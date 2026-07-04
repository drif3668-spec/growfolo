"""
GitHub OAuth 2.0 – Authorization Code Flow
==========================================
Scopes requested: read:user, user:email

Flow:
  1. GET  /api/v1/auth/github/login
       → redirects the browser to GitHub's OAuth authorization page.

  2. GET  /api/v1/auth/github/callback?code=...&state=...
       → exchanges the code for a GitHub access token,
         fetches the user's profile + primary email,
         upserts a local User row (no password required),
         issues a JWT and redirects the browser to the frontend
         with the token as a query-param:
           <FRONTEND_URL>/auth/github/success?token=<jwt>

Environment variables required (never hardcoded):
  GITHUB_CLIENT_ID      – from GitHub Developer Settings
  GITHUB_CLIENT_SECRET  – from GitHub Developer Settings
  FRONTEND_URL          – e.g. http://localhost:3000 or https://www.growol.store
"""

import secrets
import urllib.parse

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

# ── Constants ─────────────────────────────────────────────────────────────────

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

OAUTH_SCOPES = "read:user user:email"

# In-memory CSRF state store (sufficient for stateless serverless; replace with
# Redis/DB if you need persistent sessions across multiple instances).
_state_store: set[str] = set()


# ── Step 1: Redirect to GitHub ────────────────────────────────────────────────

@router.get("/github/login")
def github_login() -> RedirectResponse:
    """Redirect the user to GitHub's OAuth authorization page."""
    client_id = settings.github_client_id
    if not client_id:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "GitHub OAuth is not configured (missing GITHUB_CLIENT_ID).",
        )

    state = secrets.token_urlsafe(32)
    _state_store.add(state)

    params = {
        "client_id": client_id,
        "scope": OAUTH_SCOPES,
        "state": state,
        "allow_signup": "true",
    }
    url = f"{GITHUB_AUTHORIZE_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url, status_code=302)


# ── Step 2: Handle GitHub callback ───────────────────────────────────────────

@router.get("/github/callback")
async def github_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    """Exchange the GitHub code for an access token and issue a local JWT."""

    frontend_url = settings.frontend_url.rstrip("/")
    error_redirect = f"{frontend_url}/login?error=github_oauth_failed"

    # ── User denied access ────────────────────────────────────────────────────
    if error:
        return RedirectResponse(f"{frontend_url}/login?error=access_denied", status_code=302)

    # ── Validate CSRF state ───────────────────────────────────────────────────
    if not state or state not in _state_store:
        return RedirectResponse(error_redirect, status_code=302)
    _state_store.discard(state)

    if not code:
        return RedirectResponse(error_redirect, status_code=302)

    client_id = settings.github_client_id
    client_secret = settings.github_client_secret

    # ── Exchange code for GitHub access token ─────────────────────────────────
    async with httpx.AsyncClient(timeout=10) as client:
        token_res = await client.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
            },
        )

    if token_res.status_code != 200:
        return RedirectResponse(error_redirect, status_code=302)

    token_data = token_res.json()
    github_access_token: str = token_data.get("access_token", "")
    if not github_access_token:
        return RedirectResponse(error_redirect, status_code=302)

    # ── Fetch GitHub user profile ─────────────────────────────────────────────
    auth_headers = {
        "Authorization": f"Bearer {github_access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        profile_res = await client.get(GITHUB_USER_URL, headers=auth_headers)
        emails_res = await client.get(GITHUB_EMAILS_URL, headers=auth_headers)

    if profile_res.status_code != 200:
        return RedirectResponse(error_redirect, status_code=302)

    profile = profile_res.json()

    # ── Resolve primary verified email ────────────────────────────────────────
    email: str | None = None
    if emails_res.status_code == 200:
        for entry in emails_res.json():
            if entry.get("primary") and entry.get("verified"):
                email = entry["email"]
                break

    # Fallback: use profile email (may be None if user keeps it private)
    if not email:
        email = profile.get("email")

    if not email:
        # GitHub user has no public/verified email — cannot create account
        return RedirectResponse(
            f"{frontend_url}/login?error=no_email",
            status_code=302,
        )

    github_login_name: str = profile.get("login", "")
    full_name: str = profile.get("name") or github_login_name
    avatar_url: str | None = profile.get("avatar_url")

    # ── Upsert user ───────────────────────────────────────────────────────────
    user = db.scalar(select(User).where(User.email == email))

    if user is None:
        # New user — create account (no password; GitHub-authenticated)
        username = _unique_username(github_login_name, db)
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            hashed_password="",          # OAuth users have no local password
            is_verified=True,            # Email already verified by GitHub
            is_active=True,
            profile_picture=avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Existing user — update name/avatar if missing, mark verified
        changed = False
        if not user.full_name and full_name:
            user.full_name = full_name
            changed = True
        if not user.profile_picture and avatar_url:
            user.profile_picture = avatar_url
            changed = True
        if not user.is_verified:
            user.is_verified = True
            changed = True
        if changed:
            db.commit()

    # ── Issue local JWT ───────────────────────────────────────────────────────
    jwt_token = create_access_token(str(user.id), {"is_admin": user.is_admin})

    # ── Redirect to frontend success page ────────────────────────────────────
    success_url = (
        f"{frontend_url}/auth/github/success"
        f"?token={urllib.parse.quote(jwt_token)}"
    )
    return RedirectResponse(success_url, status_code=302)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _unique_username(base: str, db: Session) -> str:
    """Return a username derived from `base` that is not already taken."""
    candidate = base[:80]
    if not db.scalar(select(User).where(User.username == candidate)):
        return candidate
    for i in range(1, 1000):
        candidate = f"{base[:77]}_{i}"
        if not db.scalar(select(User).where(User.username == candidate)):
            return candidate
    # Extremely unlikely fallback
    return f"{base[:60]}_{secrets.token_hex(8)}"

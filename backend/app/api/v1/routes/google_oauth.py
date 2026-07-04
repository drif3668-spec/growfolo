"""
Google OAuth 2.0 – Authorization Code Flow
==========================================
Scopes requested: openid, email, profile

Flow:
  1. GET  /api/v1/auth/google/login
       → redirects the browser to Google's OAuth authorization page.

  2. GET  /api/v1/auth/google/callback?code=...&state=...
       → exchanges the code for a Google access token,
         fetches the user's profile + verified email via Google's userinfo endpoint,
         upserts a local User row (no password required),
         issues a JWT and redirects the browser to the frontend
         with the token as a query-param:
           <FRONTEND_URL>/auth/google/success?token=<jwt>

Environment variables required (never hardcoded):
  GOOGLE_CLIENT_ID      – from Google Cloud Console → APIs & Services → Credentials
  GOOGLE_CLIENT_SECRET  – from Google Cloud Console → APIs & Services → Credentials
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

GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

OAUTH_SCOPES = "openid email profile"

# In-memory CSRF state store (sufficient for stateless serverless; replace with
# Redis/DB if you need persistent sessions across multiple instances).
_state_store: set[str] = set()


def _get_callback_url() -> str:
    """
    Build the exact Redirect URI that must be registered in Google Cloud Console.
    In production (Vercel), the backend is served under the same domain as the
    frontend via /api/... routing, so we derive the base from FRONTEND_URL.
    """
    base = settings.frontend_url.rstrip("/")
    return f"{base}/api/v1/auth/google/callback"


# ── Step 1: Redirect to Google ────────────────────────────────────────────────

@router.get("/google/login")
def google_login() -> RedirectResponse:
    """Redirect the user to Google's OAuth authorization page."""
    client_id = settings.google_client_id
    if not client_id:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Google OAuth is not configured (missing GOOGLE_CLIENT_ID).",
        )

    state = secrets.token_urlsafe(32)
    _state_store.add(state)

    params = {
        "client_id": client_id,
        "redirect_uri": _get_callback_url(),
        "response_type": "code",
        "scope": OAUTH_SCOPES,
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    url = f"{GOOGLE_AUTHORIZE_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url, status_code=302)


# ── Step 2: Handle Google callback ───────────────────────────────────────────

@router.get("/google/callback")
async def google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    """Exchange the Google code for an access token and issue a local JWT."""

    frontend_url = settings.frontend_url.rstrip("/")
    error_redirect = f"{frontend_url}/login?error=google_oauth_failed"

    # ── User denied access ────────────────────────────────────────────────────
    if error:
        return RedirectResponse(f"{frontend_url}/login?error=access_denied", status_code=302)

    # ── Validate CSRF state ───────────────────────────────────────────────────
    if not state or state not in _state_store:
        return RedirectResponse(error_redirect, status_code=302)
    _state_store.discard(state)

    if not code:
        return RedirectResponse(error_redirect, status_code=302)

    client_id = settings.google_client_id
    client_secret = settings.google_client_secret

    # ── Exchange code for Google access token ─────────────────────────────────
    async with httpx.AsyncClient(timeout=10) as client:
        token_res = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "redirect_uri": _get_callback_url(),
                "grant_type": "authorization_code",
            },
        )

    if token_res.status_code != 200:
        return RedirectResponse(error_redirect, status_code=302)

    token_data = token_res.json()
    google_access_token: str = token_data.get("access_token", "")
    if not google_access_token:
        return RedirectResponse(error_redirect, status_code=302)

    # ── Fetch Google user profile via userinfo endpoint ───────────────────────
    async with httpx.AsyncClient(timeout=10) as client:
        userinfo_res = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_access_token}"},
        )

    if userinfo_res.status_code != 200:
        return RedirectResponse(error_redirect, status_code=302)

    userinfo = userinfo_res.json()

    # ── Extract verified email ────────────────────────────────────────────────
    email: str | None = userinfo.get("email")
    email_verified: bool = userinfo.get("email_verified", False)

    if not email or not email_verified:
        return RedirectResponse(
            f"{frontend_url}/login?error=no_email",
            status_code=302,
        )

    full_name: str = userinfo.get("name") or email.split("@")[0]
    avatar_url: str | None = userinfo.get("picture")
    google_sub: str = userinfo.get("sub", "")  # Google's unique user ID

    # ── Upsert user ───────────────────────────────────────────────────────────
    user = db.scalar(select(User).where(User.email == email))

    if user is None:
        # New user — create account (no password; Google-authenticated)
        username = _unique_username(email.split("@")[0], db)
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            hashed_password="",          # OAuth users have no local password
            is_verified=True,            # Email already verified by Google
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
        f"{frontend_url}/auth/google/success"
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

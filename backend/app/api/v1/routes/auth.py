from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.email import generate_otp, send_otp_email, send_welcome_email

router = APIRouter()


# ── helpers ───────────────────────────────────────────────────────────────────

def _otp_expiry() -> datetime:
    return datetime.utcnow() + timedelta(minutes=15)


def _get_current_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "يجب تسجيل الدخول أولاً")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub", "")
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "الجلسة منتهية، سجّل دخولك مجدداً")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "المستخدم غير موجود")
    return user


# ── Register ──────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    if len(payload.password) < 9:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "كلمة المرور يجب أن تكون 9 أحرف على الأقل")
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "البريد الإلكتروني مستخدم بالفعل")
    if db.scalar(select(User).where(User.username == payload.username)):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "اسم المستخدم مستخدم بالفعل")

    otp = generate_otp()
    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        is_verified=False,
        otp_code=otp,
        otp_expires_at=_otp_expiry(),
    )
    db.add(user)
    db.commit()

    name = payload.full_name or payload.username
    send_otp_email(payload.email, name, otp)

    result: dict = {"message": "check_email", "email": payload.email}  # type: ignore[type-arg]
    if settings.app_env != "production":
        result["otp"] = otp  # expose in dev so you can test without email
    return result


# ── Verify OTP ────────────────────────────────────────────────────────────────

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


@router.post("/verify-otp")
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "البريد الإلكتروني غير موجود")
    if user.is_verified:
        # Already verified — just issue a fresh token
        return {
            "access_token": create_access_token(str(user.id), {"is_admin": user.is_admin}),
            "token_type": "bearer",
        }
    if user.otp_code != payload.otp:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "رمز التحقق غير صحيح")
    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "انتهت صلاحية الرمز، اطلب رمزاً جديداً")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    send_welcome_email(user.email, user.full_name or user.username or "عميلنا")

    return {
        "access_token": create_access_token(str(user.id), {"is_admin": user.is_admin}),
        "token_type": "bearer",
    }


# ── Resend OTP ────────────────────────────────────────────────────────────────

class ResendOtpRequest(BaseModel):
    email: EmailStr


@router.post("/resend-otp")
def resend_otp_endpoint(payload: ResendOtpRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "البريد الإلكتروني غير موجود")
    if user.is_verified:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "الحساب موثّق بالفعل")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = _otp_expiry()
    db.commit()

    send_otp_email(user.email, user.full_name or user.username or "عميلنا", otp)

    result: dict = {"message": "otp_sent"}  # type: ignore[type-arg]
    if settings.app_env != "production":
        result["otp"] = otp
    return result


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "بيانات الدخول غير صحيحة")

    # Admin always bypasses email verification
    if not user.is_verified and not user.is_admin:
        otp = generate_otp()
        user.otp_code = otp
        user.otp_expires_at = _otp_expiry()
        db.commit()
        send_otp_email(user.email, user.full_name or user.username or "عميلنا", otp)
        result: dict = {  # type: ignore[type-arg]
            "require_verification": True,
            "email": user.email,
            "message": "check_email",
        }
        if settings.app_env != "production":
            result["otp"] = otp
        return result

    return {
        "access_token": create_access_token(str(user.id), {"is_admin": user.is_admin}),
        "token_type": "bearer",
        "require_verification": False,
    }


# ── /me ───────────────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(current_user: User = Depends(_get_current_user)) -> dict:  # type: ignore[type-arg]
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "is_admin": current_user.is_admin,
        "is_verified": current_user.is_verified,
        "is_active": current_user.is_active,
    }

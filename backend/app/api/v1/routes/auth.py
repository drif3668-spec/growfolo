from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.email import (
    generate_otp,
    send_otp_email,
    send_password_changed_email,
    send_welcome_email,
)

router = APIRouter()


# ── Auth helpers ──────────────────────────────────────────────────────────────

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

    send_otp_email(payload.email, payload.full_name or payload.username, otp)

    result: dict = {"message": "check_email", "email": payload.email}  # type: ignore[type-arg]
    if settings.app_env != "production":
        result["otp"] = otp
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
        return {"access_token": create_access_token(str(user.id), {"is_admin": user.is_admin}), "token_type": "bearer"}
    if user.otp_code != payload.otp:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "رمز التحقق غير صحيح")
    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "انتهت صلاحية الرمز، اطلب رمزاً جديداً")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    send_welcome_email(user.email, user.full_name or user.username or "عميلنا")

    return {"access_token": create_access_token(str(user.id), {"is_admin": user.is_admin}), "token_type": "bearer"}


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

    if not user.is_verified and not user.is_admin:
        otp = generate_otp()
        user.otp_code = otp
        user.otp_expires_at = _otp_expiry()
        db.commit()
        send_otp_email(user.email, user.full_name or user.username or "عميلنا", otp)
        result: dict = {"require_verification": True, "email": user.email, "message": "check_email"}  # type: ignore[type-arg]
        if settings.app_env != "production":
            result["otp"] = otp
        return result

    return {
        "access_token": create_access_token(str(user.id), {"is_admin": user.is_admin}),
        "token_type": "bearer",
        "require_verification": False,
    }


# ── Forgot Password ───────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    user = db.scalar(select(User).where(User.email == payload.email))
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "otp_sent"}

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = _otp_expiry()
    db.commit()
    send_otp_email(user.email, user.full_name or user.username or "عميلنا", otp)

    result: dict = {"message": "otp_sent"}  # type: ignore[type-arg]
    if settings.app_env != "production":
        result["otp"] = otp
    return result


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    if len(payload.new_password) < 9:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "كلمة المرور يجب أن تكون 9 أحرف على الأقل")

    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "البريد الإلكتروني غير موجود")
    if user.otp_code != payload.otp:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "رمز التحقق غير صحيح")
    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "انتهت صلاحية الرمز")

    user.hashed_password = hash_password(payload.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    send_password_changed_email(user.email, user.full_name or user.username or "عميلنا")

    return {"message": "password_reset_success"}


# ── GET /me ───────────────────────────────────────────────────────────────────

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
        "profile_picture": current_user.profile_picture,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


# ── PUT /me (update profile info) ────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    username: str | None = None


@router.put("/me")
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
) -> dict:  # type: ignore[type-arg]
    if payload.username and payload.username != current_user.username:
        clash = db.scalar(select(User).where(User.username == payload.username, User.id != current_user.id))
        if clash:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "اسم المستخدم مستخدم بالفعل")
        current_user.username = payload.username
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    db.commit()
    return {"message": "updated"}


# ── PUT /me/avatar ────────────────────────────────────────────────────────────

class AvatarRequest(BaseModel):
    picture: str  # base64 data-URL  e.g. "data:image/jpeg;base64,..."


@router.put("/me/avatar")
def update_avatar(
    payload: AvatarRequest,
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
) -> dict:  # type: ignore[type-arg]
    # Basic validation — must be a data-URL or a URL
    if not (payload.picture.startswith("data:image/") or payload.picture.startswith("http")):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "صيغة الصورة غير صحيحة")
    # Limit size to ~200KB base64 string
    if len(payload.picture) > 270_000:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "حجم الصورة كبير جداً، حاول بصورة أصغر")
    current_user.profile_picture = payload.picture
    db.commit()
    return {"message": "avatar_updated", "picture": current_user.profile_picture}


# ── PUT /me/password ──────────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.put("/me/password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
) -> dict:  # type: ignore[type-arg]
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "كلمة المرور الحالية غير صحيحة")
    if len(payload.new_password) < 9:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "كلمة المرور الجديدة يجب أن تكون 9 أحرف على الأقل")

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    send_password_changed_email(current_user.email, current_user.full_name or current_user.username or "عميلنا")

    return {"message": "password_changed"}


# ── GET /me/orders ────────────────────────────────────────────────────────────

@router.get("/me/orders")
def get_my_orders(
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
) -> list:  # type: ignore[type-arg]
    orders = db.scalars(
        select(Order)
        .where(Order.customer_email == current_user.email)
        .order_by(Order.created_at.desc())
    ).all()
    return [
        {
            "id": o.id,
            "product_name": o.product_name,
            "product_price": float(o.product_price),
            "status": o.status,
            "payment_method": o.payment_method,
            "tracking_stage": o.tracking_stage,
            "tracking_notes": o.tracking_notes,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "expires_at": o.expires_at.isoformat() if o.expires_at else None,
            "payment_proof_url": o.payment_proof_url,
        }
        for o in orders
    ]

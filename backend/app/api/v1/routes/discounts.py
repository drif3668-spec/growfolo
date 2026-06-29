from __future__ import annotations

from datetime import datetime
from random import choices
from string import ascii_uppercase, digits

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.discount_code import DiscountCode

router = APIRouter()


# ── Schemas ─────────────────────────────────────────────────────────────────

class DiscountCreate(BaseModel):
    code: str | None = None          # auto-generated if omitted
    percent: int = 35
    order_id: str | None = None
    description: str | None = None
    expires_at: datetime | None = None
    max_uses: int = 1


class DiscountOut(BaseModel):
    id: int
    code: str
    percent: int
    order_id: str | None
    description: str | None
    expires_at: datetime | None
    max_uses: int
    used_count: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ValidateRequest(BaseModel):
    code: str
    order_id: str | None = None      # optional — used to verify ownership


# ── Helpers ──────────────────────────────────────────────────────────────────

def _gen_code() -> str:
    return "GF-" + "".join(choices(ascii_uppercase + digits, k=8))


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=list[DiscountOut])
def list_codes(db: Session = Depends(get_db)) -> list[DiscountCode]:
    return list(db.scalars(select(DiscountCode).order_by(DiscountCode.created_at.desc())))


@router.post("", response_model=DiscountOut, status_code=status.HTTP_201_CREATED)
def create_code(payload: DiscountCreate, db: Session = Depends(get_db)) -> DiscountCode:
    code_str = payload.code.strip().upper() if payload.code else _gen_code()
    existing = db.scalar(select(DiscountCode).where(DiscountCode.code == code_str))
    if existing:
        raise HTTPException(status_code=400, detail="الكود موجود مسبقاً")
    dc = DiscountCode(
        code=code_str,
        percent=payload.percent,
        order_id=payload.order_id,
        description=payload.description,
        expires_at=payload.expires_at,
        max_uses=payload.max_uses,
    )
    db.add(dc)
    db.commit()
    db.refresh(dc)
    return dc


@router.delete("/{code_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_code(code_id: int, db: Session = Depends(get_db)) -> None:
    dc = db.get(DiscountCode, code_id)
    if not dc:
        raise HTTPException(status_code=404, detail="الكود غير موجود")
    db.delete(dc)
    db.commit()


@router.patch("/{code_id}/toggle", response_model=DiscountOut)
def toggle_code(code_id: int, db: Session = Depends(get_db)) -> DiscountCode:
    dc = db.get(DiscountCode, code_id)
    if not dc:
        raise HTTPException(status_code=404, detail="الكود غير موجود")
    dc.is_active = not dc.is_active
    db.commit()
    db.refresh(dc)
    return dc


@router.post("/validate", response_model=DiscountOut)
def validate_code(payload: ValidateRequest, db: Session = Depends(get_db)) -> DiscountCode:
    dc = db.scalar(select(DiscountCode).where(DiscountCode.code == payload.code.upper()))
    if not dc or not dc.is_active:
        raise HTTPException(status_code=404, detail="الكود غير صالح")
    if dc.expires_at and dc.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="انتهت صلاحية الكود")
    if dc.used_count >= dc.max_uses:
        raise HTTPException(status_code=409, detail="تم استخدام الكود بالكامل")
    if dc.order_id and payload.order_id and dc.order_id != payload.order_id:
        raise HTTPException(status_code=403, detail="هذا الكود مخصص لطلب آخر")
    return dc


@router.post("/use/{code}", response_model=DiscountOut)
def use_code(code: str, db: Session = Depends(get_db)) -> DiscountCode:
    dc = db.scalar(select(DiscountCode).where(DiscountCode.code == code.upper()))
    if not dc:
        raise HTTPException(status_code=404, detail="الكود غير موجود")
    dc.used_count += 1
    db.commit()
    db.refresh(dc)
    return dc


@router.get("/for-order/{order_id}", response_model=DiscountOut)
def get_order_discount(order_id: str, db: Session = Depends(get_db)) -> DiscountCode:
    dc = db.scalar(
        select(DiscountCode)
        .where(DiscountCode.order_id == order_id, DiscountCode.is_active == True)
        .order_by(DiscountCode.created_at.desc())
    )
    if not dc:
        raise HTTPException(status_code=404, detail="لا يوجد كود خصم لهذا الطلب")
    return dc

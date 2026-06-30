from __future__ import annotations

import base64
import json
import mimetypes
from datetime import datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response as FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order
from app.models.proof import OrderProof
from app.services.email import send_order_activated, send_order_received, send_order_rejected, send_proof_uploaded_admin

router = APIRouter()

EXPIRE_MINUTES = 35
EXPIRE_MINUTES_WHATSAPP = 360  # 6 hours

MAX_PROOF_BYTES = 15 * 1024 * 1024  # 15 MB per file


# ── Schemas ────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_whatsapp: str
    customer_country: str
    customer_telegram: str | None = None
    customer_notes: str | None = None
    product_name: str
    product_price: float
    payment_method: str


class StatusUpdate(BaseModel):
    status: str
    admin_notes: str | None = None


class TrackingUpdate(BaseModel):
    tracking_stage: int
    tracking_notes: str | None = None


class OrderOut(BaseModel):
    id: str
    customer_name: str
    customer_email: str
    customer_whatsapp: str | None
    customer_country: str | None
    customer_telegram: str | None
    customer_notes: str | None
    product_name: str
    product_price: float
    payment_method: str | None
    payment_proof_url: str | None
    payment_proof_urls: list[str] = Field(default_factory=list)
    payment_parts_count: int = 0
    payment_total_paid: float = 0
    status: str
    admin_notes: str | None
    tracking_stage: int
    tracking_notes: str | None
    created_at: datetime
    expires_at: datetime | None

    class Config:
        from_attributes = True


class TrackingOut(BaseModel):
    id: str
    product_name: str
    status: str
    tracking_stage: int
    tracking_notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    now = datetime.utcnow()
    is_whatsapp = payload.payment_method == "whatsapp"
    expire_mins = EXPIRE_MINUTES_WHATSAPP if is_whatsapp else EXPIRE_MINUTES
    order = Order(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_whatsapp=payload.customer_whatsapp,
        customer_country=payload.customer_country,
        customer_telegram=payload.customer_telegram,
        customer_notes=payload.customer_notes,
        product_name=payload.product_name,
        product_price=payload.product_price,
        payment_method=payload.payment_method,
        total=payload.product_price,
        status="pending_proof",
        created_at=now,
        expires_at=now + timedelta(minutes=expire_mins),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    send_order_received({
        "id": order.id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "product_name": order.product_name,
        "product_price": float(order.product_price),
        "payment_method": order.payment_method,
    })

    return order


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.created_at.desc())))


@router.get("/track/{order_id}", response_model=TrackingOut)
def track_order(order_id: str, db: Session = Depends(get_db)) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    return order


@router.patch("/{order_id}/tracking", response_model=OrderOut)
def update_tracking(order_id: str, payload: TrackingUpdate, db: Session = Depends(get_db)) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    order.tracking_stage = max(1, min(5, payload.tracking_stage))
    if payload.tracking_notes is not None:
        order.tracking_notes = payload.tracking_notes
    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}/proof/{proof_id}")
def serve_proof(order_id: str, proof_id: str, db: Session = Depends(get_db)) -> FileResponse:
    """Serve a stored proof file directly from the database."""
    proof = db.get(OrderProof, proof_id)
    if not proof or proof.order_id != order_id:
        raise HTTPException(status_code=404, detail="الملف غير موجود")
    try:
        raw = base64.b64decode(proof.data_b64)
    except Exception:
        raise HTTPException(status_code=500, detail="خطأ في قراءة الملف")
    return FileResponse(
        content=raw,
        media_type=proof.mime_type,
        headers={
            "Content-Disposition": f'inline; filename="{proof.filename}"',
            "Cache-Control": "private, max-age=604800",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    return order


def _existing_proof_urls(order: Order) -> list[str]:
    return order.payment_proof_urls


@router.post("/{order_id}/proof", response_model=OrderOut)
def upload_proof(
    order_id: str,
    files: list[UploadFile] | None = File(default=None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")

    uploaded_files = list(files or [])
    if file is not None:
        uploaded_files.append(file)
    if not uploaded_files:
        raise HTTPException(status_code=400, detail="يرجى رفع إثبات الدفع")

    is_mobilis = order.payment_method == "mobilis"
    existing_urls = _existing_proof_urls(order)
    if is_mobilis and len(existing_urls) + len(uploaded_files) > 4:
        raise HTTPException(status_code=400, detail="Flexy Mobilis يسمح برفع 4 إيصالات كحد أقصى")
    if not is_mobilis and len(uploaded_files) > 1:
        raise HTTPException(status_code=400, detail="هذه الطريقة تسمح بإثبات دفع واحد فقط")

    new_urls: list[str] = []
    proof_metas: list[dict] = []

    for uf in uploaded_files:
        raw = uf.file.read()
        if len(raw) > MAX_PROOF_BYTES:
            raise HTTPException(status_code=400, detail="حجم الملف يتجاوز 15 ميغابايت")

        fname = (uf.filename or "proof.jpg").replace("/", "_").replace("..", "_")
        mime = uf.content_type or mimetypes.guess_type(fname)[0] or "application/octet-stream"

        b64 = base64.b64encode(raw).decode()
        proof = OrderProof(
            order_id=order_id,
            filename=fname,
            mime_type=mime,
            data_b64=b64,
        )
        db.add(proof)
        db.flush()  # get proof.id before commit

        import urllib.parse
        serve_url = f"/api/v1/store-orders/{order_id}/proof/{proof.id}?name={urllib.parse.quote(fname)}"
        new_urls.append(serve_url)
        proof_metas.append({"filename": fname, "data_b64": b64, "mime": mime})

    all_urls = existing_urls + new_urls
    if is_mobilis:
        order.payment_proof_url = json.dumps(all_urls, ensure_ascii=False)
    else:
        order.payment_proof_url = new_urls[0]

    order.status = "processing"
    db.commit()
    db.refresh(order)

    # Notify admin with file attachment
    send_proof_uploaded_admin(
        {
            "id": order.id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "product_name": order.product_name,
            "product_price": float(order.product_price),
            "payment_method": order.payment_method or "—",
        },
        proof_metas,
    )

    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(order_id: str, payload: StatusUpdate, db: Session = Depends(get_db)) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")

    order.status = payload.status
    if payload.admin_notes is not None:
        order.admin_notes = payload.admin_notes

    db.commit()
    db.refresh(order)

    order_dict = {
        "id": order.id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "product_name": order.product_name,
        "product_price": float(order.product_price),
        "payment_method": order.payment_method,
        "admin_notes": order.admin_notes,
    }

    if payload.status == "activated":
        send_order_activated(order_dict)
    elif payload.status == "rejected":
        send_order_rejected(order_dict)

    return order


@router.get("/customer/{email}", response_model=list[OrderOut])
def get_customer_orders(email: str, db: Session = Depends(get_db)) -> list[Order]:
    return list(db.scalars(select(Order).where(Order.customer_email == email).order_by(Order.created_at.desc())))

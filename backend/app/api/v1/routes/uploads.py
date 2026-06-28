from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order
from app.schemas.order import OrderRead

router = APIRouter()


@router.post("/payment-proof/{order_id}", response_model=OrderRead)
async def upload_payment_proof(
    order_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> Order:
    order = db.get(Order, str(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".pdf"}:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    filename = f"{uuid4()}{suffix}"
    target = settings.upload_path / filename
    target.write_bytes(await file.read())

    order.payment_proof_url = f"/uploads/{filename}"
    order.status = "pending_review"
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order
from app.schemas.order import CheckoutRequest, OrderRead
from app.api.v1.routes.checkout import create_checkout

router = APIRouter()


@router.get("", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.created_at.desc())))


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: str, db: Session = Depends(get_db)) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderRead)
def create_order(payload: CheckoutRequest, db: Session = Depends(get_db)) -> Order:
    return create_checkout(payload, db)

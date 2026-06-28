from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import CheckoutRequest, OrderRead
from app.services.email import send_order_confirmation

router = APIRouter()


@router.post("", response_model=OrderRead)
def create_checkout(payload: CheckoutRequest, db: Session = Depends(get_db)) -> Order:
    product_ids = [str(item.product_id) for item in payload.items]
    products = list(db.scalars(select(Product).where(Product.id.in_(product_ids))))
    product_map = {product.id: product for product in products}

    if len(product_map) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="One or more products were not found")

    order = Order(customer_name=payload.customer_name, customer_email=payload.customer_email)
    total = 0.0
    for item in payload.items:
        product = product_map[str(item.product_id)]
        line_total = float(product.price) * item.quantity
        total += line_total
        order.items.append(OrderItem(product_id=product.id, quantity=item.quantity, unit_price=product.price))

    order.total = total
    db.add(order)
    db.commit()
    db.refresh(order)
    send_order_confirmation(order.customer_email, str(order.id))
    return order

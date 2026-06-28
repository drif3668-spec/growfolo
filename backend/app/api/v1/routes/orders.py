from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderRead

router = APIRouter()


@router.get("", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.created_at.desc())))

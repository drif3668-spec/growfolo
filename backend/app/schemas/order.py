from uuid import UUID

from pydantic import BaseModel, EmailStr


class CheckoutItem(BaseModel):
    product_id: UUID
    quantity: int = 1


class CheckoutRequest(BaseModel):
    customer_name: str
    customer_email: EmailStr
    items: list[CheckoutItem]


class OrderRead(BaseModel):
    id: UUID
    customer_name: str
    customer_email: EmailStr
    status: str
    total: float
    payment_proof_url: str | None = None

    class Config:
        from_attributes = True


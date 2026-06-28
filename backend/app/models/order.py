from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))

    # Customer info
    customer_name: Mapped[str] = mapped_column(String(160))
    customer_email: Mapped[str] = mapped_column(String(255), index=True)
    customer_whatsapp: Mapped[str | None] = mapped_column(String(50), nullable=True)
    customer_country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    customer_telegram: Mapped[str | None] = mapped_column(String(80), nullable=True)
    customer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Product info (denormalized for simplicity)
    product_name: Mapped[str] = mapped_column(String(200), default="")
    product_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    # Payment
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    payment_proof_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Status: new | pending_proof | processing | confirmed | activated | rejected | expired
    status: Mapped[str] = mapped_column(String(40), default="new")
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Legacy field kept for compatibility
    total: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[str] = mapped_column(String(36))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))

    order: Mapped[Order] = relationship(back_populates="items")

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class UserDiscount(Base):
    __tablename__ = "user_discounts"
    __table_args__ = (
        UniqueConstraint("user_id", "discount_code_id", name="uq_user_discount"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    discount_code_id: Mapped[int] = mapped_column(Integer, ForeignKey("discount_codes.id", ondelete="CASCADE"))
    redeemed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

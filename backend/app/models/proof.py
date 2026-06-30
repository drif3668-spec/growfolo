from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class OrderProof(Base):
    __tablename__ = "order_proofs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid4().hex)
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    filename: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(100), default="application/octet-stream")
    data_b64: Mapped[str] = mapped_column(Text)  # base64-encoded file bytes — survives restarts
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

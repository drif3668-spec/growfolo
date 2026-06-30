from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(160), index=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    subtitle: Mapped[str] = mapped_column(String(200), default="")
    logo: Mapped[str] = mapped_column(String(50), default="📦")

    # Descriptions
    description: Mapped[str] = mapped_column(Text, default="")
    full_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    usage_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    benefits: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Pricing
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    old_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    discount: Mapped[str] = mapped_column(String(20), default="")
    buyers: Mapped[str] = mapped_column(String(20), default="")

    # Media
    stock: Mapped[int] = mapped_column(Integer, default=999)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    accent_color: Mapped[str] = mapped_column(String(20), default="#a855f7")
    logo_color: Mapped[str] = mapped_column(String(200), default="from-purple-500 to-purple-900")

    # Meta
    category: Mapped[str] = mapped_column(String(50), default="AI", index=True)
    badge: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rating: Mapped[float] = mapped_column(Numeric(3, 1), default=4.9)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)

    # JSON fields stored as text
    partners_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    features_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    specs_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    faq_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Publishing
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

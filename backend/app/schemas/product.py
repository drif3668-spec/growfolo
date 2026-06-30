from __future__ import annotations
import json
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, model_validator


def _j(v: str | None) -> list:
    if not v:
        return []
    try:
        return json.loads(v)
    except Exception:
        return []


class ProductBase(BaseModel):
    name: str
    slug: str
    subtitle: str = ""
    logo: str = "📦"
    description: str = ""
    full_description: str | None = None
    usage_details: str | None = None
    requirements: str | None = None
    benefits: str | None = None
    price: float
    old_price: float = 0
    discount: str = ""
    buyers: str = ""
    stock: int = 999
    image_url: str | None = None
    accent_color: str = "#a855f7"
    logo_color: str = "from-purple-500 to-purple-900"
    category: str = "AI"
    badge: str | None = None
    rating: float = 4.9
    reviews_count: int = 0
    partners_json: str | None = None
    features_json: str | None = None
    specs_json: str | None = None
    faq_json: str | None = None
    is_published: bool = True
    sort_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    subtitle: str | None = None
    logo: str | None = None
    description: str | None = None
    full_description: str | None = None
    usage_details: str | None = None
    requirements: str | None = None
    benefits: str | None = None
    price: float | None = None
    old_price: float | None = None
    discount: str | None = None
    buyers: str | None = None
    stock: int | None = None
    image_url: str | None = None
    accent_color: str | None = None
    logo_color: str | None = None
    category: str | None = None
    badge: str | None = None
    rating: float | None = None
    reviews_count: int | None = None
    partners_json: str | None = None
    features_json: str | None = None
    specs_json: str | None = None
    faq_json: str | None = None
    is_published: bool | None = None
    sort_order: int | None = None


class ProductRead(BaseModel):
    id: str
    name: str
    slug: str
    subtitle: str
    logo: str
    description: str
    full_description: str | None
    usage_details: str | None
    requirements: str | None
    benefits: str | None
    price: float
    old_price: float
    discount: str
    buyers: str
    stock: int
    image_url: str | None
    accent_color: str
    logo_color: str
    category: str
    badge: str | None
    rating: float
    reviews_count: int
    # Parsed JSON
    partners: list
    features: list
    specs: list
    faq: list
    is_published: bool
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def parse_json_fields(cls, values):
        if hasattr(values, "__dict__"):
            obj = values
            return {
                **{c: getattr(obj, c) for c in [
                    "id", "name", "slug", "subtitle", "logo", "description",
                    "full_description", "usage_details", "requirements", "benefits",
                    "price", "old_price", "discount", "buyers", "stock", "image_url",
                    "accent_color", "logo_color", "category", "badge", "rating",
                    "reviews_count", "is_published", "sort_order", "created_at",
                ]},
                "partners": _j(getattr(obj, "partners_json", None)),
                "features": _j(getattr(obj, "features_json", None)),
                "specs":    _j(getattr(obj, "specs_json", None)),
                "faq":      _j(getattr(obj, "faq_json", None)),
            }
        return values

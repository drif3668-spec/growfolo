from uuid import UUID

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    slug: str
    description: str = ""
    price: float
    stock: int = 0
    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: UUID

    class Config:
        from_attributes = True


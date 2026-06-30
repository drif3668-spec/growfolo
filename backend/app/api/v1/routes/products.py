from __future__ import annotations

import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter()


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return list(db.scalars(
        select(Product)
        .where(Product.is_published == True)  # noqa: E712
        .order_by(Product.sort_order.asc(), Product.created_at.desc())
    ))


@router.get("/all", response_model=list[ProductRead])
def list_all_products(db: Session = Depends(get_db)) -> list[Product]:
    """Admin: all products including unpublished."""
    return list(db.scalars(
        select(Product).order_by(Product.sort_order.asc(), Product.created_at.desc())
    ))


@router.get("/category/{category}", response_model=list[ProductRead])
def list_by_category(category: str, db: Session = Depends(get_db)) -> list[Product]:
    return list(db.scalars(
        select(Product)
        .where(Product.category == category, Product.is_published == True)  # noqa: E712
        .order_by(Product.sort_order.asc())
    ))


@router.get("/slug/{slug}", response_model=ProductRead)
def get_by_slug(slug: str, db: Session = Depends(get_db)) -> Product:
    product = db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    return product


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: str, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    return product


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}/toggle", response_model=ProductRead)
def toggle_published(product_id: str, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    product.is_published = not product.is_published
    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/image", response_model=ProductRead)
def upload_image(
    product_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")

    ext = Path(file.filename or "img.jpg").suffix or ".jpg"
    filename = f"product_{product_id}{ext}"
    dest = settings.upload_path / filename
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    product.image_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(product)
    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_product(product_id: str, db: Session = Depends(get_db)) -> Response:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

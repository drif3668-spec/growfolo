from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.banner import BannerSlide

router = APIRouter()

BANNER_DIR = "banners"


# ── Helpers ────────────────────────────────────────────────────────────────

def _banner_upload_dir() -> Path:
    d = settings.upload_path / BANNER_DIR
    d.mkdir(parents=True, exist_ok=True)
    return d


def _save_image(file: UploadFile) -> str:
    suffix = Path(file.filename or "img.jpg").suffix or ".jpg"
    fname = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}{suffix}"
    dest = _banner_upload_dir() / fname
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"/uploads/{BANNER_DIR}/{fname}"


# ── Schemas ────────────────────────────────────────────────────────────────

class SlideOut(BaseModel):
    id: int
    image_url: str
    title: Optional[str]
    description: Optional[str]
    button_text: str
    link_url: str
    sort_order: int
    is_active: bool
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    alt_text: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Public ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[SlideOut])
def list_active_banners(db: Session = Depends(get_db)) -> list[BannerSlide]:
    """Returns active, in-schedule slides ordered by sort_order (for homepage)."""
    now = datetime.utcnow()
    rows = db.scalars(
        select(BannerSlide)
        .where(BannerSlide.is_active == True)  # noqa: E712
        .order_by(BannerSlide.sort_order, BannerSlide.id)
    ).all()
    # Filter by dates (optional fields)
    result = []
    for r in rows:
        if r.start_date and r.start_date > now:
            continue
        if r.end_date and r.end_date < now:
            continue
        result.append(r)
    return result


# ── Admin ──────────────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=list[SlideOut])
def list_all_banners(db: Session = Depends(get_db)) -> list[BannerSlide]:
    """Returns all slides (active + inactive) for admin panel."""
    return list(
        db.scalars(select(BannerSlide).order_by(BannerSlide.sort_order, BannerSlide.id))
    )


@router.post("", response_model=SlideOut, status_code=status.HTTP_201_CREATED)
async def create_banner(
    image: UploadFile = File(...),
    title: str = Form(""),
    description: str = Form(""),
    button_text: str = Form("مشاهدة الإعلان"),
    link_url: str = Form("/"),
    sort_order: int = Form(0),
    is_active: bool = Form(True),
    alt_text: str = Form(""),
    start_date: str = Form(""),
    end_date: str = Form(""),
    db: Session = Depends(get_db),
) -> BannerSlide:
    image_url = _save_image(image)

    def parse_dt(s: str) -> datetime | None:
        if not s:
            return None
        try:
            return datetime.fromisoformat(s)
        except ValueError:
            return None

    slide = BannerSlide(
        image_url=image_url,
        title=title or None,
        description=description or None,
        button_text=button_text or "مشاهدة الإعلان",
        link_url=link_url or "/",
        sort_order=sort_order,
        is_active=is_active,
        alt_text=alt_text or None,
        start_date=parse_dt(start_date),
        end_date=parse_dt(end_date),
    )
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return slide


@router.put("/{slide_id}", response_model=SlideOut)
async def update_banner(
    slide_id: int,
    title: str = Form(""),
    description: str = Form(""),
    button_text: str = Form(""),
    link_url: str = Form(""),
    sort_order: int = Form(0),
    is_active: bool = Form(True),
    alt_text: str = Form(""),
    start_date: str = Form(""),
    end_date: str = Form(""),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
) -> BannerSlide:
    slide = db.get(BannerSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")

    if image and image.filename:
        # Delete old file
        old = Path(slide.image_url.lstrip("/"))
        if old.exists():
            old.unlink(missing_ok=True)
        slide.image_url = _save_image(image)

    def parse_dt(s: str) -> datetime | None:
        if not s:
            return None
        try:
            return datetime.fromisoformat(s)
        except ValueError:
            return None

    slide.title = title or None
    slide.description = description or None
    slide.button_text = button_text or "مشاهدة الإعلان"
    slide.link_url = link_url or "/"
    slide.sort_order = sort_order
    slide.is_active = is_active
    slide.alt_text = alt_text or None
    slide.start_date = parse_dt(start_date)
    slide.end_date = parse_dt(end_date)

    db.commit()
    db.refresh(slide)
    return slide


@router.delete(
    "/{slide_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_banner(slide_id: int, db: Session = Depends(get_db)) -> Response:
    slide = db.get(BannerSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    # Delete image file
    old = Path(slide.image_url.lstrip("/"))
    old.unlink(missing_ok=True)
    db.delete(slide)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{slide_id}/order", response_model=SlideOut)
def update_order(slide_id: int, sort_order: int, db: Session = Depends(get_db)) -> BannerSlide:
    slide = db.get(BannerSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    slide.sort_order = sort_order
    db.commit()
    db.refresh(slide)
    return slide


@router.patch("/{slide_id}/toggle", response_model=SlideOut)
def toggle_banner(slide_id: int, db: Session = Depends(get_db)) -> BannerSlide:
    slide = db.get(BannerSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    slide.is_active = not slide.is_active
    db.commit()
    db.refresh(slide)
    return slide

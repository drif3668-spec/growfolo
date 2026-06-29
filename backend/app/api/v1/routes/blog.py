from __future__ import annotations

import json
import re
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.blog_post import BlogPost

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_slug(title: str, db: Session, exclude_id: str | None = None) -> str:
    """Generate a unique slug based on a short UUID fragment."""
    base = re.sub(r"[^\w\s-]", "", title.lower())
    base = re.sub(r"[-\s]+", "-", base).strip("-")[:60] or str(uuid4())[:8]
    slug = base
    i = 2
    while True:
        q = select(BlogPost).where(BlogPost.slug == slug)
        if exclude_id:
            q = q.where(BlogPost.id != exclude_id)
        if not db.scalar(q):
            return slug
        slug = f"{base}-{i}"
        i += 1


# ── Schemas ───────────────────────────────────────────────────────────────────

class PostCreate(BaseModel):
    title: str
    slug: str | None = None
    excerpt: str = ""
    content: str = ""
    author: str = "فريق Growfolo"
    category: str = "news"
    tags: list[str] = []
    published: bool = False
    featured: bool = False


class PostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    excerpt: str | None = None
    content: str | None = None
    author: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    published: bool | None = None
    featured: bool | None = None


class PostOut(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    tags: list[str]
    published: bool
    featured: bool
    views: int
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, p: BlogPost) -> "PostOut":
        try:
            tags = json.loads(p.tags) if p.tags else []
        except Exception:
            tags = []
        return cls(
            id=p.id, slug=p.slug, title=p.title, excerpt=p.excerpt,
            content=p.content, author=p.author, category=p.category,
            tags=tags, published=p.published, featured=p.featured,
            views=p.views, created_at=p.created_at, updated_at=p.updated_at,
        )

    class Config:
        from_attributes = True


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[PostOut])
def list_posts(
    category: str | None = Query(None),
    search: str | None = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db),
) -> list[PostOut]:
    q = select(BlogPost).where(BlogPost.published == True)
    if category and category != "all":
        q = q.where(BlogPost.category == category)
    if search:
        q = q.where(or_(BlogPost.title.ilike(f"%{search}%"), BlogPost.excerpt.ilike(f"%{search}%")))
    q = q.order_by(BlogPost.featured.desc(), BlogPost.created_at.desc()).offset(offset).limit(limit)
    return [PostOut.from_orm(p) for p in db.scalars(q)]


@router.get("/admin/all", response_model=list[PostOut])
def list_all_posts(db: Session = Depends(get_db)) -> list[PostOut]:
    posts = db.scalars(select(BlogPost).order_by(BlogPost.created_at.desc()))
    return [PostOut.from_orm(p) for p in posts]


@router.get("/{slug}", response_model=PostOut)
def get_post(slug: str, db: Session = Depends(get_db)) -> PostOut:
    post = db.scalar(select(BlogPost).where(BlogPost.slug == slug))
    if not post:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    post.views += 1
    db.commit()
    db.refresh(post)
    return PostOut.from_orm(post)


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostCreate, db: Session = Depends(get_db)) -> PostOut:
    slug = payload.slug.strip() if payload.slug else _make_slug(payload.title, db)
    existing = db.scalar(select(BlogPost).where(BlogPost.slug == slug))
    if existing:
        raise HTTPException(status_code=400, detail="الـ slug موجود مسبقاً")
    post = BlogPost(
        slug=slug,
        title=payload.title,
        excerpt=payload.excerpt,
        content=payload.content,
        author=payload.author,
        category=payload.category,
        tags=json.dumps(payload.tags, ensure_ascii=False),
        published=payload.published,
        featured=payload.featured,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return PostOut.from_orm(post)


@router.put("/{post_id}", response_model=PostOut)
def update_post(post_id: str, payload: PostUpdate, db: Session = Depends(get_db)) -> PostOut:
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    if payload.title is not None:    post.title    = payload.title
    if payload.excerpt is not None:  post.excerpt  = payload.excerpt
    if payload.content is not None:  post.content  = payload.content
    if payload.author is not None:   post.author   = payload.author
    if payload.category is not None: post.category = payload.category
    if payload.published is not None: post.published = payload.published
    if payload.featured is not None:  post.featured  = payload.featured
    if payload.tags is not None:
        post.tags = json.dumps(payload.tags, ensure_ascii=False)
    if payload.slug is not None:
        new_slug = payload.slug.strip()
        if new_slug != post.slug:
            if db.scalar(select(BlogPost).where(BlogPost.slug == new_slug, BlogPost.id != post_id)):
                raise HTTPException(status_code=400, detail="الـ slug موجود مسبقاً")
            post.slug = new_slug
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return PostOut.from_orm(post)


@router.patch("/{post_id}/toggle", response_model=PostOut)
def toggle_published(post_id: str, db: Session = Depends(get_db)) -> PostOut:
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    post.published = not post.published
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return PostOut.from_orm(post)


@router.patch("/{post_id}/featured", response_model=PostOut)
def toggle_featured(post_id: str, db: Session = Depends(get_db)) -> PostOut:
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    post.featured = not post.featured
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return PostOut.from_orm(post)


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_post(post_id: str, db: Session = Depends(get_db)) -> Response:
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.subscriber import Subscriber
from app.services.email import send_newsletter_welcome

router = APIRouter()


class SubscribeRequest(BaseModel):
    email: EmailStr


@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe(payload: SubscribeRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    email = payload.email.lower().strip()

    existing = db.scalar(select(Subscriber).where(Subscriber.email == email))
    if existing:
        # Already subscribed — return success silently (don't reveal existence)
        return {"message": "subscribed"}

    subscriber = Subscriber(email=email)
    db.add(subscriber)
    db.commit()

    send_newsletter_welcome(email)

    return {"message": "subscribed"}

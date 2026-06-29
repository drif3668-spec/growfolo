from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession

router = APIRouter()


class CreateSessionRequest(BaseModel):
    name: str
    email: str
    whatsapp: str


class SendMessageRequest(BaseModel):
    content: str
    is_admin: bool = False


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_session(payload: CreateSessionRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    session = ChatSession(name=payload.name, email=payload.email, whatsapp=payload.whatsapp)
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "name": session.name, "email": session.email, "whatsapp": session.whatsapp}


@router.get("/sessions")
def list_sessions(db: Session = Depends(get_db)) -> list:  # type: ignore[type-arg]
    sessions = db.scalars(select(ChatSession).order_by(ChatSession.created_at.desc())).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "whatsapp": s.whatsapp,
            "is_resolved": s.is_resolved,
            "created_at": s.created_at.isoformat(),
            "last_message": s.messages[-1].content if s.messages else None,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, since: str | None = None, db: Session = Depends(get_db)) -> list:  # type: ignore[type-arg]
    session = db.scalar(select(ChatSession).where(ChatSession.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    query = select(ChatMessage).where(ChatMessage.session_id == session_id)
    if since:
        try:
            # Accept both "Z" and "+00:00" suffixes; strip timezone for naive DB column
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
            if since_dt.tzinfo is not None:
                from datetime import timezone
                since_dt = since_dt.astimezone(timezone.utc).replace(tzinfo=None)
            # Use >= so messages at the exact boundary are included;
            # the frontend deduplicates by ID to avoid showing them twice.
            query = query.where(ChatMessage.created_at >= since_dt)
        except ValueError:
            pass  # bad since value — return full history

    msgs = db.scalars(query.order_by(ChatMessage.created_at.asc())).all()
    return [
        {
            "id": m.id,
            "content": m.content,
            "is_admin": m.is_admin,
            "created_at": m.created_at.isoformat(),
        }
        for m in msgs
    ]


@router.post("/sessions/{session_id}/messages", status_code=status.HTTP_201_CREATED)
def send_message(session_id: str, payload: SendMessageRequest, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    session = db.scalar(select(ChatSession).where(ChatSession.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    msg = ChatMessage(session_id=session_id, content=payload.content, is_admin=payload.is_admin)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "content": msg.content,
        "is_admin": msg.is_admin,
        "created_at": msg.created_at.isoformat(),
    }


@router.patch("/sessions/{session_id}/resolve")
def resolve_session(session_id: str, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    session = db.scalar(select(ChatSession).where(ChatSession.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_resolved = True
    db.commit()
    return {"ok": True}

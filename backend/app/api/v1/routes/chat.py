from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, get_db
from app.models.chat import ChatMessage, ChatSession

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.client_connections: dict[str, WebSocket] = {}
        self.admin_connections: list[WebSocket] = []

    async def connect_client(self, session_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.client_connections[session_id] = websocket

    async def connect_admin(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.admin_connections.append(websocket)

    def disconnect_client(self, session_id: str) -> None:
        self.client_connections.pop(session_id, None)

    def disconnect_admin(self, websocket: WebSocket) -> None:
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)

    async def send_to_client(self, session_id: str, message: dict) -> None:  # type: ignore[type-arg]
        ws = self.client_connections.get(session_id)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def broadcast_to_admins(self, message: dict) -> None:  # type: ignore[type-arg]
        dead: list[WebSocket] = []
        for ws in self.admin_connections:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_admin(ws)


manager = ConnectionManager()


class CreateSessionRequest(BaseModel):
    name: str
    email: str
    whatsapp: str


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
def get_messages(session_id: str, db: Session = Depends(get_db)) -> list:  # type: ignore[type-arg]
    session = db.scalar(select(ChatSession).where(ChatSession.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return [
        {
            "id": m.id,
            "content": m.content,
            "is_admin": m.is_admin,
            "created_at": m.created_at.isoformat(),
        }
        for m in session.messages
    ]


@router.patch("/sessions/{session_id}/resolve")
def resolve_session(session_id: str, db: Session = Depends(get_db)) -> dict:  # type: ignore[type-arg]
    session = db.scalar(select(ChatSession).where(ChatSession.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_resolved = True
    db.commit()
    return {"ok": True}


@router.websocket("/ws/{session_id}")
async def client_websocket(session_id: str, websocket: WebSocket) -> None:
    await manager.connect_client(session_id, websocket)
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive_json()
            content = str(data.get("content", "")).strip()
            if not content:
                continue
            msg = ChatMessage(session_id=session_id, content=content, is_admin=False)
            db.add(msg)
            db.commit()
            db.refresh(msg)
            msg_data = {
                "id": msg.id,
                "session_id": session_id,
                "content": msg.content,
                "is_admin": False,
                "created_at": msg.created_at.isoformat(),
            }
            await manager.broadcast_to_admins(msg_data)
    except WebSocketDisconnect:
        manager.disconnect_client(session_id)
    finally:
        db.close()


@router.websocket("/admin/ws")
async def admin_websocket(websocket: WebSocket) -> None:
    await manager.connect_admin(websocket)
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive_json()
            session_id = str(data.get("session_id", ""))
            content = str(data.get("content", "")).strip()
            if not session_id or not content:
                continue
            msg = ChatMessage(session_id=session_id, content=content, is_admin=True)
            db.add(msg)
            db.commit()
            db.refresh(msg)
            msg_data = {
                "id": msg.id,
                "session_id": session_id,
                "content": msg.content,
                "is_admin": True,
                "created_at": msg.created_at.isoformat(),
            }
            await manager.send_to_client(session_id, msg_data)
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)
    finally:
        db.close()

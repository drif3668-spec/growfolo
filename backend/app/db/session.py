from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

if settings.database_url.startswith("sqlite"):
    # Local development: SQLite with thread-safety flag
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    # PostgreSQL (Neon or any other provider).
    # pool_size=5 / max_overflow=0 stays within Neon free-tier connection limit (10).
    # pool_pre_ping validates connections before use, important for Neon's idle timeouts.
    # pool_recycle avoids stale connections after Neon's 5-minute idle disconnect.
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=0,
        pool_timeout=30,
        pool_recycle=300,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

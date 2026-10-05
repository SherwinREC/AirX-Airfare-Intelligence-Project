"""
SQLAlchemy Database Connection Factory & Auto Schema Migration
Supports SQLite and PostgreSQL.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from models.database import Base

load_dotenv()

BASE_DIR = Path(__file__).parent.parent
DB_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/data/airfare.db")

connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}

engine = create_engine(
    DB_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create database tables and perform column migrations."""
    (BASE_DIR / "data").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    if inspector.has_table("airfare_observations"):
        columns = [c["name"] for c in inspector.get_columns("airfare_observations")]
        with engine.connect() as conn:
            if "aircraft_type" not in columns:
                try:
                    conn.execute(text("ALTER TABLE airfare_observations ADD COLUMN aircraft_type VARCHAR(50) DEFAULT 'Airbus A320neo'"))
                except Exception:
                    pass

            if "seat_availability" not in columns:
                try:
                    conn.execute(text("ALTER TABLE airfare_observations ADD COLUMN seat_availability VARCHAR(50) DEFAULT 'Available'"))
                except Exception:
                    pass
            conn.commit()


def get_db():
    """Dependency generator for FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

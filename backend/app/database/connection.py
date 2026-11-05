"""Database connection and session management for the SignalDesk backend.

Connects to Neon PostgreSQL through SQLAlchemy 2.0 when DATABASE_URL is set,
and falls back to a local SQLite database for development and tests.
"""

from __future__ import annotations

import os
from typing import Generator, List

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import settings
from backend.app.database.models import Base, Ticket


def get_engine():
    """Create a SQLAlchemy engine with the appropriate dialect arguments."""
    db_url = settings.DATABASE_URL or os.getenv("DATABASE_URL", "sqlite:///./signaldesk.db")

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

    if db_url.startswith("sqlite"):
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )

    return create_engine(db_url, pool_pre_ping=True, pool_recycle=300)


try:
    engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as exc:  # pragma: no cover - depends on environment
    print(f"Warning: primary database unavailable ({exc}). Falling back to SQLite.")
    fallback_url = "sqlite:///./signaldesk.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _seed_records(limit: int = 0) -> List[dict]:
    """Build ticket mappings from the bundled dataset with genuine model confidence."""
    from backend.app.ml.data_loader import load_support_dataset
    from backend.app.ml.model_loader import ModelLoader
    from backend.app.ml.preprocessing import preprocess_support_text

    if not os.path.exists(settings.RAW_DATASET_PATH):
        print("Dataset not found; skipping history seeding.")
        return []

    df = load_support_dataset(settings.RAW_DATASET_PATH)
    if limit and limit > 0:
        df = df.head(limit)

    if df.empty:
        return []

    # Score historical records with the production model so the UI never shows
    # a fabricated confidence value.
    confidences: List[float] = [0.0] * len(df)
    try:
        model = ModelLoader.get_model()
        vectorizer = ModelLoader.get_vectorizer()
        cleaned = [
            preprocess_support_text(t) or str(t).lower().strip()
            for t in df["ticket_text"].tolist()
        ]
        matrix = vectorizer.transform(cleaned)
        probabilities = model.predict_proba(matrix)
        class_index = {str(label): i for i, label in enumerate(model.classes_)}
        labels = df["category"].astype(str).tolist()
        confidences = [
            float(probabilities[row][class_index[label]])
            if label in class_index
            else float(probabilities[row].max())
            for row, label in enumerate(labels)
        ]
    except Exception as exc:  # pragma: no cover - model artifacts may be absent
        print(f"Confidence scoring skipped during seeding: {exc}")

    records: List[dict] = []
    for (_, row), confidence in zip(df.iterrows(), confidences):
        created_at = row.get("created_at")
        if pd.isna(created_at):
            created_at = None
        priority = row.get("priority")
        priority_label = str(priority).title() if pd.notna(priority) else "Low"
        records.append(
            {
                "id": str(row.get("ticket_id")),
                "ticket_text": str(row.get("ticket_text", "")),
                "predicted_category": str(row.get("category", "General Inquiry")),
                "confidence": round(float(confidence), 4),
                "priority": priority_label,
                "priority_reason": "Historical record from the bundled support dataset.",
                "status": "Open",
                "created_at": created_at.to_pydatetime() if created_at is not None else None,
            }
        )
    return records


def seed_database(db: Session, limit: int | None = None) -> int:
    """Seed the ticket history from the dataset. Returns inserted row count."""
    max_rows = settings.SEED_MAX_ROWS if limit is None else limit
    records = _seed_records(limit=max_rows)
    if not records:
        return 0

    db.bulk_insert_mappings(Ticket, records)
    db.commit()
    return len(records)


def reset_database() -> None:
    """Drop and recreate all tables. Intended for local development only."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def init_db():
    """Create tables and seed history once when the database is empty."""
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        count = db.query(Ticket).count()
        if count == 0:
            print("Seeding ticket history from the bundled dataset...")
            inserted = seed_database(db)
            print(f"Seeded {inserted:,} tickets into the history store.")
    except Exception as exc:
        print(f"Database initialization warning: {exc}")
        db.rollback()
    finally:
        db.close()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

"""Database Connection and Session Management for SignalDesk Backend.

Supports Neon PostgreSQL and SQLite with automatic pooling, table creation,
and initial data seeding from real customer inquiries.
"""

from typing import Generator
import os
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.core.config import settings
from backend.app.database.models import Base, Ticket


def get_engine():
    """Create SQLAlchemy engine with appropriate dialect arguments."""
    db_url = settings.DATABASE_URL

    # Handle Postgres vs SQLite args
    if db_url.startswith("sqlite"):
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False}
        )
    else:
        # Neon PostgreSQL connection
        return create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=300
        )


try:
    engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"Warning: Failed to connect to primary DATABASE_URL ({e}). Falling back to local SQLite.")
    fallback_url = "sqlite:///./signaldesk.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create tables and seed initial records from real dataset if empty."""
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        count = db.query(Ticket).count()
        if count == 0:
            csv_path = os.path.join(settings.DATA_DIR, "raw", "customer_support_tickets.csv")
            if os.path.exists(csv_path):
                print("Seeding initial tickets into database from customer_support_tickets.csv...")
                df = pd.read_csv(csv_path)
                tickets_to_seed = []
                for _, row in df.head(300).iterrows():
                    t = Ticket(
                        id=str(row.get("ticket_id", f"TCK-{10000 + len(tickets_to_seed)}")),
                        ticket_text=str(row.get("ticket_text", "")),
                        predicted_category=str(row.get("category", "General Inquiry")),
                        confidence=0.88,
                        priority=str(row.get("priority", "Medium")),
                        priority_reason="Historical real customer ticket inquiry.",
                        status="Open"
                    )
                    tickets_to_seed.append(t)
                db.bulk_save_objects(tickets_to_seed)
                db.commit()
                print(f"Seeded {len(tickets_to_seed)} tickets into database.")
    except Exception as e:
        print(f"Database initialization warning: {e}")
        db.rollback()
    finally:
        db.close()


def get_db() -> Generator[Session, None, None]:
    """Dependency injection yield for FastAPI request handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

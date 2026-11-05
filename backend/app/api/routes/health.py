"""Health and System Status Route."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.connection import get_db
from backend.app.ml.model_loader import ModelLoader

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def check_health(db: Session = Depends(get_db)):
    """Check API status, Database connectivity, and ML model loading state."""
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        print(f"Health DB error: {e}")

    model_ok = ModelLoader.is_loaded()

    return {
        "status": "healthy" if db_ok and model_ok else "degraded",
        "api": "online",
        "database": "connected" if db_ok else "unavailable",
        "model_loaded": model_ok,
        "version": "2.0.0"
    }

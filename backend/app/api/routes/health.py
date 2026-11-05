"""Health and system status route."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database.connection import get_db
from backend.app.ml.model_loader import ModelLoader

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def check_health(db: Session = Depends(get_db)):
    """Check API, database connectivity, and ML model state."""
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:  # pragma: no cover - environment dependent
        print(f"Health DB error: {exc}")

    try:
        model_ok = ModelLoader.is_loaded() or bool(ModelLoader.get_model())
    except Exception:
        model_ok = False

    meta = ModelLoader.get_metadata() if model_ok else {}

    return {
        "status": "healthy" if db_ok and model_ok else "degraded",
        "api": "online",
        "database": "connected" if db_ok else "unavailable",
        "model_loaded": model_ok,
        "model_algorithm": meta.get("algorithm", ""),
        "model_accuracy": meta.get("metrics", {}).get("accuracy", 0.0),
        "model_version": meta.get("version", settings.VERSION),
        "trained_on": meta.get("total_samples", 0),
        "version": settings.VERSION,
    }

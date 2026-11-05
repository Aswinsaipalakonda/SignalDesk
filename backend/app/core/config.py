"""Application Configuration Settings for SignalDesk Backend."""

from typing import List
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "SignalDesk API"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"

    # Database configuration (Neon PostgreSQL or fallback local database)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./signaldesk.db"
    )

    # CORS configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://signaldesk.vercel.app"
    ]

    # Model and Data Directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    # Model Artifact Paths
    MODEL_PATH: str = os.path.join(MODELS_DIR, "ticket_classifier.joblib")
    VECTORIZER_PATH: str = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
    METADATA_PATH: str = os.path.join(MODELS_DIR, "model_metadata.json")

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

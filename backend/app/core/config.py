"""Application configuration settings for the SignalDesk backend."""

from typing import List
import os

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(os.path.join(BASE_DIR, ".env"), ".env"),
        extra="ignore",
        case_sensitive=True,
    )

    PROJECT_NAME: str = "SignalDesk API"
    VERSION: str = "2.1.0"
    API_PREFIX: str = "/api"

    # Database configuration (Neon PostgreSQL or local SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./signaldesk.db")

    # CORS configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "https://signaldesk.vercel.app",
    ]

    # Model, data, and artifact directories
    BASE_DIR: str = BASE_DIR
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")

    # Model artifact paths
    MODEL_PATH: str = os.path.join(MODELS_DIR, "ticket_classifier.joblib")
    VECTORIZER_PATH: str = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
    METADATA_PATH: str = os.path.join(MODELS_DIR, "model_metadata.json")

    # Dataset paths
    RAW_DATASET_PATH: str = os.path.join(DATA_DIR, "raw", "customer_support_tickets.csv")
    PROCESSED_DATASET_PATH: str = os.path.join(DATA_DIR, "processed", "cleaned_tickets.csv")

    # Seeding behaviour: 0 seeds every dataset row into the history store.
    SEED_MAX_ROWS: int = int(os.getenv("SEED_MAX_ROWS", "0"))

    # Inference guardrails
    MIN_TICKET_LENGTH: int = 4


settings = Settings()

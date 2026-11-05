"""Model Loader Singleton for SignalDesk Backend.

Caches trained Scikit-learn model and TF-IDF vectorizer artifacts in memory
for sub-millisecond API inference without repeated disk reads.
"""

from typing import Tuple, Dict, Any, Optional
import os
import json
import joblib
from backend.app.core.config import settings


class ModelLoader:
    _model = None
    _vectorizer = None
    _metadata: Optional[Dict[str, Any]] = None

    @classmethod
    def load_artifacts(cls):
        """Load model, vectorizer, and metadata artifacts into memory."""
        if not os.path.exists(settings.MODEL_PATH):
            raise FileNotFoundError(f"Model artifact not found: {settings.MODEL_PATH}")
        if not os.path.exists(settings.VECTORIZER_PATH):
            raise FileNotFoundError(f"Vectorizer artifact not found: {settings.VECTORIZER_PATH}")

        cls._model = joblib.load(settings.MODEL_PATH)
        cls._vectorizer = joblib.load(settings.VECTORIZER_PATH)

        if os.path.exists(settings.METADATA_PATH):
            with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
                cls._metadata = json.load(f)
        else:
            cls._metadata = {}

        print("ML artifacts successfully loaded into memory.")

    @classmethod
    def get_model(cls):
        if cls._model is None:
            cls.load_artifacts()
        return cls._model

    @classmethod
    def get_vectorizer(cls):
        if cls._vectorizer is None:
            cls.load_artifacts()
        return cls._vectorizer

    @classmethod
    def get_metadata(cls) -> Dict[str, Any]:
        if cls._metadata is None:
            cls.load_artifacts()
        return cls._metadata or {}

    @classmethod
    def is_loaded(cls) -> bool:
        return cls._model is not None and cls._vectorizer is not None

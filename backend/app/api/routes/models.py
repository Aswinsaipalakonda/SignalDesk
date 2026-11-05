"""Model performance, provenance, and status API routes."""

from typing import Any, Dict

from fastapi import APIRouter

from backend.app.core.config import settings
from backend.app.ml.model_loader import ModelLoader

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("/performance")
def get_model_performance() -> Dict[str, Any]:
    """Retrieve genuine evaluation results from the held-out test split."""
    meta = ModelLoader.get_metadata()
    metrics = meta.get("metrics", {})
    return {
        "model_name": meta.get("model_name", "SignalDesk Classifier"),
        "algorithm": meta.get("algorithm", "Logistic Regression"),
        "selected_reason": meta.get("selected_reason", ""),
        "training_date": meta.get("training_date", ""),
        "total_samples": meta.get("total_samples", 0),
        "train_samples": meta.get("train_samples", 0),
        "test_samples": meta.get("test_samples", 0),
        "num_categories": meta.get("num_categories", 0),
        "accuracy": metrics.get("accuracy", 0.0),
        "f1_macro": metrics.get("f1_macro", 0.0),
        "precision_macro": metrics.get("precision_macro", 0.0),
        "recall_macro": metrics.get("recall_macro", 0.0),
        "f1_weighted": metrics.get("f1_weighted", 0.0),
        "categories": meta.get("categories", []),
        "confusion_matrix": metrics.get("confusion_matrix", []),
        "classification_report": metrics.get("classification_report", {}),
        "comparison": meta.get("comparison", {}),
        "dataset_name": meta.get("dataset_name", ""),
        "dataset_source": meta.get("dataset_source", ""),
        "dataset_summary": meta.get("dataset_summary", {}),
        "vectorizer_config": meta.get("vectorizer_config", {}),
        "preprocessing": meta.get("preprocessing", {}),
        "random_seed": meta.get("random_seed"),
        "test_size": meta.get("test_size"),
        "version": meta.get("version", ""),
    }


@router.get("/metadata")
def get_model_metadata() -> Dict[str, Any]:
    """Full raw model metadata."""
    return ModelLoader.get_metadata()


@router.get("/status")
def get_model_status() -> Dict[str, Any]:
    """Artifact loading status and model identity."""
    loaded = ModelLoader.is_loaded()
    meta = ModelLoader.get_metadata() if loaded else {}
    return {
        "loaded": loaded,
        "algorithm": meta.get("algorithm", ""),
        "version": meta.get("version", settings.VERSION),
        "categories": meta.get("categories", []),
        "accuracy": meta.get("metrics", {}).get("accuracy", 0.0),
        "model_path": settings.MODEL_PATH,
        "vectorizer_path": settings.VECTORIZER_PATH,
    }

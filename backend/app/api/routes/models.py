"""Model Performance and Experimentation Metadata API Routes."""

from typing import Dict, Any
from fastapi import APIRouter
from backend.app.ml.model_loader import ModelLoader

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("/performance")
def get_model_performance() -> Dict[str, Any]:
    """Retrieve actual evaluation results from held-out test split."""
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
        "categories": meta.get("categories", []),
        "confusion_matrix": metrics.get("confusion_matrix", []),
        "classification_report": metrics.get("classification_report", {}),
        "comparison": meta.get("comparison", {})
    }


@router.get("/metadata")
def get_model_metadata() -> Dict[str, Any]:
    """Full raw metadata json."""
    return ModelLoader.get_metadata()

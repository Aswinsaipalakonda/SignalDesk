"""Inference and Prediction Pipeline for SignalDesk.

Loads serialized models and vectorizers, applies standardized preprocessing,
computes category probabilities and confidence, triggers the priority engine,
and persists inferences into SQLite.
"""

from typing import Dict, Any, Optional
import os
import time
import joblib
import numpy as np

from src.preprocessing import preprocess_support_text
from src.priority_engine import assess_ticket_priority
from src.database import insert_ticket


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "ticket_classifier.joblib")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")

_LOADED_MODEL = None
_LOADED_VECTORIZER = None


def get_inference_artifacts() -> Tuple[any, any]:
    """Retrieve or lazy-load model and TF-IDF vectorizer artifacts."""
    global _LOADED_MODEL, _LOADED_VECTORIZER

    if _LOADED_MODEL is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model artifact not found at: {MODEL_PATH}. "
                "Please run `python -m src.train_model` first."
            )
        _LOADED_MODEL = joblib.load(MODEL_PATH)

    if _LOADED_VECTORIZER is None:
        if not os.path.exists(VECTORIZER_PATH):
            raise FileNotFoundError(
                f"TF-IDF vectorizer artifact not found at: {VECTORIZER_PATH}. "
                "Please run `python -m src.train_model` first."
            )
        _LOADED_VECTORIZER = joblib.load(VECTORIZER_PATH)

    return _LOADED_MODEL, _LOADED_VECTORIZER


def predict_ticket(
    ticket_text: str,
    save_to_db: bool = True,
    ticket_id: Optional[str] = None
) -> Dict[str, Any]:
    """Classify and prioritize an incoming customer support ticket.

    Args:
        ticket_text: Raw incoming customer inquiry text.
        save_to_db: Whether to record the prediction in SQLite history.
        ticket_id: Optional unique identifier.

    Returns:
        Dictionary containing predicted category, confidence, priority, and breakdown.
    """
    start_time = time.time()

    if not isinstance(ticket_text, str) or len(ticket_text.strip()) < 4:
        raise ValueError("Ticket text is too short. Please provide a descriptive customer support message.")

    model, vectorizer = get_inference_artifacts()

    # Preprocess text
    cleaned = preprocess_support_text(ticket_text)
    if not cleaned:
        cleaned = ticket_text.lower().strip()

    # Transform with saved vectorizer (strictly no re-fitting)
    text_vec = vectorizer.transform([cleaned])

    # Predict category
    pred_category = model.predict(text_vec)[0]

    # Model confidence & distribution
    probabilities: Dict[str, float] = {}
    confidence = 0.85
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(text_vec)[0]
        classes = model.classes_
        for cls_name, prob in zip(classes, probs):
            probabilities[str(cls_name)] = round(float(prob), 4)
        confidence = float(np.max(probs))

    # Priority assessment (independent rule engine)
    priority_result = assess_ticket_priority(ticket_text)

    latency_ms = round((time.time() - start_time) * 1000, 2)
    assigned_id = ticket_id or f"TCK-{int(time.time() * 1000) % 1000000}"

    result = {
        "ticket_id": assigned_id,
        "original_text": ticket_text,
        "cleaned_text": cleaned,
        "predicted_category": pred_category,
        "confidence": round(confidence, 4),
        "confidence_percentage": f"{confidence * 100:.1f}%",
        "priority": priority_result["priority"],
        "priority_reason": priority_result["reason"],
        "matched_pattern": priority_result["matched_pattern"],
        "probabilities": probabilities,
        "latency_ms": latency_ms,
        "status": "Success"
    }

    if save_to_db:
        insert_ticket(
            ticket_id=assigned_id,
            ticket_text=ticket_text,
            category=pred_category,
            priority=priority_result["priority"],
            confidence=round(confidence, 4),
            priority_reason=priority_result["reason"]
        )

    return result


"""Prediction Service for SignalDesk Backend.

Coordinates text preprocessing, feature vectorization, category probability extraction,
independent priority rule assessment, and database persistence.
"""

from typing import Dict, Any, Optional
import time
import uuid
import numpy as np
from sqlalchemy.orm import Session

from backend.app.ml.preprocessing import preprocess_support_text
from backend.app.ml.model_loader import ModelLoader
from backend.app.services.priority_service import assess_ticket_priority
from backend.app.database.repository import TicketRepository
from backend.app.schemas.ticket import TicketPredictResponse


class PredictionService:

    @staticmethod
    def predict(
        ticket_text: str,
        db: Optional[Session] = None,
        save: bool = True
    ) -> TicketPredictResponse:
        start_time = time.time()

        if not ticket_text or len(ticket_text.strip()) < 4:
            raise ValueError("Ticket text is too short. Please provide a descriptive message.")

        model = ModelLoader.get_model()
        vectorizer = ModelLoader.get_vectorizer()

        # Preprocess text preserving negations
        cleaned = preprocess_support_text(ticket_text)
        if not cleaned:
            cleaned = ticket_text.lower().strip()

        # Vectorize using saved TF-IDF
        vec = vectorizer.transform([cleaned])

        # Predict Category
        pred_category = model.predict(vec)[0]

        # Extract probability distribution & model confidence
        probabilities: Dict[str, float] = {}
        confidence = 0.85
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(vec)[0]
            classes = model.classes_
            for cls_name, prob in zip(classes, probs):
                probabilities[str(cls_name)] = round(float(prob), 4)
            confidence = float(np.max(probs))

        # Independent transparent priority assessment
        prio_result = assess_ticket_priority(ticket_text)

        latency_ms = round((time.time() - start_time) * 1000, 2)
        ticket_id = f"TCK-{str(uuid.uuid4())[:8].upper()}"

        if save and db is not None:
            TicketRepository.create_ticket(
                db=db,
                ticket_id=ticket_id,
                ticket_text=ticket_text,
                predicted_category=pred_category,
                confidence=round(confidence, 4),
                priority=prio_result["priority"],
                priority_reason=prio_result["reason"],
                status="Open"
            )

        return TicketPredictResponse(
            ticket_id=ticket_id,
            original_text=ticket_text,
            cleaned_text=cleaned,
            predicted_category=pred_category,
            confidence=round(confidence, 4),
            confidence_percentage=f"{confidence * 100:.1f}%",
            priority=prio_result["priority"],
            priority_reason=prio_result["reason"],
            matched_pattern=prio_result["matched_pattern"],
            probabilities=probabilities,
            latency_ms=latency_ms,
            status="Success"
        )

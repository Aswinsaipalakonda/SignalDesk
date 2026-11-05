"""Prediction service for SignalDesk.

Coordinates preprocessing, TF-IDF transformation, category probabilities,
independent rule-based priority assessment, and history persistence.
"""

from __future__ import annotations

import time
import uuid
from typing import Any, Dict, Optional

import numpy as np
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database.repository import TicketRepository
from backend.app.ml.model_loader import ModelLoader
from backend.app.ml.preprocessing import preprocess_support_text
from backend.app.schemas.ticket import TicketPredictResponse
from backend.app.services.priority_service import assess_ticket_priority


class PredictionService:

    @staticmethod
    def predict(
        ticket_text: str,
        db: Optional[Session] = None,
        save: bool = True,
    ) -> TicketPredictResponse:
        start_time = time.perf_counter()

        if not isinstance(ticket_text, str) or len(ticket_text.strip()) < settings.MIN_TICKET_LENGTH:
            raise ValueError(
                "Ticket text is too short. Please provide a descriptive support message."
            )

        model = ModelLoader.get_model()
        vectorizer = ModelLoader.get_vectorizer()

        cleaned = preprocess_support_text(ticket_text)
        if not cleaned:
            # The message may consist only of punctuation/whitespace.
            if not any(character.isalnum() for character in ticket_text):
                raise ValueError(
                    "Ticket text does not contain enough meaningful content to classify."
                )
            cleaned = ticket_text.lower().strip()

        matrix = vectorizer.transform([cleaned])
        predicted_category = str(model.predict(matrix)[0])

        probabilities: Dict[str, float] = {}
        confidence = 0.0
        confidence_percentage = "N/A"

        if hasattr(model, "predict_proba"):
            raw_probabilities = model.predict_proba(matrix)[0]
            classes = getattr(model, "classes_", [])
            probabilities = {
                str(label): round(float(probability), 4)
                for label, probability in zip(classes, raw_probabilities)
            }
            confidence = float(np.max(raw_probabilities))
            confidence_percentage = f"{confidence * 100:.1f}%"

        priority_result = assess_ticket_priority(ticket_text)

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        ticket_id = f"TCK-{str(uuid.uuid4())[:8].upper()}"
        persisted = False

        if save and db is not None:
            try:
                TicketRepository.create_ticket(
                    db=db,
                    ticket_id=ticket_id,
                    ticket_text=ticket_text.strip(),
                    predicted_category=predicted_category,
                    confidence=round(confidence, 4),
                    priority=priority_result["priority"],
                    priority_reason=priority_result["reason"],
                    status="Open",
                )
                persisted = True
            except Exception as exc:  # pragma: no cover - database boundary
                print(f"Ticket persistence warning: {exc}")
                db.rollback()

        return TicketPredictResponse(
            ticket_id=ticket_id,
            original_text=ticket_text.strip(),
            cleaned_text=cleaned,
            predicted_category=predicted_category,
            confidence=round(confidence, 4),
            confidence_percentage=confidence_percentage,
            priority=priority_result["priority"],
            priority_reason=priority_result["reason"],
            matched_pattern=priority_result["matched_pattern"],
            probabilities=probabilities,
            latency_ms=latency_ms,
            status="Success",
            saved=persisted,
        )

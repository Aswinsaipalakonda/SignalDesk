"""Pydantic Request and Response Schemas for Support Tickets."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class TicketPredictRequest(BaseModel):
    ticket_text: str = Field(..., min_length=4, description="Customer inquiry or message to classify.")
    save: bool = Field(True, description="Whether to persist the prediction into database history.")


class TicketPredictResponse(BaseModel):
    ticket_id: str
    original_text: str
    cleaned_text: str
    predicted_category: str
    confidence: float
    confidence_percentage: str
    priority: str
    priority_reason: str
    matched_pattern: str
    probabilities: Dict[str, float]
    latency_ms: float
    status: str = "Success"


class TicketResponse(BaseModel):
    id: str
    ticket_text: str
    predicted_category: str
    confidence: float
    priority: str
    priority_reason: Optional[str] = None
    status: str = "Open"
    created_at: str


class TicketListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[TicketResponse]

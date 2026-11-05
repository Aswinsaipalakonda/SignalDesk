"""Pydantic request and response schemas for support tickets."""

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TicketPredictRequest(BaseModel):
    ticket_text: str = Field(
        ...,
        min_length=4,
        max_length=8000,
        description="Customer inquiry or message to classify.",
    )
    save: bool = Field(True, description="Whether to persist the prediction in history.")


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
    saved: bool = False


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


class TicketPriorityUpdate(BaseModel):
    priority: str = Field(..., description="One of High, Medium, Low.")
    reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional human note explaining the manual correction.",
    )

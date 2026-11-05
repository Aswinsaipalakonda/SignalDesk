"""Ticket prediction, triage, and history API routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import TicketRepository
from backend.app.schemas.ticket import (
    TicketListResponse,
    TicketPredictRequest,
    TicketPredictResponse,
    TicketPriorityUpdate,
    TicketResponse,
)
from backend.app.services.analytics_service import ticket_to_response
from backend.app.services.prediction_service import PredictionService

router = APIRouter(prefix="/tickets", tags=["Tickets"])

VALID_PRIORITIES = {"High", "Medium", "Low"}


@router.post("/predict", response_model=TicketPredictResponse)
def predict_ticket(payload: TicketPredictRequest, db: Session = Depends(get_db)):
    """Classify incoming customer ticket text and assess priority."""
    try:
        return PredictionService.predict(
            ticket_text=payload.ticket_text,
            db=db,
            save=payload.save,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive API boundary
        raise HTTPException(status_code=500, detail=f"Prediction error: {exc}") from exc


@router.get("", response_model=TicketListResponse)
def list_tickets(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Category filter"),
    priority: Optional[str] = Query(None, description="Priority filter"),
    search: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db),
):
    """Retrieve paginated ticket records with filtering and search."""
    skip = (page - 1) * limit
    tickets, total = TicketRepository.get_tickets(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        priority=priority,
        search=search,
    )

    return TicketListResponse(
        total=total,
        page=page,
        limit=limit,
        items=[ticket_to_response(ticket) for ticket in tickets],
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """Retrieve a single ticket by ID."""
    ticket = TicketRepository.get_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket_to_response(ticket)


@router.patch("/{ticket_id}/priority", response_model=TicketResponse)
def update_ticket_priority(
    ticket_id: str,
    payload: TicketPriorityUpdate,
    db: Session = Depends(get_db),
):
    """Apply a transparent manual priority correction to a stored ticket."""
    priority = payload.priority.strip().title()
    if priority not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail="priority must be one of High, Medium, or Low",
        )

    ticket = TicketRepository.update_priority(
        db,
        ticket_id=ticket_id,
        priority=priority,
        reason=payload.reason,
    )
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket_to_response(ticket)

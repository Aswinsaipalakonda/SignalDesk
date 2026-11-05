"""Ticket Prediction, Triage, and History API Routes."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import TicketRepository
from backend.app.services.prediction_service import PredictionService
from backend.app.schemas.ticket import (
    TicketPredictRequest,
    TicketPredictResponse,
    TicketResponse,
    TicketListResponse
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/predict", response_model=TicketPredictResponse)
def predict_ticket(payload: TicketPredictRequest, db: Session = Depends(get_db)):
    """Classify incoming customer ticket text and assess priority."""
    try:
        return PredictionService.predict(
            ticket_text=payload.ticket_text,
            db=db,
            save=payload.save
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("", response_model=TicketListResponse)
def list_tickets(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Category filter"),
    priority: Optional[str] = Query(None, description="Priority filter"),
    search: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db)
):
    """Retrieve paginated ticket records with filtering and search."""
    skip = (page - 1) * limit
    tickets, total = TicketRepository.get_tickets(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        priority=priority,
        search=search
    )

    items = [
        TicketResponse(
            id=t.id,
            ticket_text=t.ticket_text,
            predicted_category=t.predicted_category,
            confidence=t.confidence,
            priority=t.priority,
            priority_reason=t.priority_reason,
            status=t.status,
            created_at=t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else ""
        ) for t in tickets
    ]

    return TicketListResponse(
        total=total,
        page=page,
        limit=limit,
        items=items
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """Retrieve single ticket detail by ID."""
    ticket = TicketRepository.get_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return TicketResponse(
        id=ticket.id,
        ticket_text=ticket.ticket_text,
        predicted_category=ticket.predicted_category,
        confidence=ticket.confidence,
        priority=ticket.priority,
        priority_reason=ticket.priority_reason,
        status=ticket.status,
        created_at=ticket.created_at.strftime("%Y-%m-%d %H:%M:%S") if ticket.created_at else ""
    )

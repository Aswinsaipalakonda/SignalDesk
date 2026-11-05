"""Analytics API Routes for Dashboard KPIs and Visualizations."""

from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import TicketRepository
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.analytics import (
    AnalyticsOverviewResponse,
    CategoryDistributionResponse,
    PriorityDistributionResponse
)
from backend.app.schemas.ticket import TicketResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Fetch all aggregated metrics, KPI cards, and charts for Dashboard."""
    return AnalyticsService.get_overview(db)


@router.get("/categories", response_model=CategoryDistributionResponse)
def get_categories(db: Session = Depends(get_db)):
    """Category distribution breakdown."""
    counts = TicketRepository.get_category_counts(db)
    return CategoryDistributionResponse(
        total=sum(counts.values()),
        categories=counts
    )


@router.get("/priorities", response_model=PriorityDistributionResponse)
def get_priorities(db: Session = Depends(get_db)):
    """Priority distribution breakdown."""
    counts = TicketRepository.get_priority_counts(db)
    return PriorityDistributionResponse(
        total=sum(counts.values()),
        priorities=counts
    )


@router.get("/recent-tickets", response_model=List[TicketResponse])
def get_recent(db: Session = Depends(get_db)):
    """Recent ticket submissions."""
    recent = TicketRepository.get_recent_tickets(db, limit=5)
    return [
        TicketResponse(
            id=t.id,
            ticket_text=t.ticket_text,
            predicted_category=t.predicted_category,
            confidence=t.confidence,
            priority=t.priority,
            priority_reason=t.priority_reason,
            status=t.status,
            created_at=t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else ""
        ) for t in recent
    ]

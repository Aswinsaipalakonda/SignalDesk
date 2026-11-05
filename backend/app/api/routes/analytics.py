"""Analytics API routes for dashboard KPIs and visualizations."""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import TicketRepository
from backend.app.schemas.analytics import (
    AnalyticsOverviewResponse,
    CategoryDistributionResponse,
    DatasetInfoResponse,
    PriorityDistributionResponse,
)
from backend.app.schemas.ticket import TicketResponse
from backend.app.services.analytics_service import AnalyticsService, ticket_to_response

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _parse_date(value: Optional[str], *, end_of_day: bool = False) -> Optional[datetime]:
    if not value:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    try:
        parsed = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = datetime.strptime(cleaned, "%Y-%m-%d")
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date '{value}'. Use YYYY-MM-DD or ISO-8601.",
            ) from exc
    if end_of_day and parsed.hour == 0 and parsed.minute == 0 and parsed.second == 0:
        parsed = parsed + timedelta(days=1) - timedelta(seconds=1)
    # Drop timezone info so SQLite/Postgres comparisons remain naive.
    return parsed.replace(tzinfo=None)


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    category: Optional[str] = Query(None, description="Exact category filter"),
    priority: Optional[str] = Query(None, description="High, Medium, or Low"),
    start_date: Optional[str] = Query(None, description="Inclusive start date"),
    end_date: Optional[str] = Query(None, description="Inclusive end date"),
    db: Session = Depends(get_db),
):
    """Aggregated KPIs, distributions, and trend data for the dashboard."""
    start = _parse_date(start_date)
    end = _parse_date(end_date, end_of_day=True)
    if start and end and start > end:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    return AnalyticsService.get_overview(
        db,
        category=category,
        priority=priority,
        start_date=start,
        end_date=end,
    )


@router.get("/dataset", response_model=DatasetInfoResponse)
def get_dataset_info(db: Session = Depends(get_db)):
    """Dataset and model provenance shown on the About and Performance pages."""
    return AnalyticsService.get_dataset_info(db)


@router.get("/categories", response_model=CategoryDistributionResponse)
def get_categories(db: Session = Depends(get_db)):
    counts = TicketRepository.get_category_counts(db)
    return CategoryDistributionResponse(total=sum(counts.values()), categories=counts)


@router.get("/priorities", response_model=PriorityDistributionResponse)
def get_priorities(db: Session = Depends(get_db)):
    counts = TicketRepository.get_priority_counts(db)
    return PriorityDistributionResponse(total=sum(counts.values()), priorities=counts)


@router.get("/recent-tickets", response_model=List[TicketResponse])
def get_recent(db: Session = Depends(get_db)):
    recent = TicketRepository.get_recent_tickets(db, limit=5)
    return [ticket_to_response(ticket) for ticket in recent]

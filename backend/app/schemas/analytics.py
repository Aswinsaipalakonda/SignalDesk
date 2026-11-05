"""Pydantic Schemas for Analytics and KPI Outputs."""

from typing import Dict, List, Optional
from pydantic import BaseModel
from backend.app.schemas.ticket import TicketResponse


class KpiMetric(BaseModel):
    title: str
    value: str
    numeric_value: int | float
    trend: str
    icon: str
    color: str


class AnalyticsOverviewResponse(BaseModel):
    total_tickets: int
    billing_tickets: int
    technical_tickets: int
    high_priority_tickets: int
    model_accuracy: str
    kpi_cards: List[KpiMetric]
    category_distribution: Dict[str, int]
    priority_distribution: Dict[str, int]
    recent_tickets: List[TicketResponse]


class CategoryDistributionResponse(BaseModel):
    total: int
    categories: Dict[str, int]


class PriorityDistributionResponse(BaseModel):
    total: int
    priorities: Dict[str, int]

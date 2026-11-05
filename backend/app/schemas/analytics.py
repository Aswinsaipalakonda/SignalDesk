"""Pydantic schemas for analytics and KPI outputs."""

from typing import Dict, List, Optional

from pydantic import BaseModel

from backend.app.schemas.ticket import TicketResponse


class KpiMetric(BaseModel):
    title: str
    value: str
    numeric_value: float
    trend: str
    icon: str
    color: str
    description: Optional[str] = None


class TimeSeriesPoint(BaseModel):
    date: str
    tickets: int
    high_priority: int


class AnalyticsOverviewResponse(BaseModel):
    total_tickets: int
    billing_tickets: int
    technical_tickets: int
    high_priority_tickets: int
    model_accuracy: str
    avg_confidence: float = 0.0
    model_algorithm: str = ""
    f1_macro: float = 0.0
    num_categories: int = 0
    kpi_cards: List[KpiMetric]
    category_distribution: Dict[str, int]
    priority_distribution: Dict[str, int]
    time_series: List[TimeSeriesPoint] = []
    categories: List[str] = []
    priorities: List[str] = []
    recent_tickets: List[TicketResponse]
    date_range: Dict[str, str] = {}


class CategoryDistributionResponse(BaseModel):
    total: int
    categories: Dict[str, int]


class PriorityDistributionResponse(BaseModel):
    total: int
    priorities: Dict[str, int]


class DatasetInfoResponse(BaseModel):
    dataset_name: str
    dataset_source: str
    total_records: int
    stored_records: int
    categories: Dict[str, int]
    priorities: Dict[str, int]
    date_min: Optional[str] = None
    date_max: Optional[str] = None
    vectorizer_config: Dict[str, object] = {}
    preprocessing: Dict[str, object] = {}
    model_version: str = ""
    training_date: str = ""

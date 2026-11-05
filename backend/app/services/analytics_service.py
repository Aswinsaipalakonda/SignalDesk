"""Analytics aggregation for the SignalDesk dashboard."""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from backend.app.database.models import Ticket
from backend.app.database.repository import TicketRepository
from backend.app.ml.model_loader import ModelLoader
from backend.app.schemas.analytics import (
    AnalyticsOverviewResponse,
    DatasetInfoResponse,
    KpiMetric,
    TimeSeriesPoint,
)
from backend.app.schemas.ticket import TicketResponse


def ticket_to_response(ticket: Ticket) -> TicketResponse:
    return TicketResponse(
        id=ticket.id,
        ticket_text=ticket.ticket_text,
        predicted_category=ticket.predicted_category,
        confidence=ticket.confidence or 0.0,
        priority=ticket.priority,
        priority_reason=ticket.priority_reason,
        status=ticket.status,
        created_at=ticket.created_at.strftime("%Y-%m-%d %H:%M:%S")
        if ticket.created_at
        else "",
    )


def _share(value: int, total: int) -> str:
    if total <= 0:
        return "No records in range"
    return f"{value / total * 100:.1f}% of filtered volume"


def _build_time_series(tickets: List[Ticket]) -> List[TimeSeriesPoint]:
    if not tickets:
        return []

    daily: Counter = Counter()
    daily_high: Counter = Counter()
    for ticket in tickets:
        if not ticket.created_at:
            continue
        key = ticket.created_at.strftime("%Y-%m-%d")
        daily[key] += 1
        if ticket.priority == "High":
            daily_high[key] += 1

    if not daily:
        return []

    start = min(datetime.strptime(day, "%Y-%m-%d") for day in daily)
    end = max(datetime.strptime(day, "%Y-%m-%d") for day in daily)
    points: List[TimeSeriesPoint] = []
    cursor = start
    while cursor <= end:
        key = cursor.strftime("%Y-%m-%d")
        points.append(
            TimeSeriesPoint(
                date=key,
                tickets=int(daily.get(key, 0)),
                high_priority=int(daily_high.get(key, 0)),
            )
        )
        cursor += timedelta(days=1)
    return points


class AnalyticsService:

    @staticmethod
    def get_overview(
        db: Session,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> AnalyticsOverviewResponse:
        tickets = TicketRepository.get_filtered_tickets(
            db,
            category=category,
            priority=priority,
            start_date=start_date,
            end_date=end_date,
        )

        total_tickets = len(tickets)
        cat_counts = Counter(ticket.predicted_category for ticket in tickets)
        prio_counts = Counter(ticket.priority for ticket in tickets)

        billing_tickets = int(cat_counts.get("Billing & Payment", 0))
        technical_tickets = int(cat_counts.get("Technical Support", 0))
        high_prio_tickets = int(prio_counts.get("High", 0))

        confidence_values = [t.confidence for t in tickets if (t.confidence or 0) > 0]
        avg_confidence = (
            round(sum(confidence_values) / len(confidence_values), 4)
            if confidence_values
            else 0.0
        )

        meta = ModelLoader.get_metadata()
        metrics = meta.get("metrics", {})
        accuracy = float(metrics.get("accuracy", 0.0))
        f1_macro = float(metrics.get("f1_macro", 0.0))
        accuracy_str = f"{accuracy * 100:.1f}%"

        # Genuine "last seven days" count relative to the newest ticket in the
        # filtered range (dataset dates do not always align with wall-clock time).
        newest = max((t.created_at for t in tickets if t.created_at), default=None)
        recent_week = 0
        if newest is not None:
            cutoff = newest - timedelta(days=7)
            recent_week = sum(
                1 for t in tickets if t.created_at and t.created_at >= cutoff
            )

        categories = TicketRepository.get_distinct_categories(db)
        priorities = TicketRepository.get_distinct_priorities(db)

        kpi_cards: List[KpiMetric] = [
            KpiMetric(
                title="Total Tickets",
                value=f"{total_tickets:,}",
                numeric_value=float(total_tickets),
                trend=f"{recent_week:,} in the latest 7 days" if newest else "Live history",
                icon="ticket",
                color="#019077",
                description="Records matching the active filters.",
            ),
            KpiMetric(
                title="Billing & Payment",
                value=f"{billing_tickets:,}",
                numeric_value=float(billing_tickets),
                trend=_share(billing_tickets, total_tickets),
                icon="credit-card",
                color="#003437",
                description="Payment, invoice, and refund related inquiries.",
            ),
            KpiMetric(
                title="Technical Support",
                value=f"{technical_tickets:,}",
                numeric_value=float(technical_tickets),
                trend=_share(technical_tickets, total_tickets),
                icon="headphones",
                color="#0284C7",
                description="Troubleshooting and product malfunction inquiries.",
            ),
            KpiMetric(
                title="High Priority",
                value=f"{high_prio_tickets:,}",
                numeric_value=float(high_prio_tickets),
                trend=_share(high_prio_tickets, total_tickets),
                icon="alert-triangle",
                color="#DC2626",
                description="Rule-engine assessments requiring urgent review.",
            ),
            KpiMetric(
                title="Model Accuracy",
                value=accuracy_str,
                numeric_value=round(accuracy * 100, 2),
                trend=f"Macro-F1 {f1_macro:.3f}",
                icon="target",
                color="#019077",
                description="Held-out test accuracy from the trained classifier.",
            ),
        ]

        recent_responses = [ticket_to_response(ticket) for ticket in tickets[:5]]

        date_range: Dict[str, str] = {}
        if tickets:
            dates = [t.created_at for t in tickets if t.created_at]
            if dates:
                date_range = {
                    "start": min(dates).strftime("%Y-%m-%d"),
                    "end": max(dates).strftime("%Y-%m-%d"),
                }

        return AnalyticsOverviewResponse(
            total_tickets=total_tickets,
            billing_tickets=billing_tickets,
            technical_tickets=technical_tickets,
            high_priority_tickets=high_prio_tickets,
            model_accuracy=accuracy_str,
            avg_confidence=avg_confidence,
            model_algorithm=meta.get("algorithm", ""),
            f1_macro=f1_macro,
            num_categories=int(meta.get("num_categories", len(categories))),
            kpi_cards=kpi_cards,
            category_distribution=dict(cat_counts),
            priority_distribution={
                level: int(prio_counts.get(level, 0))
                for level in ("High", "Medium", "Low")
            },
            time_series=_build_time_series(tickets),
            categories=categories,
            priorities=priorities,
            recent_tickets=recent_responses,
            date_range=date_range,
        )

    @staticmethod
    def get_dataset_info(db: Session) -> DatasetInfoResponse:
        meta = ModelLoader.get_metadata()
        summary = meta.get("dataset_summary", {})
        stored = db.query(Ticket).count()

        return DatasetInfoResponse(
            dataset_name=meta.get("dataset_name", "Customer Support Dataset"),
            dataset_source=meta.get("dataset_source", "bundled CSV"),
            total_records=int(summary.get("total_rows", stored)),
            stored_records=int(stored),
            categories={str(k): int(v) for k, v in summary.get("categories", {}).items()},
            priorities={str(k): int(v) for k, v in summary.get("priorities", {}).items()},
            date_min=summary.get("date_min"),
            date_max=summary.get("date_max"),
            vectorizer_config=meta.get("vectorizer_config", {}),
            preprocessing=meta.get("preprocessing", {}),
            model_version=meta.get("version", ""),
            training_date=meta.get("training_date", ""),
        )

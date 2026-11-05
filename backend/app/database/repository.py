"""Database repository layer for SignalDesk."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Query, Session

from backend.app.database.models import Ticket


class TicketRepository:

    @staticmethod
    def create_ticket(
        db: Session,
        ticket_id: str,
        ticket_text: str,
        predicted_category: str,
        confidence: float,
        priority: str,
        priority_reason: str,
        status: str = "Open",
    ) -> Ticket:
        """Create and commit a new ticket record."""
        ticket = Ticket(
            id=ticket_id,
            ticket_text=ticket_text,
            predicted_category=predicted_category,
            confidence=confidence,
            priority=priority,
            priority_reason=priority_reason,
            status=status,
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def get_by_id(db: Session, ticket_id: str) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.id == ticket_id).first()

    @staticmethod
    def _apply_filters(
        query: Query,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
    ) -> Query:
        if category and category.lower() != "all":
            query = query.filter(Ticket.predicted_category == category)

        if priority and priority.lower() != "all":
            query = query.filter(Ticket.priority == priority)

        if start_date is not None:
            query = query.filter(Ticket.created_at >= start_date)

        if end_date is not None:
            query = query.filter(Ticket.created_at <= end_date)

        if search and search.strip():
            pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Ticket.ticket_text.ilike(pattern),
                    Ticket.id.ilike(pattern),
                    Ticket.predicted_category.ilike(pattern),
                )
            )

        return query

    @staticmethod
    def get_tickets(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Tuple[List[Ticket], int]:
        """Query tickets with pagination, filters, and full-text-like search."""
        query = TicketRepository._apply_filters(
            db.query(Ticket),
            category=category,
            priority=priority,
            search=search,
            start_date=start_date,
            end_date=end_date,
        )
        total = query.count()
        tickets = query.order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()
        return tickets, total

    @staticmethod
    def get_filtered_tickets(
        db: Session,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Ticket]:
        query = TicketRepository._apply_filters(
            db.query(Ticket),
            category=category,
            priority=priority,
            start_date=start_date,
            end_date=end_date,
        )
        return query.order_by(desc(Ticket.created_at)).all()

    @staticmethod
    def get_category_counts(db: Session) -> Dict[str, int]:
        rows = (
            db.query(Ticket.predicted_category, func.count(Ticket.id))
            .group_by(Ticket.predicted_category)
            .order_by(desc(func.count(Ticket.id)))
            .all()
        )
        return {cat: count for cat, count in rows}

    @staticmethod
    def get_priority_counts(db: Session) -> Dict[str, int]:
        rows = (
            db.query(Ticket.priority, func.count(Ticket.id))
            .group_by(Ticket.priority)
            .all()
        )
        return {prio: count for prio, count in rows}

    @staticmethod
    def get_recent_tickets(db: Session, limit: int = 5) -> List[Ticket]:
        return db.query(Ticket).order_by(desc(Ticket.created_at)).limit(limit).all()

    @staticmethod
    def get_distinct_categories(db: Session) -> List[str]:
        rows = (
            db.query(Ticket.predicted_category)
            .distinct()
            .order_by(Ticket.predicted_category.asc())
            .all()
        )
        return [row[0] for row in rows if row[0]]

    @staticmethod
    def get_distinct_priorities(db: Session) -> List[str]:
        rows = db.query(Ticket.priority).distinct().all()
        known = {"High": 0, "Medium": 1, "Low": 2}
        values = [row[0] for row in rows if row[0]]
        return sorted(values, key=lambda value: known.get(value, 99))

    @staticmethod
    def update_priority(
        db: Session,
        ticket_id: str,
        priority: str,
        reason: Optional[str] = None,
    ) -> Optional[Ticket]:
        ticket = TicketRepository.get_by_id(db, ticket_id)
        if ticket is None:
            return None
        ticket.priority = priority
        ticket.priority_reason = reason or "Priority manually corrected by a support agent."
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def get_average_confidence(db: Session) -> float:
        value = db.query(func.avg(Ticket.confidence)).filter(Ticket.confidence > 0).scalar()
        return round(float(value), 4) if value is not None else 0.0

    @staticmethod
    def get_date_bounds(db: Session) -> Tuple[Optional[datetime], Optional[datetime]]:
        row = db.query(func.min(Ticket.created_at), func.max(Ticket.created_at)).first()
        if not row:
            return None, None
        return row[0], row[1]

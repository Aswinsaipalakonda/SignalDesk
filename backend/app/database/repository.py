"""Database Repository Layer for SignalDesk Backend."""

from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
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
        status: str = "Open"
    ) -> Ticket:
        """Create and commit a new ticket record."""
        ticket = Ticket(
            id=ticket_id,
            ticket_text=ticket_text,
            predicted_category=predicted_category,
            confidence=confidence,
            priority=priority,
            priority_reason=priority_reason,
            status=status
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def get_by_id(db: Session, ticket_id: str) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.id == ticket_id).first()

    @staticmethod
    def get_tickets(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Ticket], int]:
        """Query tickets with pagination, category/priority filter, and search."""
        query = db.query(Ticket)

        if category and category.lower() != "all":
            query = query.filter(Ticket.predicted_category == category)

        if priority and priority.lower() != "all":
            query = query.filter(Ticket.priority == priority)

        if search and search.strip():
            pattern = f"%{search.strip()}%"
            query = query.filter(
                (Ticket.ticket_text.ilike(pattern)) | (Ticket.id.ilike(pattern))
            )

        total = query.count()
        tickets = query.order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()
        return tickets, total

    @staticmethod
    def get_category_counts(db: Session) -> Dict[str, int]:
        rows = (
            db.query(Ticket.predicted_category, func.count(Ticket.id))
            .group_by(Ticket.predicted_category)
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
        return (
            db.query(Ticket)
            .order_by(desc(Ticket.created_at))
            .limit(limit)
            .all()
        )

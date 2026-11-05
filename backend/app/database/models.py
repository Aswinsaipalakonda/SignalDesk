"""SQLAlchemy database models for SignalDesk."""

import datetime

from sqlalchemy import Column, DateTime, Float, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Ticket(Base):
    """Customer support ticket history record."""

    __tablename__ = "tickets"

    id = Column(String(64), primary_key=True, index=True)
    ticket_text = Column(Text, nullable=False)
    predicted_category = Column(String(64), nullable=False, index=True)
    confidence = Column(Float, nullable=False, default=0.0)
    priority = Column(String(32), nullable=False, index=True)
    priority_reason = Column(Text, nullable=True)
    status = Column(String(32), default="Open", nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None),
        index=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_text": self.ticket_text,
            "predicted_category": self.predicted_category,
            "confidence": self.confidence,
            "priority": self.priority,
            "priority_reason": self.priority_reason,
            "status": self.status,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if self.created_at
            else "",
        }

"""SQLite Storage Module for Ticket History and Submission Logs in SignalDesk.

Provides persistent storage for incoming analyzed tickets, prediction confidence,
priority reasons, and filtering utilities for Ticket Explorer and Analytics.
"""

from typing import Dict, List, Optional, Any
import os
import sqlite3
import pandas as pd


DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "signaldesk_history.db"
)


def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Create or connect to the local SQLite database."""
    path = db_path or DB_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database(db_path: Optional[str] = None):
    """Create tables and indexes if they do not exist."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            ticket_id TEXT PRIMARY KEY,
            ticket_text TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            confidence REAL NOT NULL,
            priority_reason TEXT,
            status TEXT DEFAULT 'Open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_category ON tickets(category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_priority ON tickets(priority)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON tickets(created_at)")
    conn.commit()
    conn.close()


def insert_ticket(
    ticket_id: str,
    ticket_text: str,
    category: str,
    priority: str,
    confidence: float,
    priority_reason: str = "",
    status: str = "Open",
    created_at: Optional[str] = None,
    db_path: Optional[str] = None
) -> bool:
    """Store an analyzed support ticket into SQLite history."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    try:
        if created_at:
            cursor.execute("""
                INSERT INTO tickets (ticket_id, ticket_text, category, priority, confidence, priority_reason, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (ticket_id, ticket_text, category, priority, confidence, priority_reason, status, created_at))
        else:
            cursor.execute("""
                INSERT INTO tickets (ticket_id, ticket_text, category, priority, confidence, priority_reason, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (ticket_id, ticket_text, category, priority, confidence, priority_reason, status))
        conn.commit()
        return True
    except Exception as e:
        print(f"Database insertion error: {e}")
        return False
    finally:
        conn.close()


def get_all_tickets(
    category_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    search_query: Optional[str] = None,
    limit: int = 1000,
    db_path: Optional[str] = None
) -> pd.DataFrame:
    """Retrieve ticket records with optional filtering."""
    conn = get_connection(db_path)
    query = "SELECT * FROM tickets WHERE 1=1"
    params: List[Any] = []

    if category_filter and category_filter != "All":
        query += " AND category = ?"
        params.append(category_filter)

    if priority_filter and priority_filter != "All":
        query += " AND priority = ?"
        params.append(priority_filter)

    if search_query and search_query.strip():
        query += " AND (ticket_text LIKE ? OR ticket_id LIKE ?)"
        like_term = f"%{search_query.strip()}%"
        params.extend([like_term, like_term])

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df


def seed_initial_tickets_if_empty(sample_df: pd.DataFrame, db_path: Optional[str] = None):
    """Seed SQLite database with initial records from the dataset if empty."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM tickets")
    count = cursor.fetchone()[0]
    conn.close()

    if count == 0 and not sample_df.empty:
        print("Seeding initial ticket history into SQLite...")
        for _, row in sample_df.head(200).iterrows():
            t_id = str(row.get("ticket_id", "TCK-1000"))
            text = str(row.get("ticket_text", ""))
            cat = str(row.get("category", "General Inquiry"))
            prio = str(row.get("priority", "Medium"))
            created = str(row.get("created_at", pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")))
            insert_ticket(
                ticket_id=t_id,
                ticket_text=text,
                category=cat,
                priority=prio,
                confidence=0.88,
                priority_reason="Historical verified support issue.",
                created_at=created,
                db_path=db_path
            )


# Initialize schema on module import
initialize_database()


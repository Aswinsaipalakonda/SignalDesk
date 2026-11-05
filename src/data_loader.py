"""Data Loading and Validation Module for SignalDesk.

Handles loading CSV datasets, mapping arbitrary column schemas,
cleaning missing/empty records, and reporting dataset integrity stats.
"""

from typing import Dict, Optional, Tuple
import os
import pandas as pd


DEFAULT_RAW_DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "raw", "customer_support_tickets.csv"
)
DEFAULT_PROCESSED_DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "processed", "cleaned_tickets.csv"
)

COLUMN_SYNONYMS = {
    "ticket_id": ["ticket_id", "id", "ticket_number", "incident_id", "case_id"],
    "ticket_text": ["ticket_text", "text", "description", "body", "issue", "complaint", "message"],
    "category": ["category", "queue", "department", "ticket_type", "type", "topic", "class"],
    "priority": ["priority", "severity", "urgency", "impact"],
    "created_at": ["created_at", "timestamp", "date", "created_date", "opened_at"]
}


def auto_map_columns(df: pd.DataFrame) -> Dict[str, str]:
    """Infer column mapping from dataset header synonyms.

    Args:
        df: Input pandas DataFrame.

    Returns:
        Dictionary mapping standardized keys to actual column names in df.
    """
    col_lookup = {str(col).strip().lower(): col for col in df.columns}
    mapping: Dict[str, str] = {}

    for standard_col, synonyms in COLUMN_SYNONYMS.items():
        for syn in synonyms:
            if syn in col_lookup:
                mapping[standard_col] = col_lookup[syn]
                break

    return mapping


def load_dataset(
    filepath: Optional[str] = None,
    column_mapping: Optional[Dict[str, str]] = None
) -> Tuple[pd.DataFrame, Dict[str, any]]:
    """Load and validate customer support ticket dataset.

    Args:
        filepath: Path to the CSV file. Defaults to DEFAULT_RAW_DATA_PATH.
        column_mapping: Optional explicit mapping of standard columns to CSV columns.

    Returns:
        Tuple of (Standardized pandas DataFrame, metadata summary dict).
    """
    path = filepath or DEFAULT_RAW_DATA_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset file not found at: {path}")

    df = pd.read_csv(path)
    initial_count = len(df)

    if column_mapping is None:
        mapping = auto_map_columns(df)
    else:
        mapping = column_mapping

    required_cols = ["ticket_text", "category"]
    missing_required = [col for col in required_cols if col not in mapping or mapping[col] not in df.columns]
    if missing_required:
        raise ValueError(
            f"Dataset is missing required mapped columns: {missing_required}. "
            f"Available columns: {list(df.columns)}"
        )

    # Standardize column names
    standard_df = pd.DataFrame()
    for std_name, src_name in mapping.items():
        if src_name in df.columns:
            standard_df[std_name] = df[src_name]

    if "ticket_id" not in standard_df.columns:
        standard_df["ticket_id"] = [f"TCK-{10000 + i}" for i in range(len(standard_df))]

    if "created_at" not in standard_df.columns:
        standard_df["created_at"] = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")

    # Clean missing or invalid tickets
    standard_df = standard_df.dropna(subset=["ticket_text", "category"])
    standard_df["ticket_text"] = standard_df["ticket_text"].astype(str).str.strip()
    standard_df = standard_df[standard_df["ticket_text"].str.len() > 3]

    # Remove duplicate texts
    duplicates_removed = initial_count - len(standard_df)
    standard_df = standard_df.drop_duplicates(subset=["ticket_text"])

    metadata = {
        "raw_record_count": initial_count,
        "clean_record_count": len(standard_df),
        "duplicates_or_empty_removed": duplicates_removed,
        "categories": sorted(standard_df["category"].dropna().unique().tolist()),
        "category_counts": standard_df["category"].value_counts().to_dict(),
        "has_priority": "priority" in standard_df.columns and not standard_df["priority"].isnull().all(),
        "priority_counts": standard_df["priority"].value_counts().to_dict() if "priority" in standard_df.columns else {}
    }

    return standard_df, metadata


def save_processed_dataset(df: pd.DataFrame, target_path: Optional[str] = None) -> str:
    """Save cleaned dataset to disk."""
    path = target_path or DEFAULT_PROCESSED_DATA_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    return path


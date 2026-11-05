"""Dataset loading, validation, and cleaning for SignalDesk.

The loader is intentionally tolerant of differently named CSV columns. Callers
may supply a column mapping (``{"category": "department"}``) and the loader will
normalise the frame to the canonical schema used by the training pipeline:

    ticket_id, ticket_text, category, priority, created_at
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional

import pandas as pd

from backend.app.core.config import settings

CANONICAL_COLUMNS = ["ticket_id", "ticket_text", "category", "priority", "created_at"]
REQUIRED_COLUMNS = ["ticket_text", "category"]

# Common alternative column names seen in public support datasets.
DEFAULT_COLUMN_ALIASES: Dict[str, List[str]] = {
    "ticket_id": ["id", "ticketid", "ticket_no", "ticket_number", "case_id"],
    "ticket_text": [
        "text",
        "message",
        "ticket",
        "body",
        "description",
        "subject",
        "complaint",
        "query",
        "content",
    ],
    "category": ["label", "department", "topic", "intent", "class", "type"],
    "priority": ["severity", "urgency", "priority_level"],
    "created_at": ["date", "timestamp", "created", "submitted_at", "createdat"],
}


@dataclass
class DatasetSummary:
    """Human readable summary of a cleaned dataset."""

    total_rows: int
    duplicate_rows_removed: int
    null_rows_removed: int
    categories: Dict[str, int] = field(default_factory=dict)
    priorities: Dict[str, int] = field(default_factory=dict)
    date_min: Optional[str] = None
    date_max: Optional[str] = None

    def as_dict(self) -> dict:
        return {
            "total_rows": self.total_rows,
            "duplicate_rows_removed": self.duplicate_rows_removed,
            "null_rows_removed": self.null_rows_removed,
            "categories": self.categories,
            "priorities": self.priorities,
            "date_min": self.date_min,
            "date_max": self.date_max,
        }


def _resolve_columns(df: pd.DataFrame, mapping: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    """Resolve canonical names to the actual columns present in the frame."""
    mapping = {**{}, **(mapping or {})}
    lowered = {str(col).strip().lower(): col for col in df.columns}
    resolved: Dict[str, str] = {}

    for canonical in REQUIRED_COLUMNS + ["ticket_id", "priority", "created_at"]:
        # Explicit mapping wins.
        explicit = mapping.get(canonical)
        if explicit and explicit in df.columns:
            resolved[canonical] = explicit
            continue

        if canonical in df.columns:
            resolved[canonical] = canonical
            continue

        for alias in DEFAULT_COLUMN_ALIASES.get(canonical, []):
            if alias in lowered:
                resolved[canonical] = lowered[alias]
                break

    return resolved


def load_support_dataset(
    path: Optional[str] = None,
    column_mapping: Optional[Dict[str, str]] = None,
    min_text_length: int = 5,
) -> pd.DataFrame:
    """Load and clean a customer support ticket CSV.

    Args:
        path: Optional CSV path. Defaults to the bundled raw dataset.
        column_mapping: Optional canonical -> source column name map.
        min_text_length: Messages shorter than this are discarded.

    Raises:
        FileNotFoundError: If the dataset path does not exist.
        ValueError: If required text/category columns are missing.
    """
    dataset_path = path or str(settings.RAW_DATASET_PATH)
    try:
        raw = pd.read_csv(dataset_path)
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"Dataset not found at {dataset_path}") from exc
    except Exception as exc:  # pragma: no cover - pandas error surface varies
        raise ValueError(f"Unable to read dataset: {exc}") from exc

    resolved = _resolve_columns(raw, column_mapping)
    missing = [col for col in REQUIRED_COLUMNS if col not in resolved]
    if missing:
        raise ValueError(
            "Dataset is missing required column(s): "
            + ", ".join(missing)
            + ". Provide a column mapping to continue."
        )

    df = pd.DataFrame()
    for canonical, source in resolved.items():
        df[canonical] = raw[source]

    # Optional columns fall back to safe defaults.
    if "ticket_id" not in df.columns:
        df["ticket_id"] = [f"TCK-{10000 + i}" for i in range(len(df))]
    if "priority" not in df.columns:
        df["priority"] = pd.NA
    if "created_at" not in df.columns:
        df["created_at"] = pd.NaT

    initial_rows = len(df)

    # Normalise text and category labels.
    df["ticket_text"] = df["ticket_text"].astype("string").fillna("").str.strip()
    df["category"] = df["category"].astype("string").fillna("").str.strip()
    df["ticket_id"] = df["ticket_id"].astype("string").fillna("")
    df["priority"] = df["priority"].astype("string").str.strip().str.title()
    df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")

    # Remove unusable records.
    null_mask = (df["ticket_text"].str.len() < min_text_length) | (df["category"].str.len() == 0)
    null_rows = int(null_mask.sum())
    df = df.loc[~null_mask].copy()

    before_dedupe = len(df)
    df = df.drop_duplicates(subset=["ticket_text", "category"]).copy()
    duplicates = before_dedupe - len(df)

    # Backfill missing IDs after dedupe.
    missing_ids = df["ticket_id"].eq("")
    df.loc[missing_ids, "ticket_id"] = [
        f"TCK-{20000 + i}" for i in range(int(missing_ids.sum()))
    ]

    df = df.reset_index(drop=True)
    df.attrs["summary"] = summarize_dataset(
        df,
        initial_rows=initial_rows,
        null_rows_removed=null_rows,
        duplicate_rows_removed=duplicates,
    )
    return df


def summarize_dataset(
    df: pd.DataFrame,
    initial_rows: Optional[int] = None,
    null_rows_removed: int = 0,
    duplicate_rows_removed: int = 0,
) -> DatasetSummary:
    """Build a dataset summary used by the UI and metadata."""
    categories = {str(k): int(v) for k, v in df["category"].value_counts().items()}
    priorities = (
        {str(k): int(v) for k, v in df["priority"].dropna().value_counts().items()}
        if "priority" in df.columns
        else {}
    )

    date_min = date_max = None
    if "created_at" in df.columns and df["created_at"].notna().any():
        date_min = str(df["created_at"].min())
        date_max = str(df["created_at"].max())

    return DatasetSummary(
        total_rows=int(len(df)),
        duplicate_rows_removed=int(duplicate_rows_removed),
        null_rows_removed=int(null_rows_removed),
        categories=categories,
        priorities=priorities,
        date_min=date_min,
        date_max=date_max,
    )


def supported_labels(df: pd.DataFrame) -> List[str]:
    """Return a deterministic, sorted list of target labels."""
    return sorted(str(label) for label in df["category"].dropna().unique())


def iter_texts(df: pd.DataFrame) -> Iterable[str]:
    return (str(text) for text in df["ticket_text"].tolist())

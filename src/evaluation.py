"""Model Evaluation and Reporting Module for SignalDesk.

Computes precision, recall, macro-F1, confusion matrix, and per-class metrics
on held-out test splits.
"""

from typing import Dict, List, Any
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


def evaluate_classifier(
    y_true: List[str] | np.ndarray,
    y_pred: List[str] | np.ndarray,
    labels: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Compute comprehensive evaluation metrics for multi-class classification.

    Args:
        y_true: True class labels.
        y_pred: Predicted class labels.
        labels: Sorted list of distinct target class names.

    Returns:
        Structured dictionary containing metrics, per-class breakdown,
        and confusion matrix array.
    """
    if labels is None:
        labels = sorted(list(set(y_true).union(set(y_pred))))

    acc = float(accuracy_score(y_true, y_pred))
    prec_macro = float(precision_score(y_true, y_pred, labels=labels, average="macro", zero_division=0))
    rec_macro = float(recall_score(y_true, y_pred, labels=labels, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, labels=labels, average="macro", zero_division=0))

    prec_weighted = float(precision_score(y_true, y_pred, labels=labels, average="weighted", zero_division=0))
    rec_weighted = float(recall_score(y_true, y_pred, labels=labels, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_true, y_pred, labels=labels, average="weighted", zero_division=0))

    cm = confusion_matrix(y_true, y_pred, labels=labels).tolist()
    report_dict = classification_report(y_true, y_pred, labels=labels, output_dict=True, zero_division=0)

    return {
        "accuracy": round(acc, 4),
        "precision_macro": round(prec_macro, 4),
        "recall_macro": round(rec_macro, 4),
        "f1_macro": round(f1_macro, 4),
        "precision_weighted": round(prec_weighted, 4),
        "recall_weighted": round(rec_weighted, 4),
        "f1_weighted": round(f1_weighted, 4),
        "labels": labels,
        "confusion_matrix": cm,
        "classification_report": report_dict
    }


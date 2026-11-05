"""Model evaluation helpers used by the training pipeline and API."""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)


def evaluate_classifier(
    model: Any,
    x_test,
    y_test: Sequence[str],
    labels: Optional[Sequence[str]] = None,
) -> Dict[str, Any]:
    """Return genuine held-out metrics for a fitted classifier."""
    y_pred = model.predict(x_test)

    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        y_test, y_pred, average="macro", zero_division=0
    )
    precision_weighted, recall_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )

    label_list: List[str] = list(labels) if labels is not None else sorted(
        {str(v) for v in np.concatenate([np.asarray(y_test), np.asarray(y_pred)])}
    )

    report = classification_report(
        y_test,
        y_pred,
        labels=label_list,
        output_dict=True,
        zero_division=0,
    )
    matrix = confusion_matrix(y_test, y_pred, labels=label_list).tolist()

    return {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision_macro": float(precision_macro),
        "recall_macro": float(recall_macro),
        "f1_macro": float(f1_macro),
        "precision_weighted": float(precision_weighted),
        "recall_weighted": float(recall_weighted),
        "f1_weighted": float(f1_weighted),
        "labels": label_list,
        "confusion_matrix": matrix,
        "classification_report": report,
    }


def comparison_row(metrics: Dict[str, Any]) -> Dict[str, float]:
    """Extract the subset of metrics shown in algorithm comparison tables."""
    return {
        "accuracy": round(float(metrics["accuracy"]), 4),
        "precision_macro": round(float(metrics["precision_macro"]), 4),
        "recall_macro": round(float(metrics["recall_macro"]), 4),
        "f1_macro": round(float(metrics["f1_macro"]), 4),
        "f1_weighted": round(float(metrics["f1_weighted"]), 4),
    }


def select_best_model(comparison: Dict[str, Dict[str, float]]) -> str:
    """Choose the model with the best macro-F1, using accuracy as tie-breaker."""
    if not comparison:
        raise ValueError("No trained models to compare.")
    return max(
        comparison,
        key=lambda name: (comparison[name]["f1_macro"], comparison[name]["accuracy"]),
    )

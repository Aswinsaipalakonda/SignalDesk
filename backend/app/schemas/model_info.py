"""Pydantic Schemas for Model Performance and Evaluation Reporting."""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel


class AlgorithmMetric(BaseModel):
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float


class ModelPerformanceResponse(BaseModel):
    model_name: str
    algorithm: str
    selected_reason: str
    training_date: str
    total_samples: int
    train_samples: int
    test_samples: int
    num_categories: int
    accuracy: float
    f1_macro: float
    categories: List[str]
    confusion_matrix: List[List[int]]
    classification_report: Dict[str, Any]
    comparison: Dict[str, AlgorithmMetric]

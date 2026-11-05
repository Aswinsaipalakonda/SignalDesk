"""Machine Learning Training Pipeline for SignalDesk.

Loads real customer support data, executes stratified train/test split,
fits TF-IDF representation, trains Multinomial Naive Bayes & Logistic Regression,
benchmarks metrics, and saves the top-performing artifact with complete metadata.
"""

from typing import Dict, Any, Tuple
import os
import json
import datetime
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression

from src.data_loader import load_dataset, save_processed_dataset, DEFAULT_RAW_DATA_PATH
from src.preprocessing import preprocess_support_text
from src.feature_engineering import fit_and_save_vectorizer, DEFAULT_VECTORIZER_PATH
from src.evaluation import evaluate_classifier


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "ticket_classifier.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")


def train_and_evaluate_pipeline(
    raw_csv_path: str = DEFAULT_RAW_DATA_PATH,
    test_size: float = 0.20,
    random_state: int = 42
) -> Dict[str, Any]:
    """Execute end-to-end model training, comparison, and persistence.

    Returns:
        Dictionary containing comparison metrics, selected model metadata, and test stats.
    """
    os.makedirs(MODELS_DIR, exist_ok=True)

    print("Step 1/5: Loading and validating raw customer ticket dataset...")
    raw_df, dataset_meta = load_dataset(raw_csv_path)

    print(f"Step 2/5: Preprocessing {len(raw_df)} support ticket messages...")
    raw_df["clean_text"] = raw_df["ticket_text"].apply(preprocess_support_text)
    # Filter out any entries that became empty after cleaning
    valid_mask = raw_df["clean_text"].str.strip().str.len() > 2
    clean_df = raw_df[valid_mask].copy()

    # Save processed dataset
    save_processed_dataset(clean_df)

    # Stratified split to preserve class proportions
    x = clean_df["clean_text"].values
    y = clean_df["category"].values

    x_train, x_test, y_train, y_test = train_test_split(
        x, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    print(f"Step 3/5: Fitting TF-IDF vectorizer on {len(x_train)} training records...")
    vectorizer, x_train_vec = fit_and_save_vectorizer(
        x_train,
        target_path=DEFAULT_VECTORIZER_PATH,
        max_features=6000
    )
    x_test_vec = vectorizer.transform(x_test)
    labels = sorted(list(set(y)))

    print("Step 4/5: Training Candidate Algorithms...")
    # 1. Multinomial Naive Bayes Baseline
    nb_model = MultinomialNB(alpha=0.1)
    nb_model.fit(x_train_vec, y_train)
    nb_preds = nb_model.predict(x_test_vec)
    nb_metrics = evaluate_classifier(y_test, nb_preds, labels=labels)

    # 2. Logistic Regression
    lr_model = LogisticRegression(
        C=2.5,
        max_iter=1000,
        class_weight="balanced",
        random_state=random_state,
        solver="lbfgs"
    )
    lr_model.fit(x_train_vec, y_train)
    lr_preds = lr_model.predict(x_test_vec)
    lr_metrics = evaluate_classifier(y_test, lr_preds, labels=labels)

    print(f"Naive Bayes Macro-F1: {nb_metrics['f1_macro']:.4f} | Accuracy: {nb_metrics['accuracy']:.4f}")
    print(f"Logistic Regression Macro-F1: {lr_metrics['f1_macro']:.4f} | Accuracy: {lr_metrics['accuracy']:.4f}")

    # Compare and select best model on Macro-F1 (robust against class imbalance)
    if lr_metrics["f1_macro"] >= nb_metrics["f1_macro"]:
        best_name = "Logistic Regression"
        best_model = lr_model
        best_metrics = lr_metrics
    else:
        best_name = "Multinomial Naive Bayes"
        best_model = nb_model
        best_metrics = nb_metrics

    print(f"Step 5/5: Serializing winning model ({best_name}) to {MODEL_PATH}...")
    joblib.dump(best_model, MODEL_PATH)

    # Compile comprehensive metadata
    metadata = {
        "model_name": "SignalDesk Ticket Classifier",
        "algorithm": best_name,
        "selected_reason": (
            f"Selected {best_name} based on superior Macro-F1 score "
            f"({best_metrics['f1_macro']:.4f} vs "
            f"{nb_metrics['f1_macro'] if best_name == 'Logistic Regression' else lr_metrics['f1_macro']:.4f}), "
            "providing balanced generalization across both frequent and rare ticket categories."
        ),
        "dataset_name": "Real Customer Support Inquiries",
        "dataset_source": "Hugging Face / Open Customer Support Benchmark",
        "training_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_samples": len(clean_df),
        "train_samples": len(x_train),
        "test_samples": len(x_test),
        "num_categories": len(labels),
        "categories": labels,
        "metrics": best_metrics,
        "comparison": {
            "Multinomial Naive Bayes": {
                "accuracy": nb_metrics["accuracy"],
                "precision_macro": nb_metrics["precision_macro"],
                "recall_macro": nb_metrics["recall_macro"],
                "f1_macro": nb_metrics["f1_macro"]
            },
            "Logistic Regression": {
                "accuracy": lr_metrics["accuracy"],
                "precision_macro": lr_metrics["precision_macro"],
                "recall_macro": lr_metrics["recall_macro"],
                "f1_macro": lr_metrics["f1_macro"]
            }
        },
        "vectorizer_config": {
            "max_features": 6000,
            "ngram_range": [1, 2],
            "min_df": 3,
            "sublinear_tf": True
        },
        "version": "1.0.0"
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("Training pipeline complete! Model metadata saved to:", METADATA_PATH)
    return metadata


if __name__ == "__main__":
    train_and_evaluate_pipeline()


"""Reproducible training pipeline for the SignalDesk ticket classifier.

Run from the repository root:

    python -m backend.app.ml.train_model

The pipeline:
1. Loads and cleans the bundled support ticket dataset.
2. Preprocesses text with the shared inference pipeline.
3. Creates a stratified train/test split.
4. Fits TF-IDF on the training split only.
5. Trains Multinomial Naive Bayes and Logistic Regression.
6. Evaluates both on held-out data and selects the best macro-F1 model.
7. Persists the selected classifier, vectorizer, cleaned dataset, and metadata.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Dict, List, Tuple

import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression

from backend.app.core.config import settings
from backend.app.ml.data_loader import load_support_dataset, supported_labels
from backend.app.ml.evaluation import (
    comparison_row,
    evaluate_classifier,
    select_best_model,
)
from backend.app.ml.feature_engineering import (
    build_tfidf_vectorizer,
    fit_transform_features,
    vectorizer_config,
)
from backend.app.ml.preprocessing import preprocess_support_text


RANDOM_SEED = 42
TEST_SIZE = 0.20


def _sha256(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _prepare_texts(texts: List[str]) -> List[str]:
    """Apply the exact preprocessing used at inference time."""
    prepared: List[str] = []
    for text in texts:
        cleaned = preprocess_support_text(str(text))
        prepared.append(cleaned if cleaned else str(text).lower().strip())
    return prepared


def build_models(seed: int = RANDOM_SEED) -> Dict[str, object]:
    """The two candidate algorithms required by the PRD."""
    return {
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "Logistic Regression": LogisticRegression(
            C=2.0,
            max_iter=2500,
            class_weight="balanced",
            random_state=seed,
        ),
    }


def train(
    dataset_path: str | None = None,
    output_dir: str | None = None,
    seed: int = RANDOM_SEED,
    test_size: float = TEST_SIZE,
) -> Dict[str, object]:
    """Train, evaluate, select, and save the production classifier."""
    dataset_path = dataset_path or settings.RAW_DATASET_PATH
    output_dir = output_dir or settings.MODELS_DIR
    os.makedirs(output_dir, exist_ok=True)

    print(f"[1/7] Loading dataset from {dataset_path}")
    df = load_support_dataset(dataset_path)
    summary = df.attrs.get("summary")

    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    raw_texts = df["ticket_text"].astype(str).tolist()
    labels = df["category"].astype(str).tolist()
    class_names = supported_labels(df)

    print(f"      {len(df):,} usable rows across {len(class_names)} categories")

    print("[2/7] Preprocessing text")
    texts = _prepare_texts(raw_texts)

    # Keep only rows whose preprocessing produced usable text.
    keep = [i for i, text in enumerate(texts) if text.strip()]
    texts = [texts[i] for i in keep]
    labels = [labels[i] for i in keep]

    class_counts = np.bincount([class_names.index(label) for label in labels])
    stratify = labels if class_counts.min() >= 2 else None

    print("[3/7] Creating stratified train/test split")
    x_train_raw, x_test_raw, y_train, y_test = train_test_split(
        texts,
        labels,
        test_size=test_size,
        random_state=seed,
        stratify=stratify,
    )

    print("[4/7] Fitting TF-IDF on training split only")
    vectorizer = build_tfidf_vectorizer()
    x_train, x_test = fit_transform_features(vectorizer, x_train_raw, x_test_raw)
    print(f"      Vocabulary size: {len(vectorizer.vocabulary_):,}")

    print("[5/7] Training candidate algorithms")
    models = build_models(seed)
    comparison: Dict[str, Dict[str, float]] = {}
    evaluations: Dict[str, Dict[str, object]] = {}
    fitted = {}

    for name, model in models.items():
        model.fit(x_train, y_train)
        metrics = evaluate_classifier(model, x_test, y_test, labels=class_names)
        fitted[name] = model
        evaluations[name] = metrics
        comparison[name] = comparison_row(metrics)
        print(
            f"      {name:<26} accuracy={metrics['accuracy']:.4f} "
            f"macro-F1={metrics['f1_macro']:.4f}"
        )

    print("[6/7] Selecting best model by macro-F1")
    selected_name = select_best_model(comparison)
    selected_model = fitted[selected_name]
    selected_metrics = evaluations[selected_name]
    selected_row = comparison[selected_name]
    baseline_name = next(name for name in comparison if name != selected_name)
    baseline_row = comparison[baseline_name]

    selected_reason = (
        f"Selected {selected_name} because it achieved the strongest held-out "
        f"macro-F1 ({selected_row['f1_macro']:.4f} vs "
        f"{baseline_row['f1_macro']:.4f} for {baseline_name}) while maintaining "
        f"{selected_row['accuracy'] * 100:.1f}% accuracy. Macro-F1 is the primary "
        "criterion because it weights every support category equally, including "
        "the smaller classes."
    )

    print("[7/7] Persisting artifacts and metadata")
    model_path = os.path.join(output_dir, "ticket_classifier.joblib")
    vectorizer_path = os.path.join(output_dir, "tfidf_vectorizer.joblib")
    metadata_path = os.path.join(output_dir, "model_metadata.json")
    joblib.dump(selected_model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    os.makedirs(os.path.dirname(settings.PROCESSED_DATASET_PATH), exist_ok=True)
    df.to_csv(settings.PROCESSED_DATASET_PATH, index=False)

    metadata = {
        "model_name": "SignalDesk Ticket Classifier",
        "algorithm": selected_name,
        "selected_reason": selected_reason,
        "dataset_name": "Customer Support Ticket Benchmark",
        "dataset_source": os.path.basename(dataset_path),
        "dataset_sha256": _sha256(dataset_path),
        "dataset_summary": summary.as_dict() if summary else {},
        "training_date": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "total_samples": int(len(texts)),
        "train_samples": int(len(y_train)),
        "test_samples": int(len(y_test)),
        "num_categories": int(len(class_names)),
        "categories": class_names,
        "metrics": selected_metrics,
        "comparison": comparison,
        "vectorizer_config": vectorizer_config(vectorizer),
        "preprocessing": {
            "lowercase": True,
            "strip_html": True,
            "strip_urls": True,
            "remove_stopwords": True,
            "preserve_negations": True,
            "lemmatize": True,
        },
        "random_seed": seed,
        "test_size": test_size,
        "version": "2.1.0",
        "artifact_checksums": {
            "model_sha256": _sha256(model_path),
            "vectorizer_sha256": _sha256(vectorizer_path),
        },
    }

    with open(metadata_path, "w", encoding="utf-8") as handle:
        json.dump(metadata, handle, indent=2)

    print(f"\nSelected model: {selected_name}")
    print(f"Artifacts written to {output_dir}")
    print(f"Metadata written to {metadata_path}")
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the SignalDesk classifier")
    parser.add_argument("--dataset", default=None, help="Optional CSV dataset path")
    parser.add_argument("--output-dir", default=None, help="Artifact output directory")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    parser.add_argument("--test-size", type=float, default=TEST_SIZE)
    args = parser.parse_args()
    train(
        dataset_path=args.dataset,
        output_dir=args.output_dir,
        seed=args.seed,
        test_size=args.test_size,
    )


if __name__ == "__main__":
    main()

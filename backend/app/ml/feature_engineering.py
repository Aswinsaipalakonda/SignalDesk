"""TF-IDF feature engineering for SignalDesk.

The vectorizer is always fitted on training data only. The fitted artifact is
persisted with Joblib and reused for every incoming ticket at inference time.
"""

from __future__ import annotations

from typing import Iterable, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer


DEFAULT_VECTORIZER_CONFIG = {
    "max_features": 20000,
    "ngram_range": (1, 2),
    "min_df": 2,
    "max_df": 0.95,
    "sublinear_tf": True,
    "strip_accents": "unicode",
}


def build_tfidf_vectorizer(
    max_features: int = DEFAULT_VECTORIZER_CONFIG["max_features"],
    ngram_range: Tuple[int, int] = DEFAULT_VECTORIZER_CONFIG["ngram_range"],
    min_df: int = DEFAULT_VECTORIZER_CONFIG["min_df"],
    max_df: float = DEFAULT_VECTORIZER_CONFIG["max_df"],
    sublinear_tf: bool = True,
) -> TfidfVectorizer:
    """Create a configured, unfitted TF-IDF vectorizer."""
    return TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        min_df=min_df,
        max_df=max_df,
        sublinear_tf=sublinear_tf,
        strip_accents="unicode",
        token_pattern=r"(?u)\b\w+\b",
    )


def fit_transform_features(
    vectorizer: TfidfVectorizer,
    train_texts: Iterable[str],
    test_texts: Iterable[str],
):
    """Fit on training text only, then transform both splits.

    This explicitly prevents test-set leakage into the vocabulary or IDF
    weights.
    """
    x_train = vectorizer.fit_transform(train_texts)
    x_test = vectorizer.transform(test_texts)
    return x_train, x_test


def vectorizer_config(vectorizer: TfidfVectorizer) -> dict:
    """Serialize the vectorizer configuration for model_metadata.json."""
    return {
        "max_features": int(vectorizer.max_features or 0),
        "ngram_range": list(vectorizer.ngram_range),
        "min_df": vectorizer.min_df,
        "max_df": vectorizer.max_df,
        "sublinear_tf": bool(vectorizer.sublinear_tf),
        "vocabulary_size": int(len(vectorizer.vocabulary_)),
    }

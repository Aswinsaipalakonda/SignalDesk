"""NLP Feature Engineering Module for SignalDesk.

Implements TF-IDF vectorization with n-gram extraction, persistence,
and leak-proof transformation for both batch training and real-time inference.
"""

from typing import Optional, Tuple
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
import scipy.sparse as sp


DEFAULT_VECTORIZER_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "models", "tfidf_vectorizer.joblib"
)


def create_vectorizer(
    max_features: int = 6000,
    ngram_range: Tuple[int, int] = (1, 2),
    min_df: int = 3,
    sublinear_tf: bool = True
) -> TfidfVectorizer:
    """Instantiate a configured Scikit-learn TfidfVectorizer."""
    return TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        min_df=min_df,
        sublinear_tf=sublinear_tf,
        strip_accents="unicode"
    )


def fit_and_save_vectorizer(
    training_texts: list,
    target_path: Optional[str] = None,
    max_features: int = 6000
) -> Tuple[TfidfVectorizer, sp.csr_matrix]:
    """Fit TF-IDF vectorizer strictly on training data and serialize to disk.

    Args:
        training_texts: Iterable of preprocessed support text documents.
        target_path: Filepath where the vectorizer artifact will be saved.
        max_features: Maximum vocabulary limit.

    Returns:
        Tuple of (fitted TfidfVectorizer, transformed sparse matrix).
    """
    path = target_path or DEFAULT_VECTORIZER_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)

    vectorizer = create_vectorizer(max_features=max_features)
    x_train_vec = vectorizer.fit_transform(training_texts)

    joblib.dump(vectorizer, path)
    return vectorizer, x_train_vec


def load_vectorizer(path: Optional[str] = None) -> TfidfVectorizer:
    """Load pre-fitted TF-IDF vectorizer from disk for inference."""
    filepath = path or DEFAULT_VECTORIZER_PATH
    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"Fitted TF-IDF vectorizer artifact not found at: {filepath}. "
            "Please run the model training pipeline first."
        )
    return joblib.load(filepath)


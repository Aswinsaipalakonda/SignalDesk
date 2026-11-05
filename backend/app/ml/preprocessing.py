"""Text Preprocessing Pipeline for SignalDesk Backend.

Handles text normalization, stripping HTML/URLs, tokenization,
preserving negation keywords, and applying WordNet lemmatization.
"""

from typing import List, Optional
import html
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer


NEGATION_TOKENS = {
    "not", "no", "never", "none", "neither", "nor", "cannot", "cant",
    "can't", "wont", "won't", "dont", "don't", "isnt", "isn't", "arent",
    "aren't", "didnt", "didn't", "without"
}

_LEMMATIZER: Optional[WordNetLemmatizer] = None
_STOPWORDS: Optional[set] = None


def get_stopwords() -> set:
    """Retrieve NLTK stopwords while strictly preserving negations."""
    global _STOPWORDS
    if _STOPWORDS is None:
        try:
            base_sw = set(stopwords.words("english"))
        except LookupError:
            nltk.download("stopwords", quiet=True)
            base_sw = set(stopwords.words("english"))
        _STOPWORDS = base_sw - NEGATION_TOKENS
    return _STOPWORDS


def get_lemmatizer() -> WordNetLemmatizer:
    """Retrieve or initialize the WordNet lemmatizer."""
    global _LEMMATIZER
    if _LEMMATIZER is None:
        try:
            _LEMMATIZER = WordNetLemmatizer()
        except LookupError:
            nltk.download("wordnet", quiet=True)
            _LEMMATIZER = WordNetLemmatizer()
    return _LEMMATIZER


def clean_text(raw_text: str) -> str:
    """Perform primary string-level cleaning on support messages."""
    if not isinstance(raw_text, str) or not raw_text.strip():
        return ""

    text = html.unescape(raw_text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", " ", text)
    text = text.replace("/", " ").replace("\\", " ")
    text = text.lower()
    text = re.sub(r"[^a-z0-9'\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def preprocess_support_text(
    text: str,
    remove_stopwords: bool = True,
    lemmatize: bool = True
) -> str:
    """Full preprocessing pipeline returning cleaned, normalized string."""
    cleaned = clean_text(text)
    if not cleaned:
        return ""

    tokens = cleaned.split()
    sw = get_stopwords() if remove_stopwords else set()
    lemmatizer = get_lemmatizer() if lemmatize else None

    processed_tokens: List[str] = []
    for token in tokens:
        clean_tok = token.replace("'", "")
        if not clean_tok or len(clean_tok) < 2:
            continue
        if remove_stopwords and clean_tok in sw:
            continue
        if lemmatizer:
            clean_tok = lemmatizer.lemmatize(clean_tok)
        processed_tokens.append(clean_tok)

    return " ".join(processed_tokens)

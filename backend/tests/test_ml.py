"""Unit tests for preprocessing, feature engineering, and priority rules."""

import unittest

from backend.app.ml.data_loader import load_support_dataset
from backend.app.ml.feature_engineering import build_tfidf_vectorizer
from backend.app.ml.model_loader import ModelLoader
from backend.app.ml.preprocessing import clean_text, preprocess_support_text
from backend.app.services.priority_service import assess_ticket_priority


class TestPreprocessing(unittest.TestCase):

    def test_lowercases_and_strips_urls(self):
        cleaned = clean_text("HELLO https://example.com/test <b>World</b>")
        self.assertIn("hello", cleaned)
        self.assertNotIn("https", cleaned)
        self.assertNotIn("<b>", cleaned)

    def test_preserves_negations(self):
        processed = preprocess_support_text("The service is not working and never loads")
        self.assertIn("not", processed.split())
        self.assertIn("never", processed.split())

    def test_empty_input(self):
        self.assertEqual(clean_text(""), "")
        self.assertEqual(preprocess_support_text("   "), "")


class TestPriorityRules(unittest.TestCase):

    def test_payment_double_charge_is_high(self):
        result = assess_ticket_priority("My card was charged twice and money was deducted.")
        self.assertEqual(result["priority"], "High")
        self.assertGreater(len(result["matched_pattern"]), 0)

    def test_delayed_delivery_is_medium(self):
        result = assess_ticket_priority("My delivery is delayed and tracking is stuck.")
        self.assertEqual(result["priority"], "Medium")

    def test_general_question_is_low(self):
        result = assess_ticket_priority("How do I update my profile and newsletter preferences?")
        self.assertEqual(result["priority"], "Low")

    def test_empty_message_default(self):
        result = assess_ticket_priority("")
        self.assertEqual(result["priority"], "Low")
        self.assertEqual(result["matched_pattern"], "none")


class TestModelArtifacts(unittest.TestCase):

    def test_artifacts_load_and_predict(self):
        ModelLoader.load_artifacts()
        model = ModelLoader.get_model()
        vectorizer = ModelLoader.get_vectorizer()
        cleaned = preprocess_support_text("Invoice amount is incorrect and I need a refund")
        matrix = vectorizer.transform([cleaned])
        prediction = model.predict(matrix)[0]
        self.assertIn(prediction, model.classes_)
        self.assertTrue(hasattr(model, "predict_proba"))


class TestDatasetLoader(unittest.TestCase):

    def test_bundled_dataset_loads(self):
        df = load_support_dataset()
        self.assertGreater(len(df), 1000)
        self.assertIn("ticket_text", df.columns)
        self.assertIn("category", df.columns)
        summary = df.attrs["summary"]
        self.assertGreater(summary.total_rows, 1000)


class TestVectorizer(unittest.TestCase):

    def test_fit_only_on_training_text(self):
        vectorizer = build_tfidf_vectorizer(max_features=50, min_df=1, max_df=1.0)
        vectorizer.fit(["refund invoice payment", "login account password"])
        self.assertLessEqual(len(vectorizer.vocabulary_), 50)
        transformed = vectorizer.transform(["refund"])
        self.assertEqual(transformed.shape[0], 1)


if __name__ == "__main__":
    unittest.main()

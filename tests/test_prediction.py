"""Unit tests for the end-to-end ML prediction pipeline in SignalDesk."""

import unittest
from src.predict import predict_ticket


class TestPrediction(unittest.TestCase):

    def test_predict_ticket_billing(self):
        result = predict_ticket("I need a refund for my subscription invoice, I was charged twice.", save_to_db=False)
        self.assertIn("predicted_category", result)
        self.assertIn("confidence", result)
        self.assertIn("priority", result)
        self.assertGreater(result["confidence"], 0.0)
        self.assertEqual(result["status"], "Success")

    def test_predict_ticket_short_error(self):
        with self.assertRaises(ValueError):
            predict_ticket("hi", save_to_db=False)


if __name__ == "__main__":
    unittest.main()


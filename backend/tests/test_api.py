"""Backend Integration Tests for SignalDesk FastAPI Application."""

import unittest
from fastapi.testclient import TestClient
from backend.app.main import app


class TestSignalDeskAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["api"], "online")
        self.assertTrue(data["model_loaded"])

    def test_predict_ticket_billing(self):
        payload = {"ticket_text": "Refund request for double charged transaction on my card."}
        response = self.client.post("/api/tickets/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["predicted_category"], "Billing & Payment")
        self.assertIn("confidence", data)
        self.assertIn("priority", data)

    def test_predict_ticket_too_short(self):
        payload = {"ticket_text": "hi"}
        response = self.client.post("/api/tickets/predict", json=payload)
        self.assertEqual(response.status_code, 422)  # Pydantic validation error

    def test_analytics_overview(self):
        response = self.client.get("/api/analytics/overview")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_tickets", data)
        self.assertIn("kpi_cards", data)
        self.assertIn("category_distribution", data)

    def test_model_performance(self):
        response = self.client.get("/api/models/performance")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("algorithm", data)
        self.assertIn("accuracy", data)
        self.assertIn("confusion_matrix", data)


if __name__ == "__main__":
    unittest.main()

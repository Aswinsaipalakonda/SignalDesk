"""Backend integration tests for the SignalDesk FastAPI application."""

import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///./signaldesk_test.db")
os.environ.setdefault("SEED_MAX_ROWS", "300")

from fastapi.testclient import TestClient  # noqa: E402

from backend.app.database.connection import engine  # noqa: E402
from backend.app.database.models import Base  # noqa: E402
from backend.app.main import app  # noqa: E402


class TestSignalDeskAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        # Context manager triggers lifespan: model load + database seeding.
        cls._ctx = TestClient(app)
        cls.client = cls._ctx.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls._ctx.__exit__(None, None, None)

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["api"], "online")
        self.assertTrue(data["model_loaded"])

    def test_predict_ticket_billing(self):
        payload = {"ticket_text": "Refund request for a double charged transaction on my card."}
        response = self.client.post("/api/tickets/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["predicted_category"], "Billing & Payment")
        self.assertGreater(data["confidence"], 0)
        self.assertIn(data["priority"], ["High", "Medium", "Low"])
        self.assertTrue(data["saved"])

        detail = self.client.get(f"/api/tickets/{data['ticket_id']}")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.json()["id"], data["ticket_id"])

    def test_predict_ticket_too_short(self):
        response = self.client.post("/api/tickets/predict", json={"ticket_text": "hi"})
        self.assertEqual(response.status_code, 422)

    def test_analytics_overview(self):
        response = self.client.get("/api/analytics/overview")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_tickets", data)
        self.assertIn("kpi_cards", data)
        self.assertIn("category_distribution", data)
        self.assertGreater(len(data["time_series"]), 0)

    def test_analytics_filtered(self):
        response = self.client.get(
            "/api/analytics/overview",
            params={"priority": "High", "category": "Technical Support"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(
            sum(data["category_distribution"].values()),
            data["total_tickets"],
        )
        self.assertTrue(
            all(category == "Technical Support" for category in data["category_distribution"])
        )

    def test_invalid_date_filter(self):
        response = self.client.get("/api/analytics/overview", params={"start_date": "not-a-date"})
        self.assertEqual(response.status_code, 400)

    def test_model_performance(self):
        response = self.client.get("/api/models/performance")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("algorithm", data)
        self.assertIn("accuracy", data)
        self.assertIn("confusion_matrix", data)
        self.assertIn("Logistic Regression", data["comparison"])

    def test_priority_correction(self):
        response = self.client.post(
            "/api/tickets/predict",
            json={"ticket_text": "The dashboard is slow and occasionally freezes when loading reports."},
        )
        self.assertEqual(response.status_code, 200)
        ticket_id = response.json()["ticket_id"]

        update = self.client.patch(
            f"/api/tickets/{ticket_id}/priority",
            json={"priority": "High", "reason": "Escalated by on-call agent."},
        )
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.json()["priority"], "High")
        self.assertIn("Escalated", update.json()["priority_reason"])


if __name__ == "__main__":
    unittest.main()

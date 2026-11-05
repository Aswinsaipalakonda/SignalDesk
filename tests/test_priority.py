"""Unit tests for the independent priority engine in SignalDesk."""

import unittest
from src.priority_engine import assess_ticket_priority


class TestPriorityEngine(unittest.TestCase):

    def test_high_priority_payment(self):
        result = assess_ticket_priority("Payment deducted twice from my bank account, please help ASAP!")
        self.assertEqual(result["priority"], "High")
        self.assertIn("payment deducted", result["matched_pattern"])

    def test_high_priority_account_locked(self):
        result = assess_ticket_priority("Account locked out, unable to login to production!")
        self.assertEqual(result["priority"], "High")

    def test_medium_priority_delay(self):
        result = assess_ticket_priority("My package tracking is delayed and late delivery.")
        self.assertEqual(result["priority"], "Medium")

    def test_low_priority_general_inquiry(self):
        result = assess_ticket_priority("How to configure the documentation and where can I find the guide?")
        self.assertEqual(result["priority"], "Low")


if __name__ == "__main__":
    unittest.main()


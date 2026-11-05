"""Unit tests for text preprocessing in SignalDesk."""

import unittest
from src.preprocessing import clean_text, preprocess_support_text


class TestPreprocessing(unittest.TestCase):

    def test_clean_text_removes_html(self):
        html_input = "<p>My order <b>#1234</b> has not arrived!</p>"
        cleaned = clean_text(html_input)
        self.assertNotIn("<p>", cleaned)
        self.assertNotIn("<b>", cleaned)
        self.assertIn("not arrived", cleaned)

    def test_clean_text_removes_urls(self):
        url_input = "Check the error here: https://support.example.com/log/123 it crashed."
        cleaned = clean_text(url_input)
        self.assertNotIn("https://", cleaned)
        self.assertIn("crashed", cleaned)

    def test_negations_preserved(self):
        text = "I did not receive my invoice and cannot login"
        processed = preprocess_support_text(text)
        self.assertIn("not", processed)
        self.assertIn("receive", processed)


if __name__ == "__main__":
    unittest.main()


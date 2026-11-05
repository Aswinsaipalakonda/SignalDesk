"""Transparent, rule-based priority assessment for SignalDesk.

Priority is deliberately independent of the supervised category classifier.
The keyword map below is configuration: add or edit patterns without touching
the ML model. Every result includes the matched rule and a human explanation.
"""

from __future__ import annotations

import re
from typing import Dict, List


PRIORITY_RULES: List[Dict[str, object]] = [
    {
        "priority": "High",
        "label": "critical risk",
        "patterns": [
            r"\b(payment\s+deducted|charged\s+twice|double\s+charge|duplicate\s+charge|unauthorized\s+charge|money\s+deducted)\b",
            r"\b(account\s+locked|locked\s+out|cannot\s+log\s*in|can't\s+log\s*in|unable\s+to\s+log\s*in|credential\s+compromised|hacked)\b",
            r"\b(critical|outage|downtime|system\s+down|server\s+crash|production\s+down|emergency|asap|urgent|immediately)\b",
            r"\b(security\s+breach|data\s+leak|data\s+breach|fraud|vulnerability|unauthorized\s+access)\b",
        ],
        "reason": "Critical financial risk, account lockout, security concern, or urgent operational outage detected.",
    },
    {
        "priority": "Medium",
        "label": "degraded service",
        "patterns": [
            r"\b(delay|delayed|late\s+delivery|where\s+is\s+my\s+order|tracking\s+stuck|shipment\s+issue|not\s+delivered)\b",
            r"\b(not\s+working|error\s+code|bug|glitch|freeze|crash|defect|malfunction|broken)\b",
            r"\b(slow\s+performance|frequent\s+disconnect|timeout|repeated\s+issue|unable\s+to\s+(access|use|save|upload|download|open))\b",
            r"\b(refund\s+status|cancel\s+subscription|billing\s+inquiry|invoice\s+error|incorrect\s+charge)\b",
        ],
        "reason": "Degraded functionality, shipment delay, or product malfunction affecting normal usage.",
    },
    {
        "priority": "Low",
        "label": "routine inquiry",
        "patterns": [
            r"\b(how\s+to|how\s+do\s+i|guide|documentation|tutorial|information|inquiry|question)\b",
            r"\b(feature\s+request|suggestion|feedback|roadmap|pricing\s+info|demo\s+request|would\s+like\s+to\s+know)\b",
            r"\b(compliment|thank\s+you|update\s+profile|newsletter|general\s+question|business\s+hours)\b",
        ],
        "reason": "General question, documentation request, or feedback without operational blockage.",
    },
]


def assess_ticket_priority(ticket_text: str) -> Dict[str, str]:
    """Assess priority independently of the ML category classifier."""
    if not isinstance(ticket_text, str) or not ticket_text.strip():
        return {
            "priority": "Low",
            "reason": "Empty message defaults to standard priority.",
            "matched_pattern": "none",
        }

    lower_text = ticket_text.lower()
    for rule in PRIORITY_RULES:
        for pattern in rule["patterns"]:
            match = re.search(pattern, lower_text)
            if match:
                return {
                    "priority": str(rule["priority"]),
                    "reason": str(rule["reason"]),
                    "matched_pattern": match.group(0),
                }

    if len(lower_text.split()) > 60:
        return {
            "priority": "Medium",
            "reason": "Detailed issue description without emergency keywords; assigned standard review.",
            "matched_pattern": "length_heuristic",
        }

    return {
        "priority": "Low",
        "reason": "Standard non-urgent inquiry.",
        "matched_pattern": "default",
    }

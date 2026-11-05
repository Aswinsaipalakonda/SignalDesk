"""Rule-Based Priority Assessment Engine for SignalDesk.

Evaluates incoming customer tickets independently of category classification,
detecting urgency markers, critical security/outage conditions, financial blockages,
and returns an actionable priority tier with an explicit transparent rationale.
"""

from typing import Dict, List, Tuple
import re


PRIORITY_RULES: List[Dict[str, any]] = [
    # High Priority triggers: Financial loss, locked access, system outage, emergency
    {
        "priority": "High",
        "patterns": [
            r"\b(payment\s+deducted|charged\s+twice|double\s+charge|unauthorized\s+charge|money\s+deducted)\b",
            r"\b(account\s+locked|locked\s+out|cannot\s+log\s*in|can't\s+log\s*in|credential\s+compromised|hacked)\b",
            r"\b(critical|outage|downtime|system\s+down|server\s+crash|production\s+down|emergency|asap|urgent)\b",
            r"\b(security\s+breach|data\s+leak|fraud|vulnerability)\b"
        ],
        "reason": "Critical financial risk, account lockout, or urgent operational outage detected."
    },
    # Medium Priority triggers: Product defect, delivery delays, degraded service
    {
        "priority": "Medium",
        "patterns": [
            r"\b(delay|delayed|late\s+delivery|where\s+is\s+my\s+order|tracking\s+stuck|shipment\s+issue)\b",
            r"\b(not\s+working|error\s+code|bug|glitch|freeze|crash|defect|malfunction|broken)\b",
            r"\b(slow\s+performance|frequent\s+disconnect|timeout|repeated\s+issue|unable\s+to\s+save)\b",
            r"\b(refund\s+status|cancel\s+subscription|billing\s+inquiry|invoice\s+error)\b"
        ],
        "reason": "Degraded functionality, shipment delay, or product malfunction affecting normal usage."
    },
    # Low Priority triggers: Informational, inquiries, feedback
    {
        "priority": "Low",
        "patterns": [
            r"\b(how\s+to|how\s+do\s+i|guide|documentation|tutorial|information|inquiry|question)\b",
            r"\b(feature\s+request|suggestion|feedback|roadmap|pricing\s+info|demo\s+request)\b",
            r"\b(compliment|thank\s+you|update\s+profile|newsletter|general\s+question)\b"
        ],
        "reason": "General question, documentation lookup, or feedback without operational blockage."
    }
]


def assess_ticket_priority(ticket_text: str) -> Dict[str, str]:
    """Assess customer support ticket priority based on contextual rules.

    Args:
        ticket_text: Raw or cleaned customer support text.

    Returns:
        Dict with 'priority' (High, Medium, Low), 'reason', and 'matched_pattern'.
    """
    if not isinstance(ticket_text, str) or not ticket_text.strip():
        return {
            "priority": "Low",
            "reason": "Empty message defaults to standard priority.",
            "matched_pattern": "none"
        }

    lower_text = ticket_text.lower()

    # Iterate through tiers in order of severity (High -> Medium -> Low)
    for rule in PRIORITY_RULES:
        for pattern in rule["patterns"]:
            match = re.search(pattern, lower_text)
            if match:
                return {
                    "priority": rule["priority"],
                    "reason": rule["reason"],
                    "matched_pattern": match.group(0)
                }

    # Default fallback if no specific keywords triggered
    if len(lower_text.split()) > 60:
        return {
            "priority": "Medium",
            "reason": "Detailed issue description without emergency keywords; assigned standard review.",
            "matched_pattern": "length_heuristic"
        }

    return {
        "priority": "Low",
        "reason": "Standard non-urgent inquiry.",
        "matched_pattern": "default"
    }


"""PII redactor — replaces emails, phone numbers, and high-entropy tokens with placeholders.

Used before persisting any user-supplied content (e.g., chat_logs.query_redacted).
"""
from __future__ import annotations

import math
import re

_EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
_PHONE = re.compile(
    r"(?<![A-Za-z0-9_\-])(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{3,4}(?![A-Za-z0-9_\-])"
)
_HIGH_ENTROPY = re.compile(r"\b[A-Za-z0-9_\-]{24,}\b")


def _shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq: dict[str, int] = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    n = len(s)
    return -sum((c / n) * math.log2(c / n) for c in freq.values())


def redact(text: str) -> str:
    text = _EMAIL.sub("<email>", text)
    text = _PHONE.sub("<phone>", text)

    def maybe_secret(match: re.Match[str]) -> str:
        token = match.group(0)
        return "<secret>" if _shannon_entropy(token) >= 3.5 else token

    return _HIGH_ENTROPY.sub(maybe_secret, text)

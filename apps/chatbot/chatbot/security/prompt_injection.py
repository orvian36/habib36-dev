"""Heuristic prompt-injection detector.

Catches obvious patterns; the LLM `classify_intent` node is the second line of defense
for subtler attempts.
"""
from __future__ import annotations

import math
import re

_PATTERNS = [
    re.compile(r"\bignore\s+(previous|prior|above)\s+(instructions|prompts?)\b", re.I),
    re.compile(r"\bsystem\s*[:>]", re.I),
    re.compile(r"</system\s*>", re.I),
    re.compile(r"\{\{[^}]*\}\}"),
    re.compile(r"\byou\s+are\s+now\b", re.I),
    re.compile(r"\bact\s+as\s+(a\s+)?(system|admin|root|developer)\b", re.I),
    re.compile(r"\bdisregard\s+(all|previous|prior)\b", re.I),
]
_HIGH_ENTROPY = re.compile(r"\b[A-Za-z0-9_\-]{20,}\b")


def _shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq: dict[str, int] = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    n = len(s)
    return -sum((c / n) * math.log2(c / n) for c in freq.values())


def detect(text: str) -> bool:
    if any(p.search(text) for p in _PATTERNS):
        return True
    for match in _HIGH_ENTROPY.finditer(text):
        if _shannon_entropy(match.group(0)) >= 4.0:
            return True
    return False

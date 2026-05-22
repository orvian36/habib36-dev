"""Load prompt templates as module-level strings."""
from __future__ import annotations

from pathlib import Path

_PROMPTS_DIR = Path(__file__).resolve().parent


def load(name: str) -> str:
    return (_PROMPTS_DIR / f"{name}.md").read_text(encoding="utf-8")


CLASSIFY_INTENT = load("classify_intent")
REWRITE_QUERY = load("rewrite_query")
GRADE_CHUNKS = load("grade_chunks")
GENERATE_ANSWER = load("generate_answer")
CHECK_GROUNDEDNESS = load("check_groundedness")
OUTPUT_GUARD = load("output_guard")

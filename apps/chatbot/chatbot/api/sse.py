"""SSE encoder helpers."""
from __future__ import annotations

import json
from typing import Any


def sse_event(event: str, data: dict[str, Any]) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ": "))
    return f"event: {event}\ndata: {payload}\n\n"

"""HMAC signing and verification with replay-window protection.

Signature scheme: HMAC-SHA256(secret, f"{timestamp_ms}.{path}.{sha256(body)}").
The verifier accepts a list of secrets so callers can rotate the secret zero-downtime.
"""
from __future__ import annotations

import hashlib
import hmac as _hmac
import time
from collections.abc import Iterable


class HmacVerificationError(Exception):
    pass


def _canonical(timestamp_ms: int, path: str, body: bytes) -> bytes:
    body_hash = hashlib.sha256(body).hexdigest()
    return f"{timestamp_ms}.{path}.{body_hash}".encode()


def sign_request(secret: str, timestamp_ms: int, path: str, body: bytes) -> str:
    mac = _hmac.new(secret.encode(), _canonical(timestamp_ms, path, body), hashlib.sha256)
    return mac.hexdigest()


def verify_request(
    secrets: Iterable[str],
    timestamp_ms: int,
    path: str,
    body: bytes,
    signature: str,
    *,
    now_ms: int | None = None,
    window_seconds: int = 60,
) -> None:
    now = now_ms if now_ms is not None else int(time.time() * 1000)
    if abs(now - timestamp_ms) > window_seconds * 1000:
        raise HmacVerificationError("stale or future timestamp")
    expected_payload = _canonical(timestamp_ms, path, body)
    for secret in secrets:
        candidate = _hmac.new(secret.encode(), expected_payload, hashlib.sha256).hexdigest()
        if _hmac.compare_digest(candidate, signature):
            return
    raise HmacVerificationError("signature mismatch")

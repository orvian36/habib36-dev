"""HMAC verification dependencies for internal and ingest endpoints."""
from __future__ import annotations

import time
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from ..config import Settings, get_settings
from ..security.hmac import HmacVerificationError, verify_request

INTERNAL_SIG_HEADER = "X-Internal-Auth"
INTERNAL_TS_HEADER = "X-Internal-Timestamp"
INGEST_SIG_HEADER = "X-Ingest-Signature"
INGEST_TS_HEADER = "X-Ingest-Timestamp"


async def _verify(
    request: Request,
    secrets: list[str],
    *,
    sig_header: str,
    ts_header: str,
    window_seconds: int,
) -> None:
    sig = request.headers.get(sig_header)
    ts_raw = request.headers.get(ts_header)
    if not sig or not ts_raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing signature headers")
    try:
        ts = int(ts_raw)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid timestamp") from None
    body = await request.body()
    try:
        verify_request(
            secrets, ts, request.url.path, body, sig,
            now_ms=int(time.time() * 1000),
            window_seconds=window_seconds,
        )
    except HmacVerificationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


async def require_internal_hmac(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
) -> None:
    await _verify(
        request,
        settings.internal_secrets(),
        sig_header=INTERNAL_SIG_HEADER,
        ts_header=INTERNAL_TS_HEADER,
        window_seconds=settings.replay_window_seconds,
    )


async def require_ingest_hmac(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
) -> None:
    await _verify(
        request,
        settings.ingest_secrets(),
        sig_header=INGEST_SIG_HEADER,
        ts_header=INGEST_TS_HEADER,
        window_seconds=settings.replay_window_seconds,
    )

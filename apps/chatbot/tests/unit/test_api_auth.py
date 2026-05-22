import time

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from chatbot.api.auth import (
    INGEST_SIG_HEADER,
    INGEST_TS_HEADER,
    INTERNAL_SIG_HEADER,
    INTERNAL_TS_HEADER,
    require_ingest_hmac,
    require_internal_hmac,
)
from chatbot.config import Settings, get_settings
from chatbot.security.hmac import sign_request


def _app(secret: str, *, kind: str):
    app = FastAPI()
    deps = require_internal_hmac if kind == "internal" else require_ingest_hmac

    @app.post("/protected", dependencies=[deps])
    async def protected(request: Request):
        return {"ok": True}

    settings = Settings(internal_hmac_secret=secret, ingest_hmac_secret=secret)
    app.dependency_overrides[get_settings] = lambda: settings
    return app


def _sign(secret: str, path: str, body: bytes) -> tuple[int, str]:
    ts = int(time.time() * 1000)
    return ts, sign_request(secret, ts, path, body)


def test_internal_hmac_accepts_valid_signature():
    secret = "s1"
    body = b'{"q":1}'
    ts, sig = _sign(secret, "/protected", body)
    client = TestClient(_app(secret, kind="internal"))
    r = client.post(
        "/protected", content=body,
        headers={INTERNAL_SIG_HEADER: sig, INTERNAL_TS_HEADER: str(ts), "content-type": "application/json"},
    )
    assert r.status_code == 200


def test_internal_hmac_rejects_missing_signature():
    secret = "s1"
    client = TestClient(_app(secret, kind="internal"))
    r = client.post("/protected", content=b"{}", headers={"content-type": "application/json"})
    assert r.status_code == 401


def test_internal_hmac_rejects_tampered_body():
    secret = "s1"
    body = b'{"q":1}'
    ts, sig = _sign(secret, "/protected", body)
    client = TestClient(_app(secret, kind="internal"))
    r = client.post(
        "/protected", content=b'{"q":2}',
        headers={INTERNAL_SIG_HEADER: sig, INTERNAL_TS_HEADER: str(ts), "content-type": "application/json"},
    )
    assert r.status_code == 401


def test_ingest_hmac_uses_ingest_headers_and_secret():
    secret = "ingest-key"
    body = b'{"documents":[]}'
    ts, sig = _sign(secret, "/protected", body)
    client = TestClient(_app(secret, kind="ingest"))
    r = client.post(
        "/protected", content=body,
        headers={INGEST_SIG_HEADER: sig, INGEST_TS_HEADER: str(ts), "content-type": "application/json"},
    )
    assert r.status_code == 200

import pytest

from chatbot.security.hmac import (
    HmacVerificationError,
    sign_request,
    verify_request,
)


def test_sign_and_verify_round_trip():
    secret = "topsecret"
    path = "/chat"
    body = b'{"query":"hi"}'
    ts = 1_700_000_000_000
    signature = sign_request(secret, ts, path, body)
    verify_request([secret], ts, path, body, signature, now_ms=ts, window_seconds=60)


def test_verify_rejects_tampered_body():
    secret = "topsecret"
    ts = 1_700_000_000_000
    sig = sign_request(secret, ts, "/chat", b"original")
    with pytest.raises(HmacVerificationError):
        verify_request([secret], ts, "/chat", b"tampered", sig, now_ms=ts, window_seconds=60)


def test_verify_rejects_stale_timestamp():
    secret = "topsecret"
    ts = 1_700_000_000_000
    sig = sign_request(secret, ts, "/chat", b"x")
    with pytest.raises(HmacVerificationError, match="stale"):
        verify_request([secret], ts, "/chat", b"x", sig, now_ms=ts + 120_000, window_seconds=60)


def test_verify_accepts_any_secret_in_rotation_list():
    new = "new-secret"
    old = "old-secret"
    ts = 1_700_000_000_000
    sig_old = sign_request(old, ts, "/chat", b"x")
    verify_request([new, old], ts, "/chat", b"x", sig_old, now_ms=ts, window_seconds=60)


def test_verify_rejects_unknown_secret():
    ts = 1_700_000_000_000
    sig = sign_request("intruder", ts, "/chat", b"x")
    with pytest.raises(HmacVerificationError):
        verify_request(["legit"], ts, "/chat", b"x", sig, now_ms=ts, window_seconds=60)


def test_verify_rejects_future_timestamp_outside_window():
    ts = 1_700_000_000_000
    sig = sign_request("s", ts, "/chat", b"x")
    with pytest.raises(HmacVerificationError, match="stale"):
        verify_request(["s"], ts, "/chat", b"x", sig, now_ms=ts - 120_000, window_seconds=60)

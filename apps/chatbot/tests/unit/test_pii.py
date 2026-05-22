from chatbot.security.pii import redact


def test_redacts_email_addresses():
    assert redact("contact me at habibur@example.com please") == (
        "contact me at <email> please"
    )


def test_redacts_phone_numbers():
    out = redact("call me on +1 (415) 555-1234 tomorrow")
    assert "<phone>" in out
    assert "555-1234" not in out


def test_redacts_high_entropy_tokens():
    secret = "sk_live_abcdef0123456789ABCDEF0123456789"
    out = redact(f"my key is {secret}")
    assert secret not in out
    assert "<secret>" in out


def test_leaves_normal_text_unchanged():
    assert redact("a short ordinary sentence") == "a short ordinary sentence"


def test_redact_collapses_multiple_pii_in_one_string():
    out = redact("email me at x@y.com or call 415-555-1212")
    assert "<email>" in out and "<phone>" in out
    assert "x@y.com" not in out and "555-1212" not in out

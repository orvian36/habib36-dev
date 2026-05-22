from chatbot.config import Settings


def test_settings_defaults_have_sensible_models():
    s = Settings()
    assert s.gemini_pro_model.startswith("gemini-2.5")
    assert s.gemini_flash_model.startswith("gemini-2.5")
    assert s.gemini_embedding_model == "gemini-embedding-001"
    assert s.embedding_dimension == 768


def test_internal_hmac_secrets_accept_csv_for_rotation():
    s = Settings(internal_hmac_secret="new,old")
    assert s.internal_secrets() == ["new", "old"]


def test_ingest_hmac_secrets_strip_blank_entries():
    s = Settings(ingest_hmac_secret="a,, b,")
    assert s.ingest_secrets() == ["a", "b"]


def test_replay_window_default_60_seconds():
    s = Settings()
    assert s.replay_window_seconds == 60


def test_budget_cap_in_tokens_per_day():
    s = Settings(daily_token_budget=100_000)
    assert s.daily_token_budget == 100_000

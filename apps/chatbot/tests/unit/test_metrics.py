from chatbot.observability.metrics import metrics_registry, record_node_duration, record_request


def test_record_node_duration_increments_histogram():
    record_node_duration("retrieve", 123.0)
    samples = list(metrics_registry().collect())
    names = {m.name for m in samples}
    assert "chatbot_node_duration_ms" in names


def test_record_request_counter_increments():
    record_request(intent="about_habibur", outcome="ok")
    samples = list(metrics_registry().collect())
    counter = next(m for m in samples if m.name == "chatbot_request")
    assert any(s.value > 0 for s in counter.samples)

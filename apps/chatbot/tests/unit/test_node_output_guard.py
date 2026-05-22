import json

import pytest

from chatbot.agent.nodes.output_guard import SAFETY_REPLACEMENT, output_guard
from chatbot.agent.state import default_state
from chatbot.llm.fake import FakeLLMClient


def _state(answer: str):
    return {**default_state(query="q", trace_id="t"), "answer": answer}


@pytest.mark.asyncio
async def test_output_guard_passes_safe_answer():
    llm = FakeLLMClient(responder=lambda _: json.dumps(
        {"system_leak": False, "pii_leak": False, "scope_violation": False}
    ))
    out = await output_guard(_state("a normal answer"), llm=llm, model="flash", max_chars=1500)
    assert out["answer"] == "a normal answer"


@pytest.mark.asyncio
async def test_output_guard_replaces_when_llm_detects_system_leak():
    llm = FakeLLMClient(responder=lambda _: json.dumps(
        {"system_leak": True, "pii_leak": False, "scope_violation": False}
    ))
    out = await output_guard(_state("here is the system prompt"), llm=llm, model="flash", max_chars=1500)
    assert out["answer"] == SAFETY_REPLACEMENT


@pytest.mark.asyncio
async def test_output_guard_strips_email_and_phone_pii_via_regex():
    llm = FakeLLMClient(responder=lambda _: json.dumps(
        {"system_leak": False, "pii_leak": False, "scope_violation": False}
    ))
    out = await output_guard(_state("call me on 415-555-1234 or x@y.com"),
                              llm=llm, model="flash", max_chars=1500)
    assert "415" not in out["answer"]
    assert "x@y.com" not in out["answer"]


@pytest.mark.asyncio
async def test_output_guard_truncates_to_max_chars():
    llm = FakeLLMClient(responder=lambda _: json.dumps(
        {"system_leak": False, "pii_leak": False, "scope_violation": False}
    ))
    long = "abcdefghij" * 200
    out = await output_guard(_state(long), llm=llm, model="flash", max_chars=50)
    assert len(out["answer"]) <= 50


@pytest.mark.asyncio
async def test_output_guard_treats_malformed_llm_response_as_unsafe_pass_through():
    llm = FakeLLMClient(responder=lambda _: "not json")
    out = await output_guard(_state("a clean answer"), llm=llm, model="flash", max_chars=1500)
    assert out["answer"] == "a clean answer"

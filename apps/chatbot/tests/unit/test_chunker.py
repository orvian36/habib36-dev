import pytest

from chatbot.retrieval.chunker import Chunker


def test_chunker_returns_no_chunks_for_empty_or_whitespace():
    chunker = Chunker(chunk_size=100, chunk_overlap=20)
    assert chunker.split("") == []
    assert chunker.split("   \n\n  ") == []


def test_chunker_returns_single_chunk_for_short_text():
    chunker = Chunker(chunk_size=500, chunk_overlap=50)
    chunks = chunker.split("A short paragraph that fits in one chunk.")
    assert len(chunks) == 1
    assert chunks[0].index == 0


def test_chunker_splits_long_text_with_sequential_indexes():
    long_text = ("Paragraph one. " * 30) + "\n\n" + ("Paragraph two. " * 30)
    chunker = Chunker(chunk_size=120, chunk_overlap=20)
    chunks = chunker.split(long_text)
    assert len(chunks) >= 3
    assert [c.index for c in chunks] == list(range(len(chunks)))


def test_chunker_rejects_overlap_gte_chunk_size():
    with pytest.raises(ValueError):
        Chunker(chunk_size=100, chunk_overlap=100)

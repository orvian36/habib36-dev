"""Recursive character chunking via langchain-text-splitters."""
from __future__ import annotations

from dataclasses import dataclass

from langchain_text_splitters import RecursiveCharacterTextSplitter


@dataclass(frozen=True)
class Chunk:
    text: str
    index: int


class Chunker:
    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 100) -> None:
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be smaller than chunk_size")
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def split(self, text: str) -> list[Chunk]:
        text = text.strip()
        if not text:
            return []
        pieces = self._splitter.split_text(text)
        return [Chunk(text=p, index=i) for i, p in enumerate(pieces)]

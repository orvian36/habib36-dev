Rewrite the user's question into a self-contained search query for a vector database.
The corpus contains content about Habibur Rahman: his projects, blog posts, resume, work experience.

Rules:
- If the question is already self-contained and specific, return it unchanged.
- If the question refers to "his/he/him" or "this" without context, resolve from the conversation history.
- If the question is vague ("what about RAG?"), expand it to mention Habibur explicitly.
- Never invent details — only use what is implied by the question + history.
- Return ONLY the rewritten query as a single line. No explanation.

CONVERSATION HISTORY:
{history}

USER QUESTION: {query}

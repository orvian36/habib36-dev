# habib36.dev — Product Requirements Document

### Developer Portfolio & AI Assistant

**Author:** Habibur Rahman
**Version:** 1.0 | April 2026
**Status:** Ready for Development

---

## 1. Product Overview

### 1.1 Vision

Build the most compelling developer portfolio on the internet — one that doesn't just list skills and projects, but actively demonstrates them. **habib36.dev** will be a living, breathing showcase of Habibur Rahman's engineering capability, featuring an AI assistant that visitors can actually talk to about his experience, projects, and technical philosophy.

### 1.2 Mission

Create a dark, hacker-aesthetic portfolio website powered by Next.js and Payload CMS that serves as Habibur's central brand hub — combining a professional profile, project showcase, technical blog, and a RAG-powered AI chatbot that can answer questions about him using his own content as the knowledge base.

### 1.3 Target Audience

| Audience | What They Need | Priority |
|---|---|---|
| Recruiters & Hiring Managers | Quick overview of skills, experience, downloadable resume, proof of depth | High |
| Freelance Clients | Evidence of shipped work, case studies, easy contact method | High |
| Open-Source Community | Code quality, contributions, technical blog posts, GitHub presence | Medium |
| Fellow Developers | Technical insights, tutorials, tools, knowledge sharing | Medium |
| Conference Organizers | Speaker bio, talk topics, published content | Low |

### 1.4 Unique Value Proposition

Unlike static portfolio sites, habib36.dev features an AI chatbot that has actually read every blog post, project description, and resume bullet point. Visitors don't have to hunt for information — they ask. This is both a portfolio and a live demonstration of Habibur's RAG/AI engineering skills, since he builds these exact systems professionally.

---

## 2. Research Insights

### 2.1 Key Trends in Developer Portfolios (2024–2026)

- **Interactivity over static pages:** Top portfolios in 2026 use animations, 3D elements, and interactive navigation to stand out from template-driven designs.
- **Personality-driven design:** The best portfolios inject personality through custom aesthetics (terminal themes, retro UIs, dark hacker modes) rather than generic templates.
- **Content as proof:** Blogs, case studies, and project deep-dives are replacing simple project cards. Recruiters want to see thinking, not just shipping.
- **Headless CMS adoption:** Developers increasingly use Payload CMS, Sanity, or Contentful rather than hand-coding content, enabling faster publishing.
- **Performance as a feature:** Core Web Vitals, Lighthouse scores, and load times are treated as portfolio features themselves.
- **AI integration:** Portfolio chatbots using RAG are emerging as a differentiator, especially for AI/ML engineers.

### 2.2 What Top Portfolios Do Well

- Brittany Chiang's portfolio is frequently cited as best-in-class for its clean layout, clear navigation, and code-quality showcase.
- Bruno Simon's 3D portfolio earned Awwwards Site of the Month by turning navigation into an interactive game — demonstrating creative development skills.
- Portfolios that "show, not tell" by linking to GitHub, live demos, and embedding code samples consistently outperform text-heavy sites.
- Terminal/hacker-themed portfolios resonate strongly with technical audiences and recruiter perceptions of "serious developer."

### 2.3 Gaps & Opportunities

- Very few portfolios have a working AI chatbot — this is a major differentiator, especially for someone who builds RAG systems professionally.
- Most developer blogs lack structured SEO strategy — opportunity to rank for long-tail technical keywords.
- Case study depth is typically shallow — detailed project breakdowns with architecture diagrams and lessons learned are rare.
- Competitive programming achievements are underrepresented in portfolios despite being a strong hiring signal.

### 2.4 AI Chatbot Insights

- RAG-powered portfolio chatbots are emerging but still rare. Most use OpenAI + Pinecone/Weaviate for retrieval.
- Key challenge: preventing hallucination about the portfolio owner's actual experience.
- Successful implementations use hybrid search (vector + keyword) for better retrieval accuracy.
- Self-hosted Weaviate with Docker is the most cost-effective approach for personal projects.
- Auto-ingestion pipelines that sync with CMS content updates are the gold standard for keeping chatbot knowledge current.

---

## 3. User Personas

### 3.1 Sarah — Tech Recruiter

| Attribute | Detail |
|---|---|
| Role | Senior Technical Recruiter at a mid-size tech company |
| Goal | Quickly evaluate if Habibur is a fit for a Full-Stack/AI role |
| Behavior | Spends 30–90 seconds scanning a portfolio. Looks for: tech stack, work history, project complexity, downloadable resume |
| Pain Point | Hates portfolios that are all flash and no substance. Wants to find info fast. |
| Chatbot Use | Would ask: "What is his experience with RAG?" or "Does he have production Next.js experience?" |

### 3.2 Marcus — Startup Founder

| Attribute | Detail |
|---|---|
| Role | CTO of an early-stage SaaS startup looking for freelance dev help |
| Goal | Find a developer who can build an AI-powered feature for his product |
| Behavior | Reads project case studies carefully. Looks for architectural decision-making, not just code. |
| Pain Point | Previous freelancers overpromised. Wants evidence of real AI/LLM deployment. |
| Chatbot Use | Would ask: "How did he handle the RAG pipeline at Makebell?" or "Can he build a natural-language-to-SQL interface?" |

### 3.3 Priya — Junior Developer

| Attribute | Detail |
|---|---|
| Role | Computer science student interested in competitive programming and AI |
| Goal | Learn from Habibur's blog posts and competitive programming journey |
| Behavior | Reads full blog posts, bookmarks tutorials, checks Codeforces/LeetCode ratings |
| Pain Point | Finds most technical blogs either too basic or too academic. |
| Chatbot Use | Would ask: "What resources does he recommend for learning RAG?" or "How did he reach Specialist on Codeforces?" |

---

## 4. User Journeys

### 4.1 Recruiter Journey

1. Lands on homepage → immediately sees name, title, key stats (3000+ CP problems, production RAG experience)
2. Scrolls to skills section → scans tech stack at a glance
3. Clicks "Projects" → browses 3–4 featured projects with tech tags and brief descriptions
4. Opens AI chatbot → asks "Tell me about his RAG experience" → gets a sourced, conversational answer
5. Downloads resume PDF → saves for internal review
6. Clicks contact/LinkedIn → reaches out

### 4.2 Blog Reader Journey

1. Discovers blog post via Google search (e.g., "how to build RAG pipeline with Weaviate")
2. Reads the full article with code snippets, diagrams, and explanations
3. Explores related posts via tags/categories
4. Checks "About" page to learn about the author
5. Opens chatbot to ask a follow-up question about the blog topic
6. Subscribes to newsletter or follows on GitHub

### 4.3 Chatbot Interaction Journey

1. User clicks floating chat icon in bottom-right corner
2. Chatbot greets with a witty, casual message: "Hey! I'm Habibur's AI clone. Ask me anything about his work — I've read everything he's written."
3. User asks a question → chatbot retrieves relevant chunks from blog/resume/projects
4. Chatbot responds with a sourced answer, linking to the original content
5. If chatbot can't answer, it says so honestly and suggests contacting Habibur directly

---

## 5. Features & Requirements

### 5.1 Core Features (MVP)

#### 5.1.1 Homepage / Hero Section

- **Featured Achievement Banner** at the very top: a single punchy line like `"Built production RAG systems using Weaviate + LLMs | 3000+ problems solved"` — short, high-signal, immediately establishes credibility before the visitor scrolls
- Full-screen dark hero with animated terminal-style text typing effect
- Name, title, one-liner tagline, and CTA buttons (View Projects, Download Resume)
- Subtle particle/matrix animation background (performant, CSS/canvas-based)
- Quick stats bar: years of experience, problems solved, projects shipped
- **Inline chatbot prompt (not hidden behind a button):** A visible input field or card on the homepage that says `"Ask me anything about Habibur →"` with 2–3 pre-filled suggestion chips (e.g., "What's his RAG experience?", "Best project?", "Tech stack?"). This surfaces the chatbot immediately and increases engagement — the floating button in the bottom-right remains as a secondary access point on other pages

#### 5.1.2 About / Profile

- Professional bio with personality
- Technical skills displayed as interactive tags or a skill matrix
- Education details (KUET, B.Sc. in CSE)
- **Competitive Programming Showcase** (visual emphasis — this is a major recruiter differentiator):
  - Codeforces, LeetCode, and CodeChef rating badges/shields rendered as visual cards
  - Rating history graph (fetch from CP APIs or embed static chart)
  - Headline stat: "3,000+ problems solved across platforms"
  - Links to each profile
  - Ratings displayed prominently: Specialist (CF 1558), Knight (LC 1882), 3-Star (CC 1741)

#### 5.1.3 Proof of Work Section

Instead of only listing projects, a dedicated "Proof of Work" section provides tangible evidence of engineering depth:

- **Architecture diagrams:** Embedded diagrams (Mermaid or SVG) for key projects showing system design decisions
- **Code snippets:** Highlighted, real code extracts from notable implementations (e.g., the RAG pipeline, NL-to-SQL interface)
- **Performance metrics:** Concrete numbers — "mAP@50: 0.936 on traffic signal detection", "sub-200ms query latency on vector search"
- **Before/after comparisons:** Where applicable, show what improved

This section converts "looks good" into "this person is legit" — it's the difference between a portfolio and proof.

#### 5.1.4 Work Experience

- Timeline-style layout showing roles with company, dates, and bullet points
- Each role expandable to show detailed contributions
- Tech stack tags per role

#### 5.1.5 Projects Showcase

- Card grid with project thumbnails, titles, tech tags, and brief descriptions
- Individual project pages with: problem statement, architecture, tech stack, key decisions, outcome, and links (GitHub, live demo)
- Featured/pinned projects section for top 3–4 projects

#### 5.1.6 Blog System

- Managed through Payload CMS rich text editor (Lexical)
- Categories and tags for organization
- Code syntax highlighting with copy button
- Reading time estimate
- Table of contents for long posts
- Related posts at the bottom
- RSS feed

#### 5.1.7 Resume Section

- **CMS-driven resume:** Resume data lives as structured Payload CMS collections (Experience, Education, Skills, Achievements) — not as a static PDF upload
- Interactive web-based resume view rendered from CMS data
- **PDF generated on-the-fly** from structured CMS data using `@react-pdf/renderer`, ensuring the downloadable PDF always matches the web version
- Print-optimized styling
- This approach ensures resume content is automatically available to the chatbot's knowledge base via the same ingestion pipeline — no separate PDF parsing needed

#### 5.1.8 Contact

- Simple contact form (name, email, message) via Payload form builder or custom API route
- Social links: GitHub, LinkedIn, email, LeetCode, Codeforces

### 5.2 Advanced Features

#### 5.2.1 Case Studies

- Long-form project deep-dives with architecture diagrams
- Problem → Approach → Solution → Outcome structure
- Managed as a separate Payload collection

#### 5.2.2 Uses / Stack Page

- Developer tools, hardware, and software Habibur uses daily
- Popular among developer audiences — good for SEO

#### 5.2.3 Analytics Dashboard (Admin)

- Visitor count, popular pages, chatbot usage stats
- Self-hosted analytics via Umami or Plausible (privacy-friendly, open source)

#### 5.2.4 Newsletter

- Email subscription for new blog posts
- Managed via self-hosted Listmonk or similar

### 5.3 AI Chatbot System

#### 5.3.1 Knowledge Ingestion Pipeline

The chatbot's knowledge base is built from Habibur's own content, ingested and indexed automatically.

**Data Sources:** Blog posts (from Payload CMS), project descriptions, work experience entries, resume content, case studies, and any static about/skills pages.

**Ingestion Flow:**

1. Payload CMS `afterChange` / `afterDelete` hook (defined in `packages/db/src/hooks/`) fires on content create/update/delete
2. Hook sends an HTTP request to the **worker service** (`apps/worker`) at `http://worker:4000/ingest` with a shared secret token for security
3. The worker uses `@habib36/ai` ingest pipeline (LangChain.js `RecursiveCharacterTextSplitter`) to chunk content (500–800 tokens per chunk with 100-token overlap) and tags each chunk with metadata (source type, title, date, URL, collection slug)
4. Chunks are embedded using a local embedding model (e.g., all-MiniLM-L6-v2 via Ollama or Weaviate's built-in vectorizer module)
5. Embeddings are upserted into Weaviate vector database (self-hosted via Docker), keyed by a deterministic ID (`{collection}:{slug}:{chunkIndex}`) so updates replace old chunks rather than duplicating
6. On delete, all chunks matching the document's `{collection}:{slug}:*` prefix are removed from the index
7. Worker busts Redis caches via `@habib36/ai` cache invalidation to ensure chatbot serves fresh answers

> **Why a separate worker?** Ingestion involves CPU-intensive chunking and embedding that can block the Next.js event loop. Running it as a separate lightweight service (`apps/worker`) keeps the frontend responsive while allowing independent scaling. The shared `@habib36/ai` package keeps all RAG logic in one place — used by both `apps/web` (for chat) and `apps/worker` (for ingestion).

```
┌─────────────┐   afterChange     ┌──────────────────────────────┐
│ Payload CMS │ ─────────────▶    │  Worker Service              │
│ (content)   │   hook            │  apps/worker (port 4000)     │
│ packages/db │                   │  ┌────────────────────────┐  │
└─────────────┘                   │  │ @habib36/ai            │  │
                                  │  │ • chunk content        │  │
                                  │  │ • embed via Weaviate   │  │
                                  │  │ • upsert vectors       │  │
                                  │  │ • bust Redis cache     │  │
                                  │  └──────────┬─────────────┘  │
                                  └─────────────┼────────────────┘
                                                ▼
                                         ┌───────────┐
                                         │ Weaviate  │
                                         │ Vector DB │
                                         └───────────┘
```

#### 5.3.2 Embeddings & Vector Database

| Component | Choice | Rationale |
|---|---|---|
| Vector DB | Weaviate (self-hosted, Docker) | Open-source, Habibur already has professional experience with it, supports hybrid search, 12ms p50 latency |
| Embedding Model | all-MiniLM-L6-v2 (local) | Free, fast, 384-dim vectors, good for English text retrieval |
| Alternative Embedding | nomic-embed-text via Ollama | Better quality, 768-dim, runs locally with Ollama |
| Search Strategy | Hybrid (BM25 + vector) | Combines keyword precision with semantic understanding for better retrieval |

#### 5.3.3 Query Flow (RAG Pipeline)

When a user sends a message to the chatbot:

1. User query is received by the Next.js API route
2. Query is embedded using the same embedding model
3. Weaviate performs hybrid search (vector similarity + BM25 keyword) with autocut
4. Top 3–5 relevant chunks are retrieved with metadata
5. A prompt is constructed with: system instructions (personality, guardrails), retrieved context chunks with source citations, conversation history (last 5 messages), and the user's query
6. Prompt is sent to the **primary LLM (Groq API — Llama 3.1 70B)** for near-instant inference (~200ms). If Groq rate-limits or is unavailable, falls back to self-hosted Ollama (Llama 3.1 8B).
7. Response is streamed back to the frontend with source references

```
┌──────┐   query    ┌────────────┐   embed    ┌───────────┐
│ User │ ────────▶  │  Next.js   │ ────────▶  │ Embedding │
└──────┘            │  API Route │            │ Model     │
   ▲                └─────┬──────┘            └─────┬─────┘
   │                      │                         │
   │ stream               │ search                  │ vector
   │ response              ▼                         ▼
   │                ┌────────────┐  top chunks  ┌───────────┐
   │                │  Groq API  │ ◀──────────  │ Weaviate  │
   │                │ (primary)  │              │ Hybrid    │
   │                │     or     │              │ Search    │
   │                │  Ollama    │              └───────────┘
   │                │ (fallback) │
   │                └─────┬──────┘
   │                      │
   └──────────────────────┘
```

#### 5.3.4 Context Handling

- **Conversation memory:** last 5 messages stored in session (not persisted)
- **Context window management:** total prompt stays under 8192 tokens for Groq (Llama 3.1 70B supports 128K, but shorter prompts = faster responses). Falls back to 4096 tokens if using Ollama.
- **Source attribution:** each response includes links to the original blog post/project/resume section
- **Relevance threshold:** if no chunks score above 0.65 similarity, the chatbot triggers the smart fallback (suggest relevant pages + resume download + contact link)

#### 5.3.4a Caching Strategy

To reduce latency, save compute, and stay within Groq's free tier limits:

| Cache Layer | Implementation | TTL | Purpose |
|---|---|---|---|
| Query → embedding cache | In-memory Map or Upstash Redis | 24 hours | Avoid re-embedding identical or near-identical questions |
| Embedding → retrieval cache | In-memory Map keyed by embedding hash | 1 hour | Skip Weaviate search for repeated queries |
| Full response cache | Upstash Redis, keyed by normalized query | 6 hours | Return cached LLM response instantly for common questions (e.g., "What's his tech stack?") |
| Embedding model warm-up | Cron ping every 5 minutes | — | Prevents cold start on Weaviate's vectorizer module |

**Cache invalidation:** All caches are busted when `/api/ingest` runs (content changed = answers may differ). The ingest route broadcasts a `CACHE_BUST` signal to clear response and retrieval caches.

**Expected hit rate:** For a personal portfolio, ~40–60% of questions will be repeats or near-duplicates ("What does he do?", "What's his experience?", "Tell me about his skills"). Caching these eliminates most Groq API calls.

#### 5.3.4b AI Observability & Logging

Every chatbot interaction is logged for debugging and continuous RAG improvement:

| Data Point | What's Logged | Why |
|---|---|---|
| Retrieved chunks | Chunk IDs, source titles, similarity scores | Diagnose retrieval quality — are the right chunks being found? |
| Retrieval miss rate | % of queries where no chunk scored > 0.65 | Track knowledge gaps — what are users asking that isn't covered? |
| Prompt size | Token count of final prompt sent to LLM | Monitor context window usage, prevent truncation |
| Response latency | Breakdown: embedding time + search time + LLM time + total | Identify bottlenecks (is it Weaviate? Groq? Network?) |
| LLM provider used | "groq" or "ollama" per request | Track how often fallback is triggered |
| User feedback | Thumbs up/down per response | Direct quality signal |
| Cache hit/miss | Whether response was served from cache | Measure caching effectiveness |

**Storage:** Logs are written to a `ChatLogs` Payload collection (admin-only access). A simple admin dashboard page aggregates these into charts for weekly review.

**Hallucination detection (heuristic):** If the LLM response contains proper nouns, company names, or technologies not present in the retrieved chunks, flag the response for manual review.

#### 5.3.5 Personality & Guardrails

The chatbot is Habibur's AI representative. It should be:

- **Casual and friendly**, with occasional wit ("I've read all his blog posts so you don't have to!")
- **Accurate** — only answer from retrieved context, never hallucinate
- **Transparent with smart fallback** — if it doesn't know, it doesn't just say "contact Habibur." Instead, it suggests relevant pages, quick links, or related content. Example: "I don't have specific info on that, but you might find his RAG pipeline project interesting → [link]. You can also grab his resume → [download] or reach him directly at [email]."
- **Scoped with controlled expansion** — primarily answers about Habibur, but may explain related technical concepts (e.g., "How does RAG work?") if they appear in his blog posts, projects, or context. Does NOT answer unrelated coding questions, generic LeetCode help, or off-topic queries.
- **Safe** — refuses to engage with offensive, political, or irrelevant queries
- **Concise** — responses should be 2–4 sentences unless detail is requested

#### 5.3.6 Context-Aware Suggested Prompts

To solve "blank canvas paralysis" (users don't know what to ask), the chatbot displays 3–4 dynamic suggested prompt chips above the input box, based on which page the user is currently viewing:

| Page | Suggested Prompts |
|---|---|
| Homepage | "What's his strongest tech stack?", "Tell me about his work experience", "What has he built recently?" |
| Project detail page | "What was the hardest part of building this?", "What tech did he use here?", "How does this compare to his other projects?" |
| Blog post page | "Summarize this article", "What else has he written about this topic?", "What's his opinion on [topic]?" |
| Resume page | "Does he have production experience with RAG?", "What's his educational background?", "How many problems has he solved on LeetCode?" |

Implementation: The chat component receives the current route and page metadata as props, and selects prompts from a predefined map. Clicking a chip auto-sends the prompt.

#### 5.3.7 Source Attribution UI

When the chatbot references content, sources are rendered as **interactive footnote chips** (`[1]`, `[2]`) at the end of the response:

- Each chip is a small pill/badge styled in the accent color
- **On hover (desktop) / tap (mobile):** displays a preview card with the source title, type (blog/project/resume), a 1–2 line excerpt, and a "Read more →" link
- Sources are deduplicated — if multiple chunks come from the same blog post, they merge into a single footnote
- This gives credibility to the chatbot's answers and drives traffic deeper into the portfolio

**System Prompt Template:**

```
You are Habibur Rahman's AI portfolio assistant. You are casual, friendly, and 
occasionally witty. You primarily answer questions about Habibur using the provided 
context. If a user asks about a technical concept that Habibur has written about 
or worked with (e.g., RAG, vector databases, LLMs), you may explain it using his 
content as the basis. If the context doesn't contain the answer, suggest relevant 
pages on the site and offer to connect them with Habibur directly.

RULES:
- Never invent or fabricate information about Habibur
- Always cite which source (blog post, project, resume) your answer comes from
- Keep responses concise (2-4 sentences) unless asked for detail
- You MAY explain technical concepts that appear in Habibur's content
- Do NOT answer unrelated coding questions, generic LeetCode help, or off-topic queries
- Be honest about your limitations
- When you can't answer, suggest relevant pages: "I don't have that info, but you 
  might find his RAG project interesting → [link]" or "Check out his resume for 
  his full experience → [link]"

CONTEXT:
{retrieved_chunks}

CONVERSATION HISTORY:
{last_5_messages}

USER QUESTION: {query}
```

#### 5.3.8 Limitations

- Knowledge is limited to ingested content; cannot answer about topics not covered in blog/resume/projects
- Groq free tier has rate limits (~30 requests/minute); Ollama fallback handles overflow but with slower response times
- No real-time data — chatbot knows what's been published, not live/current events
- Rate limiting: max 20 messages per session, 5 messages per minute to prevent abuse
- Ollama fallback is optional — if VPS RAM is tight, it can be disabled entirely with graceful "I'm busy, try again shortly" messages when Groq rate-limits

---

## 6. Technical Architecture

### 6.1 System Overview

The system is organized as a **Turborepo monorepo** with two apps (`web` and `worker`) and four shared packages (`ai`, `db`, `ui`, `config`). Next.js serves as both the frontend and API layer, with Payload CMS embedded directly in `apps/web`. A separate lightweight worker service (`apps/worker`) handles content ingestion for the RAG pipeline. All services are deployed and managed through **Coolify**, a self-hosted PaaS that handles Docker container orchestration, Traefik-based reverse proxy, automatic SSL, and git-push deployments.

```
┌──────────────────────────────────────────────────────────────┐
│                  Hostinger KVM 4 VPS                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Coolify (PaaS + Traefik Proxy)            │  │
│  │         Auto SSL, Git deploy, Docker management        │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │ manages all services              │
│     ┌────────────────────┼─────────────────────┐             │
│     ▼                    ▼                     ▼             │
│  ┌─────────────┐  ┌────────────┐  ┌───────────────────┐     │
│  │  apps/web   │  │apps/worker │  │ Umami + Uptime    │     │
│  │  Next.js +  │  │ Ingestion  │  │ Kuma (monitoring) │     │
│  │  Payload    │  │ (port 4000)│  └───────────────────┘     │
│  │  (port 3000)│  └──────┬─────┘                            │
│  └──────┬──────┘         │                                   │
│         │           ┌────┘                                   │
│    ┌────┼───────────┼──────┐                                 │
│    ▼    ▼           ▼      ▼                                 │
│  ┌────────┐  ┌───────────┐  ┌──────────┐                    │
│  │Postgres│  │ Weaviate  │  │  Ollama  │                    │
│  │  (CMS) │  │(Vector DB)│  │(optional)│                    │
│  │  5432  │  │   8080    │  │  11434   │                    │
│  └────────┘  └───────────┘  └──────────┘                    │
│                                    ▲                         │
│                        ┌───────────┘                         │
│                        │ fallback if Groq rate-limits        │
│                   ┌────┴─────┐                               │
│                   │ Groq API │ (primary LLM, external)       │
│                   └──────────┘                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Project Structure (Turborepo Monorepo)

```
habib36.dev/
│
├── apps/
│   ├── web/                              # Next.js 15 + Payload CMS (main app)
│   │   ├── public/
│   │   │   ├── fonts/                    # JetBrains Mono, Inter (self-hosted)
│   │   │   ├── images/                   # Static assets (favicon, fallback OG)
│   │   │   └── robots.txt
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (frontend)/           # Route group — public site
│   │   │   │   │   ├── layout.tsx        # Root layout: fonts, metadata, analytics, ChatWidget
│   │   │   │   │   ├── page.tsx          # Homepage
│   │   │   │   │   ├── about/page.tsx
│   │   │   │   │   ├── projects/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── blog/             # Phase 1.5
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── resume/page.tsx
│   │   │   │   │   ├── contact/page.tsx
│   │   │   │   │   ├── uses/page.tsx     # Phase 2
│   │   │   │   │   └── case-studies/     # Phase 2
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── [slug]/page.tsx
│   │   │   │   ├── (payload)/            # Route group — Payload admin
│   │   │   │   │   ├── admin/[[...segments]]/page.tsx
│   │   │   │   │   └── api/[...slug]/route.ts
│   │   │   │   ├── api/
│   │   │   │   │   ├── chat/route.ts     # POST — chatbot (uses @habib36/ai)
│   │   │   │   │   ├── chat/feedback/route.ts
│   │   │   │   │   ├── contact/route.ts
│   │   │   │   │   ├── resume-pdf/route.ts
│   │   │   │   │   └── og/route.tsx      # Dynamic OG images
│   │   │   │   └── sitemap.ts
│   │   │   ├── components/
│   │   │   │   ├── layout/               # Navbar, MobileMenu, Footer, PageTransition
│   │   │   │   ├── home/                 # HeroSection, AchievementBanner, CPShowcase,
│   │   │   │   │                         # ProofOfWork, InlineChatPrompt, FeaturedProjects
│   │   │   │   ├── projects/             # ProjectCard, ProjectDetail
│   │   │   │   ├── blog/                 # PostCard, PostContent, TableOfContents (Phase 1.5)
│   │   │   │   ├── resume/               # ResumeView, ResumePDF
│   │   │   │   └── chat/                 # ChatWidget, ChatPanel, ChatMessage,
│   │   │   │                             # SuggestedPrompts, SourceChip, SourcePreviewCard
│   │   │   ├── hooks/                    # useChat, useSuggestedPrompts, useIntersectionObserver
│   │   │   └── styles/globals.css
│   │   ├── payload.config.ts
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── worker/                           # Ingestion + background jobs (Phase 1.5+)
│       ├── src/
│       │   ├── index.ts                  # Express/Fastify server entry
│       │   ├── routes/ingest.ts          # POST /ingest — webhook receiver
│       │   ├── jobs/
│       │   │   ├── ingest-content.ts     # Chunk → embed → upsert to Weaviate
│       │   │   ├── delete-content.ts     # Remove chunks on delete
│       │   │   ├── cache-bust.ts         # Clear Redis caches after ingestion
│       │   │   └── warm-up.ts            # Cron: ping Weaviate/Ollama
│       │   └── cron.ts                   # Scheduled jobs
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── ai/                               # RAG core logic (shared: web + worker)
│   │   ├── src/
│   │   │   ├── llm/
│   │   │   │   ├── groq.ts              # Groq SDK client
│   │   │   │   ├── ollama.ts            # Ollama client (Phase 2)
│   │   │   │   └── router.ts            # Groq → Ollama fallback logic
│   │   │   ├── rag/
│   │   │   │   ├── pipeline.ts          # embed → search → prompt → stream
│   │   │   │   ├── static-knowledge.ts  # Phase 1: hardcoded markdown chunks
│   │   │   │   └── prompts.ts           # System prompt + suggested prompts map
│   │   │   ├── ingest/
│   │   │   │   ├── chunker.ts           # LangChain text splitter
│   │   │   │   ├── embedder.ts          # Embedding via Weaviate/Ollama
│   │   │   │   ├── weaviate.ts          # Weaviate client + upsert/delete/search
│   │   │   │   └── sync.ts             # content → chunk → embed → upsert
│   │   │   ├── cache/
│   │   │   │   ├── query-cache.ts       # Upstash Redis caching
│   │   │   │   └── invalidate.ts        # Cache bust on content changes
│   │   │   └── index.ts
│   │   └── package.json                  # @habib36/ai
│   │
│   ├── db/                               # Payload collections + DB utilities
│   │   ├── src/
│   │   │   ├── collections/              # All Payload collection configs
│   │   │   │   ├── Users.ts
│   │   │   │   ├── Projects.ts
│   │   │   │   ├── Experience.ts
│   │   │   │   ├── Education.ts
│   │   │   │   ├── Skills.ts
│   │   │   │   ├── Achievements.ts
│   │   │   │   ├── ContactSubmissions.ts
│   │   │   │   ├── Media.ts
│   │   │   │   ├── Posts.ts             # Phase 1.5
│   │   │   │   ├── Categories.ts        # Phase 1.5
│   │   │   │   ├── CaseStudies.ts       # Phase 2
│   │   │   │   └── ChatLogs.ts          # Phase 2
│   │   │   ├── hooks/
│   │   │   │   ├── afterChangeIngest.ts # Triggers worker on content change
│   │   │   │   └── computeReadingTime.ts
│   │   │   ├── access/
│   │   │   │   ├── isAdmin.ts
│   │   │   │   └── isPublished.ts
│   │   │   ├── payload-client.ts
│   │   │   └── index.ts
│   │   └── package.json                  # @habib36/db
│   │
│   ├── ui/                               # Shared UI components (design system)
│   │   ├── src/
│   │   │   ├── primitives/               # Button, Badge, Card, Input, Tooltip
│   │   │   ├── composed/                 # SkillTag, TechBadge, Timeline, SectionHeading,
│   │   │   │                             # AnimatedCounter, RatingBadge, CodeBlock
│   │   │   ├── seo/                      # JsonLd, MetaTags
│   │   │   └── index.ts
│   │   └── package.json                  # @habib36/ui
│   │
│   └── config/                           # Shared config & constants
│       ├── src/
│       │   ├── env.ts                    # Zod-validated env vars
│       │   ├── constants.ts              # Design tokens, site metadata, limits
│       │   ├── rate-limit.ts             # Rate limiter config
│       │   └── index.ts
│       └── package.json                  # @habib36/config
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.dev.yml        # Local dev: postgres + weaviate
│   │   └── docker-compose.prod.yml       # Reference for Coolify
│   ├── coolify/
│   │   └── services.md                   # Coolify service configuration docs
│   ├── weaviate/
│   │   └── schema.json                   # ContentChunk class definition
│   └── ollama/
│       └── modelfile                     # Ollama model config (optional)
│
├── scripts/
│   ├── seed/                             # Seed CMS collections from JSON/markdown
│   │   ├── seed-projects.ts
│   │   ├── seed-experience.ts
│   │   ├── seed-education.ts
│   │   ├── seed-skills.ts
│   │   ├── seed-achievements.ts
│   │   └── seed-all.ts
│   ├── ingest-backfill/
│   │   └── backfill.ts                   # One-time: ingest all content to Weaviate
│   └── dev-tools/
│       ├── generate-static-knowledge.ts  # Extract CMS → static-knowledge.ts
│       └── test-rag.ts                   # CLI tool to test RAG locally
│
├── docs/
│   ├── architecture.md
│   ├── rag-flow.md
│   ├── deployment.md
│   └── collections.md
│
├── .github/workflows/ci.yml
├── .env.example
├── docker-compose.yml                    # → symlink to infra/docker/docker-compose.dev.yml
├── package.json                          # Root workspace
├── turbo.json                            # Turborepo pipeline config
├── tsconfig.base.json                    # Shared TS config
├── .eslintrc.json
├── .prettierrc
└── README.md
```

**Why this structure:**

| Decision | Rationale |
|---|---|
| `apps/web` + `apps/worker` | Worker handles CPU-intensive ingestion (chunking, embedding) without blocking Next.js. Not deployed in Phase 1 — ingestion is deferred to Phase 1.5. |
| `packages/ai` | RAG logic is used by both `web` (for `/api/chat`) and `worker` (for ingestion). Single source of truth. |
| `packages/db` | Collections defined once, imported by both `web` (Payload config) and `worker` (reading content). Hooks and access control live here. |
| `packages/ui` | Shared primitives (Button, Badge) and composed components (Timeline, CodeBlock) are reusable and testable in isolation. |
| `packages/config` | Zod-validated env vars, design tokens, rate limit configs — shared everywhere, validated once. |
| `infra/` | Docker, Coolify, Weaviate, Ollama configs are infrastructure, not app code. |
| `scripts/` | Seeding, backfilling, and dev tools are CLI scripts run manually, not part of runtime. |

### 6.3 Frontend

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15+ (App Router) | SSR/SSG for SEO, React Server Components for performance |
| Styling | Tailwind CSS | Utility-first, dark theme by default, consistent design system |
| Animations | Framer Motion | Page transitions, scroll animations, hero effects |
| Code Highlighting | Shiki or Prism.js | Syntax highlighting in blog posts |
| Icons | Lucide React | Consistent, lightweight icon set |
| Chat UI | Custom React component | Floating widget, streaming responses, markdown rendering |
| SEO | Next.js Metadata API + next-sitemap | Dynamic OG images via `ImageResponse` (edge), structured data, sitemap |

### 6.4 Backend & CMS

| Layer | Technology | Notes |
|---|---|---|
| CMS | Payload CMS 3.x | Embedded in Next.js /app folder, native integration |
| Database | PostgreSQL | Via Payload's Postgres adapter; hosts CMS data, blog posts, projects |
| Auth | Payload built-in auth | Admin panel behind login; no public auth needed |
| File Storage | Local filesystem or S3-compatible (MinIO) | For uploaded images, resume PDF, media |
| API | Payload REST + Next.js API routes | CMS data via Payload, chatbot via custom API routes |
| Email | Resend or Nodemailer + SMTP | Contact form submissions |

### 6.5 AI System Architecture

| Component | Technology | Notes |
|---|---|---|
| Vector Database | Weaviate (Docker, self-hosted) | Stores embeddings for all content |
| Embedding Model | all-MiniLM-L6-v2 or nomic-embed-text | Local via sentence-transformers or Ollama |
| LLM (Primary) | Groq API (free tier) — Llama 3.1 70B | Near-instant inference (~200ms), high quality, free rate-limited API. Ensures "wow" factor for recruiters. |
| LLM (Fallback) | Llama 3.1 8B via Ollama (self-hosted) | Kicks in when Groq rate-limits; keeps chatbot always available. Can be disabled to save RAM if Groq suffices. |
| Orchestration | LangChain.js | Query routing, prompt construction, streaming, LLM failover logic — keeps entire stack TypeScript |
| Ingestion | `apps/worker` service | Separate Express service receives Payload webhooks, chunks content, embeds, and upserts to Weaviate. Keeps Next.js event loop unblocked. Deployed Phase 1.5+. |

### 6.6 Database Schema (Payload Collections)

**Users (built-in)**
- email, password, role (admin)

**Posts (Blog)**
- title, slug, content (Lexical rich text), excerpt, coverImage, category (relationship), tags (array), author (relationship), publishedAt, status (draft/published), readingTime, metaTitle, metaDescription

**Projects**
- title, slug, description, content (rich text), techStack (array), githubUrl, liveUrl, coverImage, featured (boolean), order (number)

**Experience**
- company, role, startDate, endDate, location, description (rich text), techStack (array), order (number)

**Education**
- institution, degree, field, startDate, endDate, cgpa, notes (text), order (number)

**Skills**
- category (e.g., "Programming Languages", "Frameworks", "AI & LLMs"), items (array of {name, proficiency}), order (number)

**Achievements**
- title, platform (e.g., "LeetCode", "Codeforces"), detail (text), rating (number), profileUrl, order (number)

**Categories**
- title, slug

**Media (built-in)**
- Payload handles file uploads, image resizing, alt text

**Contact Submissions**
- name, email, message, createdAt, read (boolean)

**Case Studies**
- title, slug, project (relationship), content (rich text), problem, approach, solution, outcome, metrics

**Chat Logs (admin-only)**
- query (text), retrievedChunks (JSON — chunk IDs, similarity scores), llmProvider ("groq" | "ollama"), promptTokens (number), responseTimeMs (number), cacheHit (boolean), userFeedback ("up" | "down" | null), sessionId, createdAt

### 6.7 Deployment Strategy

| Component | Hosting | Details |
|---|---|---|
| Deployment Platform | Coolify (on Hostinger KVM 4) | Manages all Docker containers, Traefik reverse proxy, auto SSL via Let's Encrypt, Git-push deploys |
| Next.js + Payload | Coolify service (Docker) | Deployed as a Docker container via GitHub repo integration; Coolify handles builds and rollbacks |
| PostgreSQL | Coolify managed database | One-click Postgres setup in Coolify with automated backups and persistent volumes |
| Weaviate | Coolify service (Docker) | Deployed as a standalone Docker service; Coolify manages networking between containers |
| Ollama | Coolify service (Docker) | Deployed as a Docker service; needs at least 8GB RAM allocated |
| Reverse Proxy | Traefik (built into Coolify) | Automatic SSL provisioning, domain routing, rate limiting — no manual Nginx config needed |
| CI/CD | Coolify + GitHub webhooks | Auto-deploy on push to main; Coolify handles build, deploy, health checks, and zero-downtime rollouts |
| Monitoring | Uptime Kuma (Coolify service) | One-click deploy via Coolify's service catalog |
| Analytics | Umami (Coolify service) | One-click deploy via Coolify's service catalog; privacy-friendly, open source |

**Your Server: Hostinger KVM 4**
- CPU: 4 vCPUs (AMD EPYC)
- RAM: 16 GB
- Storage: 200 GB NVMe SSD
- Bandwidth: 16 TB/month
- OS: Ubuntu 24.04 LTS
- Dedicated IP included
- Weekly automated backups via Hostinger

**RAM Allocation Plan:**

| Service | Estimated RAM | Notes |
|---|---|---|
| Ollama (Llama 3.1 8B Q4) | ~6–8 GB | **Optional fallback** — only needed if Groq rate-limits frequently. Can be disabled to free RAM. |
| Weaviate | ~2–3 GB | Lightweight at personal scale (~1000 chunks) |
| PostgreSQL | ~512 MB | Low usage for CMS data |
| Next.js + Payload | ~512 MB–1 GB | Node.js process with SSR |
| Coolify + Traefik | ~512 MB | PaaS overhead |
| Umami + Uptime Kuma | ~256 MB | Lightweight services |
| OS + system | ~1 GB | Ubuntu base |
| **Total (with Ollama)** | **~12–14 GB** | **Fits within 16 GB with headroom** |
| **Total (without Ollama)** | **~5–6 GB** | **Plenty of headroom — recommended starting config** |

> **Recommended approach:** Start without Ollama. Use Groq as the sole LLM. Monitor Groq rate-limit hits via Upstash. Only spin up Ollama if rate limits become a frequent problem. This keeps the VPS light and responsive.

---

## 7. Content Strategy

### 7.1 Blog Structure

| Category | Description | Example Topics |
|---|---|---|
| Deep Technical Tutorials | Step-by-step guides with code | Building a RAG pipeline with Weaviate, Natural Language to SQL with LangChain |
| Project Breakdowns | Case-study style posts about shipped work | How I built a multilingual translation pipeline at Makebell |
| Opinion / Thinking | Technical opinions and industry takes | Why every portfolio needs an AI chatbot in 2026 |
| Career Reflections | Personal growth, lessons learned | From 3000+ CP problems to production engineering |
| Tool Reviews | Hands-on evaluations of dev tools | Payload CMS vs Strapi vs Directus for developer portfolios |

### 7.2 SEO Strategy

- **Target long-tail keywords:** "how to build RAG pipeline Next.js", "Weaviate tutorial for beginners", "Payload CMS blog setup"
- **Dynamic OG images:** Use Next.js `ImageResponse` (edge-compatible) to auto-generate Open Graph images for every blog post and case study. Each OG image renders the post title, Habibur's name, and the terminal/hacker aesthetic branding. When shared on Twitter/X or LinkedIn, these drive significantly higher click-through rates vs. generic or missing previews.
- **Every blog post has:** custom meta title (< 60 chars), meta description (< 155 chars), auto-generated OG image, canonical URL
- **Structured data (JSON-LD) for:** Person schema on about page, Article schema on blog posts, BreadcrumbList for navigation
- **Dynamic sitemap.xml** generated by next-sitemap, updated on each build
- **robots.txt** allowing all crawlers
- **Internal linking strategy:** every blog post links to 2–3 related posts and relevant project pages
- **Image optimization:** Next.js Image component with WebP, lazy loading, alt text on every image

### 7.3 Writing Guidelines

- **Tone:** Technical but approachable. Write like you're explaining to a smart colleague, not a professor.
- **Structure:** Hook → Problem → Solution → Code → Takeaway
- **Code samples:** Always tested, with comments explaining key lines
- **Length:** Tutorials 1500–3000 words, opinions 800–1200 words, project breakdowns 1000–2000 words
- **Visuals:** At least 1 diagram or screenshot per post

### 7.4 Content Lifecycle

1. Draft in Payload CMS → Preview via Next.js draft mode → Publish
2. Auto-ingest into chatbot knowledge base (via webhook)
3. Quarterly review: update outdated posts, add editor's notes, refresh SEO metadata
4. Evergreen content should be updated when underlying tech changes

---

## 8. UX/UI Guidelines

### 8.1 Design Principles

- **Dark-first:** Background `#0D1117` (GitHub Dark), with `#58A6FF` accents. No light mode in MVP.
- **Terminal aesthetic:** Monospace fonts for headings and accents (JetBrains Mono, Fira Code, or Cascadia Code). System fonts for body text.
- **Minimal chrome:** Let content breathe. Large whitespace, no visual clutter.
- **Code is design:** Treat code snippets, terminal outputs, and technical diagrams as first-class design elements.
- **Accessible:** WCAG AA contrast ratios even in dark mode. Keyboard navigable. Screen reader friendly.

### 8.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0D1117` | Page background |
| `--bg-secondary` | `#161B22` | Cards, code blocks, chat panel |
| `--bg-tertiary` | `#21262D` | Hover states, active elements |
| `--text-primary` | `#E6EDF3` | Body text |
| `--text-secondary` | `#8B949E` | Muted text, timestamps, metadata |
| `--accent-blue` | `#58A6FF` | Links, CTA buttons, primary accent |
| `--accent-green` | `#7EE787` | Success states, online indicators, secondary accent |
| `--accent-orange` | `#FF7B72` | Warnings, hot tags |
| `--border` | `#30363D` | Borders, dividers |

### 8.3 Typography

- **Headings:** JetBrains Mono or Fira Code (monospace), bold
- **Body:** Inter or system-ui stack for readability
- **Code:** JetBrains Mono with ligatures
- **Sizes:** Base 16px, scale 1.25 (minor third)

### 8.4 Layout & Navigation

- **Navigation:** Fixed top navbar with logo, page links (Home, About, Projects, Blog, Resume, Contact), and a chatbot toggle button
- **Mobile:** Hamburger menu with slide-in drawer
- **Homepage:** Full-viewport hero → About snippet → Featured Projects (3–4 cards) → Latest Blog Posts (3) → CTA / Contact
- **Blog listing:** Grid or list layout with search and category/tag filters
- **Project detail pages:** Left sidebar with project metadata, main content area
- **Chatbot:** Inline prompt card on homepage (primary entry point); floating button (bottom-right) on all other pages, expands to a panel (400px wide on desktop, full-screen on mobile)

### 8.5 Micro-interactions

- Terminal cursor blink on hero tagline
- Smooth scroll with section snap hints
- Hover glow on project cards
- Typing indicator in chatbot while AI generates response
- Code block copy button with "Copied!" feedback
- Page transition fade-ins via Framer Motion

---

## 9. Success Metrics (KPIs)

### 9.1 Engagement Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|---|---|---|
| Monthly unique visitors | 500 | 2,000 |
| Average session duration | > 2 minutes | > 3 minutes |
| Blog post views (per post) | 100 | 500 |
| Pages per session | > 2.5 | > 3.5 |
| Bounce rate | < 60% | < 45% |

### 9.2 Recruiter / Client Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|---|---|---|
| Resume downloads | 30 | 100 |
| Contact form submissions | 5 | 15 |
| LinkedIn profile clicks from site | 50 | 200 |
| Average time on resume page | > 45 seconds | > 60 seconds |

### 9.3 Chatbot Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|---|---|---|
| Chatbot sessions per month | 50 | 200 |
| Average messages per session | > 3 | > 4 |
| Fallback rate (can't answer) | < 30% | < 20% |
| User satisfaction (thumbs up/down) | > 70% positive | > 80% positive |

### 9.4 Performance Latency Budgets

| Target | Budget | Notes |
|---|---|---|
| Page load (First Contentful Paint) | < 1.5s | SSG pages should be near-instant; SSR pages under 1.5s |
| Full page interactive (TTI) | < 2.0s | Critical for recruiter bounce rates |
| Chatbot first token (streaming start) | < 2.0s | Groq API typically responds in ~200ms; budget includes embedding + search |
| Chatbot full response | < 6.0s | End-to-end including streaming; cached responses should be < 500ms |
| Blog post load | < 1.0s | Statically generated, should be near-instant on CDN/cache |
| Resume PDF generation | < 3.0s | On-demand `@react-pdf/renderer`; cache the generated PDF |
| Lighthouse Performance score | > 90 | Enforced via CI checks on deploy |

### 9.5 SEO Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|---|---|---|
| Google-indexed pages | 20+ | 50+ |
| Organic search traffic share | 30% | 50% |
| Top-10 keyword rankings | 5 keywords | 15 keywords |
| Domain authority (Moz/Ahrefs) | 10 | 20 |

---

## 10. Risks & Challenges

### 10.1 Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| VPS resource constraints | Ollama + Weaviate + Next.js may approach 16GB RAM limit on Hostinger KVM 4 | Use quantized models (Q4_K_M), monitor via Coolify dashboard, fallback to Groq API if RAM is tight, or upgrade to KVM 8 ($20/mo) |
| Ollama cold start latency | Fallback LLM response can take 5–10 seconds on first call | Keep Ollama model loaded with keep_alive; primary Groq API responds in ~200ms so most users never hit this |
| Weaviate data loss | Vector index corruption on crash | Automated daily backups, Docker volume mounts |
| Payload CMS breaking changes | V3 is relatively new, APIs may change | Pin dependency versions, test upgrades in staging |
| SEO regression | Site changes could break indexing | Automated Lighthouse CI checks on deploy |

### 10.2 UX Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Chatbot sets wrong expectations | Users expect it to be a general AI assistant | Clear scoping in greeting + suggested prompts guide users toward relevant questions. Controlled expansion allows related technical concepts. |
| Blank canvas paralysis | Users open chatbot but don't know what to ask | Inline chatbot prompt on homepage + context-aware suggested prompt chips on every page |
| Slow page loads on mobile | High bounce rate from Bangladesh/South Asian visitors | Aggressive caching, image optimization, lazy loading |
| Content staleness | Outdated blog posts hurt credibility | Quarterly content review schedule |
| Dark-only theme | Some users may find it hard to read | Ensure WCAG AA contrast; consider light mode in Phase 3 |

### 10.3 AI Hallucination Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Fabricating experience | Chatbot claims Habibur worked at companies he didn't | Strict system prompt: only answer from retrieved context |
| Inventing skills | Chatbot says he knows a technology not in his stack | Relevance threshold: refuse to answer if no chunk scores above 0.65 |
| Misattributing quotes | Chatbot cites wrong blog post for information | Include source metadata in every response; link to original |
| Overly confident wrong answers | User trusts an incorrect claim | Append disclaimer: "I'm AI and may make mistakes. Verify important details with Habibur directly." |

### 10.4 Security & Abuse Prevention

Since this is a public-facing LLM endpoint, robust protection is critical to prevent malicious actors from spamming the Groq/Ollama endpoints, running up costs, or crashing the VPS.

| Layer | Implementation | Details |
|---|---|---|
| IP-based rate limiting | Upstash Redis (free tier) or in-memory store | Enforce 5 req/min and 20 req/session per IP on `/api/chat`. Returns `429 Too Many Requests` with retry-after header. |
| Session token | Signed, short-lived JWT or cookie | Issued when chat widget opens. Prevents raw API abuse from scripts — no token = no response. |
| Input sanitization | Server-side validation | Max query length (500 chars), strip HTML/scripts, reject empty or nonsensical inputs before hitting the LLM. |
| Ingestion endpoint auth | Shared secret token | `/api/ingest` only accepts requests with a `X-Ingest-Secret` header matching an env variable. Prevents external actors from poisoning the vector DB. |
| Groq API key protection | Server-side only | API key never exposed to client. All LLM calls go through Next.js API route. |
| Cost monitoring | Groq usage dashboard + Upstash alerts | Set alerts if chatbot usage exceeds expected thresholds (e.g., >1000 requests/day). |
| Abuse response | Graceful degradation | If rate limit is hit: show friendly message ("I need a breather — try again in a moment!"). If Groq + Ollama both fail: show static FAQ fallback. |

---

## 11. Future Roadmap

> **Philosophy:** Ship something live for recruiters fast. A polished static portfolio with a basic chatbot beats a perfect system that's never deployed. The RAG pipeline is impressive, but it's not what lands the first interview — a clean, fast, content-rich site does.

### Phase 1: True MVP — "Get Live" (Weeks 1–3)

**Goal:** A fully deployed, visually stunning portfolio that recruiters can visit today. The chatbot exists but uses a lightweight approach — no vector DB infrastructure yet.

- Homepage with hero, featured achievement banner, about, skills, experience
- Inline chatbot prompt on homepage (visible, not hidden)
- Competitive programming showcase with rating badges and stats
- Proof of Work section with architecture diagrams, code snippets, and metrics
- Project showcase (3–5 projects) with detail pages
- CMS-driven resume with auto-generated PDF via `@react-pdf/renderer`
- Contact form + social links
- **Lightweight chatbot (v1):** Groq API with a static knowledge base (hardcoded markdown chunks of resume, project descriptions, and about content — no Weaviate, no ingestion pipeline). Context-aware suggested prompts. Source footnote chips.
- Minimal Payload CMS setup (Users, Projects, Experience, Education, Skills, Achievements, Contact Submissions, Media)
- Deployment on Hostinger KVM 4 via Coolify
- Core SEO: sitemap, meta tags, structured data, dynamic OG images via `ImageResponse`
- Umami analytics setup
- IP-based rate limiting on `/api/chat` via Upstash Redis

**What's intentionally deferred:** Blog system, Weaviate, ingestion pipeline, Ollama, caching layer, AI observability.

### Phase 1.5: Real RAG — "Make the Chatbot Smart" (Weeks 4–6)

**Goal:** Upgrade the chatbot from static knowledge to a real RAG pipeline. Add the blog system so content starts flowing.

- Blog system with Payload CMS (Lexical rich text editor, categories, tags, code highlighting, reading time, TOC, RSS)
- Posts collection added to Payload (title, slug, content, excerpt, coverImage, category, tags, publishedAt, metaTitle, metaDescription)
- Categories collection
- Weaviate deployed as Coolify Docker service
- Ingestion pipeline via Next.js `/api/ingest` route with Payload `afterChange`/`afterDelete` hooks
- Chatbot upgraded to real RAG: embed query → Weaviate hybrid search → Groq API with retrieved context
- All existing content (projects, resume, about) ingested into Weaviate
- Blog posts auto-ingested on publish
- Source attribution UI with interactive footnote chips
- Query caching layer (Upstash Redis) for common questions
- 3–5 initial blog posts published

### Phase 2: Growth & Polish (Weeks 7–12)

**Goal:** Improve chatbot quality, add content depth, optimize performance, and start driving organic traffic.

- Case studies collection with rich content (Problem → Approach → Solution → Outcome)
- Uses/Stack page
- Chatbot improvements: hybrid search tuning, better prompt engineering, conversation memory
- AI observability logging (retrieved chunks, similarity scores, latency breakdown, cache hit rates)
- Admin dashboard page for chatbot analytics
- Newsletter integration (Listmonk)
- Blog search with Payload Search plugin
- Performance optimization: image CDN, edge caching, bundle analysis
- Automated Lighthouse CI checks via Coolify build hooks
- Ollama deployed as optional fallback LLM (only if Groq rate limits are a problem)
- GitHub activity feed integration on homepage
- Embedding model warm-up cron (prevent cold starts)
- Hallucination detection heuristic logging

### Phase 3: Scale & Differentiate (Months 4–6)

**Goal:** Add features that make habib36.dev truly unique and expand audience reach.

- Light mode toggle
- Internationalization (i18n) for Bengali content
- Interactive code playgrounds embedded in blog posts
- Speaking/talks page
- Chatbot voice input (Web Speech API)
- Multi-modal chatbot: answer questions about project screenshots or architecture diagrams
- Open-source the portfolio template for community use
- Custom domain email (hi@habib36.dev)
- Full response caching for top 50 most-asked questions
- A/B testing on chatbot suggested prompts

---

## Appendix

### A. Coolify Service Architecture

All services are deployed and managed through Coolify's dashboard. Each runs as an isolated Docker container with Coolify handling networking, SSL, and domain routing via Traefik.

**Coolify Project Structure:**

```
habib36.dev (Coolify Project)
├── Environments
│   ├── Production
│   │   ├── web               # Git-based deploy → apps/web/Dockerfile (port 3000)
│   │   │                     # Domain: habib36.dev
│   │   ├── worker            # Git-based deploy → apps/worker/Dockerfile (port 4000)
│   │   │                     # Internal network only (Phase 1.5+)
│   │   ├── postgres          # Coolify managed DB (port 5432)
│   │   │                     # Auto-backups enabled
│   │   ├── weaviate          # Docker image: semitechnologies/weaviate
│   │   │                     # Internal network only (port 8080, Phase 1.5+)
│   │   ├── ollama            # Docker image: ollama/ollama (OPTIONAL)
│   │   │                     # Only deploy if Groq rate limits are frequent
│   │   ├── umami             # One-click from Coolify catalog
│   │   │                     # Domain: analytics.habib36.dev
│   │   └── uptime-kuma       # One-click from Coolify catalog
│   │                         # Domain: status.habib36.dev
│   └── Staging (optional)
│       └── web               # Preview deployments for testing
```

**Coolify Advantages over manual Docker Compose:**
- Git-push auto-deploys with zero-downtime rollouts
- Built-in Traefik proxy with automatic SSL (no Nginx/Certbot config)
- One-click database backups and restore
- Environment variable management via UI
- Service health monitoring and auto-restart
- Built-in log viewer for all containers
- Staging/preview environments per branch

### B. Cost Estimate (Monthly)

| Item | Cost | Notes |
|---|---|---|
| VPS (Hostinger KVM 4) | ~$10–14 | 4 vCPU, 16 GB RAM, 200 GB NVMe (price depends on billing cycle) |
| Domain (habib36.dev) | Included | Hostinger includes free domain with VPS plans |
| SSL (Let's Encrypt) | Free | Auto-managed by Coolify's Traefik proxy |
| LLM (Ollama, self-hosted) | Free | Runs on same VPS |
| Weaviate | Free | Self-hosted Docker |
| Embedding Model | Free | Local model |
| Analytics (Umami) | Free | Self-hosted |
| Email (Resend) | Free | Up to 3000 emails/month on free tier |
| Groq API (fallback LLM) | Free | Free tier with rate limits |
| **Total** | **~$10–14/month** | **Everything runs on one VPS** |

### C. Key Open-Source Dependencies

| Package | Purpose | License |
|---|---|---|
| Next.js 15+ | Framework | MIT |
| Payload CMS 3.x | Content management | MIT |
| Coolify | Self-hosted PaaS / deployment | Apache-2.0 |
| Weaviate | Vector database | BSD-3 |
| Groq SDK | Primary LLM inference API | Apache-2.0 |
| Ollama | Local LLM serving (fallback) | MIT |
| LangChain.js | RAG orchestration, chunking, embeddings | MIT |
| @react-pdf/renderer | Resume PDF generation from CMS data | MIT |
| Upstash Redis | Rate limiting for chatbot API | BSL |
| Tailwind CSS | Styling | MIT |
| Framer Motion | Animations | MIT |
| Umami | Analytics | MIT |
| Uptime Kuma | Monitoring | MIT |
| Listmonk | Newsletter | AGPL-3.0 |

---

*// END OF DOCUMENT*
*habib36.dev — Built with intent, powered by AI*

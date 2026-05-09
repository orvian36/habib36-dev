# Graph Report - habib36-dev  (2026-05-09)

## Corpus Check
- 95 files · ~796,968 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 297 nodes · 265 edges · 74 communities (57 shown, 17 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8e516933`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]

## God Nodes (most connected - your core abstractions)
1. `getPayloadClient()` - 15 edges
2. `Badge()` - 12 edges
3. `Button()` - 12 edges
4. `SectionHeading()` - 11 edges
5. `Payload CMS 3` - 11 edges
6. `habib36.dev Personal Portfolio Site` - 10 edges
7. `About Page` - 7 edges
8. `Frontend Route Group (src/app/(frontend)/)` - 7 edges
9. `UI/UX Improvements Design Spec (2026-04-13)` - 6 edges
10. `Blog Page Desktop Screenshot` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Resume Page Desktop Screenshot` --references--> `Resume Page`  [INFERRED]
  public/screenshots/resume-desktop.png → src/app/(frontend)/resume/page.tsx
- `Resume Page` --implements--> `Resume Skills Section`  [INFERRED]
  src/app/(frontend)/resume/page.tsx → public/screenshots/resume-desktop.png
- `Resume Page` --implements--> `Resume Experience Section`  [INFERRED]
  src/app/(frontend)/resume/page.tsx → public/screenshots/resume-desktop.png
- `Resume Page` --implements--> `Resume Education Section`  [INFERRED]
  src/app/(frontend)/resume/page.tsx → public/screenshots/resume-desktop.png
- `Resume Page` --implements--> `Download PDF Button`  [INFERRED]
  src/app/(frontend)/resume/page.tsx → public/screenshots/resume-desktop.png

## Hyperedges (group relationships)
- **Portfolio Site Technology Stack** — claudemd_portfolio_site, claudemd_nextjs, claudemd_payload_cms, claudemd_postgresql, claudemd_tailwind_css, claudemd_framer_motion, claudemd_pnpm [EXTRACTED 1.00]
- **Payload CMS Subsystem** — claudemd_payload_cms, claudemd_payload_config, claudemd_collections, claudemd_payload_client_helper, claudemd_payload_types, claudemd_db_postgres_adapter, claudemd_lexical_editor [EXTRACTED 1.00]
- **Frontend Subsystem** — claudemd_frontend_route_group, claudemd_frontend_layout, claudemd_client_shell, claudemd_components_dir, claudemd_static_data, claudemd_globals_css [EXTRACTED 1.00]
- **Environment Configuration Pattern** — claudemd_payload_secret, claudemd_database_url, claudemd_payload_config_alias, claudemd_withpayload [INFERRED 0.85]

## Communities (74 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (7): Certifications(), LatestPosts(), BlogPostDetail(), Badge(), Button(), SectionHeading(), TiltCard()

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (23): AGENTS.md Reference, Payload Collections (Users, Media, Projects, Posts), DATABASE_URL Environment Variable, @payloadcms/db-postgres Adapter, ESLint Config (eslint.config.mjs), Graphify Knowledge Graph Tool, Graphify Output Directory (graphify-out/), Lexical Rich Text Editor (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (11): BlogPage(), HomePage(), InlineChatPrompt(), StatsBar(), NotificationBanner(), getPayloadClient(), ProjectsPage(), BlogPostPage() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (8): CopyButton(), makeUniqueSlugger(), CalloutBlockComponent(), CodeBlockComponent(), MermaidBlockComponent(), MermaidClient(), PullQuoteBlockComponent(), StatsBlockComponent()

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (7): ShareButton(), TocDots(), ClientShell(), ThemeProvider(), CustomCursor(), PageTransition(), ScrollProgress()

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (16): About Page Desktop Screenshot, About Me Section, About Page Mobile Screenshot, About Page, Academic Background Section, CodeChef Rating 1741, Codeforces Rating 1558, CP Showcase Section (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (11): Contact Page Desktop Screenshot, Contact Form, Contact Page, Download PDF Button, Resume Page Desktop Screenshot, Resume Education Section, Resume Experience Section, Resume Page (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (9): ClientShell Component (src/components/layout/client-shell.tsx), Components Directory (src/components/), Framer Motion Animation Library, Frontend Layout (src/app/(frontend)/layout.tsx), Frontend Route Group (src/app/(frontend)/), Global Styles (src/app/(frontend)/globals.css), Lucide React Icons, Static Data (src/lib/data.ts) (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (7): Blog Post Card Component, Blog Page Desktop Screenshot, Blog Page, Chat Widget (floating button), Posts CMS Collection, Search Bar Component, Tag Filter Component

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (7): Featured Project Badge, Natural Language to SQL Project Card (Featured), Production RAG Pipeline Project Card (Featured), Traffic Signal Detection YOLOv8 Project Card (Featured), Projects Page Desktop Screenshot, All Projects Page, Technology Tag System

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (7): AnimatedCounter Component Concept, CustomCursor Component Concept, ParticleNetwork Background Concept, ScrollProgress Indicator Concept, TiltCard 3D Effect Concept, UI/UX Improvements Implementation Plan (2026-04-13), UI/UX Improvements Design Spec (2026-04-13)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (6): Featured Work Section, Frontend Home Page, Habibur Rahman Personal Brand, Hero Section, Home Page Desktop Screenshot, Testimonials Section

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (6): Traffic Signal Detection YOLOv8 Project, Natural Language to SQL Project, Production RAG Pipeline Project, Project Card Component, Projects Page Mobile Screenshot, Projects Search and Filter UI

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (6): CodeChef Profile (3741), Codeforces Profile (1554 rating), LeetCode Profile (3882 problems), Resume Mobile Layout, Resume Mobile Screenshot, Resume Social Links (GitHub, LinkedIn, Email)

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (6): CLAUDE.md Project Instructions, Next.js App Router Architecture, Payload CMS Integration, RAG Chatbot AI System, Supabase PostgreSQL Database, habib36.dev Product Requirements Document

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (5): Blog Post Card Component, Blog Category Filter Tabs, Dark Mode Theme, Blog Page Mobile Screenshot, Blog Search Bar

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (5): Availability Badge (Available for new projects), Contact Page Mobile Screenshot, GitHub Profile Link (habib36), LinkedIn Profile Link, Social Links Section (Find Me Online)

### Community 18 - "Community 18"
Cohesion: 0.83
Nodes (3): capture(), main(), waitForServer()

### Community 23 - "Community 23"
Cohesion: 0.5
Nodes (4): Home Page Mobile Screenshot, Mobile Responsive Layout Design, Portfolio Project Cards, Stats Counters (3000+ commits, 15+ projects, 10+ clients)

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (4): CSS Variable Theming (Dark/Light Mode), FOUC Prevention Strategy, Theme Toggle Implementation Plan (2026-04-28), Theme Toggle Design Spec (2026-04-28)

## Knowledge Gaps
- **86 isolated node(s):** `About Page Desktop Screenshot`, `About Me Section`, `Verified Learning / Certifications Section`, `Navbar Component`, `Footer Component` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getPayloadClient()` connect `Community 2` to `Community 7`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 0` to `Community 20`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `getPayloadClient()` (e.g. with `HomePage()` and `BlogPage()`) actually correct?**
  _`getPayloadClient()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `About Page Desktop Screenshot`, `About Me Section`, `Verified Learning / Certifications Section` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
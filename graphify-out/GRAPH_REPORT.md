# Graph Report - .  (2026-05-08)

## Corpus Check
- Large corpus: 86 files · ~792,727 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 246 nodes · 228 edges · 57 communities (41 shown, 16 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.89)
- Token cost: 26,613 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Home Page Components|Home Page Components]]
- [[_COMMUNITY_Project Config & CMS Setup|Project Config & CMS Setup]]
- [[_COMMUNITY_Page Components & UI|Page Components & UI]]
- [[_COMMUNITY_About Page & Screenshots|About Page & Screenshots]]
- [[_COMMUNITY_Layout & Shell|Layout & Shell]]
- [[_COMMUNITY_Contact & Resume Pages|Contact & Resume Pages]]
- [[_COMMUNITY_CLAUDE.md Architecture Docs|CLAUDE.md Architecture Docs]]
- [[_COMMUNITY_Blog & Chat Features|Blog & Chat Features]]
- [[_COMMUNITY_Featured Projects Display|Featured Projects Display]]
- [[_COMMUNITY_Interactive UI Concepts|Interactive UI Concepts]]
- [[_COMMUNITY_Home & Brand Identity|Home & Brand Identity]]
- [[_COMMUNITY_Projects Collection & Cards|Projects Collection & Cards]]
- [[_COMMUNITY_Resume & Competitive Programming|Resume & Competitive Programming]]
- [[_COMMUNITY_Tech Stack Architecture|Tech Stack Architecture]]
- [[_COMMUNITY_Blog Theme & Filtering|Blog Theme & Filtering]]
- [[_COMMUNITY_Contact & Social Links|Contact & Social Links]]
- [[_COMMUNITY_Screenshot Capture Script|Screenshot Capture Script]]
- [[_COMMUNITY_Hero & Particle Animation|Hero & Particle Animation]]
- [[_COMMUNITY_Navbar & Theme Toggle|Navbar & Theme Toggle]]
- [[_COMMUNITY_Mobile Responsive Layout|Mobile Responsive Layout]]
- [[_COMMUNITY_DarkLight Mode System|Dark/Light Mode System]]
- [[_COMMUNITY_Blog Posts (AI Topics)|Blog Posts (AI Topics)]]
- [[_COMMUNITY_Notification Banner Plan|Notification Banner Plan]]
- [[_COMMUNITY_Navbar Component|Navbar Component]]
- [[_COMMUNITY_Footer Component|Footer Component]]
- [[_COMMUNITY_Portfolio Site Overview|Portfolio Site Overview]]
- [[_COMMUNITY_Dev Banner|Dev Banner]]
- [[_COMMUNITY_Blog Post CMS Setup|Blog Post: CMS Setup]]
- [[_COMMUNITY_Blog Post CP Journey|Blog Post: CP Journey]]
- [[_COMMUNITY_Blog Post AI Chatbot|Blog Post: AI Chatbot]]
- [[_COMMUNITY_Stats Section|Stats Section]]
- [[_COMMUNITY_CTA Section|CTA Section]]
- [[_COMMUNITY_CP Resume Section|CP Resume Section]]
- [[_COMMUNITY_AGENTS Next.js Warning|AGENTS Next.js Warning]]
- [[_COMMUNITY_README Overview|README Overview]]

## God Nodes (most connected - your core abstractions)
1. `getPayloadClient()` - 13 edges
2. `SectionHeading()` - 11 edges
3. `Payload CMS 3` - 11 edges
4. `Badge()` - 10 edges
5. `Button()` - 10 edges
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

## Communities (57 total, 16 thin omitted)

### Community 0 - "Home Page Components"
Cohesion: 0.13
Nodes (6): Certifications(), LatestPosts(), Badge(), Button(), SectionHeading(), TiltCard()

### Community 1 - "Project Config & CMS Setup"
Cohesion: 0.1
Nodes (23): AGENTS.md Reference, Payload Collections (Users, Media, Projects, Posts), DATABASE_URL Environment Variable, @payloadcms/db-postgres Adapter, ESLint Config (eslint.config.mjs), Graphify Knowledge Graph Tool, Graphify Output Directory (graphify-out/), Lexical Rich Text Editor (+15 more)

### Community 2 - "Page Components & UI"
Cohesion: 0.13
Nodes (10): BlogPage(), HomePage(), InlineChatPrompt(), StatsBar(), NotificationBanner(), getPayloadClient(), ProjectsPage(), BlogPostPage() (+2 more)

### Community 3 - "About Page & Screenshots"
Cohesion: 0.12
Nodes (16): About Page Desktop Screenshot, About Me Section, About Page Mobile Screenshot, About Page, Academic Background Section, CodeChef Rating 1741, Codeforces Rating 1558, CP Showcase Section (+8 more)

### Community 4 - "Layout & Shell"
Cohesion: 0.17
Nodes (5): ClientShell(), ThemeProvider(), CustomCursor(), PageTransition(), ScrollProgress()

### Community 5 - "Contact & Resume Pages"
Cohesion: 0.22
Nodes (11): Contact Page Desktop Screenshot, Contact Form, Contact Page, Download PDF Button, Resume Page Desktop Screenshot, Resume Education Section, Resume Experience Section, Resume Page (+3 more)

### Community 7 - "CLAUDE.md Architecture Docs"
Cohesion: 0.25
Nodes (9): ClientShell Component (src/components/layout/client-shell.tsx), Components Directory (src/components/), Framer Motion Animation Library, Frontend Layout (src/app/(frontend)/layout.tsx), Frontend Route Group (src/app/(frontend)/), Global Styles (src/app/(frontend)/globals.css), Lucide React Icons, Static Data (src/lib/data.ts) (+1 more)

### Community 8 - "Blog & Chat Features"
Cohesion: 0.33
Nodes (7): Blog Post Card Component, Blog Page Desktop Screenshot, Blog Page, Chat Widget (floating button), Posts CMS Collection, Search Bar Component, Tag Filter Component

### Community 9 - "Featured Projects Display"
Cohesion: 0.29
Nodes (7): Featured Project Badge, Natural Language to SQL Project Card (Featured), Production RAG Pipeline Project Card (Featured), Traffic Signal Detection YOLOv8 Project Card (Featured), Projects Page Desktop Screenshot, All Projects Page, Technology Tag System

### Community 10 - "Interactive UI Concepts"
Cohesion: 0.29
Nodes (7): AnimatedCounter Component Concept, CustomCursor Component Concept, ParticleNetwork Background Concept, ScrollProgress Indicator Concept, TiltCard 3D Effect Concept, UI/UX Improvements Implementation Plan (2026-04-13), UI/UX Improvements Design Spec (2026-04-13)

### Community 11 - "Home & Brand Identity"
Cohesion: 0.33
Nodes (6): Featured Work Section, Frontend Home Page, Habibur Rahman Personal Brand, Hero Section, Home Page Desktop Screenshot, Testimonials Section

### Community 12 - "Projects Collection & Cards"
Cohesion: 0.33
Nodes (6): Traffic Signal Detection YOLOv8 Project, Natural Language to SQL Project, Production RAG Pipeline Project, Project Card Component, Projects Page Mobile Screenshot, Projects Search and Filter UI

### Community 13 - "Resume & Competitive Programming"
Cohesion: 0.33
Nodes (6): CodeChef Profile (3741), Codeforces Profile (1554 rating), LeetCode Profile (3882 problems), Resume Mobile Layout, Resume Mobile Screenshot, Resume Social Links (GitHub, LinkedIn, Email)

### Community 14 - "Tech Stack Architecture"
Cohesion: 0.4
Nodes (6): CLAUDE.md Project Instructions, Next.js App Router Architecture, Payload CMS Integration, RAG Chatbot AI System, Supabase PostgreSQL Database, habib36.dev Product Requirements Document

### Community 15 - "Blog Theme & Filtering"
Cohesion: 0.4
Nodes (5): Blog Post Card Component, Blog Category Filter Tabs, Dark Mode Theme, Blog Page Mobile Screenshot, Blog Search Bar

### Community 16 - "Contact & Social Links"
Cohesion: 0.4
Nodes (5): Availability Badge (Available for new projects), Contact Page Mobile Screenshot, GitHub Profile Link (habib36), LinkedIn Profile Link, Social Links Section (Find Me Online)

### Community 17 - "Screenshot Capture Script"
Cohesion: 0.83
Nodes (3): capture(), main(), waitForServer()

### Community 21 - "Mobile Responsive Layout"
Cohesion: 0.5
Nodes (4): Home Page Mobile Screenshot, Mobile Responsive Layout Design, Portfolio Project Cards, Stats Counters (3000+ commits, 15+ projects, 10+ clients)

### Community 22 - "Dark/Light Mode System"
Cohesion: 0.67
Nodes (4): CSS Variable Theming (Dark/Light Mode), FOUC Prevention Strategy, Theme Toggle Implementation Plan (2026-04-28), Theme Toggle Design Spec (2026-04-28)

## Knowledge Gaps
- **86 isolated node(s):** `About Page Desktop Screenshot`, `About Me Section`, `Verified Learning / Certifications Section`, `Navbar Component`, `Footer Component` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getPayloadClient()` connect `Page Components & UI` to `Payload API Routes`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `NotificationBanner()` connect `Page Components & UI` to `Layout & Shell`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `LatestPosts()` connect `Home Page Components` to `Page Components & UI`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `getPayloadClient()` (e.g. with `HomePage()` and `BlogPage()`) actually correct?**
  _`getPayloadClient()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `About Page Desktop Screenshot`, `About Me Section`, `Verified Learning / Certifications Section` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Project Config & CMS Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
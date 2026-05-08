# Graph Report - .  (2026-05-08)

## Corpus Check
- 0 files · ~810,988 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 214 nodes · 192 edges · 56 communities (39 shown, 17 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
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
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]

## God Nodes (most connected - your core abstractions)
1. `getPayloadClient()` - 13 edges
2. `SectionHeading()` - 11 edges
3. `Badge()` - 10 edges
4. `Button()` - 10 edges
5. `About Page` - 7 edges
6. `UI/UX Improvements Design Spec (2026-04-13)` - 6 edges
7. `Blog Page Desktop Screenshot` - 5 edges
8. `Resume Page` - 5 edges
9. `Resume Mobile Screenshot` - 5 edges
10. `TiltCard()` - 4 edges

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
- **Wave 1 UI Enhancement Components** — concept_animated_counter, concept_scroll_progress, concept_custom_cursor, concept_particle_network, concept_tilt_card [EXTRACTED 1.00]
- **Theme Toggle System** — concept_css_variable_theming, concept_fouc_prevention, plan_theme_toggle, spec_theme_toggle_design [EXTRACTED 1.00]
- **Portfolio Core Architecture** — concept_payload_cms, concept_nextjs_app_router, concept_supabase_postgres [EXTRACTED 1.00]

## Communities (56 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (6): Certifications(), LatestPosts(), Badge(), Button(), SectionHeading(), TiltCard()

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (16): About Page Desktop Screenshot, About Me Section, About Page Mobile Screenshot, About Page, Academic Background Section, CodeChef Rating 1741, Codeforces Rating 1558, CP Showcase Section (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (8): BlogPage(), HomePage(), InlineChatPrompt(), NotificationBanner(), getPayloadClient(), ProjectsPage(), BlogPostPage(), ProjectDetailPage()

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (5): ClientShell(), ThemeProvider(), CustomCursor(), PageTransition(), ScrollProgress()

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (11): Contact Page Desktop Screenshot, Contact Form, Contact Page, Download PDF Button, Resume Page Desktop Screenshot, Resume Education Section, Resume Experience Section, Resume Page (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (7): Blog Post Card Component, Blog Page Desktop Screenshot, Blog Page, Chat Widget (floating button), Posts CMS Collection, Search Bar Component, Tag Filter Component

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (7): Featured Project Badge, Natural Language to SQL Project Card (Featured), Production RAG Pipeline Project Card (Featured), Traffic Signal Detection YOLOv8 Project Card (Featured), Projects Page Desktop Screenshot, All Projects Page, Technology Tag System

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (7): AnimatedCounter Component Concept, CustomCursor Component Concept, ParticleNetwork Background Concept, ScrollProgress Indicator Concept, TiltCard 3D Effect Concept, UI/UX Improvements Implementation Plan (2026-04-13), UI/UX Improvements Design Spec (2026-04-13)

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (6): Featured Work Section, Frontend Home Page, Habibur Rahman Personal Brand, Hero Section, Home Page Desktop Screenshot, Testimonials Section

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (6): Traffic Signal Detection YOLOv8 Project, Natural Language to SQL Project, Production RAG Pipeline Project, Project Card Component, Projects Page Mobile Screenshot, Projects Search and Filter UI

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (6): CodeChef Profile (3741), Codeforces Profile (1554 rating), LeetCode Profile (3882 problems), Resume Mobile Layout, Resume Mobile Screenshot, Resume Social Links (GitHub, LinkedIn, Email)

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (6): CLAUDE.md Project Instructions, Next.js App Router Architecture, Payload CMS Integration, RAG Chatbot AI System, Supabase PostgreSQL Database, habib36.dev Product Requirements Document

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (5): Blog Post Card Component, Blog Category Filter Tabs, Dark Mode Theme, Blog Page Mobile Screenshot, Blog Search Bar

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (5): Availability Badge (Available for new projects), Contact Page Mobile Screenshot, GitHub Profile Link (habib36), LinkedIn Profile Link, Social Links Section (Find Me Online)

### Community 16 - "Community 16"
Cohesion: 0.83
Nodes (3): capture(), main(), waitForServer()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (4): Home Page Mobile Screenshot, Mobile Responsive Layout Design, Portfolio Project Cards, Stats Counters (3000+ commits, 15+ projects, 10+ clients)

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (4): CSS Variable Theming (Dark/Light Mode), FOUC Prevention Strategy, Theme Toggle Implementation Plan (2026-04-28), Theme Toggle Design Spec (2026-04-28)

## Knowledge Gaps
- **70 isolated node(s):** `About Page Desktop Screenshot`, `About Me Section`, `Verified Learning / Certifications Section`, `Navbar Component`, `Footer Component` (+65 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.
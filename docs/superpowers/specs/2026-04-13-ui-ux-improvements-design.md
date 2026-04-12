# UI/UX Improvements — Design Spec

**Date:** 2026-04-13
**Status:** Approved
**Target audience:** Recruiters & hiring managers, freelance clients / startup founders

## Overview

Enhance habib36.dev with 10 features across 3 implementation waves. The animation personality is **Hybrid B+C**: buttery smooth micro-interactions as the foundation, with selective terminal/hacker touches where they reinforce the brand.

---

## Wave 1 — Foundation Layer

These affect every page and establish the site-wide interaction language.

### 1. Smooth Page Transitions

- Wrap page content in Framer Motion `AnimatePresence`
- Enter: opacity 0→1, y 8→0, duration 300ms, ease-out
- Exit: opacity 1→0, y 0→-8, duration 150ms
- Navbar and footer stay fixed — only `<main>` content transitions
- Implementation: New `<PageTransition>` component wrapping children in `client-shell.tsx`

### 2. Advanced Scroll Animations

- Replace current `whileInView` fade-ups with spring-based reveals (stiffness: 100, damping: 15)
- **Animated counters:** Stats bar numbers count up from 0 when scrolled into view using requestAnimationFrame + easing
- **Scroll progress bar:** 2px tall accent-blue bar fixed at very top of viewport (above navbar, z-60), width tracks scroll percentage
- **Staggered grid reveals:** Cards in all grids get 50ms stagger delay between siblings
- Implementation: New `<AnimatedCounter>` component, `<ScrollProgress>` component, update `staggerChildren` in grid sections

### 3. Magnetic Hover Cards + Tilt Effect

- New `<TiltCard>` wrapper component
- Tracks `onMouseMove` position relative to card center
- Applies CSS `transform: perspective(800px) rotateX(Xdeg) rotateY(Ydeg)` (max ±6deg)
- Radial gradient spotlight follows cursor position within the card
- On `onMouseLeave`: spring back to `rotateX(0) rotateY(0)` with transition 0.4s ease-out
- Desktop only — use `(hover: hover)` media query, mobile gets standard card-glow hover
- Apply to: project cards, blog cards, featured project cards, certification cards

### 4. Custom Cursor + Trail

- Global component rendered in `ClientShell`
- **Inner dot:** 8px circle, accent-blue, follows mouse instantly
- **Outer ring:** 32px circle, accent-blue/30 border, follows with spring delay (~80ms lag)
- **Hover states:** Both scale up 1.5x over interactive elements (links, buttons, cards)
- **Section color shifts:** accent-green over hero, accent-purple over CP showcase (detect via intersection observer on section refs)
- **Touch devices:** Hidden entirely via `(pointer: fine)` media query
- Implementation: New `<CustomCursor>` component in `components/ui/`, added to `ClientShell`

---

## Wave 2 — Hero & Homepage

Showpiece components that make the first 10 seconds unforgettable.

### 5. Hero Section Upgrade

- **Particle constellation (canvas):**
  - ~60 particles drifting at random slow velocities
  - Lines drawn between particles within 120px proximity, opacity fading with distance
  - Canvas fills hero section, sits behind content (z-0)
  - Use `requestAnimationFrame` loop, pause when tab not visible
  - Particle color: accent-blue at 0.3 opacity, lines at 0.1 opacity
  - New `<ParticleNetwork>` component in `components/home/`

- **Staggered name reveal:**
  - Each letter of "Habibur" and "Rahman" wrapped in individual `motion.span`
  - Fade+slide-up per letter, 30ms stagger delay
  - Total reveal time: ~600ms for full name

- **Floating tech icons:**
  - 6 small SVG/icon elements: React, Python, Weaviate, Docker, TypeScript, Node.js
  - Positioned absolutely around hero area with unique CSS `@keyframe` float paths
  - Opacity 0.12, size 24-32px, slow 8-15s animation cycles
  - New `<FloatingIcons>` component

- **Entrance choreography (precise timing):**
  - 0.0s: Particle canvas fades in
  - 0.2s: Achievement banner slides down
  - 0.5s: Name letter cascade begins
  - 1.1s: Typing effect starts
  - 1.4s: Tagline fades up
  - 1.7s: CTA buttons fade up
  - 2.2s: Scroll indicator appears

### 6. Proof of Work Section (NEW)

- Position: Homepage, between Featured Projects and Inline Chat Prompt
- Heading: `// Proof of Work` → "Don't Take My Word For It"

- **Three cards in a row (responsive: stack on mobile):**

  1. **Architecture Card:**
     - Title: "System Design"
     - Embedded SVG of RAG pipeline diagram
     - Lines animate with CSS `stroke-dashoffset` draw-in effect on scroll
     - Subtitle: "Production RAG Pipeline Architecture"

  2. **Code Card:**
     - Title: "Real Code"
     - Code snippet (RAG pipeline query, ~10 lines) that types itself out character by character when scrolled into view
     - Syntax coloring: keywords in accent-blue, strings in accent-green, comments in text-muted
     - Typing speed: 20ms per character
     - New `<TypewriterCode>` component

  3. **Metrics Card:**
     - Title: "Measured Results"
     - Three big stats that count up: `mAP@50: 0.936`, `<200ms latency`, `95% accuracy`
     - Uses `<AnimatedCounter>` from Wave 1
     - Each metric has a small label below it

### 7. Terminal Preloader

- Full-screen overlay (bg-primary, z-[9999])
- Shows on first visit only — `sessionStorage.getItem('preloaded')` check
- Terminal text sequence with 300ms delay between lines:
  ```
  > Initializing habib36.dev...
  > Loading modules... [animated progress bar]
  > Compiling portfolio... done
  > System ready.
  ```
- Progress bar animates from 0% to 100% over 800ms
- After sequence completes, overlay slides up (translateY -100%) over 500ms
- Clicking anywhere triggers immediate dismiss
- Total duration: ~1.5s
- New `<Preloader>` component in `components/layout/`, rendered in `ClientShell`

### 8. Certifications Section (NEW)

- **Data:** Add `certifications` array to `lib/data.ts` with fields:
  - `title`: course name (e.g., "Meta Full-Stack Engineer Professional Certificate")
  - `issuer`: who issued it (e.g., "Meta")
  - `platform`: where taken (e.g., "Coursera")
  - `date`: completion date
  - `url`: verification link
  - `icon`: platform identifier for styling

- **Homepage (compact):**
  - Positioned after About Snippet section
  - Horizontal scrollable row of certification cards (or 3-column grid on desktop)
  - Each card: platform icon, title, issuer, date, small "Verify →" link
  - Section heading: `// Certifications` → "Verified Learning"

- **About page (full):**
  - After Education section
  - Full card grid layout with TiltCard wrapping
  - Same card content but larger, with description field

---

## Wave 3 — Deep Page Polish

For clients who dig deeper into resume and about pages.

### 9. Interactive Experience Timeline

- **Animated SVG line:** Vertical line draws itself (stroke-dashoffset animation) as user scrolls through the timeline section
- **Expandable cards:** Each role starts collapsed (role, company, dates visible). Click/tap to expand and reveal full description + tech stack pills
- **Active state:** The role currently in viewport gets a pulsing glow dot on the timeline connector
- **Tech pill animation:** When a card expands, tech stack badges stagger in (30ms delay each, scale 0→1 with spring)
- Apply to: Resume page timeline, About page (if experience is shown there)
- Implementation: New `<InteractiveTimeline>` and `<TimelineCard>` components in `components/resume/`

### 10. Interactive Skill Visualization

- **Proficiency bars (default view):**
  - Each skill gets a horizontal bar that fills from left when scrolled into view
  - Bar style: terminal-aesthetic, monospace label on left, percentage on right
  - Fill animation: 800ms ease-out per bar, staggered 50ms within category
  - Example: `TypeScript  ████████░░  90%`

- **Hover interaction:**
  - Hovering a skill bar shows which projects used that skill
  - Small dot indicators or a tooltip listing related project names
  - Data: Add `relatedProjects` array to each skill in data.ts (references project slugs)

- **Data changes:** Update skills in `lib/data.ts` to include `proficiency: number` (1-100) per item, and `relatedProjects: string[]` per item

- Apply to: About page skills section
- Implementation: New `<SkillBar>` and `<SkillVisualization>` components in `components/ui/`

---

## New Files Summary

| File | Type | Wave |
|------|------|------|
| `components/ui/page-transition.tsx` | Component | 1 |
| `components/ui/animated-counter.tsx` | Component | 1 |
| `components/ui/scroll-progress.tsx` | Component | 1 |
| `components/ui/tilt-card.tsx` | Component | 1 |
| `components/ui/custom-cursor.tsx` | Component | 1 |
| `components/home/particle-network.tsx` | Component | 2 |
| `components/home/floating-icons.tsx` | Component | 2 |
| `components/home/proof-of-work.tsx` | Component | 2 |
| `components/home/typewriter-code.tsx` | Component | 2 |
| `components/home/certifications.tsx` | Component | 2 |
| `components/layout/preloader.tsx` | Component | 2 |
| `components/resume/interactive-timeline.tsx` | Component | 3 |
| `components/ui/skill-bar.tsx` | Component | 3 |

## Modified Files Summary

| File | Changes | Wave |
|------|---------|------|
| `lib/data.ts` | Add certifications array, add proficiency + relatedProjects to skills | 2, 3 |
| `components/layout/client-shell.tsx` | Add CustomCursor, ScrollProgress, Preloader, PageTransition | 1, 2 |
| `components/home/hero-section.tsx` | Particle canvas, staggered name, floating icons, choreography | 2 |
| `components/home/stats-bar.tsx` | Replace static values with AnimatedCounter | 1 |
| `components/home/featured-projects.tsx` | Wrap cards in TiltCard | 1 |
| `components/home/latest-posts.tsx` | Wrap cards in TiltCard | 1 |
| `app/page.tsx` | Add ProofOfWork and Certifications sections | 2 |
| `app/about/page.tsx` | Certifications section, SkillVisualization, InteractiveTimeline | 2, 3 |
| `app/resume/page.tsx` | InteractiveTimeline | 3 |
| `app/globals.css` | Custom cursor hide rule, progress bar styles | 1 |

## Performance Guardrails

- Particle canvas: pause `requestAnimationFrame` when tab is not visible (`document.hidden`)
- TiltCard: desktop only via `(hover: hover)` media query
- Custom cursor: desktop only via `(pointer: fine)` media query
- Preloader: first visit only (sessionStorage)
- All scroll animations: `viewport: { once: true }` — animate once, don't re-trigger
- Typewriter code: only runs when scrolled into view (intersection observer)

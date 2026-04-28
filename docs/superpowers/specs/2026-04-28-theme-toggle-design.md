# Theme Toggle (Light / Dark) — Design

**Date:** 2026-04-28
**Status:** Approved, ready for implementation plan
**Owner:** habib36

## Goal

Add a true light theme to habib36.dev alongside the existing dark theme, plus a button in the navbar that toggles between them. Respect the user's OS preference on first visit; persist their explicit choice afterward. Preserve the site's "cyber/terminal" identity in both themes.

## Decisions

- **Theme intent:** True light mode (paper-like surface), not a softened dark variant.
- **Toggle states:** Two states (light ↔ dark). First-visit default follows `prefers-color-scheme`; subsequent visits use the user's stored choice. No explicit "system" option in the UI.
- **Button placement:** In the navbar, on desktop and mobile drawer.
- **Mechanism:** `next-themes` library, configured with `attribute="data-theme"` and `defaultTheme="system"`.

## Approach: `next-themes`

Adds one dependency (~3 KB). It provides:
- A pre-hydration inline script that reads `localStorage` (or `prefers-color-scheme`) and sets `data-theme` on `<html>` before first paint — eliminates FOUC.
- A `useTheme()` hook for the toggle button.
- Cross-tab sync via the `storage` event.
- `disableTransitionOnChange` prop to suppress the 300 ms color transitions during the swap.

Alternatives considered: hand-rolled `ThemeProvider` (rejected — easy to get FOUC wrong, ~100 lines of fragile code) and pure-CSS + tiny script (rejected — awkward to drive a React button from DOM state).

## Architecture

CSS variables already drive every color in the codebase (Tailwind v4 tokens like `bg-bg-primary` resolve to `var(--bg-primary)`). Theme switching is therefore **pure CSS variable swapping** — no component refactor.

Three layers:

1. **CSS** (`globals.css`): keep the current dark values in `:root` as the default. Add a `[data-theme="light"]` block that overrides only the changed tokens, plus effect-level rules for elements that need re-tuning beyond color (scanline, glows).
2. **Provider** (`theme-provider.tsx`, new): a thin client wrapper around `next-themes`'s provider, configured once and used by the frontend layout.
3. **Toggle button** (`theme-toggle.tsx`, new): a client component that calls `useTheme()` and flips between `light` and `dark`. Mounted-guard placeholder prevents hydration mismatch.

## Light theme palette

| Token | Dark (current) | Light (new) |
|---|---|---|
| `--bg-primary` | `#0a0e14` | `#f6f8fb` |
| `--bg-secondary` | `#111820` | `#ffffff` |
| `--bg-tertiary` | `#1a2130` | `#eef2f7` |
| `--bg-elevated` | `#0d1219` | `#fbfcfe` |
| `--text-primary` | `#e2e8f0` | `#0d1622` |
| `--text-secondary` | `#7a8ba3` | `#475569` |
| `--text-muted` | `#4a5568` | `#94a3b8` |
| `--accent-blue` | `#00d4ff` | `#0284a8` |
| `--accent-blue-dim` | `#0090b0` | `#075985` |
| `--accent-green` | `#00ff88` | `#059669` |
| `--accent-green-dim` | `#00b060` | `#047857` |
| `--accent-orange` | `#ff6b35` | `#ea580c` |
| `--accent-purple` | `#a78bfa` | `#7c3aed` |
| `--border-primary` | `#1e2a3a` | `#e2e8f0` |
| `--border-hover` | `#2a3a50` | `#cbd5e1` |
| `--noise-opacity` | `0.03` | `0.02` |

Glow tokens for light mode (lower alpha, since neon-bright glows smear on white surfaces):

```css
--accent-blue-glow: rgba(2, 132, 168, 0.12);
--accent-blue-glow-strong: rgba(2, 132, 168, 0.22);
--accent-green-glow: rgba(5, 150, 105, 0.10);
--accent-orange-glow: rgba(234, 88, 12, 0.12);
--accent-purple-glow: rgba(124, 58, 237, 0.10);
--border-accent: rgba(2, 132, 168, 0.3);
```

Rationale: pure cyan/green neons are illegible on a near-white background. Both accents are darkened to a cool, deep variant that keeps the cyber identity while passing legibility (WCAG AA against `#f6f8fb`).

## Effect adjustments in light mode

- **Scanline overlay** — hidden (`display: none` on `.scanline-overlay::after`). Scanlines on white look like print artifacts.
- **Text glows** (`.text-glow-blue`, `.text-glow-green`) — text-shadow alpha reduced ~50%.
- **Card hover glow** — uses `--accent-blue-glow`, automatically softer once that token is overridden.
- **Noise overlay** (`body::before`) — uses `var(--noise-opacity)`, automatically softer.
- **Grid pattern bg** — uses `var(--border-primary)`, automatically flips.

## Toggle button

**File:** `src/components/layout/theme-toggle.tsx` (new, client component).

**Behavior:**
- Reads `theme` and `resolvedTheme` from `useTheme()`. Click flips `light ↔ dark`.
- `mounted` guard (set in `useEffect`) prevents hydration mismatch — until mounted, render a same-sized empty placeholder.
- Icon: Lucide `Sun` when current resolved theme is dark (next click → light), `Moon` when light (next click → dark).
- Icon swap animated via Framer Motion: 180° rotate, 200 ms.

**Styling** (matches the existing chat icon button exactly):
```
p-2 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 rounded-md transition-all
```

**Accessibility:**
- `aria-label="Switch to {next-theme} mode"` (dynamic).
- `title` attribute mirrors `aria-label`.
- Inherits global `:focus-visible` styles.

## Placement (in `navbar.tsx`)

- **Desktop:** between nav links and chat icon. Order: nav-links · `<ThemeToggle />` · chat icon.
- **Mobile drawer:** appended after the "AI Chat" entry as a full-width row, matching the `> AI Chat` styling. Tapping closes the drawer.

## FOUC prevention

1. **Inline script** — provided by `next-themes`'s `<ThemeProvider>`; runs synchronously before hydration; sets `data-theme` on `<html>` from `localStorage` or `prefers-color-scheme`. Requires `suppressHydrationWarning` on `<html>`.
2. **`disableTransitionOnChange`** — enabled in the provider config. Briefly disables CSS transitions during a theme swap so colors don't animate over 300 ms.
3. **`mounted` guard on toggle** — renders a placeholder pre-hydration so the icon never flashes the wrong glyph.

## Persistence semantics

- First visit: `prefers-color-scheme` (system) determines initial theme.
- After first toggle click: choice persists in `localStorage` under the key `theme` (next-themes default).
- Cross-tab sync: handled automatically by next-themes via the `storage` event.

## Custom cursor

`src/components/ui/custom-cursor.tsx` will be inspected during implementation. If it hardcodes the cyan accent, switch it to `getComputedStyle(document.documentElement).getPropertyValue('--accent-blue')` so it auto-flips. If it already uses the CSS variable, no change.

## Files changed / created

| File | Change |
|---|---|
| `package.json` | Add `next-themes` dependency |
| `src/app/(frontend)/globals.css` | Add `[data-theme="light"]` overrides + effect rules |
| `src/components/theme/theme-provider.tsx` | New — `next-themes` wrapper |
| `src/components/layout/theme-toggle.tsx` | New — button component |
| `src/app/(frontend)/layout.tsx` | Wrap children in `<ThemeProvider>`; add `suppressHydrationWarning` to `<html>` |
| `src/components/layout/navbar.tsx` | Insert `<ThemeToggle />` desktop + mobile drawer |
| `src/components/ui/custom-cursor.tsx` | Conditional — only if hardcoded colors |

## Out of scope

- Theme switcher inside the Payload admin (`(payload)` route group). Admin keeps its own theme.
- Theme switcher on settings pages (no settings page exists).
- Per-page theme overrides.
- Honoring `prefers-reduced-motion` for the icon-swap rotation (200 ms is innocuous).
- A "system" option in the toggle UI (the system preference still drives first-visit default; we just don't expose a third button state).

## Success criteria

- Toggle button visible in navbar (desktop) and mobile drawer.
- Clicking flips between light and dark themes with no visible flash or color animation across the page.
- First-visit theme matches OS `prefers-color-scheme`.
- Refresh preserves the user's last explicit choice.
- No hydration warnings in the console.
- All existing pages (home, about, projects, blog, resume, contact) render legibly in both themes.
- Cursor remains visible against both backgrounds.

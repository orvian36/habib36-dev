# Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a true light theme alongside the existing dark theme on habib36.dev, with a navbar toggle button. First-visit theme follows OS preference; user choice persists in localStorage.

**Architecture:** Use the `next-themes` library to manage a `data-theme` attribute on `<html>`. The codebase already drives every color through CSS variables (Tailwind v4 tokens like `bg-bg-primary` resolve to `var(--bg-primary)`), so theme switching is pure CSS variable swapping — no per-component refactor. Pre-hydration inline script (provided by next-themes) prevents FOUC.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, next-themes ^0.4, Framer Motion, Lucide React.

**Verification approach:** This codebase has no test runner configured. Verification is browser-based using `pnpm dev` and DevTools. Each task ends with a manual check + commit. Spec: `docs/superpowers/specs/2026-04-28-theme-toggle-design.md`.

---

## Task 1: Install `next-themes`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package with pnpm**

Run:
```
pnpm add next-themes
```

Expected: package.json gains a `next-themes` dependency at version `^0.4.x`. pnpm-lock.yaml is updated.

- [ ] **Step 2: Verify install**

Run:
```
pnpm list next-themes
```

Expected output includes a line like `next-themes 0.4.x`.

- [ ] **Step 3: Commit**

```
git add package.json pnpm-lock.yaml
git commit -m "chore: add next-themes dependency for theme toggle"
```

---

## Task 2: Add light-theme CSS variables and effect overrides

**Files:**
- Modify: `src/app/(frontend)/globals.css`

- [ ] **Step 1: Add the `[data-theme="light"]` block**

Open `src/app/(frontend)/globals.css`. After the closing `}` of the existing `:root { ... }` block (currently ends around line 52, just before `@theme inline {`), insert this new block:

```css
[data-theme="light"] {
  /* Background tones */
  --bg-primary: #f6f8fb;
  --bg-secondary: #ffffff;
  --bg-tertiary: #eef2f7;
  --bg-elevated: #fbfcfe;

  /* Text */
  --text-primary: #0d1622;
  --text-secondary: #475569;
  --text-muted: #94a3b8;

  /* Accent - cyber blue (dimmed for legibility on white) */
  --accent-blue: #0284a8;
  --accent-blue-dim: #075985;
  --accent-blue-glow: rgba(2, 132, 168, 0.12);
  --accent-blue-glow-strong: rgba(2, 132, 168, 0.22);

  /* Accent - matrix green (deep emerald for legibility) */
  --accent-green: #059669;
  --accent-green-dim: #047857;
  --accent-green-glow: rgba(5, 150, 105, 0.10);

  /* Accent - warning/hot */
  --accent-orange: #ea580c;
  --accent-orange-glow: rgba(234, 88, 12, 0.12);

  /* Accent - purple */
  --accent-purple: #7c3aed;
  --accent-purple-glow: rgba(124, 58, 237, 0.10);

  /* Borders */
  --border-primary: #e2e8f0;
  --border-hover: #cbd5e1;
  --border-accent: rgba(2, 132, 168, 0.3);

  /* Misc */
  --gradient-shine: linear-gradient(
    135deg,
    rgba(2, 132, 168, 0.06) 0%,
    transparent 50%,
    rgba(5, 150, 105, 0.04) 100%
  );
  --noise-opacity: 0.02;
}
```

- [ ] **Step 2: Add light-mode effect overrides at the end of the file**

Append to the bottom of `globals.css`:

```css
/* ========================================
   Light theme — effect overrides
   ======================================== */

/* Hide scanline overlay on light surfaces */
[data-theme="light"] .scanline-overlay::after {
  display: none;
}

/* Soften text glows on light surfaces */
[data-theme="light"] .text-glow-blue {
  text-shadow:
    0 0 12px rgba(2, 132, 168, 0.25),
    0 0 24px rgba(2, 132, 168, 0.08);
}

[data-theme="light"] .text-glow-green {
  text-shadow:
    0 0 12px rgba(5, 150, 105, 0.20),
    0 0 24px rgba(5, 150, 105, 0.06);
}
```

- [ ] **Step 3: Verify CSS is syntactically valid**

Run:
```
pnpm lint
```

Expected: No errors. (ESLint won't lint CSS, but it should not regress the project.)

Then start the dev server briefly:
```
pnpm dev
```

Visit `http://localhost:3000`. Page should still render in dark theme exactly as before (we haven't added the toggle yet — `data-theme` is unset, so `:root` defaults apply). Stop the dev server with Ctrl+C.

- [ ] **Step 4: Commit**

```
git add src/app/(frontend)/globals.css
git commit -m "feat(theme): add light-mode CSS variables and effect overrides"
```

---

## Task 3: Create the `ThemeProvider` wrapper

**Files:**
- Create: `src/components/theme/theme-provider.tsx`

- [ ] **Step 1: Create the directory and file**

Create the new file `src/components/theme/theme-provider.tsx` with this exact content:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run:
```
pnpm lint
```

Expected: No errors. If `ThemeProviderProps` import fails (older next-themes versions), replace the import with `import type { ComponentProps } from "react";` and use `ComponentProps<typeof NextThemesProvider>` instead.

- [ ] **Step 3: Commit**

```
git add src/components/theme/theme-provider.tsx
git commit -m "feat(theme): add ThemeProvider wrapper around next-themes"
```

---

## Task 4: Wire `ThemeProvider` into the frontend layout

**Files:**
- Modify: `src/app/(frontend)/layout.tsx`

- [ ] **Step 1: Import `ThemeProvider`**

In `src/app/(frontend)/layout.tsx`, add this import alongside the existing imports near the top of the file:

```tsx
import { ThemeProvider } from "@/components/theme/theme-provider";
```

- [ ] **Step 2: Add `suppressHydrationWarning` to `<html>` and wrap children in `<ThemeProvider>`**

Replace the existing `return ( ... )` block in `FrontendLayout` with:

```tsx
return (
  <html
    lang="en"
    className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    suppressHydrationWarning
  >
    <body className="min-h-screen flex flex-col">
      <ThemeProvider>
        <NotificationBanner />
        <ClientShell>{children}</ClientShell>
      </ThemeProvider>
    </body>
  </html>
);
```

(Two changes: `suppressHydrationWarning` added to `<html>`; `<ThemeProvider>` wraps the body content.)

- [ ] **Step 3: Verify in the browser**

Run:
```
pnpm dev
```

Visit `http://localhost:3000`.

Verify in DevTools:
1. `<html>` element now has a `data-theme` attribute (value will be `dark` or `light` depending on your OS preference).
2. No hydration warnings in the browser console.
3. Page still renders correctly.

In DevTools console, run:
```
document.documentElement.setAttribute('data-theme', 'light')
```
Page should flip to light theme. Backgrounds white-ish, text dark, accents deep cyan instead of neon. Run again with `'dark'` and confirm it flips back.

Stop the dev server with Ctrl+C.

- [ ] **Step 4: Commit**

```
git add src/app/(frontend)/layout.tsx
git commit -m "feat(theme): wire ThemeProvider into frontend layout"
```

---

## Task 5: Create the `ThemeToggle` button component

**Files:**
- Create: `src/components/layout/theme-toggle.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/layout/theme-toggle.tsx` with this exact content:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={`inline-block w-8 h-8 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`p-2 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 rounded-md transition-all ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```

Notes:
- The mounted-guard placeholder is `w-8 h-8` to match the rendered button's size (`p-2` = 8px padding + `w-4 h-4` icon = 32px).
- `resolvedTheme` is used (not `theme`) so the icon is correct even when `theme === "system"`.
- The component accepts a `className` prop so it can be styled as a full-width row in the mobile drawer.

- [ ] **Step 2: Verify it type-checks**

Run:
```
pnpm lint
```

Expected: No errors.

- [ ] **Step 3: Commit**

```
git add src/components/layout/theme-toggle.tsx
git commit -m "feat(theme): add ThemeToggle button component"
```

---

## Task 6: Insert `ThemeToggle` into the desktop navbar

**Files:**
- Modify: `src/components/layout/navbar.tsx`

- [ ] **Step 1: Import the component**

At the top of `src/components/layout/navbar.tsx`, add this import after the other component imports (after the `lucide-react` import line):

```tsx
import { ThemeToggle } from "./theme-toggle";
```

- [ ] **Step 2: Insert the toggle in the desktop nav**

Find this block in the desktop nav section (currently around lines 74–82):

```tsx
          {onChatToggle && (
            <button
              onClick={onChatToggle}
              className="ml-2 p-2 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 rounded-md transition-all"
              aria-label="Toggle AI chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
```

Insert `<ThemeToggle />` immediately *before* it, with a left margin to match the existing chat-button spacing:

```tsx
          <ThemeToggle className="ml-2" />
          {onChatToggle && (
            <button
              onClick={onChatToggle}
              className="ml-1 p-2 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 rounded-md transition-all"
              aria-label="Toggle AI chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
```

(Note: change the chat button's class from `ml-2` to `ml-1` so the two icon buttons sit close together as a group.)

- [ ] **Step 3: Verify in the browser**

Run:
```
pnpm dev
```

Visit `http://localhost:3000` on a desktop-width browser window (≥768px wide).

Verify:
1. The toggle button appears in the navbar between the nav links and the chat icon.
2. Hovering shows a tooltip "Switch to light mode" (assuming current theme is dark).
3. Clicking flips the theme. Backgrounds change. The icon swaps with a small rotation animation.
4. Refresh the page — your last-clicked theme persists.
5. Open DevTools → Application → Local Storage → confirm a `theme` key exists with value `light` or `dark`.

Stop the dev server.

- [ ] **Step 4: Commit**

```
git add src/components/layout/navbar.tsx
git commit -m "feat(theme): add theme toggle to desktop navbar"
```

---

## Task 7: Insert `ThemeToggle` into the mobile drawer

**Files:**
- Modify: `src/components/layout/navbar.tsx`

- [ ] **Step 1: Add a full-width toggle row to the mobile drawer**

In the mobile drawer block (currently around lines 105–137), find the closing `</div>` of the drawer's inner `<div className="px-4 py-4 space-y-1">` block. Just before that closing `</div>`, after the `{onChatToggle && (...)}` block, add:

```tsx
              <div className="flex items-center justify-between px-4 py-3 font-mono text-sm rounded-lg text-text-secondary">
                <span>
                  <span className="text-text-muted mr-2">{">"}</span>
                  Theme
                </span>
                <ThemeToggle />
              </div>
```

The full updated drawer inner block should look like this (for clarity — replacing the existing `<div className="px-4 py-4 space-y-1">...</div>`):

```tsx
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 font-mono text-sm rounded-lg transition-colors ${
                      isActive
                        ? "text-accent-blue bg-accent-blue/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                    }`}
                  >
                    <span className="text-text-muted mr-2">{">"}</span>
                    {link.label}
                  </Link>
                );
              })}
              {onChatToggle && (
                <button
                  onClick={() => {
                    onChatToggle();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 font-mono text-sm rounded-lg text-accent-blue hover:bg-accent-blue/10 transition-colors"
                >
                  <span className="text-text-muted mr-2">{">"}</span>
                  AI Chat
                </button>
              )}
              <div className="flex items-center justify-between px-4 py-3 font-mono text-sm rounded-lg text-text-secondary">
                <span>
                  <span className="text-text-muted mr-2">{">"}</span>
                  Theme
                </span>
                <ThemeToggle />
              </div>
            </div>
```

- [ ] **Step 2: Verify in the browser**

Run:
```
pnpm dev
```

Open `http://localhost:3000` and resize the browser to a narrow mobile width (<768px), or use DevTools' device toolbar.

Verify:
1. Click the hamburger menu — drawer opens.
2. A "> Theme" row appears at the bottom of the drawer with the toggle icon on the right.
3. Tapping the toggle icon flips the theme. The drawer remains open (no need to close — user may want to verify their choice).
4. Closing the drawer and re-opening it shows the toggle still works.

Stop the dev server.

- [ ] **Step 3: Commit**

```
git add src/components/layout/navbar.tsx
git commit -m "feat(theme): add theme toggle to mobile drawer"
```

---

## Task 8: End-to-end verification

**Files:** None modified. This task is a final verification pass against the spec's success criteria.

- [ ] **Step 1: Cold-load behavior**

Clear localStorage:
1. Open DevTools → Application → Local Storage → right-click `http://localhost:3000` → Clear.
2. In DevTools → Rendering, set "Emulate CSS media feature prefers-color-scheme" to `light`.
3. Hard-refresh (Ctrl+Shift+R).
4. Verify the site loads in light theme **with no visible flash** of dark before light renders.
5. Switch the emulation to `dark`, clear storage again, hard-refresh. Site should load in dark theme with no flash.

- [ ] **Step 2: Persistence and cross-tab sync**

1. Set theme to light via the toggle.
2. Open the same URL in a second tab.
3. Toggle to dark in the second tab.
4. Switch back to the first tab — it should also be dark (next-themes syncs via the `storage` event).

- [ ] **Step 3: Page-by-page legibility check**

In light mode, visit each page and confirm text is legible, accents are visible, and no element renders as "white on white" or "neon on white":

- `/` (home)
- `/about`
- `/projects`
- `/blog`
- `/resume`
- `/contact`

Repeat in dark mode to confirm nothing regressed.

- [ ] **Step 4: Cursor visibility**

On desktop, hover the custom cursor over both backgrounds in light mode. The cursor uses `bg-accent-blue` which resolves to the dimmed `#0284a8` in light mode — should be visible against the light surface. If it disappears against any element, file a follow-up.

- [ ] **Step 5: Build passes**

Run:
```
pnpm build
```

Expected: build completes with no errors. No new warnings about hydration mismatches.

- [ ] **Step 6: Lint passes**

Run:
```
pnpm lint
```

Expected: no new errors.

- [ ] **Step 7: Final commit (if any cleanup needed)**

If verification surfaced any small fixes (e.g., a contrast tweak), apply them and commit:
```
git add -A
git commit -m "fix(theme): <describe the fix>"
```

If no fixes were needed, this step is a no-op.

---

## Self-Review Notes

**Spec coverage:**
- Light palette → Task 2.
- Effect overrides (scanline, glows, noise) → Task 2 (plus auto-flip via existing CSS variables).
- `next-themes` install → Task 1.
- `ThemeProvider` wrapper → Task 3.
- Layout integration + `suppressHydrationWarning` → Task 4.
- Toggle button (icon, animation, mounted guard, accessibility) → Task 5.
- Desktop navbar placement → Task 6.
- Mobile drawer placement → Task 7.
- FOUC behavior, persistence, cross-tab sync, success criteria → Task 8.
- Custom cursor: confirmed during planning that it already uses CSS-variable-backed Tailwind classes (`bg-accent-blue`), so it auto-flips. No code task needed; verified visually in Task 8 Step 4.

**Out-of-scope items confirmed not in plan:** Payload admin theming, settings-page switcher, per-page overrides, `prefers-reduced-motion` handling, system-state in toggle UI.

**No placeholders.** Every code step contains the full code to be written. Every command has expected output.

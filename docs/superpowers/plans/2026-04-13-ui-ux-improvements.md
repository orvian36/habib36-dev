# UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 UI/UX enhancements across 3 waves to make habib36.dev unforgettable for recruiters and clients.

**Architecture:** Foundation layer (page transitions, scroll animations, tilt cards, custom cursor) establishes site-wide interaction language. Wave 2 builds showpiece homepage components (hero upgrade, proof of work, preloader, certifications). Wave 3 polishes deep pages (interactive timeline, skill visualization). Each wave is independently testable.

**Tech Stack:** Next.js 16, React 19, Framer Motion, Tailwind CSS v4, Lucide React, Canvas API (particles)

---

## Wave 1 — Foundation Layer

### Task 1: Animated Counter Component

**Files:**
- Create: `src/components/ui/animated-counter.tsx`

- [ ] **Step 1: Create the AnimatedCounter component**

```tsx
// src/components/ui/animated-counter.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2000,
  className = "",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    }

    requestAnimationFrame(animate);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
```

- [ ] **Step 2: Verify the component renders**

Run: `cd "C:/Users/Best Laptop Gallery/Desktop/live/habib36-dev" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Integrate into StatsBar**

Replace the static value display in `src/components/home/stats-bar.tsx`. Change the stats data to include numeric values and update the component:

```tsx
// src/components/home/stats-bar.tsx
"use client";

import { motion } from "framer-motion";
import { Code2, Briefcase, Rocket, FileText } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const statsData = [
  { label: "Problems Solved", value: 3000, suffix: "+", icon: Code2 },
  { label: "Years Experience", value: 3, suffix: "+", icon: Briefcase },
  { label: "Projects Shipped", value: 15, suffix: "+", icon: Rocket },
  { label: "Blog Posts", value: 10, suffix: "+", icon: FileText },
];

export function StatsBar() {
  return (
    <section className="relative py-16 border-y border-border-primary bg-bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statsData.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="text-center group"
              >
                <div className="inline-flex p-3 rounded-xl bg-bg-tertiary/50 border border-border-primary group-hover:border-accent-blue/30 group-hover:bg-accent-blue/5 transition-all mb-3">
                  <Icon className="w-5 h-5 text-accent-blue" />
                </div>
                <div className="font-mono text-3xl font-bold text-text-primary text-glow-blue">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2000}
                  />
                </div>
                <div className="text-text-secondary text-sm mt-1">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/animated-counter.tsx src/components/home/stats-bar.tsx
git commit -m "feat: add animated counter component and integrate into stats bar"
```

---

### Task 2: Scroll Progress Bar

**Files:**
- Create: `src/components/ui/scroll-progress.tsx`
- Modify: `src/components/layout/client-shell.tsx`

- [ ] **Step 1: Create ScrollProgress component**

```tsx
// src/components/ui/scroll-progress.tsx
"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0%" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent-blue z-[60]"
    />
  );
}
```

- [ ] **Step 2: Add to ClientShell**

Modify `src/components/layout/client-shell.tsx` — add import and render `<ScrollProgress />` as first child inside the outer div:

```tsx
// src/components/layout/client-shell.tsx
"use client";

import { useState } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="scanline-overlay flex flex-col min-h-screen">
      <ScrollProgress />
      <Navbar onChatToggle={() => setChatOpen((o) => !o)} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen((o) => !o)} />
    </div>
  );
}
```

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/scroll-progress.tsx src/components/layout/client-shell.tsx
git commit -m "feat: add scroll progress bar to top of viewport"
```

---

### Task 3: TiltCard Component

**Files:**
- Create: `src/components/ui/tilt-card.tsx`

- [ ] **Step 1: Create TiltCard component**

```tsx
// src/components/ui/tilt-card.tsx
"use client";

import { useRef, useState, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDeg?: number;
}

export function TiltCard({
  children,
  className = "",
  tiltDeg = 6,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState("");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -tiltDeg;
      const rotateY = ((x - centerX) / centerX) * tiltDeg;

      setTransform(
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      );
      setGlare(
        `radial-gradient(circle at ${x}px ${y}px, rgba(0,212,255,0.08) 0%, transparent 60%)`
      );
    },
    [tiltDeg]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("");
    setGlare("");
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        transform: transform || "perspective(800px) rotateX(0deg) rotateY(0deg)",
        transition: transform ? "none" : "transform 0.4s ease-out",
        willChange: "transform",
      }}
    >
      {/* Spotlight overlay */}
      {glare && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
          style={{ background: glare }}
        />
      )}
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Wrap FeaturedProjects cards with TiltCard**

Modify `src/components/home/featured-projects.tsx` — import `TiltCard` and wrap each card's `motion.div`:

Replace the existing `<motion.div>` wrapper for each project with:

```tsx
// In the map callback, replace the outer motion.div:
<motion.div
  key={project.slug}
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{
    delay: i * 0.1,
    type: "spring",
    stiffness: 100,
    damping: 15,
  }}
>
  <TiltCard>
    <Link
      href={`/projects/${project.slug}`}
      className="card-surface card-glow block p-6 h-full group"
    >
      {/* ... rest of card content unchanged ... */}
    </Link>
  </TiltCard>
</motion.div>
```

Add import at top: `import { TiltCard } from "@/components/ui/tilt-card";`

Also update the `transition` from `{ delay: i * 0.1, duration: 0.5 }` to use spring physics: `{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }`.

- [ ] **Step 4: Wrap LatestPosts cards with TiltCard**

Same pattern in `src/components/home/latest-posts.tsx` — import `TiltCard`, wrap each card, update transition to spring.

- [ ] **Step 5: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/tilt-card.tsx src/components/home/featured-projects.tsx src/components/home/latest-posts.tsx
git commit -m "feat: add magnetic tilt card effect to project and blog cards"
```

---

### Task 4: Page Transitions

**Files:**
- Create: `src/components/ui/page-transition.tsx`
- Modify: `src/components/layout/client-shell.tsx`

- [ ] **Step 1: Create PageTransition component**

```tsx
// src/components/ui/page-transition.tsx
"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Integrate into ClientShell**

Modify `src/components/layout/client-shell.tsx` — wrap `{children}` in `<main>` with `AnimatePresence` and `PageTransition`:

```tsx
// src/components/layout/client-shell.tsx
"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { PageTransition } from "@/components/ui/page-transition";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="scanline-overlay flex flex-col min-h-screen">
      <ScrollProgress />
      <Navbar onChatToggle={() => setChatOpen((o) => !o)} />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <PageTransition>{children}</PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen((o) => !o)} />
    </div>
  );
}
```

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/page-transition.tsx src/components/layout/client-shell.tsx
git commit -m "feat: add smooth page transitions with AnimatePresence"
```

---

### Task 5: Custom Cursor

**Files:**
- Create: `src/components/ui/custom-cursor.tsx`
- Modify: `src/components/layout/client-shell.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create CustomCursor component**

```tsx
// src/components/ui/custom-cursor.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });
  const ringX = useSpring(0, { stiffness: 150, damping: 20 });
  const ringY = useSpring(0, { stiffness: 150, damping: 20 });
  const isTouchDevice = useRef(false);

  useEffect(() => {
    // Detect touch device
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice.current) return;

    setVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("a, button, [role='button'], input, textarea, select, [data-hoverable]");
      setHovering(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      if (!isTouchDevice.current) setVisible(true);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, ringX, ringY]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="rounded-full bg-accent-blue transition-transform duration-150"
          style={{
            width: hovering ? 12 : 8,
            height: hovering ? 12 : 8,
          }}
        />
      </motion.div>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="rounded-full border border-accent-blue/30 transition-all duration-200"
          style={{
            width: hovering ? 48 : 32,
            height: hovering ? 48 : 32,
          }}
        />
      </motion.div>
    </>
  );
}
```

- [ ] **Step 2: Hide default cursor in globals.css**

Add to end of `src/app/globals.css`:

```css
/* Hide default cursor on desktop when custom cursor is active */
@media (pointer: fine) {
  * {
    cursor: none !important;
  }
}
```

- [ ] **Step 3: Add CustomCursor to ClientShell**

Add import: `import { CustomCursor } from "@/components/ui/custom-cursor";`

Add `<CustomCursor />` right after `<ScrollProgress />` in the render.

- [ ] **Step 4: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/custom-cursor.tsx src/components/layout/client-shell.tsx src/app/globals.css
git commit -m "feat: add custom cursor with trailing ring and hover scaling"
```

---

## Wave 2 — Hero & Homepage

### Task 6: Particle Network Canvas

**Files:**
- Create: `src/components/home/particle-network.tsx`

- [ ] **Step 1: Create ParticleNetwork component**

```tsx
// src/components/home/particle-network.tsx
"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 120;
    const PARTICLE_COLOR = "rgba(0, 212, 255, 0.3)";
    const LINE_COLOR_BASE = [0, 212, 255];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function initParticles() {
      particles = [];
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Update positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = 0.1 * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${LINE_COLOR_BASE.join(",")}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_COLOR;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    // Pause when tab not visible
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        draw();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/home/particle-network.tsx
git commit -m "feat: add particle constellation canvas component"
```

---

### Task 7: Floating Tech Icons

**Files:**
- Create: `src/components/home/floating-icons.tsx`

- [ ] **Step 1: Create FloatingIcons component**

```tsx
// src/components/home/floating-icons.tsx
"use client";

const icons = [
  { label: "React", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z", top: "10%", left: "8%", delay: 0, duration: 10 },
  { label: "Python", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", top: "15%", right: "10%", delay: 2, duration: 12 },
  { label: "Docker", path: "M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z", bottom: "20%", left: "5%", delay: 4, duration: 14 },
  { label: "TypeScript", path: "M3 3h18v18H3V3zm9 14v-4H9v-2h8v2h-3v4h-2z", top: "60%", right: "7%", delay: 1, duration: 11 },
  { label: "Node", path: "M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 9v6l-8 4-8-4V9l8-4.82z", bottom: "15%", right: "15%", delay: 3, duration: 13 },
  { label: "DB", path: "M12 2C8 2 4 3.5 4 5.5v13C4 20.5 8 22 12 22s8-1.5 8-3.5v-13C20 3.5 16 2 12 2zm0 2c3.87 0 6 1.25 6 1.5S15.87 7 12 7 6 5.75 6 5.5 8.13 4 12 4z", top: "40%", left: "3%", delay: 5, duration: 15 },
];

export function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {icons.map((icon) => (
        <div
          key={icon.label}
          className="absolute opacity-[0.12]"
          style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
            bottom: icon.bottom,
            animation: `float ${icon.duration}s ease-in-out infinite`,
            animationDelay: `${icon.delay}s`,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-blue)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={icon.path} />
          </svg>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/home/floating-icons.tsx
git commit -m "feat: add floating tech icons for hero atmosphere"
```

---

### Task 8: Hero Section Upgrade

**Files:**
- Modify: `src/components/home/hero-section.tsx`

- [ ] **Step 1: Rewrite hero-section.tsx with all upgrades**

Replace the entire file with the upgraded version that integrates ParticleNetwork, FloatingIcons, staggered letter reveal, and precise choreography:

```tsx
// src/components/home/hero-section.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/data";
import { ParticleNetwork } from "./particle-network";
import { FloatingIcons } from "./floating-icons";

const typingLines = [
  "Building production RAG systems",
  "3000+ competitive programming problems",
  "Full-stack engineer & AI builder",
  "Turning ideas into shipped products",
];

function StaggeredName({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="inline-flex overflow-hidden">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.03,
            type: "spring",
            stiffness: 120,
            damping: 12,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const [displayText, setDisplayText] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  useEffect(() => {
    const currentLine = typingLines[lineIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charIdx < currentLine.length) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        }, 60);
      } else {
        timer = setTimeout(() => setPhase("pause"), 50);
      }
    } else if (phase === "pause") {
      timer = setTimeout(() => setPhase("deleting"), 2200);
    } else if (phase === "deleting") {
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        }, 30);
      } else {
        setLineIdx((i) => (i + 1) % typingLines.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timer);
  }, [charIdx, phase, lineIdx]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle constellation canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
      >
        <ParticleNetwork />
      </motion.div>

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg-primary)_70%)]" />

      {/* Floating tech icons */}
      <FloatingIcons />

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px] animate-float" />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-green/5 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Achievement banner — 0.2s */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-blue/20 bg-accent-blue/5 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-mono text-text-secondary">
            Built production RAG systems using Weaviate + LLMs &middot; 3000+
            problems solved
          </span>
        </motion.div>

        {/* Staggered name — 0.5s */}
        <h1 className="heading-mono text-5xl sm:text-6xl md:text-7xl text-text-primary mb-4">
          <StaggeredName text={siteConfig.name.split(" ")[0]} delay={0.5} />
          <span className="text-accent-blue">
            {" "}
            <StaggeredName text={siteConfig.name.split(" ")[1]} delay={0.8} />
          </span>
        </h1>

        {/* Typing effect — 1.1s */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="h-10 flex items-center justify-center mb-6"
        >
          <span className="font-mono text-lg sm:text-xl text-accent-blue/80">
            {"$ "}
          </span>
          <span className="font-mono text-lg sm:text-xl text-text-secondary">
            {displayText}
          </span>
          <span className="font-mono text-lg sm:text-xl text-accent-blue animate-pulse">
            █
          </span>
        </motion.div>

        {/* Tagline — 1.4s */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-text-secondary text-lg max-w-2xl mx-auto mb-10"
        >
          {siteConfig.tagline}
        </motion.p>

        {/* CTAs — 1.7s */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button href="/projects" size="lg">
            View Projects
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button href="/resume" variant="secondary" size="lg">
            <Download className="w-4 h-4" />
            Download Resume
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator — 2.2s */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/home/hero-section.tsx
git commit -m "feat: upgrade hero with particles, staggered name reveal, floating icons"
```

---

### Task 9: Typewriter Code Component

**Files:**
- Create: `src/components/home/typewriter-code.tsx`

- [ ] **Step 1: Create TypewriterCode component**

```tsx
// src/components/home/typewriter-code.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface TypewriterCodeProps {
  code: string;
  speed?: number;
}

type TokenType = "keyword" | "string" | "comment" | "function" | "number" | "plain";

interface Token {
  text: string;
  type: TokenType;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "var(--accent-blue)",
  string: "var(--accent-green)",
  comment: "var(--text-muted)",
  function: "var(--accent-purple)",
  number: "var(--accent-orange)",
  plain: "var(--text-secondary)",
};

const KEYWORDS = ["const", "let", "var", "function", "return", "import", "from", "export", "default", "new", "await", "async", "if", "else", "for", "of", "in", "class", "extends", "typeof", "interface", "type"];

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  if (line.trimStart().startsWith("//")) {
    tokens.push({ text: line, type: "comment" });
    return tokens;
  }

  const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+\.?\d*\b|\b[a-zA-Z_]\w*\b|[^\s\w"'`]+|\s+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const text = match[0];
    if (/^["'`]/.test(text)) {
      tokens.push({ text, type: "string" });
    } else if (/^\d/.test(text)) {
      tokens.push({ text, type: "number" });
    } else if (KEYWORDS.includes(text)) {
      tokens.push({ text, type: "keyword" });
    } else if (/^[a-zA-Z_]\w*$/.test(text) && line.charAt(match.index + text.length) === "(") {
      tokens.push({ text, type: "function" });
    } else {
      tokens.push({ text, type: "plain" });
    }
  }
  return tokens;
}

export function TypewriterCode({ code, speed = 20 }: TypewriterCodeProps) {
  const ref = useRef<HTMLPreElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [visibleChars, setVisibleChars] = useState(0);
  const totalChars = code.length;
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleChars(count);
      if (count >= totalChars) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [inView, totalChars, speed]);

  // Build the visible portion and tokenize it
  const visibleCode = code.slice(0, visibleChars);
  const lines = visibleCode.split("\n");

  return (
    <pre
      ref={ref}
      className="font-mono text-sm leading-relaxed overflow-x-auto p-4"
    >
      {lines.map((line, lineIdx) => {
        const tokens = tokenizeLine(line);
        return (
          <div key={lineIdx}>
            {tokens.map((token, tokenIdx) => (
              <span key={tokenIdx} style={{ color: TOKEN_COLORS[token.type] }}>
                {token.text}
              </span>
            ))}
            {lineIdx === lines.length - 1 && visibleChars < totalChars && (
              <span className="text-accent-blue animate-pulse">█</span>
            )}
          </div>
        );
      })}
    </pre>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/home/typewriter-code.tsx
git commit -m "feat: add typewriter code component with syntax highlighting"
```

---

### Task 10: Proof of Work Section

**Files:**
- Create: `src/components/home/proof-of-work.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create ProofOfWork component**

```tsx
// src/components/home/proof-of-work.tsx
"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TypewriterCode } from "./typewriter-code";

const codeSnippet = `const pipeline = new RAGPipeline({
  vectorDb: new WeaviateClient(),
  llm: new GroqClient("llama-3.1-70b"),
  embedder: new LocalEmbedder("MiniLM-L6"),
});

const response = await pipeline.query({
  question: userQuery,
  topK: 5,
  hybridSearch: true,
});`;

const metrics = [
  { value: 936, prefix: "mAP@50: 0.", suffix: "", label: "Traffic Signal Detection" },
  { value: 200, prefix: "<", suffix: "ms", label: "Vector Search Latency" },
  { value: 95, prefix: "", suffix: "%", label: "Retrieval Accuracy" },
];

export function ProofOfWork() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Proof of Work"
          title="Don't Take My Word For It"
          description="Real architecture, real code, real metrics."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Architecture Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="card-surface p-6"
          >
            <h3 className="font-mono text-sm text-accent-blue mb-4">
              System Design
            </h3>
            <div className="bg-bg-tertiary rounded-lg p-4 font-mono text-xs text-text-muted space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-accent-green">User</span>
                <span className="flex-1 border-t border-dashed border-border-primary" />
                <span className="text-accent-blue">Next.js API</span>
              </div>
              <div className="flex justify-center">
                <span className="text-text-muted">│ embed query</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent-blue">API</span>
                <span className="flex-1 border-t border-dashed border-border-primary" />
                <span className="text-accent-purple">Weaviate</span>
              </div>
              <div className="flex justify-center">
                <span className="text-text-muted">│ hybrid search</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent-purple">Chunks</span>
                <span className="flex-1 border-t border-dashed border-border-primary" />
                <span className="text-accent-orange">Groq LLM</span>
              </div>
              <div className="flex justify-center">
                <span className="text-text-muted">│ stream response</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent-orange">LLM</span>
                <span className="flex-1 border-t border-dashed border-border-primary" />
                <span className="text-accent-green">User</span>
              </div>
            </div>
            <p className="text-text-muted text-xs mt-3">
              Production RAG Pipeline Architecture
            </p>
          </motion.div>

          {/* Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className="card-surface overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary/50 border-b border-border-primary">
              <span className="font-mono text-xs text-accent-blue">
                Real Code
              </span>
              <span className="font-mono text-xs text-text-muted">
                pipeline.ts
              </span>
            </div>
            <TypewriterCode code={codeSnippet} speed={25} />
          </motion.div>

          {/* Metrics Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className="card-surface p-6"
          >
            <h3 className="font-mono text-sm text-accent-blue mb-6">
              Measured Results
            </h3>
            <div className="space-y-6">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="font-mono text-2xl font-bold text-text-primary">
                    <AnimatedCounter
                      value={m.value}
                      prefix={m.prefix}
                      suffix={m.suffix}
                      duration={2000}
                    />
                  </div>
                  <p className="text-text-muted text-xs mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to homepage**

Modify `src/app/page.tsx` — add import and place `<ProofOfWork />` between `<FeaturedProjects />` and `<InlineChatPrompt />`:

```tsx
// src/app/page.tsx
import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { AboutSnippet } from "@/components/home/about-snippet";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { ProofOfWork } from "@/components/home/proof-of-work";
import { InlineChatPrompt } from "@/components/home/inline-chat-prompt";
import { LatestPosts } from "@/components/home/latest-posts";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <AboutSnippet />
      <FeaturedProjects />
      <ProofOfWork />
      <InlineChatPrompt />
      <LatestPosts />
      <CTASection />
    </>
  );
}
```

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/home/proof-of-work.tsx src/app/page.tsx
git commit -m "feat: add proof of work section with architecture, code, and metrics"
```

---

### Task 11: Terminal Preloader

**Files:**
- Create: `src/components/layout/preloader.tsx`
- Modify: `src/components/layout/client-shell.tsx`

- [ ] **Step 1: Create Preloader component**

```tsx
// src/components/layout/preloader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const lines = [
  "> Initializing habib36.dev...",
  "> Loading modules...",
  "> Compiling portfolio... done",
  "> System ready.",
];

export function Preloader() {
  const [show, setShow] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on first visit
    if (sessionStorage.getItem("preloaded")) {
      setDismissed(true);
      return;
    }
    setShow(true);

    // Animate lines
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), 200 + i * 300)
      );
    });

    // Animate progress (on line 2)
    timers.push(
      setTimeout(() => {
        const start = performance.now();
        function animateProgress(now: number) {
          const elapsed = now - start;
          const p = Math.min(elapsed / 800, 1);
          setProgress(Math.floor(p * 100));
          if (p < 1) requestAnimationFrame(animateProgress);
        }
        requestAnimationFrame(animateProgress);
      }, 500)
    );

    // Dismiss after sequence
    timers.push(
      setTimeout(() => {
        sessionStorage.setItem("preloaded", "1");
        setShow(false);
      }, 1700)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("preloaded", "1");
    setShow(false);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] bg-bg-primary flex items-center justify-center cursor-pointer"
        >
          <div className="font-mono text-sm space-y-2 max-w-md px-6">
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  i === lines.length - 1
                    ? "text-accent-green"
                    : "text-text-secondary"
                }
              >
                {line}
                {/* Show progress bar on line 2 */}
                {i === 1 && (
                  <span className="ml-2 text-accent-blue">
                    {"█".repeat(Math.floor(progress / 10))}
                    {"░".repeat(10 - Math.floor(progress / 10))}
                    {" "}
                    {progress}%
                  </span>
                )}
              </motion.div>
            ))}
            {visibleLines > 0 && (
              <div className="text-text-muted text-xs mt-4 animate-pulse">
                Click anywhere to skip
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Add Preloader to ClientShell**

Modify `src/components/layout/client-shell.tsx` — add import and render `<Preloader />` as the first element inside the outer div:

Add import: `import { Preloader } from "./preloader";`
Add `<Preloader />` right after the opening `<div>` tag, before `<ScrollProgress />`.

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/preloader.tsx src/components/layout/client-shell.tsx
git commit -m "feat: add terminal-style preloader on first visit"
```

---

### Task 12: Certifications Data + Components

**Files:**
- Modify: `src/lib/data.ts`
- Create: `src/components/home/certifications.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Add certifications data to lib/data.ts**

Add this export at the end of `src/lib/data.ts`:

```ts
export const certifications = [
  {
    title: "Meta Full-Stack Engineer Professional Certificate",
    issuer: "Meta",
    platform: "Coursera",
    date: "2025-06",
    url: "https://coursera.org/verify/professional-cert/example1",
  },
  {
    title: "Machine Learning Specialization",
    issuer: "DeepLearning.AI & Stanford",
    platform: "Coursera",
    date: "2024-12",
    url: "https://coursera.org/verify/specialization/example2",
  },
  {
    title: "LangChain for LLM Application Development",
    issuer: "DeepLearning.AI",
    platform: "Coursera",
    date: "2024-09",
    url: "https://coursera.org/verify/example3",
  },
  {
    title: "Docker & Kubernetes: The Complete Guide",
    issuer: "Stephen Grider",
    platform: "Udemy",
    date: "2024-06",
    url: "https://udemy.com/certificate/example4",
  },
  {
    title: "Next.js & React - The Complete Guide",
    issuer: "Maximilian Schwarzmüller",
    platform: "Udemy",
    date: "2024-03",
    url: "https://udemy.com/certificate/example5",
  },
  {
    title: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services",
    platform: "AWS",
    date: "2024-01",
    url: "https://aws.amazon.com/verification/example6",
  },
];
```

- [ ] **Step 2: Create Certifications component**

```tsx
// src/components/home/certifications.tsx
"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/ui/tilt-card";
import { certifications } from "@/lib/data";

const platformColors: Record<string, string> = {
  Coursera: "text-blue-400",
  Udemy: "text-purple-400",
  AWS: "text-orange-400",
};

export function Certifications({ compact = false }: { compact?: boolean }) {
  const items = compact ? certifications.slice(0, 3) : certifications;

  return (
    <section className={compact ? "py-16" : "py-24"}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Certifications"
          title="Verified Learning"
          description={
            compact
              ? undefined
              : "Professional certifications and specializations."
          }
          align={compact ? "center" : "left"}
        />

        <div
          className={`grid gap-6 ${
            compact
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {items.map((cert, i) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.08,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              <TiltCard>
                <div className="card-surface p-5 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-accent-blue/10">
                      <Award className="w-4 h-4 text-accent-blue" />
                    </div>
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-text-muted hover:text-accent-blue transition-colors"
                      aria-label="Verify certificate"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h3 className="font-mono text-sm font-bold text-text-primary mb-1 line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-text-secondary text-xs mb-2">
                    {cert.issuer}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono ${platformColors[cert.platform] || "text-text-muted"}`}
                    >
                      {cert.platform}
                    </span>
                    <span className="text-text-muted font-mono">
                      {new Date(cert.date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add compact Certifications to homepage**

Modify `src/app/page.tsx` — add import and place `<Certifications compact />` after `<AboutSnippet />`:

```tsx
import { Certifications } from "@/components/home/certifications";
```

Updated homepage order:
```tsx
<HeroSection />
<StatsBar />
<AboutSnippet />
<Certifications compact />
<FeaturedProjects />
<ProofOfWork />
<InlineChatPrompt />
<LatestPosts />
<CTASection />
```

- [ ] **Step 4: Add full Certifications to About page**

Modify `src/app/about/page.tsx` — import `Certifications` and add `<Certifications />` after the Education section (at the end of the page, inside the outer `<div className="py-24">`):

```tsx
import { Certifications } from "@/components/home/certifications";
```

Add at the end, after the education `</div>`:
```tsx
<Certifications />
```

- [ ] **Step 5: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/lib/data.ts src/components/home/certifications.tsx src/app/page.tsx src/app/about/page.tsx
git commit -m "feat: add certifications section to homepage and about page"
```

---

## Wave 3 — Deep Page Polish

### Task 13: Interactive Experience Timeline

**Files:**
- Create: `src/components/resume/interactive-timeline.tsx`
- Modify: `src/app/resume/page.tsx`

- [ ] **Step 1: Create InteractiveTimeline component**

```tsx
// src/components/resume/interactive-timeline.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineItem {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
}

export function InteractiveTimeline({ items }: { items: TimelineItem[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="relative">
      {/* Animated vertical line */}
      <motion.div
        className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border-primary origin-top"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <div className="space-y-4">
        {items.map((item, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <motion.div
              key={item.company}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="relative pl-8"
            >
              {/* Timeline dot */}
              <motion.div
                className={`absolute left-0 top-3 w-[16px] h-[16px] rounded-full border-2 transition-colors duration-300 ${
                  isExpanded
                    ? "border-accent-blue bg-accent-blue/20 shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                    : "border-border-hover bg-bg-primary"
                }`}
                animate={
                  isExpanded
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 1 }
                }
                transition={
                  isExpanded
                    ? { duration: 2, repeat: Infinity }
                    : {}
                }
              />

              {/* Card */}
              <button
                onClick={() =>
                  setExpandedIndex(isExpanded ? null : i)
                }
                className="w-full text-left card-surface p-4 hover:border-border-hover transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-mono font-bold text-text-primary text-sm">
                      {item.role}
                    </h3>
                    <p className="text-accent-blue text-xs mt-0.5">
                      {item.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-mono whitespace-nowrap">
                      {item.period}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-text-secondary text-sm mt-3 mb-3 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
                        <span>{item.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tech.map((t, ti) => (
                          <motion.div
                            key={t}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: ti * 0.03,
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                            }}
                          >
                            <Badge>{t}</Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate into Resume page**

Modify `src/app/resume/page.tsx`:
- Add import: `import { InteractiveTimeline } from "@/components/resume/interactive-timeline";`
- Replace the existing experience section (the `<div className="space-y-6">` that maps over `experience`) with: `<InteractiveTimeline items={experience} />`
- Keep the section heading and `<h2>` above it.

Find and replace the experience mapping block:
```tsx
{/* Old block to replace — from <div className="space-y-6"> to its closing </div> */}
```
Replace with:
```tsx
<InteractiveTimeline items={experience} />
```

- [ ] **Step 3: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/resume/interactive-timeline.tsx src/app/resume/page.tsx
git commit -m "feat: add interactive expandable experience timeline"
```

---

### Task 14: Interactive Skill Visualization

**Files:**
- Modify: `src/lib/data.ts`
- Create: `src/components/ui/skill-bar.tsx`
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Update skills data structure in lib/data.ts**

Replace the `skills` export in `src/lib/data.ts` with this version that adds proficiency:

```ts
export const skills = [
  {
    category: "Languages",
    items: [
      { name: "TypeScript", proficiency: 95 },
      { name: "Python", proficiency: 88 },
      { name: "JavaScript", proficiency: 92 },
      { name: "C++", proficiency: 80 },
      { name: "SQL", proficiency: 85 },
      { name: "Go", proficiency: 60 },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "React", proficiency: 93 },
      { name: "Next.js", proficiency: 95 },
      { name: "Tailwind CSS", proficiency: 90 },
      { name: "Framer Motion", proficiency: 82 },
      { name: "Vue.js", proficiency: 65 },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", proficiency: 92 },
      { name: "Express", proficiency: 88 },
      { name: "Payload CMS", proficiency: 85 },
      { name: "PostgreSQL", proficiency: 83 },
      { name: "Redis", proficiency: 75 },
    ],
  },
  {
    category: "AI & LLMs",
    items: [
      { name: "LangChain", proficiency: 90 },
      { name: "RAG Pipelines", proficiency: 92 },
      { name: "Weaviate", proficiency: 88 },
      { name: "Ollama", proficiency: 80 },
      { name: "OpenAI API", proficiency: 85 },
      { name: "Groq", proficiency: 82 },
    ],
  },
  {
    category: "DevOps",
    items: [
      { name: "Docker", proficiency: 88 },
      { name: "Coolify", proficiency: 80 },
      { name: "GitHub Actions", proficiency: 82 },
      { name: "Linux", proficiency: 85 },
      { name: "Nginx", proficiency: 75 },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Git", proficiency: 95 },
      { name: "VS Code", proficiency: 92 },
      { name: "Figma", proficiency: 65 },
      { name: "Postman", proficiency: 80 },
      { name: "Turborepo", proficiency: 78 },
    ],
  },
];
```

- [ ] **Step 2: Create SkillBar component**

```tsx
// src/components/ui/skill-bar.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SkillBarProps {
  name: string;
  proficiency: number;
  delay?: number;
}

export function SkillBar({ name, proficiency, delay = 0 }: SkillBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  const filled = Math.round(proficiency / 10);
  const empty = 10 - filled;

  return (
    <div ref={ref} className="flex items-center gap-3 font-mono text-xs group">
      <span className="w-28 text-text-secondary truncate group-hover:text-accent-blue transition-colors">
        {name}
      </span>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-blue rounded-full"
            initial={{ width: 0 }}
            animate={inView ? { width: `${proficiency}%` } : { width: 0 }}
            transition={{
              delay,
              duration: 0.8,
              ease: "easeOut",
            }}
          />
        </div>
        <motion.span
          className="w-8 text-right text-text-muted tabular-nums"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          {proficiency}%
        </motion.span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update About page skills section**

Modify `src/app/about/page.tsx` — replace the skills rendering section. The current code maps `skills` and renders `group.items` as strings. Since items are now objects with `{ name, proficiency }`, update the skills section:

Replace the skills grid block. Find the `{skills.map((group, i) => (` section and replace it with:

```tsx
import { SkillBar } from "@/components/ui/skill-bar";
```

And the rendering:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
  {skills.map((group, i) => (
    <motion.div
      key={group.category}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      className="card-surface p-5"
    >
      <h3 className="font-mono text-sm text-accent-blue mb-4">
        {group.category}
      </h3>
      <div className="space-y-2.5">
        {group.items.map((item, j) => (
          <SkillBar
            key={item.name}
            name={item.name}
            proficiency={item.proficiency}
            delay={j * 0.05}
          />
        ))}
      </div>
    </motion.div>
  ))}
</div>
```

Also remove the old `Badge` rendering for skills — the Badge import can stay since it's used elsewhere on the page.

- [ ] **Step 4: Update Resume page skills section**

The resume page also renders skills. Modify `src/app/resume/page.tsx` — find the skills grid that maps `group.items` as strings and update to use `item.name`:

Find:
```tsx
{group.items.map((item) => (
  <Badge key={item}>{item}</Badge>
))}
```

Replace with:
```tsx
{group.items.map((item) => (
  <Badge key={item.name}>{item.name}</Badge>
))}
```

- [ ] **Step 5: Build and verify**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/lib/data.ts src/components/ui/skill-bar.tsx src/app/about/page.tsx src/app/resume/page.tsx
git commit -m "feat: add interactive skill bars with proficiency visualization"
```

---

### Task 15: Final Integration Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `npx next build 2>&1 | tail -15`
Expected: Build succeeds with all routes, no TypeScript errors

- [ ] **Step 2: Start dev server and test all pages**

Run: `npx next dev --port 3000`

Verify these pages load without console errors:
- `http://localhost:3000` — Homepage: preloader → hero particles → name cascade → stats counter → proof of work → certifications → all cards have tilt effect
- `http://localhost:3000/about` — Skill bars animate, certifications show, CP showcase works
- `http://localhost:3000/projects` — Cards have tilt effect
- `http://localhost:3000/resume` — Interactive timeline expands/collapses
- `http://localhost:3000/blog` — Cards have tilt effect
- `http://localhost:3000/contact` — Page transitions work

Verify:
- Scroll progress bar visible at top
- Custom cursor tracks mouse (desktop)
- Page transitions animate between routes
- No performance issues (no jank on scroll)

- [ ] **Step 3: Stop dev server**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete UI/UX improvements - all 10 features across 3 waves"
```

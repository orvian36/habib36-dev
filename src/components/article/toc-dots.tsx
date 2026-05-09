"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: 2 | 3 };

export function TocDots({ rootId }: { rootId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-heading-id]")
    ).filter((el) => el.tagName === "H2" || el.tagName === "H3");

    const next: Heading[] = els.map((el) => ({
      id: el.dataset.headingId!,
      text: el.textContent ?? "",
      level: (el.tagName === "H2" ? 2 : 3) as 2 | 3,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(next);
    if (next.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.headingId;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootId]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="hidden lg:flex flex-col gap-2 sticky top-32 pt-2 group/toc"
    >
      {headings.map((h) => {
        const active = h.id === activeId;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            className="relative flex items-center group/dot py-1"
            aria-current={active ? "location" : undefined}
          >
            <span
              className={`block rounded-full transition-all ${
                active
                  ? "w-2 h-2 bg-accent-blue shadow-[0_0_8px_var(--accent-blue-glow-strong)]"
                  : "w-1.5 h-1.5 bg-border-hover group-hover/dot:bg-text-muted"
              } ${h.level === 3 ? "ml-2" : ""}`}
            />
            <span
              className={`absolute left-5 whitespace-nowrap text-xs font-mono opacity-0 -translate-x-1 group-hover/dot:opacity-100 group-hover/dot:translate-x-0 transition-all pointer-events-none ${
                active ? "text-accent-blue" : "text-text-secondary"
              }`}
            >
              {h.text}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

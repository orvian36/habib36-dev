"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";

type Heading = { id: string; text: string; level: 2 | 3 };

export function MobileToc({ rootId }: { rootId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-heading-id]")
    ).filter((el) => el.tagName === "H2" || el.tagName === "H3");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(
      els.map((el) => ({
        id: el.dataset.headingId!,
        text: el.textContent ?? "",
        level: (el.tagName === "H2" ? 2 : 3) as 2 | 3,
      }))
    );
  }, [rootId]);

  if (headings.length < 2) return null;

  return (
    <details className="lg:hidden card-surface p-4 mb-6 group">
      <summary className="flex items-center justify-between cursor-pointer list-none font-mono text-xs text-text-muted uppercase tracking-wider">
        <span className="inline-flex items-center gap-2">
          <List className="w-3.5 h-3.5" /> On this page
        </span>
        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
      </summary>
      <nav className="mt-3 space-y-1.5">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block text-sm hover:text-accent-blue transition-colors ${
              h.level === 3 ? "pl-4 text-text-muted" : "text-text-secondary"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </details>
  );
}

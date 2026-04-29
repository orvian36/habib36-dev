"use client";

import { useEffect, useRef, useState } from "react";
import { devTools } from "@/lib/dev-tools";

export function FloatingIcons() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeSlug) return;
    const timer = window.setTimeout(() => setActiveSlug(null), 2400);
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setActiveSlug(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeSlug]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {devTools.map((tool) => {
        const isActive = activeSlug === tool.slug;
        return (
          <div
            key={tool.slug}
            className="floating-icon absolute"
            style={{
              top: tool.position.top,
              left: tool.position.left,
              right: tool.position.right,
              bottom: tool.position.bottom,
              animation: `float ${tool.duration}s ease-in-out infinite`,
              animationDelay: `${tool.delay}s`,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSlug(isActive ? null : tool.slug)}
              aria-label={tool.name}
              className="pointer-events-auto group relative block p-1 rounded-md transition-transform duration-200 hover:scale-125 focus-visible:scale-125"
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="var(--accent-blue)"
                className="opacity-45 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200"
              >
                <path d={tool.path} />
              </svg>
              {isActive && (
                <span
                  role="tooltip"
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap px-2 py-1 text-xs font-mono rounded-md bg-bg-elevated border border-border-accent text-text-primary shadow-lg"
                >
                  {tool.name}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

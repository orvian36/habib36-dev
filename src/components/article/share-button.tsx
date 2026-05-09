"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  async function onClick() {
    const url = window.location.href;
    if ("share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // Only fall through to clipboard if the user explicitly aborted.
        // Other errors (permission, etc.) should not silently masquerade as a successful share.
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — silent
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all inline-flex items-center gap-1.5 text-xs font-mono"
      aria-label="Share article"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied && <span>copied</span>}
    </button>
  );
}

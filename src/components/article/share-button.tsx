"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title, url };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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

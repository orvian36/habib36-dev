"use client";

import { useEffect, useRef, useState } from "react";

let counter = 0;

export function MermaidClient({ source }: { source: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${++counter}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        const isLight =
          typeof document !== "undefined" &&
          document.documentElement.dataset.theme === "light";
        mermaid.initialize({
          startOnLoad: false,
          theme: isLight ? "default" : "dark",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          securityLevel: "strict",
        });
        const { svg: rendered } = await mermaid.render(idRef.current, source);
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Render failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (error) {
    return (
      <div>
        <p className="font-mono text-xs text-text-muted mb-2">
          Diagram failed to render — showing source:
        </p>
        <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap m-0">
          {source}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <pre className="font-mono text-xs text-text-muted whitespace-pre-wrap m-0">
        {source}
      </pre>
    );
  }

  return <div className="mermaid-rendered" dangerouslySetInnerHTML={{ __html: svg }} />;
}

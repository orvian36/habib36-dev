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

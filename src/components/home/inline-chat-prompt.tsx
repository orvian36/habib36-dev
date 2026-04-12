"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

const suggestedPrompts = [
  "What's his RAG experience?",
  "Best project?",
  "Tech stack?",
];

export function InlineChatPrompt() {
  const [query, setQuery] = useState("");

  return (
    <section className="py-24 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.04)_0%,transparent_60%)]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-surface p-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-xs font-mono text-accent-blue">
              AI-Powered
            </span>
          </div>

          <h2 className="heading-mono text-2xl md:text-3xl text-text-primary mb-3">
            Ask me anything about Habibur
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            I&apos;ve read all his blog posts, project docs, and resume.
            Try asking me something.
          </p>

          {/* Input */}
          <div className="relative max-w-lg mx-auto mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about experience, projects, skills..."
              className="w-full px-5 py-3.5 pr-12 bg-bg-tertiary border border-border-primary rounded-xl font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Suggested prompts */}
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setQuery(prompt)}
                className="px-3 py-1.5 text-xs font-mono text-text-secondary border border-border-primary rounded-full hover:text-accent-blue hover:border-accent-blue/30 hover:bg-accent-blue/5 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

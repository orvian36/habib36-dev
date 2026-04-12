"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export function AboutSnippet() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="About"
          title="Who I Am"
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 space-y-5"
          >
            <p className="text-text-secondary text-lg leading-relaxed">
              I&apos;m <span className="text-text-primary font-medium">Habibur Rahman</span>,
              a full-stack engineer from Bangladesh who builds production AI systems.
              I specialize in <span className="text-accent-blue">RAG pipelines</span>,{" "}
              <span className="text-accent-blue">LLM integrations</span>, and{" "}
              <span className="text-accent-blue">modern web applications</span> with
              Next.js and TypeScript.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed">
              With 3000+ competitive programming problems solved across Codeforces,
              LeetCode, and CodeChef, I bring algorithmic rigor to every system I build.
              Currently working at Makebell, where I architect AI-powered features
              that serve thousands of users daily.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed">
              This portfolio itself is a demonstration — the AI chatbot you see here
              uses a RAG pipeline I built from scratch, backed by Weaviate vector search
              and Groq API for near-instant inference.
            </p>

            <Button href="/about">
              More about me
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Terminal card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="card-surface p-0 overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-bg-tertiary/50 border-b border-border-primary">
                <div className="w-3 h-3 rounded-full bg-accent-orange/60" />
                <div className="w-3 h-3 rounded-full bg-accent-green/40" />
                <div className="w-3 h-3 rounded-full bg-accent-blue/40" />
                <span className="ml-2 text-xs font-mono text-text-muted">
                  ~/habib36
                </span>
              </div>
              {/* Terminal body */}
              <div className="p-4 font-mono text-sm space-y-2">
                <div>
                  <span className="text-accent-green">$</span>{" "}
                  <span className="text-text-secondary">cat about.json</span>
                </div>
                <div className="text-text-muted pl-2">{"{"}</div>
                <div className="pl-4">
                  <span className="text-accent-purple">&quot;role&quot;</span>
                  <span className="text-text-muted">: </span>
                  <span className="text-accent-green">&quot;Full-Stack Engineer&quot;</span>
                </div>
                <div className="pl-4">
                  <span className="text-accent-purple">&quot;focus&quot;</span>
                  <span className="text-text-muted">: </span>
                  <span className="text-accent-green">&quot;AI & RAG Systems&quot;</span>
                </div>
                <div className="pl-4">
                  <span className="text-accent-purple">&quot;problems&quot;</span>
                  <span className="text-text-muted">: </span>
                  <span className="text-accent-orange">3000</span>
                  <span className="text-text-muted">+</span>
                </div>
                <div className="pl-4">
                  <span className="text-accent-purple">&quot;coffee&quot;</span>
                  <span className="text-text-muted">: </span>
                  <span className="text-accent-orange">Infinity</span>
                </div>
                <div className="text-text-muted pl-2">{"}"}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

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

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/data";
import { ParticleNetwork } from "./particle-network";
// import { FloatingIcons } from "./floating-icons";

const typingLines = [
  "Building production RAG systems",
  "3000+ competitive programming problems",
  "Full-stack engineer & AI builder",
  "Turning ideas into shipped products",
];

function StaggeredName({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="inline-flex overflow-hidden">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.03,
            type: "spring",
            stiffness: 120,
            damping: 12,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const [displayText, setDisplayText] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  useEffect(() => {
    const currentLine = typingLines[lineIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charIdx < currentLine.length) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        }, 60);
      } else {
        timer = setTimeout(() => setPhase("pause"), 50);
      }
    } else if (phase === "pause") {
      timer = setTimeout(() => setPhase("deleting"), 2200);
    } else if (phase === "deleting") {
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentLine.slice(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        }, 30);
      } else {
        setLineIdx((i) => (i + 1) % typingLines.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timer);
  }, [charIdx, phase, lineIdx]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle constellation canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
      >
        <ParticleNetwork />
      </motion.div>

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg-primary)_70%)]" />

      {/* Floating tech icons — temporarily disabled */}
      {/* <FloatingIcons /> */}

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px] animate-float" />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-green/5 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Achievement banner — 0.2s */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-blue/20 bg-accent-blue/5 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-mono text-text-secondary">
            Built production RAG systems using Weaviate + LLMs &middot; 3000+
            problems solved
          </span>
        </motion.div>

        {/* Staggered name — 0.5s */}
        <h1 className="heading-mono text-5xl sm:text-6xl md:text-7xl text-text-primary mb-4">
          <StaggeredName text={siteConfig.name.split(" ")[0]} delay={0.5} />
          <span className="text-accent-blue">
            {" "}
            <StaggeredName text={siteConfig.name.split(" ")[1]} delay={0.8} />
          </span>
        </h1>

        {/* Typing effect — 1.1s */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="h-10 flex items-center justify-center mb-6"
        >
          <span className="font-mono text-lg sm:text-xl text-accent-blue/80">
            {"$ "}
          </span>
          <span className="font-mono text-lg sm:text-xl text-text-secondary">
            {displayText}
          </span>
          <span className="font-mono text-lg sm:text-xl text-accent-blue animate-pulse">
            █
          </span>
        </motion.div>

        {/* Tagline — 1.4s */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-text-secondary text-lg max-w-2xl mx-auto mb-10"
        >
          {siteConfig.tagline}
        </motion.p>

        {/* CTAs — 1.7s */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button href="/projects" size="lg">
            View Projects
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button href="/resume" variant="secondary" size="lg">
            <Download className="w-4 h-4" />
            Download Resume
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator — 2.2s */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}

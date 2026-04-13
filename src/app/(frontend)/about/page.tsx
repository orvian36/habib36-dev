"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  GraduationCap,
  ExternalLink,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Certifications } from "@/components/home/certifications";
import { SkillBar } from "@/components/ui/skill-bar";
import { skills, achievements, education, siteConfig } from "@/lib/data";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
};

export default function AboutPage() {
  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Bio Section */}
        <SectionHeading
          label="About"
          title="About Me"
          align="left"
        />

        <motion.div {...fadeInUp} transition={{ duration: 0.5 }} className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              <p className="text-text-secondary text-lg leading-relaxed">
                I&apos;m <span className="text-text-primary font-medium">Habibur Rahman</span>,
                a full-stack software engineer from Bangladesh with a deep focus on
                AI systems, particularly{" "}
                <span className="text-accent-blue">RAG (Retrieval-Augmented Generation)</span>{" "}
                pipelines and <span className="text-accent-blue">LLM integrations</span>.
              </p>
              <p className="text-text-secondary text-lg leading-relaxed">
                I graduated from{" "}
                <span className="text-text-primary">
                  Khulna University of Engineering & Technology (KUET)
                </span>{" "}
                with a B.Sc. in Computer Science & Engineering. During my academic
                journey, I fell in love with competitive programming — solving over{" "}
                <span className="text-accent-green font-mono font-bold">3,000+</span>{" "}
                problems across Codeforces, LeetCode, and CodeChef.
              </p>
              <p className="text-text-secondary text-lg leading-relaxed">
                Professionally, I build production systems that combine modern web
                technologies (Next.js, TypeScript, Payload CMS) with AI capabilities
                (vector search, embeddings, LLM orchestration). I believe the best
                way to prove your skills is to ship things that work — which is why
                this portfolio itself is a working demonstration of everything I know.
              </p>
            </div>

            {/* Quick info card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="card-surface p-6 h-fit"
            >
              <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-4">
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Location</span>
                  <span className="text-text-primary">Bangladesh</span>
                </div>
                <div className="border-t border-border-primary" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Education</span>
                  <span className="text-text-primary">KUET, CSE</span>
                </div>
                <div className="border-t border-border-primary" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Focus</span>
                  <span className="text-accent-blue">AI & Full-Stack</span>
                </div>
                <div className="border-t border-border-primary" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Problems</span>
                  <span className="text-accent-green font-mono">3000+</span>
                </div>
                <div className="border-t border-border-primary" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <span className="text-accent-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                    Open to work
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Skills Section */}
        <div className="mb-20">
          <SectionHeading
            label="Skills"
            title="Technical Skills"
            description="Technologies and tools I work with daily."
            align="left"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {skills.map((group, i) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="card-surface p-5"
              >
                <h3 className="font-mono text-sm text-accent-blue mb-4">
                  {group.category}
                </h3>
                <div className="space-y-2.5">
                  {group.items.map((item, j) => (
                    <SkillBar
                      key={item.name}
                      name={item.name}
                      proficiency={item.proficiency}
                      delay={j * 0.05}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Competitive Programming Showcase */}
        <div className="mb-20">
          <SectionHeading
            label="Competitive Programming"
            title="CP Showcase"
            description="3,000+ problems solved across platforms. Here are my ratings."
            align="left"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((a, i) => (
              <motion.a
                key={a.platform}
                href={a.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-surface card-glow p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-mono font-bold text-lg text-text-primary">
                      {a.platform}
                    </h3>
                    <p
                      className="font-mono text-sm font-bold mt-1"
                      style={{ color: a.color }}
                    >
                      {a.rank}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-accent-blue transition-colors" />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-mono font-bold text-text-primary">
                      {a.rating}
                    </div>
                    <p className="text-xs text-text-muted mt-1">Rating</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg text-text-secondary">
                      {a.problemsSolved}
                    </div>
                    <p className="text-xs text-text-muted mt-1">Solved</p>
                  </div>
                </div>

                {/* Rating bar */}
                <div className="mt-4 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((a.rating / 2500) * 100, 100)}%`,
                      backgroundColor: a.color,
                    }}
                  />
                </div>
              </motion.a>
            ))}
          </div>

          {/* Total stat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 card-surface p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-green/10">
                <Target className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <p className="font-mono text-sm text-text-muted">
                  Total Problems Solved
                </p>
                <p className="font-mono text-2xl font-bold text-text-primary text-glow-green">
                  3,000+
                </p>
              </div>
            </div>
            <p className="text-text-secondary text-sm text-center sm:text-right max-w-sm">
              Across Codeforces, LeetCode, CodeChef, and other platforms.
              Competitive programming shaped my approach to engineering.
            </p>
          </motion.div>
        </div>

        {/* Education */}
        <div>
          <SectionHeading
            label="Education"
            title="Academic Background"
            align="left"
          />

          {education.map((edu, i) => (
            <motion.div
              key={edu.institution}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card-surface p-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent-purple/10 shrink-0">
                  <GraduationCap className="w-6 h-6 text-accent-purple" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-lg text-text-primary">
                    {edu.institution}
                  </h3>
                  <p className="text-accent-blue text-sm mt-1">{edu.degree}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-muted">
                    <span>{edu.period}</span>
                    <span>CGPA: {edu.cgpa}</span>
                  </div>
                  <p className="text-text-secondary text-sm mt-2">{edu.notes}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-20">
          <Certifications />
        </div>
      </div>
    </div>
  );
}

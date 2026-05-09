"use client";

import { motion } from "framer-motion";
import {
  Download,
  Briefcase,
  GraduationCap,
  Trophy,
  Code2,
  MapPin,
  Mail,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { InteractiveTimeline } from "@/components/resume/interactive-timeline";
import {
  siteConfig,
  experience,
  education,
  skills,
  achievements,
} from "@/lib/data";

export default function ResumePage() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <span className="font-mono text-sm text-accent-blue tracking-wider uppercase">
              {"// "}Resume
            </span>
            <h1 className="heading-mono text-3xl md:text-4xl text-text-primary mt-2">
              Habibur Rahman
            </h1>
            <p className="text-text-secondary mt-1">{siteConfig.title}</p>
          </div>
          <Button size="lg">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* Contact info bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-4 mb-10 flex flex-wrap gap-4 text-sm"
        >
          <span className="flex items-center gap-1.5 text-text-secondary">
            <MapPin className="w-4 h-4 text-text-muted" />
            Bangladesh
          </span>
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Mail className="w-4 h-4 text-text-muted" />
            {siteConfig.email}
          </span>
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Globe className="w-4 h-4 text-text-muted" />
            habib36.dev
          </span>
        </motion.div>

        {/* Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="font-mono text-sm text-accent-blue uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-8 h-px bg-accent-blue/30" />
            Summary
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Full-stack software engineer specializing in AI systems, RAG pipelines,
            and modern web development. Experienced building production LLM
            integrations with Weaviate, LangChain, and Groq. 3,000+ competitive
            programming problems solved across Codeforces (Specialist, 1558),
            LeetCode (Knight, 1882), and CodeChef (3-Star, 1741). B.Sc. in CSE
            from KUET.
          </p>
        </motion.section>

        {/* Experience */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-mono text-sm text-accent-blue uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-8 h-px bg-accent-blue/30" />
            <Briefcase className="w-4 h-4" />
            Experience
          </h2>

          <InteractiveTimeline items={experience} />
        </motion.section>

        {/* Skills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-mono text-sm text-accent-blue uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-8 h-px bg-accent-blue/30" />
            <Code2 className="w-4 h-4" />
            Skills
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((group) => (
              <div key={group.category}>
                <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge key={item.name}>{item.name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Education */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-mono text-sm text-accent-blue uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-8 h-px bg-accent-blue/30" />
            <GraduationCap className="w-4 h-4" />
            Education
          </h2>

          {education.map((edu) => (
            <div key={edu.institution} className="pl-6 border-l-2 border-border-primary relative">
              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-accent-purple" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                <h3 className="font-mono font-bold text-text-primary text-sm">
                  {edu.institution}
                </h3>
                <span className="text-xs text-text-muted font-mono">
                  {edu.period}
                </span>
              </div>
              <p className="text-accent-blue text-sm">{edu.degree}</p>
              <p className="text-text-muted text-sm">CGPA: {edu.cgpa}</p>
            </div>
          ))}
        </motion.section>

        {/* Competitive Programming */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-mono text-sm text-accent-blue uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-8 h-px bg-accent-blue/30" />
            <Trophy className="w-4 h-4" />
            Competitive Programming
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {achievements.map((a) => (
              <div key={a.platform} className="card-surface p-4 text-center">
                <h3 className="font-mono font-bold text-text-primary text-sm">
                  {a.platform}
                </h3>
                <p className="font-mono text-2xl font-bold mt-1" style={{ color: a.color }}>
                  {a.rating}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {a.rank} &middot; {a.problemsSolved} solved
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

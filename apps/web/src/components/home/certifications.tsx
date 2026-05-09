"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/ui/tilt-card";
import { certifications } from "@/lib/data";

const platformColors: Record<string, string> = {
  Coursera: "text-blue-400",
  Udemy: "text-purple-400",
  AWS: "text-orange-400",
};

export function Certifications({ compact = false }: { compact?: boolean }) {
  const items = compact ? certifications.slice(0, 3) : certifications;

  return (
    <section className={compact ? "py-16" : "py-24"}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Certifications"
          title="Verified Learning"
          description={
            compact
              ? undefined
              : "Professional certifications and specializations."
          }
          align={compact ? "center" : "left"}
        />

        <div
          className={`grid gap-6 ${
            compact
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {items.map((cert, i) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.08,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="h-full"
            >
              <TiltCard className="h-full">
                <div className="card-surface p-5 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-accent-blue/10">
                      <Award className="w-4 h-4 text-accent-blue" />
                    </div>
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-text-muted hover:text-accent-blue transition-colors"
                      aria-label="Verify certificate"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h3 className="font-mono text-sm font-bold text-text-primary mb-1 line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-text-secondary text-xs mb-2">
                    {cert.issuer}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono ${platformColors[cert.platform] || "text-text-muted"}`}
                    >
                      {cert.platform}
                    </span>
                    <span className="text-text-muted font-mono">
                      {new Date(cert.date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

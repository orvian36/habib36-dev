"use client";

import { motion } from "framer-motion";
import { Code2, Briefcase, Rocket, FileText } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const statsData = [
  { label: "Problems Solved", value: 3000, suffix: "+", icon: Code2 },
  { label: "Years Experience", value: 3, suffix: "+", icon: Briefcase },
  { label: "Projects Shipped", value: 15, suffix: "+", icon: Rocket },
  { label: "Blog Posts", value: 10, suffix: "+", icon: FileText },
];

export function StatsBar() {
  return (
    <section className="relative py-16 border-y border-border-primary bg-bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statsData.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="text-center group"
              >
                <div className="inline-flex p-3 rounded-xl bg-bg-tertiary/50 border border-border-primary group-hover:border-accent-blue/30 group-hover:bg-accent-blue/5 transition-all mb-3">
                  <Icon className="w-5 h-5 text-accent-blue" />
                </div>
                <div className="font-mono text-3xl font-bold text-text-primary text-glow-blue">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2000}
                  />
                </div>
                <div className="text-text-secondary text-sm mt-1">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

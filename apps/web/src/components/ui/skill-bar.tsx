"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SkillBarProps {
  name: string;
  proficiency: number;
  delay?: number;
}

export function SkillBar({ name, proficiency, delay = 0 }: SkillBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <div ref={ref} className="flex items-center gap-3 font-mono text-xs group">
      <span className="w-28 text-text-secondary truncate group-hover:text-accent-blue transition-colors">
        {name}
      </span>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-blue rounded-full"
            initial={{ width: 0 }}
            animate={inView ? { width: `${proficiency}%` } : { width: 0 }}
            transition={{
              delay,
              duration: 0.8,
              ease: "easeOut",
            }}
          />
        </div>
        <motion.span
          className="w-8 text-right text-text-muted tabular-nums"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          {proficiency}%
        </motion.span>
      </div>
    </div>
  );
}

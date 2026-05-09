"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineItem {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
}

export function InteractiveTimeline({ items }: { items: TimelineItem[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="relative">
      {/* Animated vertical line */}
      <motion.div
        className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border-primary origin-top"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <div className="space-y-4">
        {items.map((item, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <motion.div
              key={item.company}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="relative pl-8"
            >
              {/* Timeline dot */}
              <motion.div
                className={`absolute left-0 top-3 w-[16px] h-[16px] rounded-full border-2 transition-colors duration-300 ${
                  isExpanded
                    ? "border-accent-blue bg-accent-blue/20 shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                    : "border-border-hover bg-bg-primary"
                }`}
                animate={
                  isExpanded
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 1 }
                }
                transition={
                  isExpanded
                    ? { duration: 2, repeat: Infinity }
                    : {}
                }
              />

              {/* Card */}
              <button
                onClick={() =>
                  setExpandedIndex(isExpanded ? null : i)
                }
                className="w-full text-left card-surface p-4 hover:border-border-hover transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-mono font-bold text-text-primary text-sm">
                      {item.role}
                    </h3>
                    <p className="text-accent-blue text-xs mt-0.5">
                      {item.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-mono whitespace-nowrap">
                      {item.period}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-text-secondary text-sm mt-3 mb-3 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
                        <span>{item.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tech.map((t, ti) => (
                          <motion.div
                            key={t}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: ti * 0.03,
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                            }}
                          >
                            <Badge>{t}</Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

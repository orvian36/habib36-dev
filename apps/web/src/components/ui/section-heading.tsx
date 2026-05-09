"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  label,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <span className="font-mono text-sm text-accent-blue tracking-wider uppercase">
        {"// "}
        {label}
      </span>
      <h2 className="heading-mono text-3xl md:text-4xl text-text-primary mt-2">
        {title}
      </h2>
      {description && (
        <p className="text-text-secondary mt-3 max-w-2xl mx-auto text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
}

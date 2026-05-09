"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="heading-mono text-3xl md:text-4xl text-text-primary mb-4">
            Let&apos;s build something{" "}
            <span className="text-accent-blue">together</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
            Looking for a full-stack engineer who actually ships AI systems?
            I&apos;m open to freelance projects, full-time roles, and interesting
            collaborations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/contact" size="lg">
              <Mail className="w-4 h-4" />
              Get in touch
            </Button>
            <Button href="/resume" variant="secondary" size="lg">
              View resume
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

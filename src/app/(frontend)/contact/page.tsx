"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  GitFork,
  Link2,
  Mail,
  Code2,
  Trophy,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/data";

const socialLinks = [
  {
    icon: GitFork,
    label: "GitHub",
    href: siteConfig.github,
    handle: "@habib36",
  },
  {
    icon: Link2,
    label: "LinkedIn",
    href: siteConfig.linkedin,
    handle: "/in/habib36",
  },
  {
    icon: Code2,
    label: "LeetCode",
    href: siteConfig.leetcode,
    handle: "habib36",
  },
  {
    icon: Trophy,
    label: "Codeforces",
    href: siteConfig.codeforces,
    handle: "habib36",
  },
  {
    icon: Mail,
    label: "Email",
    href: `mailto:${siteConfig.email}`,
    handle: siteConfig.email,
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only — backend will handle form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Contact"
          title="Get in Touch"
          description="Have a project idea, want to collaborate, or just want to say hi? I'd love to hear from you."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, name: e.target.value }))
                  }
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={formState.message}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, message: e.target.value }))
                  }
                  required
                  rows={5}
                  placeholder="Tell me about your project or just say hi..."
                  className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 focus:ring-1 focus:ring-accent-blue/20 transition-all resize-none"
                />
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-accent-green font-mono text-sm py-3"
                >
                  <CheckCircle className="w-4 h-4" />
                  Message sent! I&apos;ll get back to you soon.
                </motion.div>
              ) : (
                <Button type="submit" size="lg" className="w-full">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              )}
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Info card */}
            <div className="card-surface p-6">
              <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-4">
                Let&apos;s Connect
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                I&apos;m currently open to freelance projects, full-time
                opportunities, and interesting collaborations in AI and
                full-stack development.
              </p>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4 text-text-muted" />
                Bangladesh (UTC+6)
              </div>
              <div className="flex items-center gap-2 text-sm text-accent-green mt-2">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                Available for new projects
              </div>
            </div>

            {/* Social links */}
            <div className="card-surface p-6">
              <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-4">
                Find Me Online
              </h3>
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-accent-blue/5 transition-all group"
                  >
                    <link.icon className="w-5 h-5 text-text-muted group-hover:text-accent-blue transition-colors" />
                    <div>
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-xs text-text-muted">{link.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

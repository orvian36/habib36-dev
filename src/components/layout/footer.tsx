import Link from "next/link";
import { GitFork, Link2, Mail, Code2, Trophy } from "lucide-react";
import { siteConfig, navLinks } from "@/lib/data";

const socialLinks = [
  { icon: GitFork, href: siteConfig.github, label: "GitHub" },
  { icon: Link2, href: siteConfig.linkedin, label: "LinkedIn" },
  { icon: Code2, href: siteConfig.leetcode, label: "LeetCode" },
  { icon: Trophy, href: siteConfig.codeforces, label: "Codeforces" },
  { icon: Mail, href: `mailto:${siteConfig.email}`, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-primary bg-bg-secondary/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="font-mono font-bold text-lg">
              <span className="text-text-primary">habib36</span>
              <span className="text-accent-blue">.dev</span>
            </Link>
            <p className="text-text-secondary text-sm mt-3 max-w-xs">
              Full-stack engineer building production AI systems. This portfolio
              is itself a demonstration of those skills.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-blue text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-4">
              Connect
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-primary flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs font-mono">
            &copy; {new Date().getFullYear()} Habibur Rahman. Built with Next.js
            + Payload CMS.
          </p>
          <p className="text-text-muted text-xs font-mono">
            <span className="text-accent-green">&#9679;</span> All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

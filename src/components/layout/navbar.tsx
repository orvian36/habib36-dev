"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal, MessageSquare } from "lucide-react";
import { navLinks } from "@/lib/data";

export function Navbar({ onChatToggle }: { onChatToggle?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-primary/80 backdrop-blur-xl border-b border-border-primary shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <Terminal className="w-5 h-5 text-accent-blue group-hover:text-accent-green transition-colors" />
          <span className="font-mono font-bold text-text-primary group-hover:text-accent-blue transition-colors">
            habib36
          </span>
          <span className="font-mono text-accent-blue">.dev</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-mono transition-colors rounded-md ${
                  isActive
                    ? "text-accent-blue"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 bg-accent-blue/10 border border-accent-blue/20 rounded-md"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
          {onChatToggle && (
            <button
              onClick={onChatToggle}
              className="ml-2 p-2 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 rounded-md transition-all"
              aria-label="Toggle AI chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-bg-primary/95 backdrop-blur-xl border-b border-border-primary overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 font-mono text-sm rounded-lg transition-colors ${
                      isActive
                        ? "text-accent-blue bg-accent-blue/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                    }`}
                  >
                    <span className="text-text-muted mr-2">{">"}</span>
                    {link.label}
                  </Link>
                );
              })}
              {onChatToggle && (
                <button
                  onClick={() => {
                    onChatToggle();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 font-mono text-sm rounded-lg text-accent-blue hover:bg-accent-blue/10 transition-colors"
                >
                  <span className="text-text-muted mr-2">{">"}</span>
                  AI Chat
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

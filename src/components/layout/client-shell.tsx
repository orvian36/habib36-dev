"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { PageTransition } from "@/components/ui/page-transition";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Preloader } from "./preloader";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="scanline-overlay flex flex-col min-h-screen">
      <Preloader />
      <ScrollProgress />
      <CustomCursor />
      <Navbar onChatToggle={() => setChatOpen((o) => !o)} />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <PageTransition>{children}</PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen((o) => !o)} />
    </div>
  );
}

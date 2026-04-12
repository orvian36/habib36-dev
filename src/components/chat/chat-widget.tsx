"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User,
  Minus,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; type: string; url: string }[];
}

const defaultSuggestions = [
  "What's his strongest tech stack?",
  "Tell me about his work experience",
  "What has he built recently?",
];

export function ChatWidget({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm Habibur's AI assistant. I've read all his blog posts, project docs, and resume. Ask me anything about his work!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (frontend only - backend will replace this)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Thanks for your question! The AI chatbot backend isn't connected yet — this is a frontend preview. Once the RAG pipeline is live, I'll be able to answer questions about Habibur's experience, projects, and skills using his actual content as my knowledge base.",
        sources: [
          { title: "About Habibur", type: "page", url: "/about" },
          { title: "Projects", type: "page", url: "/projects" },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating toggle button (visible when chat is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onToggle}
            className="fixed bottom-6 right-6 z-50 p-4 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full hover:bg-accent-blue/20 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all animate-pulse-glow"
            aria-label="Open AI chat"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] flex flex-col bg-bg-secondary border border-border-primary rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary bg-bg-tertiary/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent-blue/10">
                  <Sparkles className="w-4 h-4 text-accent-blue" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-text-primary">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-accent-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggle}
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggle}
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-accent-blue/10 flex items-center justify-center mt-0.5">
                      <Bot className="w-4 h-4 text-accent-blue" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-accent-blue/10 border border-accent-blue/20 text-text-primary"
                        : "bg-bg-tertiary border border-border-primary text-text-secondary"
                    } rounded-xl px-3.5 py-2.5 text-sm`}
                  >
                    <p>{msg.content}</p>

                    {/* Source chips */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border-primary">
                        {msg.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-accent-blue bg-accent-blue/10 rounded-full hover:bg-accent-blue/20 transition-colors"
                          >
                            [{i + 1}] {src.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Feedback buttons for assistant messages */}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
                      <div className="flex gap-1 mt-2">
                        <button className="p-1 text-text-muted hover:text-accent-green transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-text-muted hover:text-accent-orange transition-colors">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-bg-tertiary border border-border-primary flex items-center justify-center mt-0.5">
                      <User className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent-blue" />
                  </div>
                  <div className="bg-bg-tertiary border border-border-primary rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" />
                      <span
                        className="w-2 h-2 rounded-full bg-text-muted animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-text-muted animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {defaultSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="px-2.5 py-1 text-xs font-mono text-text-secondary border border-border-primary rounded-full hover:text-accent-blue hover:border-accent-blue/30 hover:bg-accent-blue/5 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border-primary">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about Habibur..."
                  className="flex-1 px-3.5 py-2.5 bg-bg-tertiary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2.5 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-lg hover:bg-accent-blue/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-text-muted text-center mt-2 font-mono">
                AI may make mistakes. Verify important details.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

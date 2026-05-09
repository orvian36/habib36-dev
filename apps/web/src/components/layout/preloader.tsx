"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const lines = [
  "> Initializing habib36.dev...",
  "> Loading modules...",
  "> Compiling portfolio... done",
  "> System ready.",
];

export function Preloader() {
  const [show, setShow] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on first visit
    if (sessionStorage.getItem("preloaded")) {
      setDismissed(true);
      return;
    }
    setShow(true);

    // Animate lines
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), 200 + i * 300)
      );
    });

    // Animate progress (on line 2)
    timers.push(
      setTimeout(() => {
        const start = performance.now();
        function animateProgress(now: number) {
          const elapsed = now - start;
          const p = Math.min(elapsed / 800, 1);
          setProgress(Math.floor(p * 100));
          if (p < 1) requestAnimationFrame(animateProgress);
        }
        requestAnimationFrame(animateProgress);
      }, 500)
    );

    // Dismiss after sequence
    timers.push(
      setTimeout(() => {
        sessionStorage.setItem("preloaded", "1");
        setShow(false);
      }, 1700)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("preloaded", "1");
    setShow(false);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] bg-bg-primary flex items-center justify-center cursor-pointer"
        >
          <div className="font-mono text-sm space-y-2 max-w-md px-6">
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  i === lines.length - 1
                    ? "text-accent-green"
                    : "text-text-secondary"
                }
              >
                {line}
                {/* Show progress bar on line 2 */}
                {i === 1 && (() => {
                  const filled = Math.max(0, Math.min(10, Math.floor(progress / 10)));
                  return (
                    <span className="ml-2 text-accent-blue">
                      {"█".repeat(filled)}
                      {"░".repeat(10 - filled)}
                      {" "}
                      {Math.max(0, Math.min(100, progress))}%
                    </span>
                  );
                })()}
              </motion.div>
            ))}
            {visibleLines > 0 && (
              <div className="text-text-muted text-xs mt-4 animate-pulse">
                Click anywhere to skip
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

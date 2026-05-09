"use client";

import { useRef, useState, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDeg?: number;
}

export function TiltCard({
  children,
  className = "",
  tiltDeg = 6,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState("");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -tiltDeg;
      const rotateY = ((x - centerX) / centerX) * tiltDeg;

      setTransform(
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      );
      setGlare(
        `radial-gradient(circle at ${x}px ${y}px, rgba(0,212,255,0.08) 0%, transparent 60%)`
      );
    },
    [tiltDeg]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("");
    setGlare("");
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        transform: transform || "perspective(800px) rotateX(0deg) rotateY(0deg)",
        transition: transform ? "none" : "transform 0.4s ease-out",
        willChange: "transform",
      }}
    >
      {/* Spotlight overlay */}
      {glare && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
          style={{ background: glare }}
        />
      )}
      {children}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface ThemeColors {
  particle: string;
  lineRgb: [number, number, number];
  lineMaxOpacity: number;
}

const DARK_COLORS: ThemeColors = {
  particle: "rgba(0, 212, 255, 0.3)",
  lineRgb: [0, 212, 255],
  lineMaxOpacity: 0.1,
};

const LIGHT_COLORS: ThemeColors = {
  particle: "rgba(2, 132, 168, 0.55)",
  lineRgb: [2, 132, 168],
  lineMaxOpacity: 0.35,
};

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const colorsRef = useRef<ThemeColors>(DARK_COLORS);

  useEffect(() => {
    colorsRef.current = resolvedTheme === "light" ? LIGHT_COLORS : DARK_COLORS;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let particles: Particle[] = [];
    let initialized = false;
    const PARTICLE_COUNT = 110;
    const CONNECTION_DIST = 130;

    function setupCanvas(): boolean {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      if (w === 0 || h === 0) return false;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.scale(dpr, dpr);
      return true;
    }

    function initParticles() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
    }

    function tryInit(): boolean {
      if (initialized) return true;
      if (setupCanvas()) {
        initParticles();
        initialized = true;
        return true;
      }
      return false;
    }

    function draw() {
      if (!tryInit()) {
        // Canvas has no layout yet — keep polling each frame.
        animId = requestAnimationFrame(draw);
        return;
      }

      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      const { particle: particleColor, lineRgb, lineMaxOpacity } = colorsRef.current;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = lineMaxOpacity * (1 - dist / CONNECTION_DIST);
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(${lineRgb.join(",")}, ${opacity})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = particleColor;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    // ResizeObserver fires once the canvas gets its first non-zero box,
    // and again on every layout change (URL bar collapse on mobile, rotation, etc).
    let lastW = 0;
    let lastH = 0;
    const ro = new ResizeObserver(() => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      if (!initialized) {
        tryInit();
      } else if (w > 0 && h > 0) {
        setupCanvas();
        initParticles();
      }
    });
    ro.observe(canvas);

    draw();

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        draw();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

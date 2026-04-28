"use client";

const icons = [
  { label: "React", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z", top: "10%", left: "8%", delay: 0, duration: 10 },
  { label: "Python", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", top: "15%", right: "10%", delay: 2, duration: 12 },
  { label: "Docker", path: "M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z", bottom: "20%", left: "5%", delay: 4, duration: 14 },
  { label: "TypeScript", path: "M3 3h18v18H3V3zm9 14v-4H9v-2h8v2h-3v4h-2z", top: "60%", right: "7%", delay: 1, duration: 11 },
  { label: "Node", path: "M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 9v6l-8 4-8-4V9l8-4.82z", bottom: "15%", right: "15%", delay: 3, duration: 13 },
  { label: "DB", path: "M12 2C8 2 4 3.5 4 5.5v13C4 20.5 8 22 12 22s8-1.5 8-3.5v-13C20 3.5 16 2 12 2zm0 2c3.87 0 6 1.25 6 1.5S15.87 7 12 7 6 5.75 6 5.5 8.13 4 12 4z", top: "40%", left: "3%", delay: 5, duration: 15 },
];

export function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {icons.map((icon) => (
        <div
          key={icon.label}
          className="floating-icon absolute opacity-[0.12]"
          style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
            bottom: icon.bottom,
            animation: `float ${icon.duration}s ease-in-out infinite`,
            animationDelay: `${icon.delay}s`,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-blue)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={icon.path} />
          </svg>
        </div>
      ))}
    </div>
  );
}

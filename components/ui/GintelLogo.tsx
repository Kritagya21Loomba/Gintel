"use client";

import { useEffect, useState } from "react";

interface GintelLogoProps {
  size?: number;
  className?: string;
}

export function GintelLogo({ size = 32, className = "" }: GintelLogoProps) {
  // A clean "G" formed from a broken circuit ring:
  // — outer arc that doesn't close (open at the right like a C)
  // — a horizontal crossbar extending inward at midpoint
  // — small node dots at the terminals
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.36;        // main arc radius
  const sw = s * 0.075;      // stroke width
  const gap = 28;            // degrees of arc left open at the right (top-right terminal)

  // Arc: starts at gap/2 degrees from top-right, goes counter-clockwise almost full circle
  const startDeg = -gap / 2;  // top-right opening start
  const endDeg = gap / 2;     // top-right opening end (going the long way around)

  const toRad = (d: number) => (d * Math.PI) / 180;
  const px = (deg: number) => cx + r * Math.cos(toRad(deg));
  const py = (deg: number) => cy + r * Math.sin(toRad(deg));

  // The long arc goes from startDeg, clockwise (large arc), to endDeg
  const x1 = px(startDeg);
  const y1 = py(startDeg);
  const x2 = px(endDeg);
  const y2 = py(endDeg);

  // Crossbar: horizontal line from the 0° (right) point inward to center-right
  const crossY = cy;                        // vertical midpoint
  const crossX1 = cx + r;                  // outer edge (3 o'clock)
  const crossX2 = cx + r * 0.18;           // terminates near centre

  // The 3 o'clock point on the arc (where crossbar meets arc)
  const midX = px(0);
  const midY = py(0);

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id="logo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main arc — open at top-right, clockwise large arc */}
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`}
        stroke="#00ff88"
        strokeWidth={sw}
        strokeLinecap="square"
        filter="url(#logo-glow)"
      />

      {/* Crossbar — horizontal from arc's 3 o'clock inward */}
      <line
        x1={crossX1}
        y1={crossY}
        x2={crossX2}
        y2={crossY}
        stroke="#00ff88"
        strokeWidth={sw}
        strokeLinecap="square"
        filter="url(#logo-glow)"
      />

      {/* Terminal node at top opening (start) */}
      <circle cx={x1} cy={y1} r={sw * 0.8} fill="#00ff88" opacity="0.9" />
      {/* Terminal node at bottom opening (end) */}
      <circle cx={x2} cy={y2} r={sw * 0.8} fill="#00ff88" opacity="0.9" />
      {/* Terminal node at crossbar inner end */}
      <circle cx={crossX2} cy={crossY} r={sw * 0.8} fill="#00ff88" opacity="0.9" />
    </svg>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"enter" | "pulse" | "exit">("enter");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressInterval); return 100; }
        return p + 2;
      });
    }, 25);

    const pulseTimer = setTimeout(() => setPhase("pulse"), 400);
    const exitTimer  = setTimeout(() => setPhase("exit"),  1600);
    const doneTimer  = setTimeout(() => onComplete(),      2100);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(pulseTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${
        phase === "exit" ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial ambient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,255,136,0.05) 0%, transparent 70%)" }}
      />

      <div
        className={`relative flex flex-col items-center gap-7 transition-all duration-500 ${
          phase === "enter" ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Logo with slow-spin orbit ring */}
        <div className="relative" style={{ width: 100, height: 100 }}>
          {/* Orbit ring */}
          <svg
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "4s" }}
            width={100} height={100} viewBox="0 0 100 100"
          >
            <circle
              cx="50" cy="50" r="46"
              stroke="#00ff88" strokeWidth="0.75" fill="none"
              strokeDasharray="12 10" opacity="0.25"
            />
          </svg>

          {/* Logo centered */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              filter: phase === "pulse"
                ? "drop-shadow(0 0 12px rgba(0,255,136,0.7)) drop-shadow(0 0 28px rgba(0,255,136,0.3))"
                : "none",
              transition: "filter 0.6s ease",
            }}
          >
            <GintelLogo size={56} />
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-mono font-bold tracking-[0.45em] text-lg"
            style={{
              color: "#00ff88",
              textShadow: phase === "pulse" ? "0 0 18px rgba(0,255,136,0.5)" : "none",
              transition: "text-shadow 0.6s ease",
            }}
          >
            GINTEL
          </span>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: "var(--muted)" }}>
            GITHUB INTELLIGENCE LAYER
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-40 h-px overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #00cc6a, #00ff88)",
              boxShadow: "0 0 6px rgba(0,255,136,0.5)",
            }}
          />
        </div>

        <span className="font-mono text-[10px] tracking-widest animate-pulse" style={{ color: "var(--muted)" }}>
          INITIALIZING...
        </span>
      </div>
    </div>
  );
}

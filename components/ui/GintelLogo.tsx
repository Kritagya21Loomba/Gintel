"use client";

import { useEffect, useState } from "react";

interface GintelLogoProps {
  size?: number;
  className?: string;
}

// The mark: a clean geometric "G" — two concentric arcs (outer 3/4, inner half)
// forming a modern monogram. Smooth, refined, zero circuit-board energy.
// Think: a compass rose collapsed into a letter. Animated on mount.
export function GintelLogo({ size = 32, className = "" }: GintelLogoProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const c = size / 2;
  const R = size * 0.42;   // outer arc radius
  const r = size * 0.26;   // inner arc radius
  const sw = size * 0.08;  // stroke weight

  // Outer arc: 270° — open at top-right (starts at ~135° goes clockwise to ~45°)
  const outerCirc = 2 * Math.PI * R;
  const outerDash = outerCirc * 0.75; // 270° of 360°
  const outerGap = outerCirc * 0.25;

  // Inner arc: 180° — the "shelf" of the G, bottom half
  const innerCirc = 2 * Math.PI * r;
  const innerDash = innerCirc * 0.5;
  const innerGap = innerCirc * 0.5;

  // Crossbar: horizontal line from inner-right edge to outer-right edge, at midpoint
  const crossY = c;
  const crossX1 = c + r;   // inner right
  const crossX2 = c + R;   // outer right

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={`g-glow-${size}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={size * 0.06} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#g-glow-${size})`}>
        {/* Outer arc — 270°, rotated so gap is at top-right */}
        <circle
          cx={c} cy={c} r={R}
          stroke="#00ff88"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${outerDash} ${outerGap}`}
          strokeDashoffset={mounted ? 0 : outerCirc}
          fill="none"
          style={{
            transform: `rotate(135deg)`,
            transformOrigin: `${c}px ${c}px`,
            transition: mounted ? "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          }}
        />

        {/* Inner arc — 180°, bottom half */}
        <circle
          cx={c} cy={c} r={r}
          stroke="#00ff88"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${innerDash} ${innerGap}`}
          strokeDashoffset={mounted ? 0 : innerCirc}
          fill="none"
          style={{
            transform: `rotate(0deg)`,
            transformOrigin: `${c}px ${c}px`,
            transition: mounted ? "stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s" : "none",
          }}
        />

        {/* Crossbar */}
        <line
          x1={mounted ? crossX1 : crossX2}
          y1={crossY}
          x2={crossX2}
          y2={crossY}
          stroke="#00ff88"
          strokeWidth={sw}
          strokeLinecap="round"
          style={{ transition: mounted ? "x1 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s" : "none" }}
        />
      </g>
    </svg>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"enter" | "draw" | "glow" | "exit">("enter");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("draw"), 100);
    const t2 = setTimeout(() => setPhase("glow"), 900);
    const t3 = setTimeout(() => setPhase("exit"), 1800);
    const t4 = setTimeout(() => onComplete(), 2300);

    const iv = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(iv); return 100; } return p + 2; });
    }, 28);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearInterval(iv); };
  }, [onComplete]);

  // Large animated G for the loader — same mark, bigger
  const size = 96;
  const c = size / 2;
  const R = size * 0.42;
  const r = size * 0.26;
  const sw = size * 0.075;
  const outerCirc = 2 * Math.PI * R;
  const outerDash = outerCirc * 0.75;
  const outerGap = outerCirc * 0.25;
  const innerCirc = 2 * Math.PI * r;
  const innerDash = innerCirc * 0.5;
  const innerGap = innerCirc * 0.5;
  const crossX1 = c + r;
  const crossX2 = c + R;
  const crossY = c;

  const isDrawing = phase !== "enter";
  const isGlowing = phase === "glow" || phase === "exit";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${phase === "exit" ? "opacity-0 scale-[1.04]" : "opacity-100 scale-100"
        }`}
      style={{ background: "var(--bg)" }}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "linear-gradient(rgba(0,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.05) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />

      {/* Radial ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none" style={{
        background: "radial-gradient(ellipse, rgba(0,255,136,0.04) 0%, transparent 70%)",
      }} />

      <div className={`flex flex-col items-center gap-8 transition-all duration-500 ${phase === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}>

        {/* Mark */}
        <div style={{ position: "relative", width: size, height: size }}>
          {/* Slow rotating orbit ring — subtle */}
          <svg
            width={size} height={size} viewBox={`0 0 ${size} ${size}`}
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "8s", opacity: 0.18 }}
          >
            <circle cx={c} cy={c} r={R + sw} stroke="#00ff88" strokeWidth="0.5" fill="none" strokeDasharray="4 12" />
          </svg>

          {/* The G mark */}
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ overflow: "visible" }} className="absolute inset-0">
            <defs>
              <filter id="loader-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation={isGlowing ? 5 : 2} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#loader-glow)" style={{ transition: "filter 0.6s ease" }}>
              <circle
                cx={c} cy={c} r={R}
                stroke="#00ff88" strokeWidth={sw} strokeLinecap="round" fill="none"
                strokeDasharray={`${outerDash} ${outerGap}`}
                strokeDashoffset={isDrawing ? 0 : outerCirc}
                style={{
                  transform: `rotate(135deg)`,
                  transformOrigin: `${c}px ${c}px`,
                  transition: "stroke-dashoffset 0.65s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
              <circle
                cx={c} cy={c} r={r}
                stroke="#00ff88" strokeWidth={sw} strokeLinecap="round" fill="none"
                strokeDasharray={`${innerDash} ${innerGap}`}
                strokeDashoffset={isDrawing ? 0 : innerCirc}
                style={{
                  transformOrigin: `${c}px ${c}px`,
                  transition: "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1) 0.2s",
                }}
              />
              <line
                x1={isDrawing ? crossX1 : crossX2} y1={crossY}
                x2={crossX2} y2={crossY}
                stroke="#00ff88" strokeWidth={sw} strokeLinecap="round"
                style={{ transition: "x1 0.35s cubic-bezier(0.4,0,0.2,1) 0.4s" }}
              />
            </g>
          </svg>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1.5">
          <span
            className="font-mono font-bold tracking-[0.5em] text-xl"
            style={{
              color: "#00ff88",
              textShadow: isGlowing ? "0 0 24px rgba(0,255,136,0.5), 0 0 48px rgba(0,255,136,0.2)" : "none",
              transition: "text-shadow 0.7s ease",
            }}
          >
            GINTEL
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--muted)" }}>
            Github Intelligence Layer
          </span>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-36 h-px overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00cc6a, #00ff88)",
                boxShadow: "0 0 8px rgba(0,255,136,0.4)",
              }}
            />
          </div>
          <span className="font-mono text-[9px] tracking-widest animate-pulse" style={{ color: "var(--muted)" }}>
            INITIALIZING
          </span>
        </div>
      </div>
    </div>
  );
}
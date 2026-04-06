"use client";

import { useEffect, useState } from "react";

interface GintelLogoProps {
  size?: number;
  className?: string;
}

export function GintelLogo({ size = 32, className = "" }: GintelLogoProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const c = size / 2;
  const R = size * 0.42;
  const r = size * 0.26;
  const sw = size * 0.08;

  const outerCirc = 2 * Math.PI * R;
  const outerDash = outerCirc * 0.75;
  const outerGap = outerCirc * 0.25;
  const innerCirc = 2 * Math.PI * r;
  const innerDash = innerCirc * 0.5;
  const innerGap = innerCirc * 0.5;

  const crossX1 = c + r;
  const crossX2 = c + R;
  const crossY = c;

  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={`g-glow-${size}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={size * 0.06} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter={`url(#g-glow-${size})`}>
        <circle cx={c} cy={c} r={R} stroke="#00ff88" strokeWidth={sw} strokeLinecap="round" fill="none"
          strokeDasharray={`${outerDash} ${outerGap}`}
          strokeDashoffset={mounted ? 0 : outerCirc}
          style={{
            transform: `rotate(135deg)`, transformOrigin: `${c}px ${c}px`,
            transition: mounted ? "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" : "none"
          }}
        />
        <circle cx={c} cy={c} r={r} stroke="#00ff88" strokeWidth={sw} strokeLinecap="round" fill="none"
          strokeDasharray={`${innerDash} ${innerGap}`}
          strokeDashoffset={mounted ? 0 : innerCirc}
          style={{
            transformOrigin: `${c}px ${c}px`,
            transition: mounted ? "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1) 0.15s" : "none"
          }}
        />
        <line x1={mounted ? crossX1 : crossX2} y1={crossY} x2={crossX2} y2={crossY}
          stroke="#00ff88" strokeWidth={sw} strokeLinecap="round"
          style={{ transition: mounted ? "x1 0.4s cubic-bezier(0.4,0,0.2,1) 0.3s" : "none" }}
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
  const [phase, setPhase] = useState<"enter" | "draw" | "glow" | "text" | "exit">("enter");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Logo draws from t=100ms
    const t1 = setTimeout(() => setPhase("draw"), 100);
    // Glow pulses at t=900ms (draw complete)
    const t2 = setTimeout(() => setPhase("glow"), 900);
    // Text slides in at t=1100ms
    const t3 = setTimeout(() => setPhase("text"), 1150);
    // Exit fade at t=2400ms
    const t4 = setTimeout(() => setPhase("exit"), 2400);
    // Unmount at t=2900ms
    const t5 = setTimeout(() => onComplete(), 2900);

    const iv = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(iv); return 100; } return p + 1.6; });
    }, 28);

    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); clearInterval(iv); };
  }, [onComplete]);

  const size = 140;
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
  const isGlowing = phase === "glow" || phase === "text" || phase === "exit";
  const showText = phase === "text" || phase === "exit";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-600 ${phase === "exit" ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100"
        }`}
      style={{ background: "var(--bg)", transitionDuration: "500ms" }}
    >
      {/* Grid */}
      <div className="absolute inset-0 opacity-25" style={{
        backgroundImage: "linear-gradient(rgba(0,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.05) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />
      {/* Radial ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{
        background: "radial-gradient(ellipse, rgba(0,255,136,0.05) 0%, transparent 65%)",
      }} />

      <div className={`flex flex-col items-center gap-10 transition-all duration-500 ${phase === "enter" ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
        }`}>

        {/* ── Large logo mark ── */}
        <div style={{ position: "relative", width: size, height: size }}>
          {/* Orbit ring */}
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "10s", opacity: 0.12 }}
          >
            <circle cx={c} cy={c} r={R + sw + 4} stroke="#00ff88" strokeWidth="0.8" fill="none" strokeDasharray="5 14" />
          </svg>

          {/* G mark */}
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
            fill="none" className="absolute inset-0" style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="loader-glow-main" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation={isGlowing ? 7 : 2.5} result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g filter="url(#loader-glow-main)" style={{ transition: "filter 0.7s ease" }}>
              <circle cx={c} cy={c} r={R} stroke="#00ff88" strokeWidth={sw} strokeLinecap="round" fill="none"
                strokeDasharray={`${outerDash} ${outerGap}`}
                strokeDashoffset={isDrawing ? 0 : outerCirc}
                style={{
                  transform: `rotate(135deg)`, transformOrigin: `${c}px ${c}px`,
                  transition: "stroke-dashoffset 0.65s cubic-bezier(0.4,0,0.2,1)"
                }}
              />
              <circle cx={c} cy={c} r={r} stroke="#00ff88" strokeWidth={sw} strokeLinecap="round" fill="none"
                strokeDasharray={`${innerDash} ${innerGap}`}
                strokeDashoffset={isDrawing ? 0 : innerCirc}
                style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1) 0.2s" }}
              />
              <line x1={isDrawing ? crossX1 : crossX2} y1={crossY} x2={crossX2} y2={crossY}
                stroke="#00ff88" strokeWidth={sw} strokeLinecap="round"
                style={{ transition: "x1 0.35s cubic-bezier(0.4,0,0.2,1) 0.38s" }}
              />
            </g>
          </svg>
        </div>

        {/* ── Wordmark — appears after logo draws, slides up ── */}
        <div
          className="flex flex-col items-center gap-3 overflow-hidden"
          style={{
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Big impact wordmark */}
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "52px",
              letterSpacing: "0.15em",
              lineHeight: 1,
              color: "#00ff88",
              textShadow: isGlowing
                ? "0 0 30px rgba(0,255,136,0.5), 0 0 80px rgba(0,255,136,0.15)"
                : "none",
              transition: "text-shadow 0.8s ease",
            }}
          >
            GINTEL
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.35em",
            color: "var(--muted)",
            textTransform: "uppercase",
          }}>
            Github Intelligence Layer
          </span>
        </div>

        {/* ── Progress bar ── */}
        <div
          className="flex flex-col items-center gap-3"
          style={{
            opacity: showText ? 1 : 0,
            transition: "opacity 0.4s ease 0.15s",
          }}
        >
          <div style={{ width: 160, height: 1, background: "var(--border)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #00cc6a, #00ff88)",
              boxShadow: "0 0 8px rgba(0,255,136,0.4)",
              transition: "width 0.075s linear",
            }} />
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: "var(--muted)",
          }} className="animate-pulse">
            INITIALIZING
          </span>
        </div>
      </div>
    </div>
  );
}
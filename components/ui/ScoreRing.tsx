"use client";

import { scoreColor } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 120, strokeWidth = 8 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* SVG ring — no box, pure radial glow via filter inside SVG */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)", overflow: "visible" }}
      >
        <defs>
          {/* Radial glow filter — keeps the glow circular, never rectangular */}
          <filter id={`ring-glow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2d3d"
          strokeWidth={strokeWidth}
        />

        {/* Progress — glow via SVG filter, not box-shadow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#ring-glow-${score})`}
          style={{
            transition: "stroke-dashoffset 1.5s ease",
          }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute flex flex-col items-center">
        <span
          className="font-display font-extrabold text-3xl leading-none"
          style={{ color }}
        >
          {score}
        </span>
        <span className="font-mono text-xs text-muted mt-1">/ 100</span>
      </div>
    </div>
  );
}
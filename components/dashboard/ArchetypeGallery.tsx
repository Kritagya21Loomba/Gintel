"use client";

import { Lock, Trophy, Sparkles, ShieldCheck, ChevronRight, Zap } from "lucide-react";
import type { ArchetypeScore } from "@/types";

interface ArchetypeGalleryProps {
  archetypes: ArchetypeScore[];
}

// Archetype-specific accent colors for visual identity
const ARCHETYPE_COLORS: Record<string, { primary: string; glow: string; bg: string }> = {
  "The Architect": { primary: "#00ff88", glow: "rgba(0,255,136,0.15)", bg: "rgba(0,255,136,0.05)" },
  "The Craftsman": { primary: "#38bdf8", glow: "rgba(56,189,248,0.15)", bg: "rgba(56,189,248,0.05)" },
  "The Builder": { primary: "#f5a623", glow: "rgba(245,166,35,0.15)", bg: "rgba(245,166,35,0.05)" },
  "The Researcher": { primary: "#a78bfa", glow: "rgba(167,139,250,0.15)", bg: "rgba(167,139,250,0.05)" },
  "The Collaborator": { primary: "#fb7185", glow: "rgba(251,113,133,0.15)", bg: "rgba(251,113,133,0.05)" },
  "The Generalist": { primary: "#34d399", glow: "rgba(52,211,153,0.15)", bg: "rgba(52,211,153,0.05)" },
  "The Specialist": { primary: "#fbbf24", glow: "rgba(251,191,36,0.15)", bg: "rgba(251,191,36,0.05)" },
};

const DEFAULT_COLOR = { primary: "var(--accent)", glow: "var(--accent-glow)", bg: "var(--accent-muted)" };

function getColor(name: string) {
  return ARCHETYPE_COLORS[name] || DEFAULT_COLOR;
}

export function ArchetypeGallery({ archetypes }: ArchetypeGalleryProps) {
  const sorted = [...archetypes].sort((a, b) => {
    if (a.level > 0 && b.level === 0) return -1;
    if (a.level === 0 && b.level > 0) return 1;
    return b.score - a.score;
  });

  const unlockedCount = sorted.filter(a => a.level > 0).length;
  const primaryArchetype = sorted.find(a => a.level > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <span className="font-mono text-[10px] text-muted tracking-widest uppercase">Identity Classification System</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-text mb-2">
            Archetype Database
          </h2>
          <p className="font-body text-sm text-text-dim max-w-2xl">
            Your GitHub portfolio is continuously evaluated against specialized industry roles. Unlock archetypes by writing code, using dependencies, and building diverse architectures.
          </p>
        </div>

        {/* Progress widget */}
        <div className="flex-shrink-0 border border-border rounded-xl p-4 bg-surface/50 min-w-[160px] text-center">
          <div className="font-display font-extrabold text-3xl text-accent mb-0.5">
            {unlockedCount}<span className="text-muted text-lg font-mono">/{sorted.length}</span>
          </div>
          <div className="font-mono text-[10px] text-muted tracking-widest">UNLOCKED</div>
          <div className="w-full h-1 bg-border rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-1000"
              style={{ width: `${(unlockedCount / sorted.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary archetype spotlight — if any unlocked */}
      {primaryArchetype && (
        <PrimaryArchetypeSpotlight archetype={primaryArchetype} />
      )}

      {/* All archetypes grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-[10px] text-muted tracking-widest uppercase">All Archetypes</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((arch, idx) => (
            <ArchetypeCard key={arch.name} arch={arch} rank={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PrimaryArchetypeSpotlight({ archetype }: { archetype: ArchetypeScore }) {
  const color = getColor(archetype.name);

  return (
    <div
      className="relative rounded-2xl border overflow-hidden p-6 md:p-8"
      style={{
        borderColor: color.primary + "40",
        background: `linear-gradient(135deg, ${color.bg} 0%, rgba(13,17,23,0.8) 60%)`,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
        style={{ background: color.glow }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Left: identity */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: color.primary }} />
            <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: color.primary }}>
              Primary Archetype — Active Classification
            </span>
          </div>
          <h3 className="font-display font-extrabold text-3xl md:text-4xl mb-3" style={{ color: color.primary }}>
            {archetype.name}
          </h3>
          <p className="font-body text-sm text-text-dim max-w-md leading-relaxed">
            {archetype.description}
          </p>
        </div>

        {/* Right: score circle */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="relative" style={{ width: 100, height: 100 }}>
            <svg width={100} height={100} viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
              <defs>
                <filter id="spotlight-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke={color.primary}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - archetype.score / 100)}
                filter="url(#spotlight-glow)"
                style={{ transition: "stroke-dashoffset 1.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-extrabold text-2xl" style={{ color: color.primary }}>
                {archetype.score}
              </span>
              <span className="font-mono text-[10px] text-muted">MATCH</span>
            </div>
          </div>
          <LevelBadge level={archetype.level} score={archetype.score} color={color.primary} size="lg" />
        </div>
      </div>
    </div>
  );
}

function ArchetypeCard({ arch, rank }: { arch: ArchetypeScore; rank: number }) {
  const isUnlocked = arch.level > 0;
  const color = getColor(arch.name);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 group ${isUnlocked
        ? "bg-surface/50 hover:border-accent/30"
        : "bg-bg/40 border-border/20 opacity-60 hover:opacity-90"
        }`}
      style={isUnlocked ? { borderColor: color.primary + "25" } : {}}
    >
      {/* Subtle bg glow on hover for unlocked */}
      {isUnlocked && (
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: color.glow }}
        />
      )}

      {/* Top row */}
      <div className="flex justify-between items-start mb-3 relative">
        <div className="flex items-center gap-2">
          {/* Color dot = archetype identity indicator */}
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: isUnlocked ? color.primary : "#4a5568", boxShadow: isUnlocked ? `0 0 6px ${color.primary}` : "none" }}
          />
          <h3 className={`font-display font-bold text-base ${isUnlocked ? "text-text" : "text-text-dim"}`}>
            {arch.name}
          </h3>
        </div>

        {isUnlocked ? (
          <LevelBadge level={arch.level} score={arch.score} color={color.primary} size="sm" />
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-surface rounded-md border border-border/30">
            <Lock size={11} className="text-muted" />
            <span className="font-mono text-[10px] uppercase text-muted tracking-wide">Locked</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="font-body text-xs text-text-dim leading-relaxed min-h-[48px] mb-4 relative">
        {arch.description}
      </p>

      {/* Footer: progress or unlock hint */}
      <div className="pt-4 border-t border-border/30 relative">
        {isUnlocked ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-muted tracking-widest">CONFIDENCE</span>
              <span className="font-mono text-xs font-bold" style={{ color: color.primary }}>
                {arch.score}%
              </span>
            </div>
            <div className="w-full h-1 bg-bg rounded-full overflow-hidden border border-border/30">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${arch.score}%`,
                  background: `linear-gradient(90deg, ${color.primary}99, ${color.primary})`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <ChevronRight size={11} className="text-amber flex-shrink-0" />
              <span className="font-mono text-[10px] text-amber tracking-widest uppercase">Unlock Requirement</span>
            </div>
            <p className="font-mono text-[11px] text-text-dim leading-snug pl-4">{arch.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LevelBadge({
  level,
  color,
}: {
  level: number;
  score: number;
  color: string;
  size?: "sm" | "lg"; // kept for API compat, no longer used
}) {
  const baseClass = "flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider text-[10px] border";

  if (level === 3) {
    return (
      <div className={`${baseClass} bg-amber/10 text-amber border-amber/25`}>
        <Trophy size={11} fill="currentColor" />
        <span>Lvl 3 Master</span>
      </div>
    );
  }

  if (level === 2) {
    return (
      <div className={`${baseClass} bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/25`}>
        <Sparkles size={11} />
        <span>Lvl 2 Pro</span>
      </div>
    );
  }

  return (
    <div
      className={baseClass}
      style={{
        background: color + "15",
        color: color,
        borderColor: color + "30",
      }}
    >
      <ShieldCheck size={11} />
      <span>Lvl 1 Basic</span>
    </div>
  );
}
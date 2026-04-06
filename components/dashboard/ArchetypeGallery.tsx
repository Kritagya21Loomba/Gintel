"use client";

import { Lock, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import type { ArchetypeScore } from "@/types";

interface ArchetypeGalleryProps {
  archetypes: ArchetypeScore[];
}

export function ArchetypeGallery({ archetypes }: ArchetypeGalleryProps) {
  // Sort mechanically for the gallery: Unlocked first, then by score descending
  const sorted = [...archetypes].sort((a, b) => {
    if (a.level > 0 && b.level === 0) return -1;
    if (a.level === 0 && b.level > 0) return 1;
    return b.score - a.score;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col mb-4">
        <h2 className="font-display font-extrabold text-2xl text-text mb-2">Archetype Database</h2>
        <p className="font-body text-sm text-text-dim max-w-2xl">
          Your GitHub portfolio is continuously evaluated against specialized industry roles. Write code, leverage specific dependencies, and build diverse architectures to unlock them all.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((arch) => {
          const isUnlocked = arch.level > 0;
          
          return (
            <div 
              key={arch.name} 
              className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
                isUnlocked 
                  ? "bg-surface/50 border-border hover:border-accent/40 shadow-sm" 
                  : "bg-bg/40 border-border/20 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
              }`}
            >
              {/* Top Row: Name and Level/Lock info */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`font-display font-bold text-lg ${isUnlocked ? 'text-text' : 'text-text-dim'}`}>
                    {arch.name}
                  </h3>
                </div>
                
                {isUnlocked ? (
                   <LevelBadge level={arch.level} score={arch.score} />
                ) : (
                   <div className="flex items-center gap-1.5 px-2 py-1 bg-surface rounded-md border border-border/40">
                      <Lock size={12} className="text-muted" />
                      <span className="font-mono text-[10px] uppercase text-muted tracking-wide">Locked</span>
                   </div>
                )}
              </div>

              {/* Description body */}
              <p className="font-body text-xs text-text-dim leading-relaxed min-h-[50px] mb-4">
                {arch.description}
              </p>

              {/* Progress or Hint */}
              <div className="mt-auto pt-4 border-t border-border/40">
                {isUnlocked ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-muted tracking-widest">CONFIDENCE SCORE</span>
                      <span className="font-mono text-xs font-bold text-accent">{arch.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-border/50">
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-out" 
                        style={{ width: `${arch.score}%` }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] text-amber tracking-widest uppercase">Unlock Requirement</span>
                    <p className="font-mono text-[11px] text-text-dim leading-snug">
                      {arch.hint}
                    </p>
                  </div>
                )}
              </div>

              {/* Background ambient glow if level 3 */}
              {arch.level === 3 && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber/10 blur-[40px] rounded-full pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LevelBadge({ level, score }: { level: number, score: number }) {
  if (level === 3) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber/10 text-amber border border-amber/20 rounded-md">
        <Trophy size={12} fill="currentColor" />
        <span className="font-mono text-[10px] uppercase tracking-wide font-bold">Lvl 3 Master</span>
      </div>
    );
  }
  
  if (level === 2) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/20 rounded-md">
        <Sparkles size={12} />
        <span className="font-mono text-[10px] uppercase tracking-wide font-bold">Lvl 2 Pro</span>
      </div>
    );
  }

  // Level 1
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 text-accent border border-accent/20 rounded-md">
      <ShieldCheck size={12} />
      <span className="font-mono text-[10px] uppercase tracking-wide font-bold">Lvl 1 Basic</span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, Trophy, Sparkles, ShieldCheck } from "lucide-react";
import type { ArchetypeScore } from "@/types";

export interface UnlockEvent {
  type: "NEW_UNLOCK" | "LEVEL_UP";
  archetype: ArchetypeScore;
  previousLevel?: number;
}

interface AchievementModalProps {
  events: UnlockEvent[];
  onClose: () => void;
}

export function AchievementModal({ events, onClose }: AchievementModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!events || events.length === 0) return null;

  const event = events[currentIndex];
  const { type, archetype, previousLevel } = event;

  const handleNext = () => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500"
        style={{
          boxShadow: `0 0 80px -20px ${
            archetype.level === 3 ? "rgba(245, 166, 35, 0.4)" : 
            archetype.level === 2 ? "rgba(167, 139, 250, 0.4)" : 
            "rgba(0, 255, 136, 0.3)"
          }`
        }}
      >
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-text hover:bg-white/5 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8 pb-10 flex flex-col items-center text-center relative z-10">
          
          <div className="mb-6 transform hover:scale-110 transition-transform duration-500">
             {archetype.level === 3 ? (
               <div className="w-24 h-24 rounded-full bg-amber/10 flex items-center justify-center border-4 border-amber/30 text-amber shadow-[0_0_40px_-5px_rgba(245,166,35,0.4)]">
                 <Trophy size={48} fill="currentColor" />
               </div>
             ) : archetype.level === 2 ? (
               <div className="w-24 h-24 rounded-full bg-[#a78bfa]/10 flex items-center justify-center border-4 border-[#a78bfa]/30 text-[#a78bfa] shadow-[0_0_40px_-5px_rgba(167,139,250,0.4)]">
                 <Sparkles size={48} />
               </div>
             ) : (
               <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center border-4 border-accent/30 text-accent shadow-[0_0_40px_-5px_rgba(0,255,136,0.3)]">
                 <ShieldCheck size={48} />
               </div>
             )}
          </div>

          <div className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2 border border-border/50 px-3 py-1 rounded-full bg-bg/50">
            {type === "NEW_UNLOCK" ? "New Archetype Unlocked" : `Rank Up! Level ${previousLevel} → ${archetype.level}`}
          </div>

          <h2 className="font-display font-extrabold text-3xl text-text mb-3">
            {archetype.name}
          </h2>

          <p className="font-body text-sm text-text-dim leading-relaxed mb-8 max-w-sm">
            {archetype.description}
          </p>

          <button
            onClick={handleNext}
            className="w-full bg-bg border border-border/80 text-text font-mono text-sm font-bold py-3 px-6 rounded-xl hover:bg-surface hover:text-accent transition-all uppercase tracking-wider"
          >
            {currentIndex < events.length - 1 ? `Next Unlock (${currentIndex + 1}/${events.length})` : "Continue to Dashboard"}
          </button>
        </div>
        
        {/* Progress bar for multiple events */}
        {events.length > 1 && (
           <div className="absolute bottom-0 left-0 h-1 bg-border w-full">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / events.length) * 100}%` }}
              />
           </div>
        )}
      </div>
    </div>
  );
}

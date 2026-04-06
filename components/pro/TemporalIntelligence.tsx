"use client";

import type { TemporalProfile } from "@/types/pro";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Moon, Calendar } from "lucide-react";

interface Props {
  temporal: TemporalProfile;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TRAJECTORY_META = {
  accelerating: { icon: <TrendingUp size={14} />, color: "text-accent", label: "Accelerating" },
  stable: { icon: <Minus size={14} />, color: "text-sky", label: "Stable" },
  decelerating: { icon: <TrendingDown size={14} />, color: "text-amber", label: "Decelerating" },
  sporadic: { icon: <AlertTriangle size={14} />, color: "text-red-400", label: "Sporadic" },
};

export function TemporalIntelligence({ temporal }: Props) {
  const traj = TRAJECTORY_META[temporal.growthTrajectory];

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border/30 rounded-lg p-3">
          <div className="font-mono text-sm text-accent font-bold">{temporal.peakWindow}</div>
          <div className="font-mono text-[10px] text-muted">Peak Productivity</div>
        </div>
        <div className="border border-border/30 rounded-lg p-3">
          <div className={`font-mono text-sm font-bold flex items-center gap-1.5 ${traj.color}`}>
            {traj.icon} {traj.label}
          </div>
          <div className="font-mono text-[10px] text-muted">Growth Trajectory</div>
        </div>
        <div className="border border-border/30 rounded-lg p-3">
          <div className="font-mono text-sm text-text font-bold flex items-center gap-1.5">
            <Moon size={12} /> {temporal.nightOwlScore}%
          </div>
          <div className="font-mono text-[10px] text-muted">Night Owl Score</div>
        </div>
        <div className="border border-border/30 rounded-lg p-3">
          <div className="font-mono text-sm text-text font-bold flex items-center gap-1.5">
            <Calendar size={12} /> {temporal.weekendWarriorScore}%
          </div>
          <div className="font-mono text-[10px] text-muted">Weekend Commits</div>
        </div>
      </div>

      {/* Productivity heatmap (7×24 grid) */}
      <div>
        <span className="font-mono text-xs text-muted mb-2 block">ACTIVITY HEATMAP (Day × Hour)</span>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Hour headers */}
            <div className="flex ml-8 mb-1">
              {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
                <div key={h} className="font-mono text-[8px] text-muted" style={{ width: `${100/8}%` }}>
                  {h === 0 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h-12}p`}
                </div>
              ))}
            </div>
            {/* Rows */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-1 mb-0.5">
                <span className="font-mono text-[9px] text-muted w-7 text-right">{day}</span>
                <div className="flex flex-1 gap-px">
                  {Array.from({ length: 24 }).map((_, hourIdx) => {
                    const cell = temporal.productivityHeatmap.find(
                      (c) => c.dayOfWeek === dayIdx && c.hourOfDay === hourIdx
                    );
                    const intensity = cell?.intensity || 0;
                    return (
                      <div
                        key={hourIdx}
                        className="flex-1 aspect-square rounded-sm"
                        style={{
                          backgroundColor: intensity > 0
                            ? `rgba(0, 255, 136, ${Math.max(0.08, intensity * 0.9)})`
                            : "rgba(255,255,255,0.03)",
                        }}
                        title={`${day} ${hourIdx}:00 — ${Math.round(intensity * 100)}%`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech timeline */}
      {temporal.techTimeline.length > 0 && (
        <div>
          <span className="font-mono text-xs text-muted mb-2 block">TECHNOLOGY TIMELINE</span>
          <div className="space-y-1.5">
            {temporal.techTimeline.slice(0, 8).map((tech, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  tech.status === "active" ? "bg-accent" : tech.status === "graduated" ? "bg-amber" : "bg-muted"
                }`} />
                <span className="font-mono text-xs text-text w-24">{tech.technology}</span>
                <span className="font-mono text-[10px] text-muted">{tech.firstSeen}</span>
                <div className="flex-1 h-px bg-border relative">
                  <div className={`absolute inset-y-0 left-0 ${
                    tech.status === "active" ? "bg-accent/30" : tech.status === "graduated" ? "bg-amber/20" : "bg-muted/20"
                  }`} style={{ width: "100%" }} />
                </div>
                <span className="font-mono text-[10px] text-muted">{tech.lastSeen}</span>
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded capitalize ${
                  tech.status === "active" ? "text-accent bg-accent/10" :
                  tech.status === "graduated" ? "text-amber bg-amber/10" : "text-muted bg-surface"
                }`}>{tech.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Burnout signals */}
      <div className={`border rounded-lg p-3 ${
        temporal.burnoutSignals.risk === "high" ? "border-red-500/30 bg-red-500/[0.03]" :
        temporal.burnoutSignals.risk === "moderate" ? "border-amber/30 bg-amber/[0.03]" :
        "border-accent/15 bg-accent/[0.02]"
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-mono text-xs font-bold ${
            temporal.burnoutSignals.risk === "high" ? "text-red-400" :
            temporal.burnoutSignals.risk === "moderate" ? "text-amber" : "text-accent"
          }`}>
            BURNOUT RISK: {temporal.burnoutSignals.risk.toUpperCase()}
          </span>
        </div>
        {temporal.burnoutSignals.signals.map((s, i) => (
          <p key={i} className="font-mono text-[10px] text-text-dim leading-relaxed">• {s}</p>
        ))}
      </div>
    </div>
  );
}

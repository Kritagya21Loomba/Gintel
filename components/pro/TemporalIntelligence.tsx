"use client";

import { useState } from "react";
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

function fmt12(h: number) {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  day: string;
  hour: number;
  intensity: number;
}

export function TemporalIntelligence({ temporal }: Props) {
  const traj = TRAJECTORY_META[temporal.growthTrajectory];
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, day: "", hour: 0, intensity: 0,
  });

  function handleCellEnter(e: React.MouseEvent, day: string, hour: number, intensity: number) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      day, hour, intensity,
    });
  }

  function handleCellLeave() {
    setTooltip(t => ({ ...t, visible: false }));
  }

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

      {/* Heatmap with custom tooltip */}
      <div>
        <span className="font-mono text-xs text-muted mb-2 block">ACTIVITY HEATMAP (Day × Hour)</span>
        <div className="overflow-x-auto">
          <div className="min-w-[500px] heatmap-container relative">
            {/* Hour headers */}
            <div className="flex ml-8 mb-1">
              {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
                <div key={h} className="font-mono text-[8px] text-muted" style={{ width: `${100 / 8}%` }}>
                  {fmt12(h)}
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
                        className="flex-1 aspect-square rounded-sm transition-transform duration-75 hover:scale-125 hover:z-10 relative"
                        style={{
                          backgroundColor: intensity > 0
                            ? `rgba(0,255,136,${Math.max(0.08, intensity * 0.9)})`
                            : "rgba(255,255,255,0.03)",
                        }}
                        onMouseEnter={(e) => handleCellEnter(e, day, hourIdx, intensity)}
                        onMouseLeave={handleCellLeave}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Custom tooltip — fixed so it's never clipped by overflow containers */}
            {tooltip.visible && (
              <div
                className="fixed z-[9999] pointer-events-none"
                style={{
                  left: tooltip.x,
                  top: tooltip.y - 8,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div
                  className="rounded-lg px-3 py-2 text-left shadow-lg"
                  style={{
                    background: "#0d1117",
                    border: "1px solid rgba(0,255,136,0.2)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(0,255,136,0.08)",
                    minWidth: 130,
                  }}
                >
                  <div className="font-mono text-[10px] text-accent font-bold mb-0.5">
                    {tooltip.day} · {fmt12(tooltip.hour)}
                  </div>
                  <div className="font-mono text-[11px] text-text">
                    {tooltip.intensity === 0
                      ? "No activity"
                      : `${Math.round(tooltip.intensity * 100)}% activity`}
                  </div>
                  {tooltip.intensity > 0.7 && (
                    <div className="font-mono text-[9px] text-accent/60 mt-0.5">Peak window</div>
                  )}
                </div>
                {/* Arrow */}
                <div className="flex justify-center">
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid rgba(0,255,136,0.2)",
                  }} />
                </div>
              </div>
            )}
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
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tech.status === "active" ? "bg-accent" : tech.status === "graduated" ? "bg-amber" : "bg-muted"
                  }`} />
                <span className="font-mono text-xs text-text w-24 flex-shrink-0">{tech.technology}</span>
                <span className="font-mono text-[10px] text-muted flex-shrink-0">{tech.firstSeen}</span>
                <div className="flex-1 h-px bg-border relative">
                  <div className={`absolute inset-y-0 left-0 ${tech.status === "active" ? "bg-accent/30" : tech.status === "graduated" ? "bg-amber/20" : "bg-muted/20"
                    }`} style={{ width: "100%" }} />
                </div>
                <span className="font-mono text-[10px] text-muted flex-shrink-0">{tech.lastSeen}</span>
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded capitalize flex-shrink-0 ${tech.status === "active" ? "text-accent bg-accent/10" :
                  tech.status === "graduated" ? "text-amber bg-amber/10" : "text-muted bg-surface"
                  }`}>{tech.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Burnout signals */}
      <div className={`border rounded-lg p-3 ${temporal.burnoutSignals.risk === "high" ? "border-red-500/30 bg-red-500/[0.03]" :
        temporal.burnoutSignals.risk === "moderate" ? "border-amber/30 bg-amber/[0.03]" :
          "border-accent/15 bg-accent/[0.02]"
        }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-mono text-xs font-bold ${temporal.burnoutSignals.risk === "high" ? "text-red-400" :
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
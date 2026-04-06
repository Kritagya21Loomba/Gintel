"use client";

import type { MarketPosition, TechTrajectory } from "@/types/pro";
import { Target, DollarSign, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Props {
  market: MarketPosition;
  trajectory: TechTrajectory;
}

const TIER_META = {
  "below-market": { label: "Below Market", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  "market": { label: "Market Rate", color: "#8892a4", bg: "rgba(136,146,164,0.08)", border: "rgba(136,146,164,0.2)" },
  "above-market": { label: "Above Market", color: "#00ff88", bg: "rgba(0,255,136,0.06)", border: "rgba(0,255,136,0.2)" },
  "premium": { label: "Premium", color: "#f5a623", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.2)" },
};

// Horizontal percentile bars — styled like a data viz panel
function PercentilePanel({ percentiles }: { percentiles: MarketPosition["percentiles"] }) {
  const rows = [
    { label: "Overall", value: percentiles.overall, key: "overall" },
    { label: "Commit Activity", value: percentiles.commits, key: "commits" },
    { label: "Star Velocity", value: percentiles.starVelocity, key: "star" },
    { label: "Repo Quality", value: percentiles.repoQuality, key: "quality" },
    { label: "Language Breadth", value: percentiles.languageBreadth, key: "lang" },
  ];

  function barColor(v: number) {
    if (v >= 75) return "#00ff88";
    if (v >= 50) return "#38bdf8";
    if (v >= 25) return "#f5a623";
    return "#f87171";
  }

  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.key}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs text-text-dim">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold" style={{ color: barColor(row.value) }}>
                p{row.value}
              </span>
              <span className="font-mono text-[9px] text-muted">
                {row.value >= 75 ? "top 25%" : row.value >= 50 ? "top 50%" : row.value >= 25 ? "top 75%" : "lower quartile"}
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${row.value}%`,
                background: `linear-gradient(90deg, ${barColor(row.value)}60, ${barColor(row.value)})`,
                boxShadow: `0 0 8px ${barColor(row.value)}40`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Role readiness — horizontal card list with clear visual hierarchy
function RoleReadinessPanel({ roles }: { roles: MarketPosition["roleReadiness"] }) {
  function color(v: number) {
    if (v >= 70) return { text: "#00ff88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.2)" };
    if (v >= 40) return { text: "#f5a623", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.2)" };
    return { text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" };
  }

  return (
    <div className="space-y-2">
      {roles.slice(0, 6).map((role, i) => {
        const c = color(role.readiness);
        return (
          <div key={i} className="border rounded-xl p-3 relative overflow-hidden" style={{ borderColor: c.border, background: c.bg }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="font-mono text-xs font-bold text-text">{role.role}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-sm font-bold" style={{ color: c.text }}>{role.readiness}%</span>
                {role.readiness >= 70
                  ? <CheckCircle2 size={12} style={{ color: c.text }} />
                  : <Clock size={12} className="text-muted" />}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${role.readiness}%`, background: c.text, opacity: 0.7 }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-muted">{role.timeToReady}</span>
              {role.missingSignals.length > 0 && (
                <div className="flex gap-1 flex-wrap justify-end">
                  {role.missingSignals.slice(0, 2).map((s, j) => (
                    <span key={j} className="font-mono text-[8px] text-red-400/60 bg-red-400/5 border border-red-400/10 px-1.5 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Market fit — 4 quadrant skill map
function SkillMap({ marketFit }: { marketFit: TechTrajectory["marketFit"] }) {
  const quadrants = [
    { label: "Hot Skills", items: marketFit.hotSkills, color: "#00ff88", icon: <TrendingUp size={11} /> },
    { label: "Rising", items: marketFit.risingSkills, color: "#38bdf8", icon: <TrendingUp size={11} /> },
    { label: "Gap Skills", items: marketFit.gapSkills, color: "#f5a623", icon: <XCircle size={11} /> },
    { label: "Declining", items: marketFit.obsoleteRisk, color: "#f87171", icon: <XCircle size={11} /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {quadrants.map(q => (
        <div key={q.label} className="rounded-xl border p-3"
          style={{ borderColor: q.color + "20", background: q.color + "05" }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span style={{ color: q.color }}>{q.icon}</span>
            <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: q.color }}>
              {q.label.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            {q.items.length > 0
              ? q.items.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: q.color, opacity: 0.6 }} />
                  <span className="font-mono text-[10px] text-text-dim">{s}</span>
                </div>
              ))
              : <span className="font-mono text-[10px] text-muted">—</span>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketPositioning({ market, trajectory }: Props) {
  const tier = TIER_META[market.compensationSignal.tier];

  return (
    <div className="space-y-6">

      {/* ── Top: compensation signal + percentiles ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Compensation signal — large prominent card */}
        <div className="rounded-xl border p-5 relative overflow-hidden"
          style={{ borderColor: tier.border, background: tier.bg }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
            style={{ background: tier.color + "20" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={14} style={{ color: tier.color }} />
              <span className="font-mono text-[10px] tracking-widest text-muted">COMPENSATION SIGNAL</span>
            </div>
            <div className="font-display font-bold text-3xl mb-3" style={{ color: tier.color }}>
              {tier.label}
            </div>
            <div className="space-y-1.5">
              {market.compensationSignal.drivers.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: tier.color, opacity: 0.6 }} />
                  <p className="font-mono text-[10px] text-text-dim leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Percentile panel */}
        <div className="rounded-xl border border-border/30 p-5 bg-surface/30">
          <div className="font-mono text-[10px] text-muted tracking-widest mb-4">PERCENTILE RANKINGS</div>
          <PercentilePanel percentiles={market.percentiles} />
        </div>
      </div>

      {/* ── Predicted direction ── */}
      <div className="rounded-xl border border-accent/15 p-5 bg-accent/[0.02]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Target size={14} className="text-accent" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-widest text-accent/60 mb-1">PREDICTED DIRECTION</div>
            <p className="font-display font-bold text-lg text-text mb-3">{trajectory.predictedPath.direction}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {trajectory.predictedPath.suggestedRoles.map((r, i) => (
                <span key={i} className="font-mono text-[10px] bg-accent/10 text-accent border border-accent/15 px-2.5 py-1 rounded-full">
                  {r}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted">Confidence</span>
              <div className="flex-1 max-w-[120px] h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent/60 rounded-full transition-all duration-1000"
                  style={{ width: `${trajectory.predictedPath.confidence}%` }} />
              </div>
              <span className="font-mono text-[10px] font-bold text-accent">{trajectory.predictedPath.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Role readiness ── */}
      <div>
        <div className="font-mono text-[10px] text-muted tracking-widest mb-3">ROLE READINESS</div>
        <RoleReadinessPanel roles={market.roleReadiness} />
      </div>

      {/* ── Skill map ── */}
      <div>
        <div className="font-mono text-[10px] text-muted tracking-widest mb-3">SKILL MARKET MAP</div>
        <SkillMap marketFit={trajectory.marketFit} />
      </div>
    </div>
  );
}
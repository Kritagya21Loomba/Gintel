"use client";

import type { MarketPosition, TechTrajectory } from "@/types/pro";
import { Target, DollarSign, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Props {
  market: MarketPosition;
  trajectory: TechTrajectory;
}

const TIER_META = {
  "below-market": { label: "Below Market", color: "var(--red)",   bg: "rgba(var(--accent-rgb),0)",  border: "rgba(248,113,113,0.2)" },
  "market":       { label: "Market Rate",  color: "var(--muted)", bg: "rgba(136,146,164,0.08)",      border: "rgba(136,146,164,0.2)" },
  "above-market": { label: "Above Market", color: "var(--accent)", bg: "var(--accent-muted)",        border: "var(--accent-glow)" },
  "premium":      { label: "Premium",      color: "var(--amber)", bg: "rgba(245,166,35,0.08)",       border: "rgba(245,166,35,0.2)" },
};

function barColor(v: number): string {
  if (v >= 75) return "var(--accent)";
  if (v >= 50) return "var(--sky)";
  if (v >= 25) return "var(--amber)";
  return "var(--red)";
}

function roleColor(v: number) {
  if (v >= 70) return { text: "var(--accent)", bg: "var(--accent-muted)", border: "var(--accent-glow)" };
  if (v >= 40) return { text: "var(--amber)",  bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.2)" };
  return        { text: "var(--red)",   bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" };
}

function PercentilePanel({ percentiles }: { percentiles: MarketPosition["percentiles"] }) {
  const rows = [
    { label: "Overall",          value: percentiles.overall },
    { label: "Commit Activity",  value: percentiles.commits },
    { label: "Star Velocity",    value: percentiles.starVelocity },
    { label: "Repo Quality",     value: percentiles.repoQuality },
    { label: "Language Breadth", value: percentiles.languageBreadth },
  ];

  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs text-text-dim">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold" style={{ color: barColor(row.value) }}>p{row.value}</span>
              <span className="font-mono text-[9px] text-muted">
                {row.value >= 75 ? "top 25%" : row.value >= 50 ? "top 50%" : row.value >= 25 ? "top 75%" : "lower quartile"}
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${row.value}%`, background: barColor(row.value), opacity: 0.85 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleReadinessPanel({ roles }: { roles: MarketPosition["roleReadiness"] }) {
  return (
    <div className="space-y-2">
      {roles.slice(0, 6).map((role, i) => {
        const c = roleColor(role.readiness);
        return (
          <div key={i} className="border rounded-xl p-3 relative overflow-hidden"
            style={{ borderColor: c.border, background: c.bg }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="font-mono text-xs font-bold text-text">{role.role}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-sm font-bold" style={{ color: c.text }}>{role.readiness}%</span>
                {role.readiness >= 70
                  ? <CheckCircle2 size={12} style={{ color: c.text }} />
                  : <Clock size={12} className="text-muted" />}
              </div>
            </div>
            <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${role.readiness}%`, background: c.text, opacity: 0.7 }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-muted">{role.timeToReady}</span>
              {role.missingSignals.length > 0 && (
                <div className="flex gap-1 flex-wrap justify-end">
                  {role.missingSignals.slice(0, 2).map((s, j) => (
                    <span key={j} className="font-mono text-[8px] text-red-400/60 bg-red-400/5 border border-red-400/10 px-1.5 py-0.5 rounded">{s}</span>
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

function SkillMap({ marketFit }: { marketFit: TechTrajectory["marketFit"] }) {
  const quadrants = [
    { label: "Hot Skills", items: marketFit.hotSkills,    color: "var(--accent)", icon: <TrendingUp size={11} /> },
    { label: "Rising",     items: marketFit.risingSkills, color: "var(--sky)",    icon: <TrendingUp size={11} /> },
    { label: "Gap Skills", items: marketFit.gapSkills,    color: "var(--amber)",  icon: <XCircle size={11} /> },
    { label: "Declining",  items: marketFit.obsoleteRisk, color: "var(--red)",    icon: <XCircle size={11} /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {quadrants.map(q => (
        <div key={q.label} className="rounded-xl border p-3"
          style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5 relative overflow-hidden"
          style={{ borderColor: tier.border, background: tier.bg }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
            style={{ background: "var(--accent-glow)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={14} style={{ color: tier.color }} />
              <span className="font-mono text-[10px] tracking-widest text-muted">COMPENSATION SIGNAL</span>
            </div>
            <div className="font-display font-bold text-3xl mb-3" style={{ color: tier.color }}>{tier.label}</div>
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

        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="font-mono text-[10px] text-muted tracking-widest mb-4">PERCENTILE RANKINGS</div>
          <PercentilePanel percentiles={market.percentiles} />
        </div>
      </div>

      <div className="rounded-xl border p-5" style={{ borderColor: "var(--accent-glow)", background: "var(--accent-muted)" }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-glow)" }}>
            <Target size={14} style={{ color: "var(--accent)" }} />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: "var(--accent)", opacity: 0.6 }}>PREDICTED DIRECTION</div>
            <p className="font-display font-bold text-lg text-text mb-3">{trajectory.predictedPath.direction}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {trajectory.predictedPath.suggestedRoles.map((r, i) => (
                <span key={i} className="font-mono text-[10px] px-2.5 py-1 rounded-full"
                  style={{ background: "var(--accent-muted)", color: "var(--accent)", border: "1px solid var(--accent-glow)" }}>
                  {r}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted">Confidence</span>
              <div className="flex-1 max-w-[120px] h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${trajectory.predictedPath.confidence}%`, background: "var(--accent)", opacity: 0.6 }} />
              </div>
              <span className="font-mono text-[10px] font-bold" style={{ color: "var(--accent)" }}>{trajectory.predictedPath.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] text-muted tracking-widest mb-3">ROLE READINESS</div>
        <RoleReadinessPanel roles={market.roleReadiness} />
      </div>

      <div>
        <div className="font-mono text-[10px] text-muted tracking-widest mb-3">SKILL MARKET MAP</div>
        <SkillMap marketFit={trajectory.marketFit} />
      </div>
    </div>
  );
}

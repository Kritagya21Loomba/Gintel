"use client";

import type { MarketPosition, TechTrajectory } from "@/types/pro";
import { TrendingUp, Target, DollarSign, Zap } from "lucide-react";

interface Props {
  market: MarketPosition;
  trajectory: TechTrajectory;
}

const TIER_META = {
  "below-market": { label: "Below Market", color: "text-red-400", bg: "bg-red-400" },
  "market": { label: "Market Rate", color: "text-text-dim", bg: "bg-text-dim" },
  "above-market": { label: "Above Market", color: "text-accent", bg: "bg-accent" },
  "premium": { label: "Premium", color: "text-amber", bg: "bg-amber" },
};

export function MarketPositioning({ market, trajectory }: Props) {
  const tier = TIER_META[market.compensationSignal.tier];

  return (
    <div className="space-y-5">
      {/* Percentile gauges */}
      <div>
        <span className="font-mono text-xs text-muted mb-3 block">PERCENTILE RANKINGS</span>
        <div className="space-y-3">
          {[
            { label: "Overall", value: market.percentiles.overall },
            { label: "Commit Activity", value: market.percentiles.commits },
            { label: "Star Velocity", value: market.percentiles.starVelocity },
            { label: "Repo Quality", value: market.percentiles.repoQuality },
            { label: "Language Breadth", value: market.percentiles.languageBreadth },
          ].map((p) => (
            <div key={p.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-text-dim">{p.label}</span>
                <span className={`font-mono text-xs font-bold ${
                  p.value >= 75 ? "text-accent" : p.value >= 50 ? "text-sky" : p.value >= 25 ? "text-amber" : "text-red-400"
                }`}>p{p.value}</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${p.value}%`,
                    backgroundColor: p.value >= 75 ? "#00ff88" : p.value >= 50 ? "#38bdf8" : p.value >= 25 ? "#f5a623" : "#f87171",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compensation signal */}
      <div className="border border-border/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={14} className={tier.color} />
          <span className={`font-mono text-sm font-bold ${tier.color}`}>{tier.label}</span>
          <span className="font-mono text-[10px] text-muted">COMPENSATION SIGNAL</span>
        </div>
        <div className="space-y-1">
          {market.compensationSignal.drivers.map((d, i) => (
            <p key={i} className="font-mono text-[10px] text-text-dim">• {d}</p>
          ))}
        </div>
      </div>

      {/* Career direction */}
      <div className="border border-accent/15 rounded-lg p-4 bg-accent/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-accent" />
          <span className="font-mono text-xs text-accent font-bold">PREDICTED DIRECTION</span>
        </div>
        <p className="font-mono text-sm text-text mb-2">{trajectory.predictedPath.direction}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {trajectory.predictedPath.suggestedRoles.map((r, i) => (
            <span key={i} className="font-mono text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded">
              {r}
            </span>
          ))}
        </div>
        <p className="font-mono text-[10px] text-muted">
          Confidence: {trajectory.predictedPath.confidence}%
        </p>
      </div>

      {/* Role readiness */}
      <div>
        <span className="font-mono text-xs text-muted mb-3 block">ROLE READINESS</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {market.roleReadiness.slice(0, 6).map((role, i) => (
            <div key={i} className="border border-border/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-text font-bold">{role.role}</span>
                <span className={`font-mono text-xs font-bold ${
                  role.readiness >= 70 ? "text-accent" : role.readiness >= 40 ? "text-amber" : "text-red-400"
                }`}>{role.readiness}%</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${role.readiness}%`,
                    backgroundColor: role.readiness >= 70 ? "#00ff88" : role.readiness >= 40 ? "#f5a623" : "#f87171",
                  }}
                />
              </div>
              <p className="font-mono text-[9px] text-muted">{role.timeToReady}</p>
              {role.missingSignals.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {role.missingSignals.slice(0, 3).map((s, j) => (
                    <span key={j} className="font-mono text-[8px] text-red-400/70 bg-red-400/5 px-1.5 py-0.5 rounded">
                      ✕ {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Market fit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Hot Skills", items: trajectory.marketFit.hotSkills, color: "text-accent", bg: "bg-accent/10" },
          { label: "Rising", items: trajectory.marketFit.risingSkills, color: "text-sky", bg: "bg-sky/10" },
          { label: "Gap Skills", items: trajectory.marketFit.gapSkills, color: "text-amber", bg: "bg-amber/10" },
          { label: "Declining", items: trajectory.marketFit.obsoleteRisk, color: "text-red-400", bg: "bg-red-400/10" },
        ].map((group) => (
          <div key={group.label} className="border border-border/30 rounded-lg p-3">
            <span className={`font-mono text-[10px] ${group.color} font-bold`}>{group.label}</span>
            <div className="mt-1.5 space-y-0.5">
              {group.items.length > 0 ? group.items.slice(0, 4).map((s, i) => (
                <div key={i} className="font-mono text-[10px] text-text-dim">{s}</div>
              )) : (
                <div className="font-mono text-[10px] text-muted">—</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

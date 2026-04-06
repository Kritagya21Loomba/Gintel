"use client";

import { useState } from "react";
import type { CollaborationProfile } from "@/types/pro";
import { Users, GitPullRequest, MessageSquare, GitFork, Cpu, Shield, Search, Star, GitMerge, Clock } from "lucide-react";

interface Props {
  collaboration: CollaborationProfile;
}

const STYLE_META: Record<string, { label: string; desc: string; icon: React.ReactNode; accentColor: string }> = {
  "solo-builder": { label: "Solo Builder", desc: "Ships independently — deep focus, high autonomy", icon: <Cpu size={18} />, accentColor: "#00ff88" },
  "team-player": { label: "Team Player", desc: "Balanced PRs and reviews — strong collaborative fit", icon: <Users size={18} />, accentColor: "#38bdf8" },
  "mentor": { label: "Mentor", desc: "High review activity + documentation — uplifts others", icon: <Shield size={18} />, accentColor: "#a78bfa" },
  "code-reviewer": { label: "Code Reviewer", desc: "Reviews outweigh PRs — quality gatekeeper", icon: <Search size={18} />, accentColor: "#f5a623" },
  "community-leader": { label: "Community Leader", desc: "High stars, forks, and followers — builds movements", icon: <Star size={18} />, accentColor: "#fb7185" },
};

// Radar chart for the 4 collaboration dimensions
function CollabRadar({
  prScore, issueScore, reviewScore, externalScore,
}: { prScore: number; issueScore: number; reviewScore: number; externalScore: number }) {
  const cx = 90, cy = 90, r = 64;
  const labels = ["PRs", "Issues", "Reviews", "External"];
  const values = [prScore, issueScore, reviewScore, externalScore];

  // 4 axes at 0, 90, 180, 270 degrees (top, right, bottom, left)
  const angles = [-90, 0, 90, 180].map(d => (d * Math.PI) / 180);

  const pts = (vals: number[], scale = 1) =>
    vals.map((v, i) => ({
      x: cx + Math.cos(angles[i]) * r * (v / 100) * scale,
      y: cy + Math.sin(angles[i]) * r * (v / 100) * scale,
    }));

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  const dataPoints = pts(values);
  const dataPath = toPath(dataPoints);

  // Grid rings at 25, 50, 75, 100%
  const rings = [25, 50, 75, 100];

  // Axis endpoints
  const axisEnds = angles.map(a => ({
    x: cx + Math.cos(a) * r,
    y: cy + Math.sin(a) * r,
  }));

  // Label positions (slightly beyond axis end)
  const labelPos = angles.map((a, i) => ({
    x: cx + Math.cos(a) * (r + 18),
    y: cy + Math.sin(a) * (r + 18),
    label: labels[i],
    value: values[i],
  }));

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" style={{ overflow: "visible" }}>
      {/* Grid rings */}
      {rings.map(pct => {
        const ringPts = angles.map(a => ({
          x: cx + Math.cos(a) * r * (pct / 100),
          y: cy + Math.sin(a) * r * (pct / 100),
        }));
        return (
          <polygon key={pct}
            points={ringPts.map(p => `${p.x},${p.y}`).join(" ")}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
        );
      })}

      {/* Axes */}
      {axisEnds.map((end, i) => (
        <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Data fill */}
      <path d={dataPath} fill="rgba(0,255,136,0.1)" stroke="#00ff88" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#00ff88"
          style={{ filter: "drop-shadow(0 0 3px rgba(0,255,136,0.8))" }} />
      ))}

      {/* Labels */}
      {labelPos.map((l, i) => (
        <text key={i} x={l.x} y={l.y}
          textAnchor="middle" dominantBaseline="middle"
          fill="#4a5568" fontSize="9" fontFamily="'JetBrains Mono', monospace"
          style={{ letterSpacing: "0.05em" }}
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

// Radial merge rate gauge
function MergeGauge({ rate }: { rate: number }) {
  const r = 36, sw = 7;
  const circ = 2 * Math.PI * r;
  const dash = circ * (rate / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
      <svg width={88} height={88} viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <defs>
          <filter id="gauge-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={44} cy={44} r={r} fill="none" stroke="#1e2d3d" strokeWidth={sw} />
        <circle cx={44} cy={44} r={r} fill="none" stroke="#00ff88" strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          filter="url(#gauge-glow)"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-base font-bold text-accent leading-none">{rate}%</span>
        <span className="font-mono text-[8px] text-muted mt-0.5">MERGED</span>
      </div>
    </div>
  );
}

export function CollaborationDNA({ collaboration }: Props) {
  const style = STYLE_META[collaboration.style] || STYLE_META["solo-builder"];

  // Normalise metrics into 0–100 scores for radar
  const prScore = Math.min(100, collaboration.prMetrics.totalPRs * 2);
  const issueScore = Math.min(100, collaboration.issueMetrics.issuesOpened * 3);
  const reviewScore = Math.min(100, collaboration.prMetrics.reviewsGiven * 4);
  const externalScore = Math.min(100, collaboration.externalContributions.length * 20);

  return (
    <div className="space-y-5">

      {/* ── Identity banner ── */}
      <div className="rounded-xl border p-5 relative overflow-hidden"
        style={{ borderColor: style.accentColor + "25", background: style.accentColor + "05" }}>
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
          style={{ background: style.accentColor + "18" }} />
        <div className="flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: style.accentColor + "15", border: `1px solid ${style.accentColor}30`, color: style.accentColor }}>
            {style.icon}
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: style.accentColor + "80" }}>
              COLLABORATION STYLE
            </div>
            <div className="font-display font-bold text-xl text-text">{style.label}</div>
            <div className="font-body text-sm text-text-dim mt-0.5">{style.desc}</div>
          </div>
        </div>
      </div>

      {/* ── Radar + Merge gauge side by side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Radar */}
        <div className="border border-border/30 rounded-xl p-4 bg-surface/30">
          <div className="font-mono text-[10px] text-muted tracking-widest mb-3">COLLABORATION DIMENSIONS</div>
          <div className="flex items-center justify-center">
            <CollabRadar
              prScore={prScore}
              issueScore={issueScore}
              reviewScore={reviewScore}
              externalScore={externalScore}
            />
          </div>
        </div>

        {/* Merge + key metrics */}
        <div className="border border-border/30 rounded-xl p-4 bg-surface/30 flex flex-col gap-4">
          <div className="font-mono text-[10px] text-muted tracking-widest">PULL REQUEST HEALTH</div>
          <div className="flex items-center gap-5">
            <MergeGauge rate={collaboration.prMetrics.mergeRate} />
            <div className="space-y-2">
              <Stat label="Total PRs" value={collaboration.prMetrics.totalPRs} />
              <Stat label="Avg PR Size" value={`${collaboration.prMetrics.avgPRSize} lines`} />
              <Stat label="Reviews Given" value={collaboration.prMetrics.reviewsGiven} />
              <Stat label="Reviews Received" value={collaboration.prMetrics.reviewsReceived} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Issue metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <GitPullRequest size={12} />, label: "Issues Opened", value: collaboration.issueMetrics.issuesOpened },
          { icon: <GitMerge size={12} />, label: "Issues Closed", value: collaboration.issueMetrics.issuesClosed },
          { icon: <Clock size={12} />, label: "Avg Response", value: `${collaboration.issueMetrics.avgResponseTimeHours}h` },
          { icon: <MessageSquare size={12} />, label: "Feature Requests", value: collaboration.issueMetrics.featureRequests },
        ].map(m => (
          <div key={m.label} className="border border-border/30 rounded-lg p-3">
            <div className="text-accent/50 mb-1.5">{m.icon}</div>
            <div className="font-mono text-lg font-bold text-text">{m.value}</div>
            <div className="font-mono text-[10px] text-muted">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Team signals bar ── */}
      <div className="border border-border/30 rounded-xl p-4 bg-surface/20">
        <div className="font-mono text-[10px] text-muted tracking-widest mb-4">TEAM SIGNALS</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="font-mono text-[10px] text-muted mb-1">COMMIT SIZE</div>
            <div className={`font-mono text-sm font-bold ${collaboration.teamSignals.averageCommitSize === "atomic" ? "text-accent" :
                collaboration.teamSignals.averageCommitSize === "medium" ? "text-sky" : "text-amber"
              }`}>
              {collaboration.teamSignals.averageCommitSize.charAt(0).toUpperCase() +
                collaboration.teamSignals.averageCommitSize.slice(1)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-muted mb-1">CONV. COMMITS</div>
            <div className={`font-mono text-sm font-bold ${collaboration.teamSignals.usesConventionalCommits ? "text-accent" : "text-text-dim"}`}>
              {collaboration.teamSignals.usesConventionalCommits ? "Yes" : "No"}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-muted mb-1">REVIEW SCORE</div>
            <div className="space-y-1 mt-1">
              <div className="flex justify-between">
                <span className="font-mono text-sm font-bold text-text">
                  {collaboration.teamSignals.codeReviewParticipation}%
                </span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-accent/60 transition-all duration-1000"
                  style={{ width: `${collaboration.teamSignals.codeReviewParticipation}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── External contributions ── */}
      {collaboration.externalContributions.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-muted tracking-widest mb-2">EXTERNAL CONTRIBUTIONS</div>
          <div className="space-y-1">
            {collaboration.externalContributions.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/10 last:border-0">
                <GitFork size={10} className="text-accent/50 flex-shrink-0" />
                <span className="font-mono text-xs text-text flex-1">{c.repo}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border/30 text-muted">{c.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-sm font-bold text-text">{value}</span>
      <span className="font-mono text-[10px] text-muted">{label}</span>
    </div>
  );
}
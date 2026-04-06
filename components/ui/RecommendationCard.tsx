import { AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { impactLabel } from "@/lib/utils";
import type { Recommendation } from "@/types";

const TYPE_CONFIG = {
  warning: {
    icon: <AlertTriangle size={14} />,
    color: "#f87171",
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.2)",
  },
  improvement: {
    icon: <TrendingUp size={14} />,
    color: "#f5a623",
    bg: "rgba(245,166,35,0.06)",
    border: "rgba(245,166,35,0.2)",
  },
  opportunity: {
    icon: <Lightbulb size={14} />,
    color: "#00ff88",
    bg: "rgba(0,255,136,0.06)",
    border: "rgba(0,255,136,0.2)",
  },
};

interface RecommendationCardProps {
  rec: Recommendation;
  index: number;
}

export function RecommendationCard({ rec, index }: RecommendationCardProps) {
  const cfg = TYPE_CONFIG[rec.type];
  const impact = impactLabel(rec.impact);

  return (
    <div
      className="rounded-lg p-4 stagger-child"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div className="flex items-start gap-3">
        <span style={{ color: cfg.color }} className="mt-0.5 flex-shrink-0">
          {cfg.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="font-display font-semibold text-sm text-text">{rec.title}</h4>
            <span
              className="font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
              style={{ color: impact.color, background: `${impact.color}15` }}
            >
              {impact.label}
            </span>
          </div>
          <p className="font-body text-xs text-text-dim leading-relaxed">{rec.description}</p>
        </div>
      </div>
    </div>
  );
}

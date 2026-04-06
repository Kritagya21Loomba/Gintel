"use client";

import { useState, useEffect } from "react";
import type { AnalysisResult } from "@/types";
import type { AdvancedAnalysisResult } from "@/types/pro";
import { runAdvancedAnalysis } from "@/lib/pro";
import { SectionCard } from "@/components/ui/SectionCard";
import { TemporalIntelligence } from "./TemporalIntelligence";
import { MarketPositioning } from "./MarketPositioning";
import { CollaborationDNA } from "./CollaborationDNA";
import {
  Loader2, Zap, ChevronDown, ChevronRight,
} from "lucide-react";

interface Props {
  analysis: AnalysisResult;
}

export function ProSection({ analysis }: Props) {
  const [data, setData] = useState<AdvancedAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Run synchronously — no async LLM calls
    const result = runAdvancedAnalysis(analysis);
    setData(result);
    setLoading(false);
  }, [analysis]);

  return (
    <div className="mt-8 mb-8">
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 mb-4"
      >
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
          <Zap size={12} className="text-accent" />
          <span className="font-mono text-xs text-accent font-bold tracking-widest">ADVANCED INTELLIGENCE</span>
        </div>
        {expanded ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
      </button>

      {loading && (
        <div className="border border-border rounded-lg p-8 text-center mb-6">
          <Loader2 size={24} className="text-accent animate-spin mx-auto mb-3" />
          <p className="font-mono text-sm text-text-dim">Computing advanced intelligence...</p>
        </div>
      )}

      {data && expanded && (
        <div className="space-y-6">
          {/* Temporal Intelligence */}
          <SectionCard title="Temporal Intelligence" badge="PATTERNS">
            <TemporalIntelligence temporal={data.temporal} />
          </SectionCard>

          {/* Collaboration DNA */}
          <SectionCard title="Collaboration DNA" badge="WORK STYLE">
            <CollaborationDNA collaboration={data.collaboration} />
          </SectionCard>

          {/* Market Positioning */}
          <SectionCard title="Market Positioning" badge="BENCHMARKS">
            <MarketPositioning market={data.market} trajectory={data.trajectory} />
          </SectionCard>
        </div>
      )}
    </div>
  );
}

"use client";

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { SkillRadarPoint } from "@/types";

interface SkillRadarProps { data: SkillRadarPoint[]; }

export function SkillRadar({ data }: SkillRadarProps) {
  const css = (v: string) => typeof window !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue(v).trim() : "";
  const accent  = css("--accent")   || "#00ff88";
  const border  = css("--border")   || "#1e2d3d";
  const textDim = css("--text-dim") || "#8892a4";
  const surface = css("--surface")  || "#0d1117";
  const text    = css("--text")     || "#e2e8f0";

  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={border} />
          <PolarAngleAxis dataKey="subject" tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fill: textDim }} />
          <Radar name="Score" dataKey="score" stroke={accent} fill={accent} fillOpacity={0.12} strokeWidth={1.5} />
          <Tooltip
            contentStyle={{ background: surface, border: `1px solid ${border}`, borderRadius: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: text }}
            formatter={(v: number) => [`${v}/100`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

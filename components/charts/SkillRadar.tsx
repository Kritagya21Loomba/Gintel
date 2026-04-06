"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SkillRadarPoint } from "@/types";

interface SkillRadarProps {
  data: SkillRadarPoint[];
}

export function SkillRadar({ data }: SkillRadarProps) {
  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#1e2d3d" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              fill: "#8892a4",
            }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#00ff88"
            fill="#00ff88"
            fillOpacity={0.12}
            strokeWidth={1.5}
          />
          <Tooltip
            contentStyle={{
              background: "#0d1117",
              border: "1px solid #1e2d3d",
              borderRadius: 6,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              color: "#e2e8f0",
            }}
            formatter={(v: number) => [`${v}/100`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

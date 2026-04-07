"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { WeeklyCommit } from "@/types";

interface CommitChartProps { data: WeeklyCommit[]; }

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-bright)",
      borderRadius: 6,
      padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    }}>
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "var(--text-dim)", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
        {payload[0].value} commits
      </p>
    </div>
  );
}

export function CommitChart({ data }: CommitChartProps) {
  const max = Math.max(...data.map((d) => d.commits));
  // Read CSS vars at render time for recharts (which needs static values)
  const accent   = typeof window !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()     : "#00ff88";
  const accentDim= typeof window !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--accent-dim").trim()  : "#00cc6a";
  const borderC  = typeof window !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--border").trim()      : "#1e2d3d";
  const mutedC   = typeof window !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--muted").trim()       : "#4a5568";

  return (
    <div style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
          <XAxis dataKey="week" tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, fill: mutedC }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, fill: mutedC }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-muted)" }} />
          <Bar dataKey="commits" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index}
                fill={entry.commits === max ? accent : entry.commits > max * 0.6 ? accentDim : borderC}
                fillOpacity={entry.commits === max ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

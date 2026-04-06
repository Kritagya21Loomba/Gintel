"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { WeeklyCommit } from "@/types";

interface CommitChartProps {
  data: WeeklyCommit[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #2d4a5e",
        borderRadius: 6,
        padding: "8px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#8892a4", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>
        {payload[0].value} commits
      </p>
    </div>
  );
}

export function CommitChart({ data }: CommitChartProps) {
  const max = Math.max(...data.map((d) => d.commits));

  return (
    <div style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
          <XAxis
            dataKey="week"
            tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, fill: "#4a5568" }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, fill: "#4a5568" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,255,136,0.06)" }}
          />
          <Bar dataKey="commits" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.commits === max
                    ? "#00ff88"
                    : entry.commits > max * 0.6
                    ? "#00cc6a"
                    : "#1e2d3d"
                }
                fillOpacity={entry.commits === max ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

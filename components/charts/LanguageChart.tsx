"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { LanguageStat } from "@/types";

interface LanguageChartProps {
  data: LanguageStat[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
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
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: entry.payload.color,
          }}
        />
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>
          {entry.name}
        </span>
      </div>
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e2e8f0" }}>
        {entry.value}%
      </p>
    </div>
  );
}

export function LanguageChart({ data }: LanguageChartProps) {
  return (
    <div className="flex flex-col gap-4">
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="percentage"
              nameKey="language"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.language}
                  fill={entry.color}
                  stroke="transparent"
                  style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((lang) => (
          <div key={lang.language} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: lang.color }}
              />
              <span className="font-mono text-xs text-text-dim">{lang.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                />
              </div>
              <span className="font-mono text-xs text-muted w-8 text-right">
                {lang.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

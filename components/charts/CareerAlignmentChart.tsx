"use client";

import type { CareerAlignment } from "@/types";

interface CareerAlignmentChartProps {
  data: CareerAlignment[];
}

export function CareerAlignmentChart({ data }: CareerAlignmentChartProps) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((item, i) => (
        <div key={item.role} className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-dim w-28 flex-shrink-0">{item.role}</span>
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bar-animated"
              style={{
                width: `${item.score}%`,
                backgroundColor: item.color,
                boxShadow: `0 0 6px ${item.color}60`,
                "--target-width": `${item.score}%`,
                "--delay": `${0.1 + i * 0.08}s`,
              } as React.CSSProperties}
            />
          </div>
          <span
            className="font-mono text-xs font-bold w-8 text-right"
            style={{ color: item.color }}
          >
            {item.score}
          </span>
        </div>
      ))}
    </div>
  );
}

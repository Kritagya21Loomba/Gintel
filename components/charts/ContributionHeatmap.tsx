"use client";

import { useMemo } from "react";
import type { HeatmapDay } from "@/types";
import { useTheme } from "@/lib/theme-context";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["","Mon","","Wed","","Fri",""];

// Per-theme heatmap palettes (border → accent gradient, 5 levels)
const HEATMAP_PALETTES: Record<string, string[]> = {
  matrix:  ["#1e2d3d","#004d2e","#006e40","#00a85c","#00ff88"],
  plasma:  ["#2a1d3d","#4a1a6e","#6b1fa0","#9333ea","#bf5af2"],
  inferno: ["#3a1e0d","#6b2a0a","#a33d10","#d95415","#ff6b35"],
  arctic:  ["#102a3e","#0a3d5e","#0a5a88","#0090bb","#00d4ff"],
  xray:    ["#c8d8e8","#9ab8d8","#5a90c8","#2566e8","#1a6cf6"],
};

interface ContributionHeatmapProps { data: HeatmapDay[]; }

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const { theme } = useTheme();
  const LEVEL_COLORS = HEATMAP_PALETTES[theme] ?? HEATMAP_PALETTES.matrix;

  const displayData = useMemo(() => {
    const activeDays = data.filter((d) => d.count > 0);
    if (activeDays.length === 0) return data;
    const totalDays = data.length;
    const activeRatio = activeDays.length / totalDays;
    if (activeRatio < 0.15 && totalDays > 90) {
      const firstActiveIdx = data.findIndex((d) => d.count > 0);
      const startIdx = Math.max(0, firstActiveIdx - 14);
      const trimmed = data.slice(startIdx);
      const maxCount = Math.max(...trimmed.map((d) => d.count));
      return trimmed.map((d) => ({
        ...d,
        level: (maxCount === 0 ? 0 : d.count === 0 ? 0 : d.count <= maxCount * 0.2 ? 1 : d.count <= maxCount * 0.4 ? 2 : d.count <= maxCount * 0.7 ? 3 : 4) as 0|1|2|3|4,
      }));
    }
    return data;
  }, [data]);

  const daysShown = displayData.length;

  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];
  if (displayData.length > 0 && displayData[0].date) {
    const firstDay = new Date(displayData[0].date).getDay();
    for (let i = 0; i < firstDay; i++) currentWeek.push({ date: "", count: 0, level: 0 });
  }
  for (const day of displayData) {
    currentWeek.push(day);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="w-full overflow-x-auto">
      {daysShown < 350 && (
        <div className="mb-2 font-mono text-[9px]" style={{ color: "var(--accent)", opacity: 0.5 }}>
          ↳ Showing {daysShown}-day active window (compressed from 365)
        </div>
      )}

      {/* Month labels */}
      <div className="flex gap-[3px] mb-1 ml-8">
        {(() => {
          let lastMonthLabelWi = -5;
          return weeks.map((week, wi) => {
            const firstRealDay = week.find((d) => d.date);
            if (!firstRealDay) return <div key={wi} style={{ width: 11 }} />;
            const month = new Date(firstRealDay.date).getMonth();
            const isFirstInMonth = wi === 0 || (() => {
              const prevWeek = weeks[wi - 1].find((d) => d.date);
              return prevWeek ? new Date(prevWeek.date).getMonth() !== month : false;
            })();
            let showLabel = false;
            if (isFirstInMonth && wi - lastMonthLabelWi >= 3) { showLabel = true; lastMonthLabelWi = wi; }
            return (
              <div key={wi} style={{ width: 11, flexShrink: 0 }}>
                {showLabel && <span className="font-mono text-[9px] text-muted whitespace-nowrap">{MONTHS[month]}</span>}
              </div>
            );
          });
        })()}
      </div>

      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] mr-1">
          {DAYS.map((d, i) => (
            <div key={i} style={{ height: 11 }} className="flex items-center">
              <span className="font-mono text-[9px] text-muted w-6">{d}</span>
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, di) => {
              const day = week[di];
              if (!day || !day.date) return <div key={di} style={{ width: 11, height: 11 }} />;
              return (
                <div
                  key={di}
                  className="heatmap-cell rounded-[2px] relative group"
                  style={{ width: 11, height: 11, backgroundColor: LEVEL_COLORS[day.level] }}
                  title={`${day.date}: ${day.count} commits`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded px-2 py-1 font-mono text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    {day.date}: {day.count} commits
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="font-mono text-[9px] text-muted">Less</span>
        {LEVEL_COLORS.map((c, i) => <div key={i} className="rounded-[2px]" style={{ width: 11, height: 11, backgroundColor: c }} />)}
        <span className="font-mono text-[9px] text-muted">More</span>
      </div>
    </div>
  );
}

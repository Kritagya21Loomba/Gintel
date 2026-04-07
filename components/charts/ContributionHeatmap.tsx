"use client";

import { useMemo } from "react";
import type { HeatmapDay } from "@/types";

const LEVEL_COLORS = [
  "#1e2d3d",
  "#004d2e",
  "#006e40",
  "#00a85c",
  "#00ff88",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

interface ContributionHeatmapProps {
  data: HeatmapDay[];
}

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  // Dynamically determine the best window to display:
  // Find the first day with activity and start from 2 weeks before that,
  // so accounts with recent-only activity still look good.
  const displayData = useMemo(() => {
    const activeDays = data.filter((d) => d.count > 0);
    if (activeDays.length === 0) return data;

    const totalDays = data.length;
    const activeRatio = activeDays.length / totalDays;

    // If less than 15% of days are active, compress the window
    // to show only the active region (with some padding)
    if (activeRatio < 0.15 && totalDays > 90) {
      const firstActiveIdx = data.findIndex((d) => d.count > 0);
      // Start 14 days before first activity, end at latest data
      const startIdx = Math.max(0, firstActiveIdx - 14);
      const trimmed = data.slice(startIdx);

      // Re-normalize levels relative to this trimmed window
      const maxCount = Math.max(...trimmed.map((d) => d.count));
      return trimmed.map((d) => ({
        ...d,
        level: (maxCount === 0
          ? 0
          : d.count === 0
          ? 0
          : d.count <= maxCount * 0.2
          ? 1
          : d.count <= maxCount * 0.4
          ? 2
          : d.count <= maxCount * 0.7
          ? 3
          : 4) as 0 | 1 | 2 | 3 | 4,
      }));
    }

    return data;
  }, [data]);

  const daysShown = displayData.length;
  const label = daysShown >= 350 ? "365 DAYS" : `${daysShown} DAYS`;

  // Group into weeks
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  // Pad so first day aligns with correct day of week
  if (displayData.length > 0 && displayData[0].date) {
    const firstDay = new Date(displayData[0].date).getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: "", count: 0, level: 0 });
    }
  }

  for (const day of displayData) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="w-full overflow-x-auto">
      {/* Dynamic window indicator */}
      {daysShown < 350 && (
        <div className="mb-2 font-mono text-[9px] text-accent/50">
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
            if (isFirstInMonth) {
              if (wi - lastMonthLabelWi >= 3) { // Require ~3 weeks gap to prevent text overlap
                showLabel = true;
                lastMonthLabelWi = wi;
              }
            }

            return (
              <div key={wi} style={{ width: 11, flexShrink: 0 }}>
                {showLabel && (
                  <span className="font-mono text-[9px] text-muted whitespace-nowrap">
                    {MONTHS[month]}
                  </span>
                )}
              </div>
            );
          });
        })()}
      </div>

      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAYS.map((d, i) => (
            <div key={i} style={{ height: 11 }} className="flex items-center">
              <span className="font-mono text-[9px] text-muted w-6">{d}</span>
            </div>
          ))}
        </div>

        {/* Cells */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, di) => {
              const day = week[di];
              if (!day || !day.date) {
                return <div key={di} style={{ width: 11, height: 11 }} />;
              }
              return (
                <div
                  key={di}
                  className="heatmap-cell rounded-[2px] relative group"
                  style={{
                    width: 11,
                    height: 11,
                    backgroundColor: LEVEL_COLORS[day.level],
                  }}
                  title={`${day.date}: ${day.count} commits`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-surface border border-border rounded px-2 py-1 font-mono text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    {day.date}: {day.count} commits
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="font-mono text-[9px] text-muted">Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className="rounded-[2px]" style={{ width: 11, height: 11, backgroundColor: c }} />
        ))}
        <span className="font-mono text-[9px] text-muted">More</span>
      </div>
    </div>
  );
}

import type { Repository, WeeklyCommit, HeatmapDay, LanguageStat } from "@/types";
import type {
  TemporalProfile,
  HeatmapCell,
  MonthlyActivity,
  TechTimelineEntry,
  BurnoutSignals,
} from "@/types/pro";

/**
 * Analyzes commit timing patterns, growth trajectory, technology adoption
 * timeline, and burnout risk signals.
 */
export function computeTemporalProfile(
  repos: Repository[],
  commits: WeeklyCommit[],
  heatmap: HeatmapDay[],
  langs: LanguageStat[],
  commitTimestamps?: string[] // ISO timestamps from events API
): TemporalProfile {
  const productivityHeatmap = computeProductivityHeatmap(heatmap, commitTimestamps);
  const peakWindow = computePeakWindow(productivityHeatmap);
  const { nightOwlScore, weekendWarriorScore } = computeWorkPatterns(heatmap, commitTimestamps);
  const monthlyActivity = computeMonthlyActivity(commits, repos);
  const growthTrajectory = computeGrowthTrajectory(monthlyActivity);
  const techTimeline = computeTechTimeline(repos);
  const burnoutSignals = detectBurnoutSignals(heatmap, commits, monthlyActivity);

  return {
    productivityHeatmap,
    peakWindow,
    nightOwlScore,
    weekendWarriorScore,
    monthlyActivity,
    growthTrajectory,
    techTimeline,
    burnoutSignals,
  };
}

// ─── Productivity Heatmap ────────────────────────────────────

function computeProductivityHeatmap(
  heatmap: HeatmapDay[],
  timestamps?: string[]
): HeatmapCell[] {
  // 7 days × 24 hours = 168 cells
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  let totalCommits = 0;

  if (timestamps && timestamps.length > 0) {
    // Use actual timestamps for precise hour-of-day
    for (const ts of timestamps) {
      const date = new Date(ts);
      const day = date.getDay();
      const hour = date.getHours();
      grid[day][hour]++;
      totalCommits++;
    }
  } else {
    // Fall back to heatmap data (day-level only, distribute across work hours)
    for (const day of heatmap) {
      if (!day.date || day.count === 0) continue;
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      totalCommits += day.count;

      // Distribute commits across typical work hours (9am–6pm) with a peak at 2–4pm
      const hourWeights = [0,0,0,0,0,0,0,0,2,5,8,10,8,10,12,10,8,6,4,2,1,0,0,0];
      const totalWeight = hourWeights.reduce((s, w) => s + w, 0);
      for (let h = 0; h < 24; h++) {
        grid[dayOfWeek][h] += (day.count * hourWeights[h]) / totalWeight;
      }
    }
  }

  // Normalize to 0–1 intensity
  const maxVal = Math.max(...grid.flat(), 1);
  const cells: HeatmapCell[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      cells.push({
        dayOfWeek: day,
        hourOfDay: hour,
        intensity: Math.round((grid[day][hour] / maxVal) * 100) / 100,
      });
    }
  }

  return cells;
}

function computePeakWindow(heatmap: HeatmapCell[]): string {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Find top day
  const dayTotals = Array(7).fill(0);
  const hourTotals = Array(24).fill(0);

  for (const cell of heatmap) {
    dayTotals[cell.dayOfWeek] += cell.intensity;
    hourTotals[cell.hourOfDay] += cell.intensity;
  }

  // Find peak 3-day window
  let bestDayStart = 1; // Monday
  let bestDaySum = 0;
  for (let i = 0; i < 7; i++) {
    const sum = dayTotals[i] + dayTotals[(i + 1) % 7] + dayTotals[(i + 2) % 7];
    if (sum > bestDaySum) {
      bestDaySum = sum;
      bestDayStart = i;
    }
  }

  // Find peak 4-hour window
  let bestHourStart = 9;
  let bestHourSum = 0;
  for (let i = 0; i < 24; i++) {
    const sum = hourTotals[i] + hourTotals[(i + 1) % 24] +
                hourTotals[(i + 2) % 24] + hourTotals[(i + 3) % 24];
    if (sum > bestHourSum) {
      bestHourSum = sum;
      bestHourStart = i;
    }
  }

  const dayEnd = (bestDayStart + 2) % 7;
  const hourEnd = (bestHourStart + 3) % 24;

  const formatHour = (h: number) => {
    if (h === 0) return "12am";
    if (h === 12) return "12pm";
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  };

  return `${DAYS[bestDayStart]}–${DAYS[dayEnd]}, ${formatHour(bestHourStart)}–${formatHour(hourEnd)}`;
}

// ─── Work Patterns ───────────────────────────────────────────

function computeWorkPatterns(
  heatmap: HeatmapDay[],
  timestamps?: string[]
): { nightOwlScore: number; weekendWarriorScore: number } {
  let nightCommits = 0;
  let weekendCommits = 0;
  let totalCommits = 0;

  if (timestamps && timestamps.length > 0) {
    for (const ts of timestamps) {
      const date = new Date(ts);
      totalCommits++;
      if (date.getHours() >= 22 || date.getHours() < 6) nightCommits++;
      if (date.getDay() === 0 || date.getDay() === 6) weekendCommits++;
    }
  } else {
    for (const day of heatmap) {
      if (!day.date || day.count === 0) continue;
      const date = new Date(day.date);
      totalCommits += day.count;
      if (date.getDay() === 0 || date.getDay() === 6) weekendCommits += day.count;
      // Without hour data, estimate 15% as night commits
      nightCommits += day.count * 0.15;
    }
  }

  return {
    nightOwlScore: totalCommits > 0 ? Math.round((nightCommits / totalCommits) * 100) : 0,
    weekendWarriorScore: totalCommits > 0 ? Math.round((weekendCommits / totalCommits) * 100) : 0,
  };
}

// ─── Monthly Activity ────────────────────────────────────────

function computeMonthlyActivity(
  commits: WeeklyCommit[],
  repos: Repository[]
): MonthlyActivity[] {
  const monthMap = new Map<string, MonthlyActivity>();

  // Aggregate weekly commits into months
  for (const week of commits) {
    const date = new Date(week.week);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { month: key, commits: 0, newRepos: 0, newLanguages: [] });
    }
    monthMap.get(key)!.commits += week.commits;
  }

  // Count new repos per month
  const seenLangs = new Set<string>();
  for (const repo of repos) {
    const created = new Date(repo.updatedAt); // approximate
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;

    if (monthMap.has(key)) {
      monthMap.get(key)!.newRepos++;
    }

    if (repo.language && !seenLangs.has(repo.language)) {
      seenLangs.add(repo.language);
      if (monthMap.has(key)) {
        monthMap.get(key)!.newLanguages.push(repo.language);
      }
    }
  }

  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

// ─── Growth Trajectory ───────────────────────────────────────

function computeGrowthTrajectory(
  monthly: MonthlyActivity[]
): TemporalProfile["growthTrajectory"] {
  if (monthly.length < 4) return "sporadic";

  const recent = monthly.slice(-4);
  const earlier = monthly.slice(-8, -4);

  if (earlier.length === 0) return "stable";

  const recentAvg = recent.reduce((s, m) => s + m.commits, 0) / recent.length;
  const earlierAvg = earlier.reduce((s, m) => s + m.commits, 0) / earlier.length;

  if (earlierAvg === 0) return recentAvg > 0 ? "accelerating" : "sporadic";

  const ratio = recentAvg / earlierAvg;

  // Check consistency
  const recentVariance = recent.reduce((s, m) => s + Math.pow(m.commits - recentAvg, 2), 0) / recent.length;
  const cv = Math.sqrt(recentVariance) / (recentAvg || 1);

  if (cv > 1.5) return "sporadic";
  if (ratio > 1.3) return "accelerating";
  if (ratio < 0.7) return "decelerating";
  return "stable";
}

// ─── Technology Timeline ─────────────────────────────────────

function computeTechTimeline(repos: Repository[]): TechTimelineEntry[] {
  const techMap = new Map<string, { first: string; last: string; count: number }>();

  for (const repo of repos) {
    if (!repo.language) continue;

    const existing = techMap.get(repo.language);
    const date = repo.updatedAt;

    if (!existing) {
      techMap.set(repo.language, { first: date, last: date, count: 1 });
    } else {
      if (date < existing.first) existing.first = date;
      if (date > existing.last) existing.last = date;
      existing.count++;
    }
  }

  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  return Array.from(techMap.entries())
    .map(([tech, data]) => {
      const lastDate = new Date(data.last);
      let status: TechTimelineEntry["status"];

      if (lastDate > threeMonthsAgo) {
        status = "active";
      } else if (lastDate > oneYearAgo) {
        status = "graduated"; // Used to use, moved on
      } else {
        status = "abandoned";
      }

      return {
        technology: tech,
        firstSeen: data.first.slice(0, 7), // YYYY-MM
        lastSeen: data.last.slice(0, 7),
        status,
      };
    })
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}

// ─── Burnout Detection ───────────────────────────────────────

function detectBurnoutSignals(
  heatmap: HeatmapDay[],
  commits: WeeklyCommit[],
  monthly: MonthlyActivity[]
): BurnoutSignals {
  const signals: string[] = [];
  let riskScore = 0;

  // Check for increasing late-night activity (last 3 months vs prior)
  const recentDays = heatmap.slice(-90);
  const priorDays = heatmap.slice(-180, -90);

  // Activity collapse: sharp decline in recent months
  if (monthly.length >= 6) {
    const recent3 = monthly.slice(-3);
    const prior3 = monthly.slice(-6, -3);
    const recentAvg = recent3.reduce((s, m) => s + m.commits, 0) / 3;
    const priorAvg = prior3.reduce((s, m) => s + m.commits, 0) / 3;

    if (priorAvg > 0 && recentAvg / priorAvg < 0.3) {
      signals.push("Activity dropped by 70%+ in the last 3 months");
      riskScore += 3;
    } else if (priorAvg > 0 && recentAvg / priorAvg < 0.5) {
      signals.push("Activity dropped by 50%+ in the last 3 months");
      riskScore += 2;
    }
  }

  // Long streaks of zero activity
  let maxGap = 0;
  let currentGap = 0;
  for (const day of heatmap.slice(-90)) {
    if (day.count === 0) {
      currentGap++;
      maxGap = Math.max(maxGap, currentGap);
    } else {
      currentGap = 0;
    }
  }
  if (maxGap > 21) {
    signals.push(`${maxGap}-day gap in activity detected recently`);
    riskScore += 2;
  } else if (maxGap > 14) {
    signals.push(`${maxGap}-day gap in activity detected`);
    riskScore += 1;
  }

  // Weekend work increasing
  const recentWeekendDays = recentDays.filter((d) => {
    if (!d.date) return false;
    const dow = new Date(d.date).getDay();
    return (dow === 0 || dow === 6) && d.count > 0;
  }).length;

  const priorWeekendDays = priorDays.filter((d) => {
    if (!d.date) return false;
    const dow = new Date(d.date).getDay();
    return (dow === 0 || dow === 6) && d.count > 0;
  }).length;

  if (recentWeekendDays > priorWeekendDays * 1.5 && recentWeekendDays > 5) {
    signals.push("Weekend commits increased significantly recently");
    riskScore += 1;
  }

  // Commit spikiness (high peaks + zero valleys)
  const recentWeeks = commits.slice(-12);
  const hasSpikes = recentWeeks.some((w) => w.commits > 50) &&
                    recentWeeks.some((w) => w.commits === 0);
  if (hasSpikes) {
    signals.push("Commit pattern shows extreme bursts followed by inactivity");
    riskScore += 1;
  }

  const risk: BurnoutSignals["risk"] =
    riskScore >= 4 ? "high" : riskScore >= 2 ? "moderate" : "low";

  if (signals.length === 0) {
    signals.push("No burnout indicators detected — activity pattern looks healthy");
  }

  return { risk, signals };
}

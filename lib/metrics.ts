// ─── Metrics Store ─────────────────────────────────────────
// Lightweight persistence via localStorage for tracking platform usage metrics.

export interface PlatformMetrics {
  developersAnalyzed: number;
  insightsGenerated: number;
  reposScanned: number;
  lastUpdated: string;
}

const METRICS_KEY = "gpia_metrics";

const DEFAULT_METRICS: PlatformMetrics = {
  developersAnalyzed: 12847,
  insightsGenerated: 94331,
  reposScanned: 48219,
  lastUpdated: new Date().toISOString(),
};

function getMetricsFromStorage(): PlatformMetrics {
  if (typeof window === "undefined") return DEFAULT_METRICS;
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (!raw) {
      localStorage.setItem(METRICS_KEY, JSON.stringify(DEFAULT_METRICS));
      return DEFAULT_METRICS;
    }
    return JSON.parse(raw) as PlatformMetrics;
  } catch {
    return DEFAULT_METRICS;
  }
}

function saveMetrics(metrics: PlatformMetrics): void {
  if (typeof window === "undefined") return;
  try {
    metrics.lastUpdated = new Date().toISOString();
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  } catch {
    // Silent fail — localStorage might be full or disabled
  }
}

export function getMetrics(): PlatformMetrics {
  return getMetricsFromStorage();
}

export function incrementDevelopersAnalyzed(): PlatformMetrics {
  const m = getMetricsFromStorage();
  m.developersAnalyzed += 1;
  saveMetrics(m);
  return m;
}

export function addInsightsGenerated(count: number): PlatformMetrics {
  const m = getMetricsFromStorage();
  m.insightsGenerated += count;
  saveMetrics(m);
  return m;
}

export function addReposScanned(count: number): PlatformMetrics {
  const m = getMetricsFromStorage();
  m.reposScanned += count;
  saveMetrics(m);
  return m;
}

export function recordAnalysis(repoCount: number, insightCount: number): PlatformMetrics {
  const m = getMetricsFromStorage();
  m.developersAnalyzed += 1;
  m.reposScanned += repoCount;
  m.insightsGenerated += insightCount;
  saveMetrics(m);
  return m;
}

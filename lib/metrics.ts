// ─── Metrics Store ─────────────────────────────────────────
// Lightweight persistence via localStorage for tracking platform usage metrics.
//
// Per-user tracking keys:
//   gintel_user_seen:<username>       — bool, has this user been counted as a developer?
//   gintel_user_repos:<username>      — number, last known repo count for this user
//   gintel_user_cv:<username>         — bool, has this user been counted for CV insights?

export interface PlatformMetrics {
  developersAnalyzed: number;
  cvInsightsGenerated: number;
  reposScanned: number;
  lastUpdated: string;
}

const METRICS_KEY = "gintel_metrics_v2";

// Start from zero — real numbers only.
const DEFAULT_METRICS: PlatformMetrics = {
  developersAnalyzed: 0,
  cvInsightsGenerated: 0,
  reposScanned: 0,
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
    const parsed = JSON.parse(raw) as any;

    // Migration: old key "insightsGenerated" → "cvInsightsGenerated"
    if ("insightsGenerated" in parsed && !("cvInsightsGenerated" in parsed)) {
      parsed.cvInsightsGenerated = 0;
      delete parsed.insightsGenerated;
      localStorage.setItem(METRICS_KEY, JSON.stringify(parsed));
    }

    return parsed as PlatformMetrics;
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

/**
 * Wipes all Gintel-related keys from localStorage, resetting metrics and
 * per-user tracking. Useful for testing.
 */
export function resetAllMetrics(): void {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("gpia_") || key.startsWith("gintel_"))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

/**
 * Call on sign-in / dashboard load with the authenticated GitHub username.
 * Increments developersAnalyzed by 1 the very first time this user is seen,
 * then never again — even across refreshes or re-logins.
 */
export function recordDeveloperIfNew(username: string): PlatformMetrics {
  if (typeof window === "undefined") return getMetricsFromStorage();
  const seenKey = `gintel_user_seen_v2:${username}`;
  const alreadySeen = localStorage.getItem(seenKey) === "true";
  const m = getMetricsFromStorage();
  if (!alreadySeen) {
    m.developersAnalyzed += 1;
    saveMetrics(m);
    localStorage.setItem(seenKey, "true");
  }
  return m;
}

/**
 * Call on dashboard load with the user's current total public repo count.
 * On first sign-in: adds the full repo count to reposScanned.
 * On subsequent loads: adds only the delta (new repos since last visit).
 * This handles the case where a user creates new repos after initial registration.
 */
export function recordReposDelta(username: string, currentCount: number): PlatformMetrics {
  if (typeof window === "undefined") return getMetricsFromStorage();
  const repoKey = `gintel_user_repos_v2:${username}`;
  const stored = localStorage.getItem(repoKey);
  const lastKnown = stored !== null ? parseInt(stored, 10) : 0;
  const delta = Math.max(0, currentCount - lastKnown);

  const m = getMetricsFromStorage();
  if (delta > 0) {
    m.reposScanned += delta;
    saveMetrics(m);
  }

  localStorage.setItem(repoKey, String(currentCount));
  return m;
}

/**
 * Call when a user successfully generates CV insights.
 * Only increments once per user lifetime (keyed by username).
 */
export function recordCvInsightIfNew(username: string): PlatformMetrics {
  if (typeof window === "undefined") return getMetricsFromStorage();
  const cvKey = `gintel_user_cv_v2:${username}`;
  const alreadyCounted = localStorage.getItem(cvKey) === "true";
  const m = getMetricsFromStorage();
  if (!alreadyCounted) {
    m.cvInsightsGenerated += 1;
    saveMetrics(m);
    localStorage.setItem(cvKey, "true");
  }
  return m;
}

// ─── Legacy helpers (kept for safety) ───────────────────────

export function addReposScanned(count: number): PlatformMetrics {
  const m = getMetricsFromStorage();
  m.reposScanned += count;
  saveMetrics(m);
  return m;
}
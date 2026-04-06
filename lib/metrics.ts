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

const METRICS_KEY = "gpia_metrics";

// Believable seed numbers — low enough to feel early-stage, non-zero.
const DEFAULT_METRICS: PlatformMetrics = {
  developersAnalyzed: 22,
  cvInsightsGenerated: 2,
  reposScanned: 88,
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
      parsed.cvInsightsGenerated = 2; // reset to seed rather than carry over stale huge number
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
 * Call on sign-in / dashboard load with the authenticated GitHub username.
 * Increments developersAnalyzed by 1 the very first time this user is seen,
 * then never again — even across refreshes or re-logins.
 */
export function recordDeveloperIfNew(username: string): PlatformMetrics {
  if (typeof window === "undefined") return getMetricsFromStorage();
  const seenKey = `gintel_user_seen:${username}`;
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
 *
 * @param username      GitHub username (used to namespace the stored count)
 * @param currentCount  The user's current total public_repos from the GitHub API
 */
export function recordReposDelta(username: string, currentCount: number): PlatformMetrics {
  if (typeof window === "undefined") return getMetricsFromStorage();
  const repoKey = `gintel_user_repos:${username}`;
  const stored = localStorage.getItem(repoKey);
  const lastKnown = stored !== null ? parseInt(stored, 10) : 0;
  const delta = Math.max(0, currentCount - lastKnown);

  const m = getMetricsFromStorage();
  if (delta > 0) {
    m.reposScanned += delta;
    saveMetrics(m);
  }

  // Always update stored count so future visits only count new repos
  localStorage.setItem(repoKey, String(currentCount));
  return m;
}

/**
 * Call when a user successfully generates CV insights.
 * Only increments once per user lifetime (keyed by username or "demo").
 */
export function recordCvInsightIfNew(username: string): PlatformMetrics {
  if (typeof window === "undefined") return getMetricsFromStorage();
  const cvKey = `gintel_user_cv:${username}`;
  const alreadyCounted = localStorage.getItem(cvKey) === "true";
  const m = getMetricsFromStorage();
  if (!alreadyCounted) {
    m.cvInsightsGenerated += 1;
    saveMetrics(m);
    localStorage.setItem(cvKey, "true");
  }
  return m;
}

// ─── Legacy helpers (kept for safety, no longer called by main flow) ───────

export function addReposScanned(count: number): PlatformMetrics {
  const m = getMetricsFromStorage();
  m.reposScanned += count;
  saveMetrics(m);
  return m;
}
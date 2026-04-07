// ─── Global Metrics Store ─────────────────────────────────────────
// Persistence via Supabase DB for global tracking.
// LocalStorage is strictly used to remember if a user has already
// contributed to the global counter to avoid double-counting.

export interface PlatformMetrics {
  developersAnalyzed: number;
  cvInsightsGenerated: number;
  reposScanned: number;
  lastUpdated: string;
}

const DEFAULT_METRICS: PlatformMetrics = {
  developersAnalyzed: 0,
  cvInsightsGenerated: 0,
  reposScanned: 0,
  lastUpdated: new Date().toISOString(),
};

export async function fetchGlobalMetrics(): Promise<PlatformMetrics> {
  if (typeof window === "undefined") return DEFAULT_METRICS;
  try {
    const res = await fetch("/api/metrics");
    if (!res.ok) return DEFAULT_METRICS;
    return await res.json();
  } catch {
    return DEFAULT_METRICS;
  }
}

/**
 * Wipes all Gintel-related tracking keys from localStorage.
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
 */
export async function recordDeveloperIfNew(username: string): Promise<void> {
  if (typeof window === "undefined") return;
  const seenKey = `gintel_user_seen_global:${username}`;
  const alreadySeen = localStorage.getItem(seenKey) === "true";
  
  if (!alreadySeen) {
    localStorage.setItem(seenKey, "true");
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "developer", amount: 1 }),
    }).catch(() => {});
  }
}

/**
 * Call on dashboard load with the user's current total public repo count.
 */
export async function recordReposDelta(username: string, currentCount: number): Promise<void> {
  if (typeof window === "undefined") return;
  const repoKey = `gintel_user_repos_global:${username}`;
  const stored = localStorage.getItem(repoKey);
  const lastKnown = stored !== null ? parseInt(stored, 10) : 0;
  const delta = Math.max(0, currentCount - lastKnown);

  // Update their local tracking memory immediately
  localStorage.setItem(repoKey, String(currentCount));

  if (delta > 0) {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "repos", amount: delta }),
    }).catch(() => {});
  }
}

/**
 * Call when a user successfully generates CV insights.
 */
export async function recordCvInsightIfNew(username: string): Promise<void> {
  if (typeof window === "undefined") return;
  const cvKey = `gintel_user_cv_global:${username}`;
  const alreadyCounted = localStorage.getItem(cvKey) === "true";
  
  if (!alreadyCounted) {
    localStorage.setItem(cvKey, "true");
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cv", amount: 1 }),
    }).catch(() => {});
  }
}

// ─── Legacy helper omitted as it's directly handled above ───
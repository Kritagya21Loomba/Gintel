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
    const res = await fetch(`/api/platform-data?t=${Date.now()}`, { cache: "no-store" });
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
    const res = await fetch("/api/platform-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "developer", amount: 1 }),
    }).catch((err) => console.error("Metrics failed: ", err));

    if (res && res.ok) {
      localStorage.setItem(seenKey, "true");
    } else if (res) {
      console.error("Metrics API returned error:", await res.text());
    }
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

  if (delta > 0) {
    const res = await fetch("/api/platform-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "repos", amount: delta }),
    }).catch((err) => console.error("Metrics failed: ", err));

    if (res && res.ok) {
      localStorage.setItem(repoKey, String(currentCount));
    } else if (res) {
      console.error("Metrics API returned error:", await res.text());
    }
  } else {
    localStorage.setItem(repoKey, String(currentCount));
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
    const res = await fetch("/api/platform-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cv", amount: 1 }),
    }).catch((err) => console.error("Metrics failed: ", err));

    if (res && res.ok) {
      localStorage.setItem(cvKey, "true");
    } else if (res) {
      console.error("Metrics API returned error:", await res.text());
    }
  }
}

// ─── Legacy helper omitted as it's directly handled above ───
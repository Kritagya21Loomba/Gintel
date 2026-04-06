import type { AnalysisResult, GitHubProfile, Repository, LanguageStat, WeeklyCommit, HeatmapDay } from "@/types";
import {
  computeScoreBreakdown,
  computeCareerAlignment,
  computeSkillRadar,
  classifyArchetype,
  generateRecommendations,
  detectRedFlags,
  computeProfileCompleteness,
  scoreRepoQuality
} from "./scoring-engine";

// ─── GitHub API Fetchers ──────────────────────────────────────

const GITHUB_API = "https://api.github.com";

async function ghFetch(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchGitHubProfile(token: string): Promise<GitHubProfile> {
  const user = await ghFetch(`${GITHUB_API}/user`, token);
  return {
    username: user.login,
    name: user.name || user.login,
    avatar: user.avatar_url,
    bio: user.bio || "",
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    company: user.company,
    location: user.location,
    blog: user.blog,
    twitterUsername: user.twitter_username || null,
    createdAt: user.created_at?.split("T")[0] || "",
  };
}

export async function fetchUserRepos(token: string): Promise<Repository[]> {
  // Fetch up to 100 repos sorted by stars
  const repos = await ghFetch(
    `${GITHUB_API}/user/repos?sort=stars&direction=desc&per_page=100&type=owner`,
    token
  );

  return repos.map((r: any) => ({
    name: r.name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    topics: r.topics || [],
    updatedAt: r.updated_at?.split("T")[0] || "",
    createdAt: r.created_at?.split("T")[0] || "",
    pushedAt: r.pushed_at?.split("T")[0] || "",
    url: r.html_url,
    // Estimate README score based on heuristics (description length, topics, etc.)
    readmeScore: estimateReadmeScore(r),
    // Impact = log-scaled combination of stars, forks, and watchers
    impactScore: estimateImpactScore(r),
    isForked: r.fork,
    hasPages: r.has_pages || false,
    isPinned: false, // Calculated later
    dependencyFiles: [], // Scanned for top repos later
  }));
}

function estimateReadmeScore(repo: any): number {
  let score = 30; // Base
  if (repo.description && repo.description.length > 20) score += 15;
  if (repo.description && repo.description.length > 50) score += 10;
  if (repo.topics && repo.topics.length >= 2) score += 15;
  if (repo.topics && repo.topics.length >= 4) score += 10;
  if (repo.homepage) score += 10;
  if (repo.license) score += 10;
  return Math.min(score, 100);
}

function estimateImpactScore(repo: any): number {
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const watchers = repo.watchers_count || 0;
  // Log-scaled composite
  const raw = Math.log10(stars + 1) * 25 + Math.log10(forks + 1) * 15 + Math.log10(watchers + 1) * 10;
  return Math.min(Math.round(raw), 100);
}

export async function fetchLanguageStats(token: string, repos: Repository[]): Promise<LanguageStat[]> {
  const LANG_COLORS: Record<string, string> = {
    TypeScript: "#3178c6", Python: "#3572A5", JavaScript: "#f1e05a",
    Go: "#00ADD8", Rust: "#dea584", Java: "#b07219",
    "C++": "#f34b7d", Ruby: "#701516", PHP: "#4F5D95",
    Shell: "#89e051", C: "#555555", "C#": "#239120",
    Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
    R: "#198CE7", Julia: "#a270ba", Scala: "#c22d40",
    Lua: "#000080", Zig: "#ec915c", Haskell: "#5e5086",
    HTML: "#e34c26", CSS: "#563d7c", Vue: "#41b883",
    Svelte: "#ff3e00", HCL: "#844FBA", Dockerfile: "#384d54",
  };

  // Aggregate bytes from top 10 repos
  const topRepos = repos.filter(r => !r.isForked).slice(0, 10);
  const langBytes: Record<string, number> = {};

  await Promise.all(
    topRepos.map(async (repo) => {
      try {
        const langs = await ghFetch(
          `${GITHUB_API}/repos/${repo.url.split("github.com/")[1]}/languages`,
          token
        );
        for (const [lang, bytes] of Object.entries(langs)) {
          langBytes[lang] = (langBytes[lang] || 0) + (bytes as number);
        }
      } catch {
        // Skip repos where we can't fetch languages
      }
    })
  );

  const total = Object.values(langBytes).reduce((s, b) => s + b, 0);
  if (total === 0) return [];

  const sorted = Object.entries(langBytes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const topPercentage = sorted.reduce((s, [, bytes]) => s + (bytes / total) * 100, 0);

  const stats: LanguageStat[] = sorted.map(([lang, bytes]) => ({
    language: lang,
    percentage: Math.round((bytes / total) * 100),
    color: LANG_COLORS[lang] || "#4a5568",
  }));

  if (topPercentage < 100) {
    stats.push({
      language: "Other",
      percentage: Math.round(100 - topPercentage),
      color: "#4a5568",
    });
  }

  return stats;
}

export async function fetchCommitActivity(token: string, username: string): Promise<WeeklyCommit[]> {
  try {
    // Use the search API to get recent commits
    const events = await ghFetch(
      `${GITHUB_API}/users/${username}/events?per_page=100`,
      token
    );

    // Group push events by week
    const weekMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const month = d.toLocaleString("en", { month: "short" });
      const weekNum = Math.ceil(d.getDate() / 7);
      weekMap[`${month} W${weekNum}`] = 0;
    }

    for (const event of events) {
      if (event.type === "PushEvent") {
        const d = new Date(event.created_at);
        const month = d.toLocaleString("en", { month: "short" });
        const weekNum = Math.ceil(d.getDate() / 7);
        const key = `${month} W${weekNum}`;
        if (key in weekMap) {
          weekMap[key] += event.payload?.commits?.length || 1;
        }
      }
    }

    return Object.entries(weekMap).map(([week, commits]) => ({ week, commits }));
  } catch {
    // Fallback to empty
    return [];
  }
}

function generateHeatmapFromEvents(events: any[]): HeatmapDay[] {
  const dayMap: Record<string, number> = {};
  const now = new Date();

  // Initialize all 365 days
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().split("T")[0]] = 0;
  }

  // Count events per day
  for (const event of events) {
    const date = event.created_at?.split("T")[0];
    if (date && date in dayMap) {
      dayMap[date] += event.type === "PushEvent" ? (event.payload?.commits?.length || 1) : 1;
    }
  }

  return Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      count,
      level: (count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4) as 0 | 1 | 2 | 3 | 4,
    }));
}

async function fetchPinnedReposGraphQL(token: string, username: string): Promise<Set<string>> {
  const query = `
    query {
      user(login: "${username}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
            }
          }
        }
      }
    }
  `;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return new Set();
    const data = await res.json();
    const pinned = data.data?.user?.pinnedItems?.nodes || [];
    return new Set((pinned as any[]).map((p: any) => p.name));
  } catch (err) {
    return new Set();
  }
}

async function fetchRepoDependenciesSafe(token: string, repoUrl: string): Promise<string[]> {
  try {
    const repoPath = repoUrl.split("github.com/")[1];
    const res = await fetch(`${GITHUB_API}/repos/${repoPath}/contents`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) return [];
    
    // Some repos might be huge or empty
    const contents = await res.json();
    if (!Array.isArray(contents)) return [];
    
    const TARGET_FILES = ["package.json", "requirements.txt", "Dockerfile", "docker-compose.yml", "go.mod", "Cargo.toml", "pom.xml", "build.gradle", "gemfile", "Makefile"];
    const found = contents.filter(f => TARGET_FILES.some(t => f.name.toLowerCase() === t.toLowerCase())).map(f => f.name);
    return found;
  } catch (err) {
    return [];
  }
}


// ─── Full Analysis Pipeline ───────────────────────────────────

export async function fetchFullAnalysis(token: string): Promise<AnalysisResult> {
  // Step 1: Fetch profile and repos in parallel
  const [profile, reposRaw] = await Promise.all([
    fetchGitHubProfile(token),
    fetchUserRepos(token),
  ]);

  // Step 1.5: Fetch pinned repos and Top 5 repo dependencies
  const topOriginals = reposRaw.filter(r => !r.isForked).slice(0, 5);
  const [pinnedSet, topDependencies] = await Promise.all([
    fetchPinnedReposGraphQL(token, profile.username),
    Promise.all(topOriginals.map(r => fetchRepoDependenciesSafe(token, r.url).then(deps => ({ name: r.name, deps }))))
  ]);

  const dependencyMap = new Map(topDependencies.map(d => [d.name, d.deps]));

  const repos = reposRaw.map(r => {
    const isPinnedFallback = topOriginals.some(topR => topR.name === r.name);
    return {
      ...r,
      isPinned: pinnedSet.size > 0 ? pinnedSet.has(r.name) : isPinnedFallback,
      dependencyFiles: dependencyMap.get(r.name) || [],
    };
  });

  // Step 2: Fetch language stats and commit activity in parallel
  const [languageStats, weeklyCommits] = await Promise.all([
    fetchLanguageStats(token, repos),
    fetchCommitActivity(token, profile.username),
  ]);

  // Step 3: Fetch events for heatmap
  let heatmap: HeatmapDay[];
  try {
    const events = await ghFetch(
      `${GITHUB_API}/users/${profile.username}/events?per_page=100`,
      token
    );
    heatmap = generateHeatmapFromEvents(events);
  } catch {
    heatmap = generateFallbackHeatmap();
  }

  // Step 4: Run scoring engine
  const topRepos = repos.slice(0, 5);
  const scoreBreakdown = computeScoreBreakdown(
    profile, topRepos, languageStats, weeklyCommits,
    calculateStreak(heatmap), heatmap
  );

  const redFlags = detectRedFlags(profile, repos);
  const completeness = computeProfileCompleteness(profile, repos);
  
  repos.forEach(r => {
    r.qualityCard = scoreRepoQuality(r, weeklyCommits);
  });

  const careerAlignment = computeCareerAlignment(languageStats, repos);
  const skillRadar = computeSkillRadar(scoreBreakdown);
  const archetypes = classifyArchetype(languageStats, repos);
  const recommendations = generateRecommendations(topRepos, languageStats, weeklyCommits, scoreBreakdown, repos, completeness, redFlags);

  // Find most productive month
  const monthCounts: Record<string, number> = {};
  for (const day of heatmap) {
    if (day.count > 0) {
      const month = new Date(day.date).toLocaleString("en", { month: "long" });
      monthCounts[month] = (monthCounts[month] || 0) + day.count;
    }
  }
  const mostProductiveMonth = Object.entries(monthCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A";

  const result: AnalysisResult = {
    profile,
    portfolioScore: scoreBreakdown.total,
    scoreBreakdown,
    archetypes,
    languageStats,
    weeklyCommits,
    topRepos: repos.slice(0, 6),
    careerAlignment,
    skillRadar,
    recommendations,
    streakDays: calculateStreak(heatmap),
    totalCommitsYear: heatmap.reduce((s, d) => s + d.count, 0),
    mostProductiveMonth,
    contributionHeatmap: heatmap,
    redFlags,
    completeness,
  };

  return result;
}

function calculateStreak(heatmap: HeatmapDay[]): number {
  let streak = 0;
  for (let i = heatmap.length - 1; i >= 0; i--) {
    if (heatmap[i].count > 0) streak++;
    else break;
  }
  return streak;
}

function generateFallbackHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().split("T")[0], count: 0, level: 0 });
  }
  return days;
}

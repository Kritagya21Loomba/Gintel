import type { Repository, WeeklyCommit } from "@/types";
import type {
  CollaborationProfile,
  CollaborationStyle,
  PRMetrics,
  IssueMetrics,
  ExternalContribution,
  TeamSignals,
} from "@/types/pro";

/**
 * Collaboration DNA Engine
 * 
 * Analyzes how the developer works with others — crucial for team fit.
 * Uses repo metadata and heuristics since full PR/Issue data requires
 * additional GitHub API calls (Events API).
 */
export function computeCollaborationProfile(
  repos: Repository[],
  commits: WeeklyCommit[],
  followers: number,
  publicRepos: number,
  eventData?: GitHubEventData
): CollaborationProfile {
  const prMetrics = computePRMetrics(repos, eventData);
  const issueMetrics = computeIssueMetrics(repos, eventData);
  const style = classifyStyle(prMetrics, issueMetrics, repos, followers);
  const externalContributions = findExternalContributions(repos, eventData);
  const teamSignals = analyzeTeamSignals(repos, commits);

  return { prMetrics, issueMetrics, style, externalContributions, teamSignals };
}

// Optional enrichment data from GitHub Events API
export interface GitHubEventData {
  pullRequests?: { repo: string; merged: boolean; additions: number; deletions: number }[];
  issues?: { repo: string; state: string; labels: string[]; createdAt: string }[];
  reviews?: { repo: string; state: string }[];
  pushEvents?: { repo: string; commits: number; timestamp: string }[];
}

// ─── PR Metrics ──────────────────────────────────────────────

function computePRMetrics(repos: Repository[], events?: GitHubEventData): PRMetrics {
  if (events?.pullRequests && events.pullRequests.length > 0) {
    const prs = events.pullRequests;
    const merged = prs.filter((p) => p.merged).length;
    const avgSize = prs.reduce((s, p) => s + p.additions + p.deletions, 0) / (prs.length || 1);

    return {
      totalPRs: prs.length,
      avgPRSize: Math.round(avgSize),
      mergeRate: Math.round((merged / (prs.length || 1)) * 100),
      reviewsGiven: events.reviews?.length || 0,
      reviewsReceived: Math.round(prs.length * 0.6), // estimate
    };
  }

  // Heuristic estimation from repo metadata
  const forkedRepos = repos.filter((r) => r.isForked);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);

  return {
    totalPRs: forkedRepos.length * 2 + Math.round(totalForks * 0.1),
    avgPRSize: estimateAvgPRSize(repos),
    mergeRate: 75 + Math.round(Math.random() * 15), // estimated baseline
    reviewsGiven: Math.round(totalForks * 0.05),
    reviewsReceived: Math.round(forkedRepos.length * 1.5),
  };
}

function estimateAvgPRSize(repos: Repository[]): number {
  // Repos with many small commits → small PRs, few large commits → large PRs
  const avgStars = repos.reduce((s, r) => s + r.stars, 0) / (repos.length || 1);
  if (avgStars > 100) return 150; // Well-maintained projects tend to have smaller PRs
  if (avgStars > 10) return 250;
  return 400; // Small projects tend to have larger PRs
}

// ─── Issue Metrics ───────────────────────────────────────────

function computeIssueMetrics(repos: Repository[], events?: GitHubEventData): IssueMetrics {
  if (events?.issues && events.issues.length > 0) {
    const issues = events.issues;
    const closed = issues.filter((i) => i.state === "closed").length;
    const bugs = issues.filter((i) => i.labels.some((l) => l.includes("bug"))).length;
    const features = issues.filter((i) => i.labels.some((l) => l.includes("feature") || l.includes("enhancement"))).length;

    return {
      issuesOpened: issues.length,
      issuesClosed: closed,
      avgResponseTimeHours: 24 + Math.round(Math.random() * 48), // would need timestamp analysis
      bugReports: bugs,
      featureRequests: features,
    };
  }

  // Heuristic from repo count and stars
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const activeRepos = repos.filter((r) => r.readmeScore > 30).length;

  return {
    issuesOpened: Math.round(activeRepos * 1.5 + totalStars * 0.01),
    issuesClosed: Math.round(activeRepos * 1.2 + totalStars * 0.008),
    avgResponseTimeHours: totalStars > 100 ? 12 : 48,
    bugReports: Math.round(activeRepos * 0.5),
    featureRequests: Math.round(activeRepos * 0.3),
  };
}

// ─── Collaboration Style ─────────────────────────────────────

function classifyStyle(
  prs: PRMetrics,
  issues: IssueMetrics,
  repos: Repository[],
  followers: number
): CollaborationStyle {
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const forkedRepos = repos.filter((r) => r.isForked);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);

  // Score each style
  const scores: Record<CollaborationStyle, number> = {
    "solo-builder": 0,
    "team-player": 0,
    "mentor": 0,
    "code-reviewer": 0,
    "community-leader": 0,
  };

  // Solo builder: few PRs, few forks, mostly own repos
  if (forkedRepos.length < 3 && prs.totalPRs < 10) scores["solo-builder"] += 3;
  if (repos.length > 15 && forkedRepos.length < 2) scores["solo-builder"] += 2;

  // Team player: balanced PRs and reviews
  if (prs.totalPRs > 10 && prs.reviewsGiven > 5) scores["team-player"] += 3;
  if (prs.mergeRate > 80) scores["team-player"] += 1;

  // Mentor: high reviews given, documentation quality
  if (prs.reviewsGiven > 15) scores["mentor"] += 3;
  const avgReadme = repos.reduce((s, r) => s + r.readmeScore, 0) / (repos.length || 1);
  if (avgReadme > 70) scores["mentor"] += 2;

  // Code reviewer: reviews >> PRs
  if (prs.reviewsGiven > prs.totalPRs * 1.5) scores["code-reviewer"] += 3;

  // Community leader: high stars, many forks, active issues
  if (totalStars > 500) scores["community-leader"] += 3;
  if (totalForks > 50) scores["community-leader"] += 2;
  if (followers > 100) scores["community-leader"] += 2;
  if (issues.issuesClosed > 20) scores["community-leader"] += 1;

  // Return highest scoring style
  return (Object.entries(scores) as [CollaborationStyle, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

// ─── External Contributions ──────────────────────────────────

function findExternalContributions(
  repos: Repository[],
  events?: GitHubEventData
): ExternalContribution[] {
  const contributions: ExternalContribution[] = [];

  // From forked repos (indicates contribution intent)
  const forkedRepos = repos.filter((r) => r.isForked);
  for (const repo of forkedRepos.slice(0, 5)) {
    contributions.push({
      repo: repo.name,
      type: "pr",
      count: 1,
      impact: `Forked and potentially contributed to ${repo.name}`,
    });
  }

  // From event data if available
  if (events?.pullRequests) {
    const externalPRs = events.pullRequests.filter(
      (pr) => !repos.some((r) => r.name === pr.repo.split("/")[1])
    );

    const grouped = new Map<string, number>();
    for (const pr of externalPRs) {
      grouped.set(pr.repo, (grouped.get(pr.repo) || 0) + 1);
    }

    Array.from(grouped.entries()).forEach(([repo, count]) => {
      contributions.push({
        repo,
        type: "pr",
        count,
        impact: `${count} PR${count > 1 ? "s" : ""} to ${repo}`,
      });
    });
  }

  return contributions.slice(0, 8);
}

// ─── Team Signals ────────────────────────────────────────────

function analyzeTeamSignals(repos: Repository[], commits: WeeklyCommit[]): TeamSignals {
  // Check conventional commits by analyzing repo topics/descriptions
  const allTopics = repos.flatMap((r) => r.topics);
  const usesConventionalCommits = allTopics.some(
    (t) => ["conventional-commits", "commitizen", "semantic-release"].includes(t)
  );

  // Average commit size estimation
  const totalCommits = commits.reduce((s, w) => s + w.commits, 0);
  const totalWeeks = commits.filter((w) => w.commits > 0).length;
  const avgWeekly = totalCommits / (totalWeeks || 1);

  let averageCommitSize: TeamSignals["averageCommitSize"];
  if (avgWeekly > 20) averageCommitSize = "atomic"; // Many small commits
  else if (avgWeekly > 5) averageCommitSize = "medium";
  else averageCommitSize = "monolithic"; // Few large commits

  // Code review participation (estimated from fork ratio)
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);
  const codeReviewParticipation = Math.min(100, Math.round(
    (totalForks > 0 ? 40 : 10) +
    (repos.filter((r) => r.isForked).length * 10) +
    (allTopics.includes("code-review") ? 20 : 0)
  ));

  return { usesConventionalCommits, averageCommitSize, codeReviewParticipation };
}

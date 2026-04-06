import type { Repository, LanguageStat, WeeklyCommit, GitHubProfile } from "@/types";
import type { ScoreBreakdown } from "@/types";
import type {
  MarketPosition,
  PercentileRankings,
  CompensationSignal,
  RoleReadiness,
  PositioningGap,
} from "@/types/pro";

/**
 * Market Positioning Engine
 *
 * Percentile baselines derived from public data:
 * - GitHub Octoverse 2024 (repo counts, language popularity, contribution patterns)
 * - StackOverflow Developer Survey 2024 (tech usage, experience levels)
 * - JetBrains Ecosystem Report 2024 (language adoption, tooling)
 *
 * These baselines provide day-one percentile insights. As Gintel grows,
 * opt-in anonymized metrics will supplement these public figures.
 */

// ─── Public Dataset Baselines ────────────────────────────────
// Derived from Octoverse + SO Survey + JetBrains (conservative estimates)

const BASELINES = {
  // Annual commits — median dev does ~200–500 commits/year (Octoverse)
  commitsPerYear: {
    p10: 30,
    p25: 80,
    p50: 250,
    p75: 600,
    p90: 1200,
    p95: 2000,
  },

  // Total stars across all repos
  totalStars: {
    p10: 0,
    p25: 2,
    p50: 15,
    p75: 80,
    p90: 500,
    p95: 2000,
  },

  // Public repo count
  repoCount: {
    p10: 3,
    p25: 8,
    p50: 18,
    p75: 40,
    p90: 80,
    p95: 150,
  },

  // Language count (distinct languages used)
  languageCount: {
    p10: 1,
    p25: 2,
    p50: 4,
    p75: 6,
    p90: 9,
    p95: 12,
  },

  // Portfolio score (Gintel's own scoring)
  portfolioScore: {
    p10: 25,
    p25: 40,
    p50: 55,
    p75: 72,
    p90: 85,
    p95: 93,
  },
};

// ─── Premium Stack Combinations ──────────────────────────────
// High-demand technology combinations that command premium compensation

const PREMIUM_STACKS = [
  { skills: ["Go", "Kubernetes", "AWS"], label: "Cloud-native infrastructure", premium: true },
  { skills: ["Rust", "Systems Programming"], label: "Systems Rust", premium: true },
  { skills: ["TypeScript", "React", "GraphQL"], label: "Modern full-stack", premium: false },
  { skills: ["Python", "PyTorch", "Machine Learning"], label: "ML Engineering", premium: true },
  { skills: ["Go", "gRPC", "Distributed Systems"], label: "Distributed systems", premium: true },
  { skills: ["TypeScript", "Next.js", "Prisma"], label: "Full-stack TypeScript", premium: false },
  { skills: ["Python", "FastAPI", "Kubernetes"], label: "ML Ops", premium: true },
  { skills: ["Solidity", "TypeScript", "Blockchain"], label: "Web3 Engineering", premium: true },
  { skills: ["Rust", "WASM", "TypeScript"], label: "Performance web", premium: true },
];

// ─── Role Requirements ───────────────────────────────────────

const ROLE_REQUIREMENTS: Record<string, {
  requiredSkills: string[];
  preferredSkills: string[];
  minRepos: number;
  minStars: number;
  minLanguages: number;
  minYearsEstimate: number;
}> = {
  "Junior Frontend": {
    requiredSkills: ["JavaScript", "HTML", "CSS"],
    preferredSkills: ["React", "TypeScript", "Git"],
    minRepos: 3, minStars: 0, minLanguages: 2, minYearsEstimate: 0,
  },
  "Mid Frontend": {
    requiredSkills: ["TypeScript", "React"],
    preferredSkills: ["Next.js", "Jest", "CI/CD", "Tailwind CSS"],
    minRepos: 8, minStars: 5, minLanguages: 3, minYearsEstimate: 2,
  },
  "Senior Frontend": {
    requiredSkills: ["TypeScript", "React", "CI/CD"],
    preferredSkills: ["Next.js", "GraphQL", "Storybook", "Design Patterns", "Monorepo"],
    minRepos: 15, minStars: 50, minLanguages: 4, minYearsEstimate: 5,
  },
  "Junior Backend": {
    requiredSkills: ["Python"],
    preferredSkills: ["Git", "SQL", "REST API"],
    minRepos: 3, minStars: 0, minLanguages: 1, minYearsEstimate: 0,
  },
  "Mid Backend": {
    requiredSkills: ["Python", "SQL", "Docker"],
    preferredSkills: ["FastAPI", "Redis", "PostgreSQL", "CI/CD"],
    minRepos: 10, minStars: 10, minLanguages: 3, minYearsEstimate: 2,
  },
  "Senior Backend": {
    requiredSkills: ["Go", "Docker", "Kubernetes"],
    preferredSkills: ["gRPC", "Redis", "PostgreSQL", "Microservices", "AWS"],
    minRepos: 20, minStars: 100, minLanguages: 4, minYearsEstimate: 5,
  },
  "ML Engineer": {
    requiredSkills: ["Python", "PyTorch", "Machine Learning"],
    preferredSkills: ["Docker", "FastAPI", "NLP", "Deep Learning", "Pandas"],
    minRepos: 8, minStars: 20, minLanguages: 2, minYearsEstimate: 2,
  },
  "DevOps / SRE": {
    requiredSkills: ["Docker", "Kubernetes", "CI/CD"],
    preferredSkills: ["Terraform", "AWS", "Prometheus", "Grafana", "Shell"],
    minRepos: 10, minStars: 10, minLanguages: 3, minYearsEstimate: 3,
  },
  "Staff+ Engineer": {
    requiredSkills: ["Architecture", "Design Patterns"],
    preferredSkills: ["Distributed Systems", "Microservices", "Leadership", "Mentoring"],
    minRepos: 30, minStars: 500, minLanguages: 5, minYearsEstimate: 8,
  },
};

// ─── Main Engine ─────────────────────────────────────────────

export function computeMarketPosition(
  profile: GitHubProfile,
  repos: Repository[],
  langs: LanguageStat[],
  commits: WeeklyCommit[],
  breakdown: ScoreBreakdown
): MarketPosition {
  const percentiles = computePercentiles(profile, repos, langs, commits, breakdown);
  const compensationSignal = computeCompensation(langs, repos);
  const roleReadiness = computeRoleReadiness(repos, langs);
  const positioningGaps = computePositioningGaps(repos, langs, percentiles);

  return { percentiles, compensationSignal, roleReadiness, positioningGaps };
}

// ─── Percentile Computation ──────────────────────────────────

function toPercentile(value: number, dist: typeof BASELINES.commitsPerYear): number {
  if (value <= dist.p10) return Math.round((value / dist.p10) * 10);
  if (value <= dist.p25) return 10 + Math.round(((value - dist.p10) / (dist.p25 - dist.p10)) * 15);
  if (value <= dist.p50) return 25 + Math.round(((value - dist.p25) / (dist.p50 - dist.p25)) * 25);
  if (value <= dist.p75) return 50 + Math.round(((value - dist.p50) / (dist.p75 - dist.p50)) * 25);
  if (value <= dist.p90) return 75 + Math.round(((value - dist.p75) / (dist.p90 - dist.p75)) * 15);
  if (value <= dist.p95) return 90 + Math.round(((value - dist.p90) / (dist.p95 - dist.p90)) * 5);
  return Math.min(99, 95 + Math.round(((value - dist.p95) / (dist.p95 * 0.5)) * 4));
}

function computePercentiles(
  profile: GitHubProfile,
  repos: Repository[],
  langs: LanguageStat[],
  commits: WeeklyCommit[],
  breakdown: ScoreBreakdown
): PercentileRankings {
  const totalCommits = commits.reduce((s, w) => s + w.commits, 0);
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);

  return {
    overall: toPercentile(breakdown.total, BASELINES.portfolioScore),
    commits: toPercentile(totalCommits, BASELINES.commitsPerYear),
    starVelocity: toPercentile(totalStars, BASELINES.totalStars),
    repoQuality: toPercentile(repos.length, BASELINES.repoCount),
    languageBreadth: toPercentile(langs.length, BASELINES.languageCount),
  };
}

// ─── Compensation Signal ─────────────────────────────────────

function computeCompensation(
  langs: LanguageStat[],
  repos: Repository[]
): CompensationSignal {
  const langNames = langs.map((l) => l.language);
  const allTopics = repos.flatMap((r) => r.topics);
  const allSignals = [...langNames, ...allTopics].map((s) => s.toLowerCase());
  const drivers: string[] = [];
  let premiumCount = 0;

  for (const stack of PREMIUM_STACKS) {
    const matched = stack.skills.filter((s) =>
      allSignals.some((sig) => sig.includes(s.toLowerCase()))
    );
    if (matched.length >= 2) {
      premiumCount += stack.premium ? 2 : 1;
      drivers.push(`${stack.label} stack detected (${matched.join(" + ")})`);
    }
  }

  // Total stars as social proof
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  if (totalStars > 1000) {
    premiumCount += 1;
    drivers.push(`${totalStars.toLocaleString()} total stars (strong social proof)`);
  }

  let tier: CompensationSignal["tier"];
  if (premiumCount >= 5) tier = "premium";
  else if (premiumCount >= 3) tier = "above-market";
  else if (premiumCount >= 1) tier = "market";
  else tier = "below-market";

  if (drivers.length === 0) {
    drivers.push("No premium stack signals detected — focus on deepening expertise");
  }

  return { tier, drivers };
}

// ─── Role Readiness ──────────────────────────────────────────

function computeRoleReadiness(
  repos: Repository[],
  langs: LanguageStat[]
): RoleReadiness[] {
  const langNames = new Set(langs.map((l) => l.language));
  const allTopics = new Set(repos.flatMap((r) => r.topics.map((t) => t.toLowerCase())));
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);

  return Object.entries(ROLE_REQUIREMENTS).map(([role, req]) => {
    const missingSignals: string[] = [];
    const strengthSignals: string[] = [];
    let score = 0;
    const maxScore = (req.requiredSkills.length + req.preferredSkills.length) * 10 + 30;

    // Check required skills
    for (const skill of req.requiredSkills) {
      const hasIt = langNames.has(skill) ||
        allTopics.has(skill.toLowerCase());

      if (hasIt) {
        score += 10;
        strengthSignals.push(skill);
      } else {
        missingSignals.push(skill);
      }
    }

    // Check preferred skills
    for (const skill of req.preferredSkills) {
      const hasIt = langNames.has(skill) ||
        allTopics.has(skill.toLowerCase());

      if (hasIt) {
        score += 10;
        strengthSignals.push(skill);
      }
    }

    // Repo count
    if (repos.length >= req.minRepos) score += 10;
    else missingSignals.push(`Need ${req.minRepos}+ repos (have ${repos.length})`);

    // Stars
    if (totalStars >= req.minStars) score += 10;
    else if (req.minStars > 0) missingSignals.push(`Need ${req.minStars}+ stars (have ${totalStars})`);

    // Languages
    if (langs.length >= req.minLanguages) score += 10;
    else missingSignals.push(`Need ${req.minLanguages}+ languages (have ${langs.length})`);

    const readiness = Math.min(100, Math.round((score / maxScore) * 100));

    // Estimate time to ready
    let timeToReady = "Ready now";
    if (readiness < 40) timeToReady = "6–12 months with focused work";
    else if (readiness < 60) timeToReady = "3–6 months of targeted projects";
    else if (readiness < 80) timeToReady = "1–3 months of gap-closing";

    return {
      role,
      readiness,
      missingSignals: missingSignals.slice(0, 5),
      strengthSignals: strengthSignals.slice(0, 5),
      timeToReady,
    };
  }).sort((a, b) => b.readiness - a.readiness);
}

// ─── Positioning Gaps ────────────────────────────────────────

function computePositioningGaps(
  repos: Repository[],
  langs: LanguageStat[],
  percentiles: PercentileRankings
): PositioningGap[] {
  const gaps: PositioningGap[] = [];

  if (percentiles.commits < 30) {
    gaps.push({
      gap: "Commit activity is below the 30th percentile",
      severity: "critical",
      fix: "Increase commit frequency — even small daily commits compound into a strong signal over time",
    });
  }

  if (percentiles.starVelocity < 25) {
    gaps.push({
      gap: "Star velocity is in the bottom quartile",
      severity: "moderate",
      fix: "Focus on one flagship project and promote it — add a polished README, share on dev communities",
    });
  }

  if (percentiles.languageBreadth < 25) {
    gaps.push({
      gap: "Language breadth is narrow — may be perceived as single-language specialist",
      severity: "minor",
      fix: "Add 1–2 side projects in a complementary language to show versatility",
    });
  }

  // Repo quality gaps
  const lowReadmeRepos = repos.filter((r) => r.readmeScore < 40);
  if (lowReadmeRepos.length > repos.length * 0.5) {
    gaps.push({
      gap: `${lowReadmeRepos.length} of ${repos.length} repos have poor documentation`,
      severity: "critical",
      fix: "Add structured READMEs to your top repos — badges, install steps, screenshots. Recruiters scan in <10 seconds",
    });
  }

  return gaps.sort((a, b) => {
    const order = { critical: 0, moderate: 1, minor: 2 };
    return order[a.severity] - order[b.severity];
  });
}

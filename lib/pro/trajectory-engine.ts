import type { Repository, LanguageStat } from "@/types";
import type {
  TechTrajectory,
  StackProfile,
  PredictedPath,
  StackMaturity,
  MarketFit,
} from "@/types/pro";
import { findSkill } from "./skill-taxonomy";

/**
 * Technology Trajectory Engine
 * 
 * Analyzes stack composition, technology adoption patterns, and
 * predicts career direction based on recent activity signals.
 */

// ─── Market demand data (public sources: SO Survey 2024 + LinkedIn) ─────

const HIGH_DEMAND_SKILLS = [
  "TypeScript", "Python", "Go", "Rust", "Kubernetes", "Docker",
  "React", "Next.js", "AWS", "GCP", "PostgreSQL", "Redis",
  "GraphQL", "FastAPI", "Machine Learning", "PyTorch",
];

const RISING_SKILLS = [
  "Rust", "Zig", "Svelte", "Astro", "Bun", "Deno",
  "HTMX", "Generative AI", "LangChain", "WASM",
  "Solid.js", "Drizzle", "tRPC",
];

const DECLINING_SKILLS = [
  "jQuery", "Angular", "PHP", "Perl", "CoffeeScript",
  "Backbone.js", "Grunt", "Bower",
];

// Career path mappings
const CAREER_PATHS: {
  signal: string[];
  direction: string;
  roles: string[];
}[] = [
  {
    signal: ["Rust", "C++", "C", "Systems Programming", "WASM"],
    direction: "Systems programming and performance engineering",
    roles: ["Systems Engineer", "Performance Engineer", "Embedded Developer"],
  },
  {
    signal: ["Python", "PyTorch", "TensorFlow", "Machine Learning", "NLP"],
    direction: "Machine learning and AI engineering",
    roles: ["ML Engineer", "AI Researcher", "Data Scientist"],
  },
  {
    signal: ["Go", "Kubernetes", "Docker", "Terraform", "AWS"],
    direction: "Cloud infrastructure and platform engineering",
    roles: ["Platform Engineer", "SRE", "DevOps Engineer", "Cloud Architect"],
  },
  {
    signal: ["TypeScript", "React", "Next.js", "GraphQL", "Tailwind CSS"],
    direction: "Modern frontend and full-stack web development",
    roles: ["Senior Frontend Engineer", "Full-Stack Engineer", "Staff Engineer"],
  },
  {
    signal: ["Solidity", "TypeScript", "Blockchain", "Cryptography"],
    direction: "Web3 and blockchain engineering",
    roles: ["Smart Contract Developer", "Protocol Engineer", "Web3 Engineer"],
  },
  {
    signal: ["Python", "FastAPI", "PostgreSQL", "Redis", "Microservices"],
    direction: "Backend and API engineering",
    roles: ["Backend Engineer", "API Engineer", "Systems Architect"],
  },
  {
    signal: ["React Native", "Flutter", "Swift", "Kotlin", "Dart"],
    direction: "Mobile application development",
    roles: ["Mobile Engineer", "iOS Developer", "Android Developer"],
  },
  {
    signal: ["Python", "Pandas", "SQL", "Jupyter", "Data Engineering"],
    direction: "Data engineering and analytics",
    roles: ["Data Engineer", "Analytics Engineer", "BI Developer"],
  },
];

// ─── Main Engine ─────────────────────────────────────────────

export function computeTechTrajectory(
  repos: Repository[],
  langs: LanguageStat[]
): TechTrajectory {
  const currentStack = computeStackProfile(repos, langs);
  const stackAge = computeStackMaturity(repos, langs);
  const predictedPath = predictCareerPath(langs, repos, currentStack);
  const marketFit = computeMarketFit(currentStack, stackAge);

  return { currentStack, predictedPath, stackAge, marketFit };
}

// ─── Stack Profile ───────────────────────────────────────────

function computeStackProfile(repos: Repository[], langs: LanguageStat[]): StackProfile {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Primary: >= 15% of codebase
  const primary = langs
    .filter((l) => l.percentage >= 15)
    .map((l) => l.language);

  // Secondary: 3-15% of codebase
  const secondary = langs
    .filter((l) => l.percentage >= 3 && l.percentage < 15)
    .map((l) => l.language);

  // Exploring: less than 3 months of activity (recent repos only)
  const recentLangs = new Set<string>();
  for (const repo of repos) {
    const updated = new Date(repo.updatedAt);
    if (updated > threeMonthsAgo && repo.language) {
      // If this language isn't already primary/secondary, it's exploring
      if (!primary.includes(repo.language) && !secondary.includes(repo.language)) {
        recentLangs.add(repo.language);
      }
    }
  }

  // Also add framework/tool signals from topics
  const recentTopics = repos
    .filter((r) => new Date(r.updatedAt) > threeMonthsAgo)
    .flatMap((r) => r.topics);

  for (const topic of recentTopics) {
    const skill = findSkill(topic);
    if (skill && !primary.includes(skill.canonical) && !secondary.includes(skill.canonical)) {
      recentLangs.add(skill.canonical);
    }
  }

  return {
    primary,
    secondary,
    exploring: Array.from(recentLangs).slice(0, 5),
  };
}

// ─── Stack Maturity ──────────────────────────────────────────

function computeStackMaturity(repos: Repository[], langs: LanguageStat[]): StackMaturity[] {
  const techMap = new Map<string, { firstSeen: Date; lastSeen: Date; repoCount: number; percentage: number }>();

  for (const repo of repos) {
    if (!repo.language) continue;
    const lang = repo.language;
    const date = new Date(repo.updatedAt);

    const existing = techMap.get(lang);
    if (!existing) {
      const langStat = langs.find((l) => l.language === lang);
      techMap.set(lang, {
        firstSeen: date,
        lastSeen: date,
        repoCount: 1,
        percentage: langStat?.percentage || 0,
      });
    } else {
      if (date < existing.firstSeen) existing.firstSeen = date;
      if (date > existing.lastSeen) existing.lastSeen = date;
      existing.repoCount++;
    }
  }

  const now = new Date();

  return Array.from(techMap.entries())
    .map(([tech, data]) => {
      const monthsActive = Math.max(1, Math.floor(
        (data.lastSeen.getTime() - data.firstSeen.getTime()) / (30 * 24 * 60 * 60 * 1000)
      ));

      let proficiency: StackMaturity["proficiency"];
      if (monthsActive >= 36 && data.repoCount >= 8 && data.percentage >= 15) {
        proficiency = "expert";
      } else if (monthsActive >= 12 && data.repoCount >= 4) {
        proficiency = "proficient";
      } else if (monthsActive >= 3 && data.repoCount >= 2) {
        proficiency = "competent";
      } else {
        proficiency = "learning";
      }

      const evidence = `${data.repoCount} repos over ${monthsActive} months (${data.percentage}% of codebase)`;

      return { technology: tech, monthsActive, proficiency, evidence };
    })
    .sort((a, b) => {
      const profOrder = { expert: 0, proficient: 1, competent: 2, learning: 3 };
      return profOrder[a.proficiency] - profOrder[b.proficiency];
    });
}

// ─── Career Path Prediction ─────────────────────────────────

function predictCareerPath(
  langs: LanguageStat[],
  repos: Repository[],
  stack: StackProfile
): PredictedPath {
  const allSignals = [
    ...stack.primary,
    ...stack.secondary,
    ...stack.exploring,
    ...repos.flatMap((r) => r.topics),
  ].map((s) => s.toLowerCase());

  let bestPath = CAREER_PATHS[0];
  let bestScore = 0;
  let bestEvidence: string[] = [];

  for (const path of CAREER_PATHS) {
    const matched = path.signal.filter((s) =>
      allSignals.some((sig) => sig.includes(s.toLowerCase()))
    );
    const score = matched.length / path.signal.length;

    if (score > bestScore) {
      bestScore = score;
      bestPath = path;
      bestEvidence = matched.map((m) => `${m} detected in stack`);
    }
  }

  // Add exploring signals as evidence
  if (stack.exploring.length > 0) {
    bestEvidence.push(`Recently exploring: ${stack.exploring.join(", ")}`);
  }

  return {
    direction: bestPath.direction,
    confidence: Math.min(95, Math.round(bestScore * 100)),
    evidence: bestEvidence.slice(0, 5),
    suggestedRoles: bestPath.roles,
  };
}

// ─── Market Fit ──────────────────────────────────────────────

function computeMarketFit(stack: StackProfile, maturity: StackMaturity[]): MarketFit {
  const allSkills = [...stack.primary, ...stack.secondary, ...stack.exploring];
  const allSkillsLower = allSkills.map((s) => s.toLowerCase());

  const hotSkills = HIGH_DEMAND_SKILLS.filter((s) =>
    allSkillsLower.includes(s.toLowerCase())
  );

  const risingSkills = RISING_SKILLS.filter((s) =>
    allSkillsLower.includes(s.toLowerCase())
  );

  const gapSkills = HIGH_DEMAND_SKILLS.filter(
    (s) => !allSkillsLower.includes(s.toLowerCase())
  ).slice(0, 5);

  const obsoleteRisk = DECLINING_SKILLS.filter((s) =>
    allSkillsLower.includes(s.toLowerCase())
  );

  return { hotSkills, risingSkills, gapSkills, obsoleteRisk };
}

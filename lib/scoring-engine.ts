import type {
  Repository,
  LanguageStat,
  WeeklyCommit,
  CareerAlignment,
  SkillRadarPoint,
  Recommendation,
  HeatmapDay,
  GitHubProfile,
  ScoreBreakdown,
  ScoreDimension,
  RedFlag,
  CompletenessScore,
  RepoQualityCard,
} from "@/types";

// ─── Constants ────────────────────────────────────────────────
const WEIGHTS = {
  projectQuality: 0.30,
  consistency: 0.20,
  breadth: 0.15,
  depth: 0.15,
  documentation: 0.10,
  community: 0.10,
} as const;

/**
 * Role signal vectors — each role has weighted preferences across
 * language affinity, topic keywords, and structural patterns.
 */
const ROLE_SIGNALS: Record<string, {
  languages: Record<string, number>;
  topics: string[];
  color: string;
}> = {
  "Full-Stack SWE": {
    languages: { TypeScript: 3, JavaScript: 3, Python: 1, Go: 1, Ruby: 1 },
    topics: ["nextjs", "react", "api", "fullstack", "graphql", "prisma", "database", "frontend", "backend", "vercel", "supabase"],
    color: "#00ff88",
  },
  "Backend Eng.": {
    languages: { Go: 4, Python: 3, Java: 3, Rust: 2, "C++": 2, TypeScript: 1 },
    topics: ["api", "microservices", "grpc", "database", "cache", "redis", "kafka", "queue", "server", "backend", "orm", "performance"],
    color: "#38bdf8",
  },
  "Frontend Eng.": {
    languages: { TypeScript: 4, JavaScript: 4, CSS: 3 },
    topics: ["react", "vue", "svelte", "nextjs", "css", "ui", "design-system", "animation", "frontend", "tailwind", "component"],
    color: "#a78bfa",
  },
  "ML Engineer": {
    languages: { Python: 5, R: 3, Julia: 2 },
    topics: ["machine-learning", "deep-learning", "pytorch", "tensorflow", "sklearn", "pandas", "numpy", "nlp", "cv", "ml", "ai", "data-science", "model"],
    color: "#f5a623",
  },
  "DevOps Eng.": {
    languages: { Go: 2, Python: 2, Shell: 3, HCL: 4 },
    topics: ["docker", "kubernetes", "terraform", "ci-cd", "aws", "gcp", "azure", "devops", "infrastructure", "monitoring", "helm", "ansible"],
    color: "#f87171",
  },
  "Research Eng.": {
    languages: { Python: 3, "C++": 3, Rust: 2, Julia: 2 },
    topics: ["research", "paper", "algorithm", "math", "simulation", "compiler", "formal-verification", "proof", "optimization"],
    color: "#4a5568",
  },
};

const ARCHETYPES = [
  {
    name: "Full-Stack Engineer",
    description: "You span both frontend and backend with strong JavaScript/TypeScript signals. Your projects show a pattern of shipping end-to-end — from UI to API to deployment.",
    test: (langs: LanguageStat[], topics: string[]) => {
      const tsJs = sumLangPercent(langs, ["TypeScript", "JavaScript"]);
      const hasFront = topics.some(t => ["react", "vue", "svelte", "nextjs", "frontend", "css", "ui"].includes(t));
      const hasBack = topics.some(t => ["api", "backend", "database", "server", "prisma", "graphql"].includes(t));
      return tsJs > 30 && hasFront && hasBack ? tsJs * 1.2 : 0;
    },
  },
  {
    name: "Backend Engineer",
    description: "Your codebase leans heavily server-side — APIs, data stores, and infrastructure. You build the systems that other systems depend on.",
    test: (langs: LanguageStat[], topics: string[]) => {
      const backLangs = sumLangPercent(langs, ["Go", "Python", "Java", "Rust", "C++"]);
      const hasBack = topics.filter(t => ["api", "backend", "server", "cache", "redis", "grpc", "microservices", "queue"].includes(t)).length;
      return backLangs > 40 && hasBack >= 1 ? backLangs + hasBack * 5 : 0;
    },
  },
  {
    name: "Frontend Engineer",
    description: "You're visually driven — React, CSS, component libraries, and pixel-perfect UIs. Your GitHub screams interactive experiences.",
    test: (langs: LanguageStat[], topics: string[]) => {
      const frontLangs = sumLangPercent(langs, ["TypeScript", "JavaScript", "CSS"]);
      const hasFront = topics.filter(t => ["react", "vue", "svelte", "css", "ui", "design-system", "animation", "component", "frontend"].includes(t)).length;
      const noBack = !topics.some(t => ["api", "backend", "server", "database"].includes(t));
      return frontLangs > 50 && hasFront >= 2 && noBack ? frontLangs + hasFront * 8 : 0;
    },
  },
  {
    name: "ML Engineer",
    description: "Python-dominant with clear machine learning signals — model training, data pipelines, and scientific computing. Your repos tell an experimentation story.",
    test: (langs: LanguageStat[], topics: string[]) => {
      const py = sumLangPercent(langs, ["Python", "R", "Julia"]);
      const hasML = topics.filter(t => ["machine-learning", "ml", "deep-learning", "pytorch", "tensorflow", "sklearn", "pandas", "ai", "nlp", "data-science"].includes(t)).length;
      return py > 30 && hasML >= 1 ? py + hasML * 10 : 0;
    },
  },
  {
    name: "DevOps Engineer",
    description: "Infrastructure-as-code, containers, and deployment pipelines. You're the person who makes sure everything actually runs in production.",
    test: (langs: LanguageStat[], topics: string[]) => {
      const devopsTopics = topics.filter(t => ["docker", "kubernetes", "terraform", "ci-cd", "aws", "gcp", "azure", "devops", "infrastructure", "helm"].includes(t)).length;
      const hasShell = sumLangPercent(langs, ["Shell", "HCL", "Dockerfile"]);
      return devopsTopics >= 2 ? devopsTopics * 15 + hasShell : 0;
    },
  },
  {
    name: "Open Source Maintainer",
    description: "High star counts, active fork communities, and consistent maintenance patterns. You don't just build — you cultivate ecosystems.",
    test: (_langs: LanguageStat[], _topics: string[], repos?: Repository[]) => {
      if (!repos) return 0;
      const totalStars = repos.reduce((s, r) => s + r.stars, 0);
      const avgForkRatio = repos.reduce((s, r) => s + (r.stars > 0 ? r.forks / r.stars : 0), 0) / repos.length;
      return totalStars > 500 && avgForkRatio > 0.05 ? Math.log10(totalStars) * 20 + avgForkRatio * 100 : 0;
    },
  },
  {
    name: "Research Engineer",
    description: "Low-visibility but deeply technical repos — algorithm implementations, formal proofs, and academic-adjacent code. Quality over popularity.",
    test: (langs: LanguageStat[], topics: string[], repos?: Repository[]) => {
      const researchTopics = topics.filter(t => ["research", "algorithm", "paper", "math", "compiler", "simulation", "proof"].includes(t)).length;
      const hasDepth = repos ? repos.some(r => r.impactScore > 70 && r.stars < 50) : false;
      return researchTopics >= 1 || hasDepth ? researchTopics * 15 + (hasDepth ? 30 : 0) : 0;
    },
  },
];

// ─── Helper Functions ─────────────────────────────────────────

function sumLangPercent(langs: LanguageStat[], names: string[]): number {
  return langs
    .filter((l) => names.includes(l.language))
    .reduce((sum, l) => sum + l.percentage, 0);
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Shannon entropy — measures language diversity.
 * H = -Σ(p * log2(p)) normalized to [0, 100]
 * Max entropy = log2(N) where N = number of languages
 */
function shannonEntropy(langs: LanguageStat[]): number {
  const total = langs.reduce((s, l) => s + l.percentage, 0);
  if (total === 0) return 0;
  const probs = langs.map((l) => l.percentage / total).filter((p) => p > 0);
  const H = -probs.reduce((s, p) => s + p * Math.log2(p), 0);
  const maxH = Math.log2(probs.length || 1);
  return maxH > 0 ? (H / maxH) * 100 : 0;
}

/**
 * Coefficient of Variation — measures commit consistency.
 * CV = σ/μ. Lower CV = more consistent. Mapped inversely to 0–100.
 */
function commitConsistency(commits: WeeklyCommit[]): number {
  const vals = commits.map((w) => w.commits);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  if (mean === 0) return 0;
  const variance = vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length;
  const cv = Math.sqrt(variance) / mean;
  // CV of 0 = perfect consistency (100), CV of 1.5+ = very inconsistent (0)
  return clamp(Math.round((1 - cv / 1.5) * 100));
}

// ─── Dimension Scorers ────────────────────────────────────────

/**
 * Project Quality (30%)
 * Signals: star-to-fork ratio, non-fork ratio, topic coverage, star velocity
 */
export function scoreProjectQuality(repos: Repository[]): ScoreDimension {
  const originals = repos.filter((r) => !r.isForked);
  const nonForkRatio = repos.length > 0 ? originals.length / repos.length : 0;

  // Star-weighted quality: log-scaled avg stars across originals
  const avgStars = originals.length > 0
    ? originals.reduce((s, r) => s + r.stars, 0) / originals.length
    : 0;
  const starSignal = clamp(Math.log10(avgStars + 1) * 33); // log10(1000)=3 → 99

  // Topic coverage: repos with 2+ topics / total
  const topicCoverage = repos.length > 0
    ? repos.filter((r) => r.topics.length >= 2).length / repos.length
    : 0;

  // Impact score average
  const avgImpact = repos.length > 0
    ? repos.reduce((s, r) => s + r.impactScore, 0) / repos.length
    : 0;

  const score = clamp(Math.round(
    starSignal * 0.35 +
    nonForkRatio * 100 * 0.2 +
    topicCoverage * 100 * 0.15 +
    avgImpact * 0.3
  ));

  return {
    label: "Project Quality",
    score,
    weight: WEIGHTS.projectQuality,
    methodology: `Star velocity (log-scaled avg ${Math.round(avgStars)} stars → ${Math.round(starSignal)}/100), ` +
      `${Math.round(nonForkRatio * 100)}% original repos, ` +
      `${Math.round(topicCoverage * 100)}% with 2+ topics, ` +
      `avg impact ${Math.round(avgImpact)}/100`,
  };
}

/**
 * Consistency (20%)
 * Signals: commit CV, streak days, active days ratio
 */
export function scoreConsistency(
  commits: WeeklyCommit[],
  streakDays: number,
  heatmap: HeatmapDay[]
): ScoreDimension {
  const cv = commitConsistency(commits);
  const activeDays = heatmap.filter((d) => d.count > 0).length;
  const activeRatio = clamp(Math.round((activeDays / 365) * 100));
  const streakSignal = clamp(Math.round(Math.log2(streakDays + 1) * 20)); // log2(32)=5 → 100

  const score = clamp(Math.round(
    cv * 0.45 +
    activeRatio * 0.30 +
    streakSignal * 0.25
  ));

  return {
    label: "Consistency",
    score,
    weight: WEIGHTS.consistency,
    methodology: `Commit CV score ${cv}/100, ` +
      `${activeDays}/365 active days (${activeRatio}%), ` +
      `${streakDays}-day streak (${streakSignal}/100)`,
  };
}

/**
 * Breadth (15%)
 * Signals: language Shannon entropy, unique topics, cross-domain coverage
 */
export function scoreBreadth(langs: LanguageStat[], repos: Repository[]): ScoreDimension {
  const entropy = Math.round(shannonEntropy(langs));
  const allTopics = new Set(repos.flatMap((r) => r.topics));
  const topicDiversity = clamp(Math.round(Math.min(allTopics.size / 15, 1) * 100));

  // Cross-domain: how many different "domains" do repos touch?
  const domains = new Set<string>();
  const domainMap: Record<string, string[]> = {
    frontend: ["react", "vue", "svelte", "css", "ui", "frontend"],
    backend: ["api", "backend", "server", "database", "graphql"],
    ml: ["machine-learning", "ml", "ai", "deep-learning", "data-science"],
    devops: ["docker", "kubernetes", "terraform", "ci-cd", "devops"],
    mobile: ["react-native", "flutter", "ios", "android", "mobile"],
  };
  Array.from(allTopics).forEach((topic) => {
    for (const [domain, keywords] of Object.entries(domainMap)) {
      if (keywords.includes(topic)) domains.add(domain);
    }
  });
  const domainScore = clamp(Math.round((domains.size / 4) * 100));

  const score = clamp(Math.round(
    entropy * 0.4 +
    topicDiversity * 0.35 +
    domainScore * 0.25
  ));

  return {
    label: "Skill Breadth",
    score,
    weight: WEIGHTS.breadth,
    methodology: `Shannon entropy ${entropy}/100 across ${langs.length} languages, ` +
      `${allTopics.size} unique topics (${topicDiversity}/100), ` +
      `${domains.size} cross-domain signals`,
  };
}

/**
 * Depth (15%)
 * Signals: max repo stars (log-scaled), top impact score, single-language mastery
 */
export function scoreDepth(repos: Repository[], langs: LanguageStat[]): ScoreDimension {
  const maxStars = repos.length > 0 ? Math.max(...repos.map((r) => r.stars)) : 0;
  const starDepth = clamp(Math.round(Math.log10(maxStars + 1) * 30));

  const maxImpact = repos.length > 0 ? Math.max(...repos.map((r) => r.impactScore)) : 0;

  // Mastery: top language percentage as a depth signal
  const topLangPct = langs.length > 0 ? langs[0].percentage : 0;
  const masterySignal = clamp(Math.round(topLangPct * 1.2)); // 40% → 48, 80% → 96

  const score = clamp(Math.round(
    starDepth * 0.30 +
    maxImpact * 0.40 +
    masterySignal * 0.30
  ));

  return {
    label: "Technical Depth",
    score,
    weight: WEIGHTS.depth,
    methodology: `Top repo ${maxStars} stars (${starDepth}/100 log-scaled), ` +
      `peak impact ${maxImpact}/100, ` +
      `${topLangPct}% mastery in ${langs[0]?.language || "N/A"}`,
  };
}

/**
 * Documentation (10%)
 * Signals: avg README score, description fill rate, topic fill rate
 */
export function scoreDocumentation(repos: Repository[]): ScoreDimension {
  const avgReadme = repos.length > 0
    ? Math.round(repos.reduce((s, r) => s + r.readmeScore, 0) / repos.length)
    : 0;
  const descRate = repos.length > 0
    ? Math.round((repos.filter((r) => r.description && r.description.length > 10).length / repos.length) * 100)
    : 0;
  const topicRate = repos.length > 0
    ? Math.round((repos.filter((r) => r.topics.length >= 1).length / repos.length) * 100)
    : 0;

  const score = clamp(Math.round(
    avgReadme * 0.50 +
    descRate * 0.30 +
    topicRate * 0.20
  ));

  return {
    label: "Documentation",
    score,
    weight: WEIGHTS.documentation,
    methodology: `Avg README score ${avgReadme}/100, ` +
      `${descRate}% repos have descriptions, ` +
      `${topicRate}% repos have topic tags`,
  };
}

/**
 * Community (10%)
 * Signals: follower/following ratio, total stars (log-scaled), fork attraction
 */
export function scoreCommunity(profile: GitHubProfile, repos: Repository[]): ScoreDimension {
  // Follower ratio — capped at 10x
  const ratio = profile.following > 0
    ? Math.min(profile.followers / profile.following, 10)
    : Math.min(profile.followers, 10);
  const ratioScore = clamp(Math.round((ratio / 10) * 100));

  // Total stars, log-scaled
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const starScore = clamp(Math.round(Math.log10(totalStars + 1) * 30));

  // Fork attraction: avg forks per star
  const forkRate = totalStars > 0
    ? repos.reduce((s, r) => s + r.forks, 0) / totalStars
    : 0;
  const forkScore = clamp(Math.round(Math.min(forkRate / 0.15, 1) * 100));

  const score = clamp(Math.round(
    ratioScore * 0.30 +
    starScore * 0.45 +
    forkScore * 0.25
  ));

  return {
    label: "Community",
    score,
    weight: WEIGHTS.community,
    methodology: `Follower ratio ${profile.followers}:${profile.following} (${ratioScore}/100), ` +
      `${totalStars} total stars (${starScore}/100), ` +
      `fork attraction rate ${(forkRate * 100).toFixed(1)}%`,
  };
}

// ─── Composite Score ──────────────────────────────────────────

export function computeScoreBreakdown(
  profile: GitHubProfile,
  repos: Repository[],
  langs: LanguageStat[],
  commits: WeeklyCommit[],
  streakDays: number,
  heatmap: HeatmapDay[]
): ScoreBreakdown {
  const dimensions = [
    scoreProjectQuality(repos),
    scoreConsistency(commits, streakDays, heatmap),
    scoreBreadth(langs, repos),
    scoreDepth(repos, langs),
    scoreDocumentation(repos),
    scoreCommunity(profile, repos),
  ];

  const total = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  return { total, dimensions };
}

// ─── Career Alignment ─────────────────────────────────────────

export function computeCareerAlignment(
  langs: LanguageStat[],
  repos: Repository[]
): CareerAlignment[] {
  const allTopics = repos.flatMap((r) => r.topics.map((t) => t.toLowerCase()));

  return Object.entries(ROLE_SIGNALS)
    .map(([role, config]) => {
      // Language affinity score
      let langScore = 0;
      let langMax = 0;
      for (const [lang, weight] of Object.entries(config.languages)) {
        const pct = langs.find((l) => l.language === lang)?.percentage || 0;
        langScore += (pct / 100) * weight;
        langMax += weight;
      }
      const normalizedLang = langMax > 0 ? (langScore / langMax) * 100 : 0;

      // Topic match score
      const topicMatches = config.topics.filter((t) => allTopics.includes(t)).length;
      const topicScore = Math.min(topicMatches / 3, 1) * 100; // 3+ matches = 100

      const score = clamp(Math.round(normalizedLang * 0.55 + topicScore * 0.45));

      return { role, score, color: config.color };
    })
    .sort((a, b) => b.score - a.score);
}

// ─── Skill Radar ──────────────────────────────────────────────

export function computeSkillRadar(breakdown: ScoreBreakdown): SkillRadarPoint[] {
  return breakdown.dimensions.map((d) => ({
    subject: d.label.replace("Technical ", "").replace("Skill ", ""),
    score: d.score,
    fullMark: 100,
  }));
}

// ─── Archetype Classification ─────────────────────────────────

export function classifyArchetype(
  langs: LanguageStat[],
  repos: Repository[]
): { name: string; description: string } {
  const allTopics = repos.flatMap((r) => r.topics.map((t) => t.toLowerCase()));

  let best = { name: "Full-Stack Engineer", description: ARCHETYPES[0].description, score: 0 };

  for (const archetype of ARCHETYPES) {
    const score = archetype.test(langs, allTopics, repos);
    if (score > best.score) {
      best = { name: archetype.name, description: archetype.description, score };
    }
  }

  return { name: best.name, description: best.description };
}

// ─── Recommendation Engine ────────────────────────────────────

export function generateRecommendations(
  repos: Repository[],
  langs: LanguageStat[],
  commits: WeeklyCommit[],
  breakdown: ScoreBreakdown,
  allRepos: Repository[],
  completeness: CompletenessScore,
  redFlags: RedFlag[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  let id = 0;

  // README quality check
  const lowReadme = repos.filter((r) => r.readmeScore < 60);
  if (lowReadme.length > 0) {
    const estimatedScoreImpact = Math.round((lowReadme.length / repos.length) * 12);
    recs.push({
      id: `r${++id}`,
      type: "warning",
      title: "README quality is dragging your score down",
      description: `${lowReadme.length} of your top repos (${lowReadme.map(r => r.name).join(", ")}) have README scores under 60. Add badges, installation steps, and usage examples.`,
      impact: "high",
      estimatedScoreImpact: estimatedScoreImpact > 0 ? estimatedScoreImpact : 2
    });
  }

  // Commit consistency check
  const consistencyDim = breakdown.dimensions.find((d) => d.label === "Consistency");
  if (consistencyDim && consistencyDim.score < 60) {
    const vals = commits.map((w) => w.commits);
    const lowWeeks = vals.filter((v) => v < 5).length;
    const impact = 95 - consistencyDim.score;
    recs.push({
      id: `r${++id}`,
      type: "improvement",
      title: "Commit frequency is too spiky",
      description: `You have ${lowWeeks} weeks with <5 commits out of ${commits.length} total. A more consistent cadence (even 2-3 commits on slow weeks) improves your consistency signal.`,
      impact: "medium",
      estimatedScoreImpact: Math.min(Math.round(impact * 0.2), 15) // Consistency is 20% weight
    });
  }

  // Missing deployment signals
  const allTopics = repos.flatMap((r) => r.topics);
  const hasML = allTopics.some((t) => ["machine-learning", "ml", "ai", "deep-learning", "pytorch", "tensorflow"].includes(t));
  const hasDeployment = repos.some(r => r.hasPages || r.topics.some(t => ["docker", "kubernetes", "deployment", "api", "fastapi", "serverless"].includes(t)));
  if (hasML && !hasDeployment) {
    recs.push({
      id: `r${++id}`,
      type: "opportunity",
      title: "Strong ML signals, but no deployment project",
      description: "You show ML competency but lack a deployed inference project. A FastAPI + ONNX inference service would unlock ML Engineer roles.",
      impact: "high",
      estimatedScoreImpact: 8
    });
  }

  // DevOps gap
  const devopsTopics = allTopics.filter((t) => ["docker", "kubernetes", "terraform", "ci-cd", "devops"].includes(t));
  if (devopsTopics.length === 0) {
    recs.push({
      id: `r${++id}`,
      type: "improvement",
      title: "Zero infrastructure signals detected",
      description: "No Dockerfile, Kubernetes, or Terraform signals found. A containerized project pushes your DevOps alignment.",
      impact: "medium",
      estimatedScoreImpact: 5
    });
  }

  // Viral threshold
  const topRepo = repos[0];
  if (topRepo && topRepo.stars > 500 && topRepo.stars < 5000) {
    const threshold = topRepo.stars < 2000 ? "Hacker News" : "trending GitHub";
    recs.push({
      id: `r${++id}`,
      type: "opportunity",
      title: `${topRepo.name} is approaching viral threshold`,
      description: `At ${topRepo.stars.toLocaleString()} stars, you're within striking distance of ${threshold} territory. High-leverage.`,
      impact: "high",
      estimatedScoreImpact: 10
    });
  }

  // Language diversity
  const breadthDim = breakdown.dimensions.find((d) => d.label === "Skill Breadth");
  if (breadthDim && breadthDim.score < 50) {
    recs.push({
      id: `r${++id}`,
      type: "improvement",
      title: "Language diversity is below average",
      description: `Your breadth score is ${breadthDim.score}/100. Consider adding a project in a complementary language to demonstrate versatility.`,
      impact: "medium",
      estimatedScoreImpact: 6
    });
  }
  
  // Profile Completeness Gap
  if (completeness.score < 8) {
    recs.push({
      id: `r${++id}`,
      type: "improvement",
      title: "Incomplete Profile Visibility",
      description: `Your profile completeness is ${completeness.score}/8. Fixing missing fields like your bio or location makes an immediate positive impression.`,
      impact: "high",
      estimatedScoreImpact: (8 - completeness.score) * 2
    });
  }

  // Focus on top recommendation
  recs.sort((a, b) => (b.estimatedScoreImpact || 0) - (a.estimatedScoreImpact || 0));

  return recs.slice(0, 6); // Cap at 6 recommendations
}

// ─── New Priority Features ─────────────────────────────────────

export function scoreRepoQuality(repo: Repository, commits: WeeklyCommit[]): RepoQualityCard {
  // Activity score based on commits
  const commitCount = commits.reduce((sum, w) => sum + w.commits, 0); // Simplified activity proxy
  
  // Test File Ratio heuristic (approximated here by topics or simple presence if we had tree scope)
  const testsScore = repo.topics.some(t => ["test", "jest", "pytest", "mocha", "cypress"].includes(t)) ? 100 : 0;
  
  // Deployment Signal
  const deploymentScore = repo.hasPages || repo.topics.some(t => ["vercel", "netlify", "docker", "kubernetes", "aws", "deploy"].includes(t)) ? 100 : 0;
  
  const descriptionScore = repo.description && repo.description.length > 10 ? 100 : 0;
  
  const activityScore = Math.min(Math.round(repo.impactScore * 1.5), 100);

  const total = Math.round(
    repo.readmeScore * 0.3 + testsScore * 0.2 + activityScore * 0.2 + deploymentScore * 0.15 + descriptionScore * 0.15
  );

  return {
    readme: repo.readmeScore,
    tests: testsScore,
    activity: activityScore,
    deployment: deploymentScore,
    description: descriptionScore,
    total
  };
}

export function detectRedFlags(profile: GitHubProfile, repos: Repository[]): RedFlag[] {
  const flags: RedFlag[] = [];
  let id = 1;

  // 1. Forked repo dominance
  const forks = repos.filter(r => r.isForked).length;
  if (repos.length > 0 && forks / repos.length > 0.5) {
    flags.push({
      id: `flag-${id++}`,
      title: "Forked Repo Dominance",
      description: `More than 50% of your public repos are forks. Forks without subsequent commits add no signal and dilute your portfolio.`
    });
  }

  // 2. Repo name quality
  const badNames = ["test", "asdf", "repo1", "untitled", "copy", "new-folder", "temp"];
  const carelesslyNamed = repos.filter(r => badNames.includes(r.name.toLowerCase()));
  if (carelesslyNamed.length > 0) {
    flags.push({
      id: `flag-${id++}`,
      title: "Careless Repository Naming",
      description: `You have repos named like test, untitled, or temp. These signal carelessness about profile presentation and should be made private.`
    });
  }

  // 3. Stale pinned repos
  const pinned = repos.filter(r => r.isPinned);
  const stalePinned = pinned.filter(r => {
    const ageInDays = (new Date().getTime() - new Date(r.pushedAt || r.updatedAt).getTime()) / (1000 * 3600 * 24);
    return ageInDays > 365;
  });
  if (stalePinned.length > 0) {
    flags.push({
      id: `flag-${id++}`,
      title: "Stale Pinned Repositories",
      description: `You have pinned repos that haven't been touched in over a year. Consider pinning your most active and recent work.`
    });
  }

  // 4. Empty repo count (approximated by pushed_at equals created_at roughly, or very young)
  const empty = repos.filter(r => r.stars === 0 && r.forks === 0 && r.createdAt === r.pushedAt);
  if (empty.length > 3) {
    flags.push({
      id: `flag-${id++}`,
      title: "High Empty Repo Count",
      description: `You have ${empty.length} repositories with no substantive activity. These pad your repo count while contributing nothing.`
    });
  }

  return flags;
}

export function computeProfileCompleteness(profile: GitHubProfile, repos: Repository[]): CompletenessScore {
  const checks = [
    { label: "Profile photo set", passed: !!(profile.avatar && !profile.avatar.includes("identicon")) }, // simplistic identicon check
    { label: "Bio filled in", passed: profile.bio.length > 10 },
    { label: "Location set", passed: !!profile.location },
    { label: "Website or URL set", passed: !!profile.blog },
    { label: "Twitter/X handle linked", passed: !!profile.twitterUsername },
    { label: "Pinned repos configured", passed: repos.some(r => r.isPinned) },
    { label: "Repos with descriptions ratio > 50%", passed: repos.length > 0 && repos.filter(r => r.description).length / repos.length > 0.5 },
    { label: "Any repos with GitHub Pages", passed: repos.some(r => r.hasPages) }
  ];

  const score = checks.filter(c => c.passed).length;
  
  return {
    score,
    checks
  };
}


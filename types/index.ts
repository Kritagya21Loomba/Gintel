export interface GitHubProfile {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  createdAt: string;
}

export interface RepoQualityCard {
  readme: number;
  activity: number;
  tests: number;
  deployment: number;
  description: number;
  total: number;
}

export interface Repository {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  createdAt: string;
  pushedAt: string;
  url: string;
  readmeScore: number; // 0–100
  impactScore: number; // 0–100
  isForked: boolean;
  hasPages: boolean;
  isPinned: boolean;
  dependencyFiles: string[];
  qualityCard?: RepoQualityCard;
}

export interface LanguageStat {
  language: string;
  percentage: number;
  color: string;
}

export interface WeeklyCommit {
  week: string;
  commits: number;
}

export interface ScoreDimension {
  label: string;
  score: number;
  weight: number;
  methodology: string;
}

export interface ScoreBreakdown {
  total: number;
  dimensions: ScoreDimension[];
}

export interface RedFlag {
  id: string;
  title: string;
  description: string;
}

export interface CompletenessScore {
  score: number; // 0 to 8
  checks: { label: string; passed: boolean }[];
}

export interface AnalysisResult {
  profile: GitHubProfile;
  portfolioScore: number;
  scoreBreakdown: ScoreBreakdown;
  archetype: string;
  archetypeDescription: string;
  languageStats: LanguageStat[];
  weeklyCommits: WeeklyCommit[];
  topRepos: Repository[];
  careerAlignment: CareerAlignment[];
  skillRadar: SkillRadarPoint[];
  recommendations: Recommendation[];
  streakDays: number;
  totalCommitsYear: number;
  mostProductiveMonth: string;
  contributionHeatmap: HeatmapDay[];
  redFlags: RedFlag[];
  completeness: CompletenessScore;
}

export interface CareerAlignment {
  role: string;
  score: number;
  color: string;
}

export interface SkillRadarPoint {
  subject: string;
  score: number;
  fullMark: number;
}

export interface Recommendation {
  id: string;
  type: "warning" | "improvement" | "opportunity";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  estimatedScoreImpact?: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

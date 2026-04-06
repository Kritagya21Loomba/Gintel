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
  createdAt: string;
}

export interface Repository {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  url: string;
  readmeScore: number; // 0–100
  impactScore: number; // 0–100
  isForked: boolean;
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
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

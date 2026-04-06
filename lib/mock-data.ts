import type { AnalysisResult } from "@/types";
import {
  computeScoreBreakdown,
  computeCareerAlignment,
  computeSkillRadar,
  classifyArchetype,
  generateRecommendations,
} from "./scoring-engine";

const profile = {
  username: "alexchen",
  name: "Alex Chen",
  avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
  bio: "Building things that matter. Open source enthusiast. Coffee-driven.",
  followers: 847,
  following: 134,
  publicRepos: 62,
  company: "@vercel",
  location: "San Francisco, CA",
  blog: "alexchen.dev",
  createdAt: "2019-03-12",
};

const topRepos = [
  {
    name: "turbo-query",
    description: "A blazing-fast query engine for TypeScript with zero runtime deps",
    stars: 1243,
    forks: 87,
    language: "TypeScript",
    topics: ["typescript", "performance", "query", "orm"],
    updatedAt: "2024-01-15",
    url: "#",
    readmeScore: 88,
    impactScore: 91,
    isForked: false,
  },
  {
    name: "ml-pipeline-kit",
    description: "Modular ML pipeline components for Python data scientists",
    stars: 534,
    forks: 62,
    language: "Python",
    topics: ["machine-learning", "pipeline", "sklearn", "pandas"],
    updatedAt: "2023-11-20",
    url: "#",
    readmeScore: 72,
    impactScore: 78,
    isForked: false,
  },
  {
    name: "edge-router",
    description: "Lightweight HTTP router for edge runtimes (Cloudflare, Vercel Edge)",
    stars: 289,
    forks: 31,
    language: "TypeScript",
    topics: ["edge", "cloudflare", "routing", "serverless"],
    updatedAt: "2024-01-08",
    url: "#",
    readmeScore: 65,
    impactScore: 72,
    isForked: false,
  },
  {
    name: "devdash",
    description: "Personal developer dashboard with GitHub, Linear, Notion integrations",
    stars: 178,
    forks: 44,
    language: "TypeScript",
    topics: ["dashboard", "nextjs", "integrations"],
    updatedAt: "2023-12-29",
    url: "#",
    readmeScore: 55,
    impactScore: 61,
    isForked: false,
  },
  {
    name: "gopher-cache",
    description: "Redis-compatible in-memory cache written in Go",
    stars: 95,
    forks: 12,
    language: "Go",
    topics: ["go", "cache", "redis", "performance"],
    updatedAt: "2023-10-14",
    url: "#",
    readmeScore: 45,
    impactScore: 54,
    isForked: false,
  },
];

const languageStats = [
  { language: "TypeScript", percentage: 41, color: "#3178c6" },
  { language: "Python", percentage: 22, color: "#3572A5" },
  { language: "JavaScript", percentage: 17, color: "#f1e05a" },
  { language: "Go", percentage: 11, color: "#00ADD8" },
  { language: "Rust", percentage: 5, color: "#dea584" },
  { language: "Other", percentage: 4, color: "#4a5568" },
];

const weeklyCommits = [
  { week: "Nov W1", commits: 12 },
  { week: "Nov W2", commits: 8 },
  { week: "Nov W3", commits: 23 },
  { week: "Nov W4", commits: 5 },
  { week: "Dec W1", commits: 18 },
  { week: "Dec W2", commits: 31 },
  { week: "Dec W3", commits: 7 },
  { week: "Dec W4", commits: 2 },
  { week: "Jan W1", commits: 19 },
  { week: "Jan W2", commits: 27 },
  { week: "Jan W3", commits: 14 },
  { week: "Jan W4", commits: 33 },
  { week: "Feb W1", commits: 21 },
  { week: "Feb W2", commits: 9 },
  { week: "Feb W3", commits: 28 },
  { week: "Feb W4", commits: 16 },
];

const heatmap = generateHeatmap();
const streakDays = 18;

// ─── Run Scoring Engine on Mock Data ──────────────────────────

const scoreBreakdown = computeScoreBreakdown(
  profile, topRepos, languageStats, weeklyCommits, streakDays, heatmap
);

const careerAlignment = computeCareerAlignment(languageStats, topRepos);
const skillRadar = computeSkillRadar(scoreBreakdown);
const archetype = classifyArchetype(languageStats, topRepos);
const recommendations = generateRecommendations(topRepos, languageStats, weeklyCommits, scoreBreakdown);

// ─── Export ───────────────────────────────────────────────────

export const MOCK_DATA: AnalysisResult = {
  profile,
  portfolioScore: scoreBreakdown.total,
  scoreBreakdown,
  archetype: archetype.name,
  archetypeDescription: archetype.description,
  languageStats,
  weeklyCommits,
  topRepos,
  careerAlignment,
  skillRadar,
  recommendations,
  streakDays,
  totalCommitsYear: 847,
  mostProductiveMonth: "January",
  contributionHeatmap: heatmap,
};

function generateHeatmap() {
  const days = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const rand = Math.random();
    const count =
      rand < 0.3 ? 0 : rand < 0.5 ? 1 : rand < 0.7 ? 3 : rand < 0.85 ? 6 : 12;
    const level =
      count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
    days.push({
      date: d.toISOString().split("T")[0],
      count,
      level: level as 0 | 1 | 2 | 3 | 4,
    });
  }
  return days;
}

import type { AnalysisResult } from "@/types";
import type { AdvancedAnalysisResult } from "@/types/pro";
import { computeTemporalProfile } from "./temporal-engine";
import { computeCollaborationProfile } from "./collaboration-engine";
import { computeTechTrajectory } from "./trajectory-engine";
import { computeMarketPosition } from "./market-engine";

/**
 * Advanced Intelligence Orchestrator
 *
 * Runs all 4 numerical intelligence modules and assembles the result.
 * Purely data-driven — no LLM, no CV, no external APIs.
 */
export function runAdvancedAnalysis(
  analysis: AnalysisResult
): AdvancedAnalysisResult {
  // Module 1: Temporal Intelligence
  const temporal = computeTemporalProfile(
    analysis.topRepos,
    analysis.weeklyCommits,
    analysis.contributionHeatmap,
    analysis.languageStats
  );

  // Module 2: Collaboration DNA
  const collaboration = computeCollaborationProfile(
    analysis.topRepos,
    analysis.weeklyCommits,
    analysis.profile.followers,
    analysis.profile.publicRepos
  );

  // Module 3: Technology Trajectory
  const trajectory = computeTechTrajectory(
    analysis.topRepos,
    analysis.languageStats
  );

  // Module 4: Market Positioning
  const market = computeMarketPosition(
    analysis.profile,
    analysis.topRepos,
    analysis.languageStats,
    analysis.weeklyCommits,
    analysis.scoreBreakdown
  );

  return {
    temporal,
    collaboration,
    trajectory,
    market,
    generatedAt: new Date().toISOString(),
  };
}

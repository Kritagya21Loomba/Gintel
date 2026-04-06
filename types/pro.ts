// ─── Shared Types ────────────────────────────────────────────

export type SkillCategory =
  | "language"
  | "framework"
  | "infrastructure"
  | "database"
  | "cloud"
  | "practice"
  | "domain"
  | "soft";

// ─── Temporal Intelligence Types ─────────────────────────────

export interface TemporalProfile {
  productivityHeatmap: HeatmapCell[];
  peakWindow: string;
  nightOwlScore: number;
  weekendWarriorScore: number;
  monthlyActivity: MonthlyActivity[];
  growthTrajectory: "accelerating" | "stable" | "decelerating" | "sporadic";
  techTimeline: TechTimelineEntry[];
  burnoutSignals: BurnoutSignals;
}

export interface HeatmapCell {
  dayOfWeek: number;
  hourOfDay: number;
  intensity: number;
}

export interface MonthlyActivity {
  month: string;
  commits: number;
  newRepos: number;
  newLanguages: string[];
}

export interface TechTimelineEntry {
  technology: string;
  firstSeen: string;
  lastSeen: string;
  status: "active" | "abandoned" | "graduated";
}

export interface BurnoutSignals {
  risk: "low" | "moderate" | "high";
  signals: string[];
}

// ─── Collaboration DNA Types ─────────────────────────────────

export interface CollaborationProfile {
  prMetrics: PRMetrics;
  issueMetrics: IssueMetrics;
  style: CollaborationStyle;
  externalContributions: ExternalContribution[];
  teamSignals: TeamSignals;
}

export type CollaborationStyle =
  | "solo-builder"
  | "team-player"
  | "mentor"
  | "code-reviewer"
  | "community-leader";

export interface PRMetrics {
  totalPRs: number;
  avgPRSize: number;
  mergeRate: number;
  reviewsGiven: number;
  reviewsReceived: number;
}

export interface IssueMetrics {
  issuesOpened: number;
  issuesClosed: number;
  avgResponseTimeHours: number;
  bugReports: number;
  featureRequests: number;
}

export interface ExternalContribution {
  repo: string;
  type: "pr" | "issue" | "review";
  count: number;
  impact: string;
}

export interface TeamSignals {
  usesConventionalCommits: boolean;
  averageCommitSize: "atomic" | "medium" | "monolithic";
  codeReviewParticipation: number;
}

// ─── Technology Trajectory Types ─────────────────────────────

export interface TechTrajectory {
  currentStack: StackProfile;
  predictedPath: PredictedPath;
  stackAge: StackMaturity[];
  marketFit: MarketFit;
}

export interface StackProfile {
  primary: string[];
  secondary: string[];
  exploring: string[];
}

export interface PredictedPath {
  direction: string;
  confidence: number;
  evidence: string[];
  suggestedRoles: string[];
}

export interface StackMaturity {
  technology: string;
  monthsActive: number;
  proficiency: "learning" | "competent" | "proficient" | "expert";
  evidence: string;
}

export interface MarketFit {
  hotSkills: string[];
  risingSkills: string[];
  gapSkills: string[];
  obsoleteRisk: string[];
}

// ─── Market Positioning Types ────────────────────────────────

export interface MarketPosition {
  percentiles: PercentileRankings;
  compensationSignal: CompensationSignal;
  roleReadiness: RoleReadiness[];
  positioningGaps: PositioningGap[];
}

export interface PercentileRankings {
  overall: number;
  commits: number;
  starVelocity: number;
  repoQuality: number;
  languageBreadth: number;
}

export interface CompensationSignal {
  tier: "below-market" | "market" | "above-market" | "premium";
  drivers: string[];
}

export interface RoleReadiness {
  role: string;
  readiness: number;
  missingSignals: string[];
  strengthSignals: string[];
  timeToReady: string;
}

export interface PositioningGap {
  gap: string;
  severity: "critical" | "moderate" | "minor";
  fix: string;
}

// ─── Advanced Analysis Result ────────────────────────────────

export interface AdvancedAnalysisResult {
  temporal: TemporalProfile;
  collaboration: CollaborationProfile;
  trajectory: TechTrajectory;
  market: MarketPosition;
  generatedAt: string;
}

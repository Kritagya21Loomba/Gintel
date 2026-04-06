"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { MOCK_DATA } from "@/lib/mock-data";
import { fetchFullAnalysis } from "@/lib/github-api";
import { recordAnalysis } from "@/lib/metrics";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs, type TabId } from "@/components/dashboard/DashboardTabs";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatCard } from "@/components/ui/StatCard";
import { RepoCard } from "@/components/ui/RepoCard";
import { RecommendationCard } from "@/components/ui/RecommendationCard";
import { LanguageChart } from "@/components/charts/LanguageChart";
import { SkillRadar } from "@/components/charts/SkillRadar";
import { CommitChart } from "@/components/charts/CommitChart";
import { CareerAlignmentChart } from "@/components/charts/CareerAlignmentChart";
import { ContributionHeatmap } from "@/components/charts/ContributionHeatmap";
import { formatNumber } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { RedFlags } from "@/components/ui/RedFlags";
import { ProfileCompleteness } from "@/components/ui/ProfileCompleteness";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { ProSection } from "@/components/pro/ProSection";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 size={40} className="text-accent animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "mock";

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      if (mode === "live" && session && (session as any).accessToken) {
        try {
          const result = await fetchFullAnalysis((session as any).accessToken);
          setData(result);
          // Record metrics
          recordAnalysis(result.topRepos.length, result.recommendations.length);
        } catch (err: any) {
          console.error("GitHub API error:", err);
          setError("Failed to fetch GitHub data. Falling back to demo data.");
          setData(MOCK_DATA);
        }
      } else {
        setData(MOCK_DATA);
        // Record mock analysis for metrics
        recordAnalysis(MOCK_DATA.topRepos.length, MOCK_DATA.recommendations.length);
      }

      setLoading(false);
    }

    loadData();
  }, [mode, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-accent animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm text-text-dim">
            {mode === "live" ? "Analyzing your GitHub profile..." : "Loading analysis..."}
          </p>
          <div className="mt-4 space-y-2 max-w-xs mx-auto">
            {mode === "live" && (
              <>
                <LoadingStep label="Fetching repositories" delay={0} />
                <LoadingStep label="Computing language entropy" delay={600} />
                <LoadingStep label="Running scoring engine" delay={1200} />
                <LoadingStep label="Generating recommendations" delay={1800} />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-bg scanlines noise">
      <DashboardNav isLive={mode === "live"} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8" id="dashboard-main">
        {error && (
          <div className="mb-4 border border-amber/30 bg-amber/5 rounded-lg p-3 font-mono text-xs text-amber">
            ⚠ {error}
          </div>
        )}

        {/* Profile header */}
        <DashboardHeader data={data} />

        <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="animate-in fade-in duration-300">
          {activeTab === "overview" && (
            <>
              {/* Top stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard
                  label="Total Commits / Year"
                  value={formatNumber(data.totalCommitsYear)}
                  sub="public repos"
                  accent
                />
                <StatCard
                  label="Current Streak"
                  value={`${data.streakDays}d`}
                  sub="consecutive days"
                />
                <StatCard
                  label="Top Repo Stars"
                  value={formatNumber(data.topRepos[0]?.stars || 0)}
                  sub={data.topRepos[0]?.name || "–"}
                />
                <StatCard
                  label="Most Productive"
                  value={data.mostProductiveMonth}
                  sub="by commit count"
                />
              </div>

              {/* Commit activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <SectionCard title="Commit Velocity" badge="16 WEEKS">
                  <CommitChart data={data.weeklyCommits} />
                  <div className="flex gap-4 mt-3 pt-3 border-t border-border/50">
                    <div>
                      <span className="font-mono text-xs text-muted">Avg / week </span>
                      <span className="font-mono text-xs text-text font-bold">
                        {Math.round(
                          data.weeklyCommits.reduce((s, w) => s + w.commits, 0) /
                            data.weeklyCommits.length
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-muted">Peak </span>
                      <span className="font-mono text-xs text-accent font-bold">
                        {Math.max(...data.weeklyCommits.map((w) => w.commits))}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-muted">Consistency </span>
                      <span className="font-mono text-xs text-amber font-bold">
                        {data.scoreBreakdown.dimensions.find(d => d.label === "Consistency")?.score || "–"}%
                      </span>
                    </div>
                  </div>
                </SectionCard>

                {/* Contribution heatmap */}
                <SectionCard title="Contribution Graph" badge="365 DAYS">
                  <ContributionHeatmap data={data.contributionHeatmap} />
                  <div className="flex gap-4 mt-3 pt-3 border-t border-border/50">
                    <div>
                      <span className="font-mono text-xs text-muted">Current streak </span>
                      <span className="font-mono text-xs text-accent font-bold">
                        {data.streakDays} days
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-muted">Active days </span>
                      <span className="font-mono text-xs text-text font-bold">
                        {data.contributionHeatmap.filter((d) => d.count > 0).length}
                      </span>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </>
          )}

          {activeTab === "portfolio" && (
            <>
              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Language breakdown — col 1 */}
                <SectionCard title="Language Distribution" badge="PRIMARY STACK">
                  <LanguageChart data={data.languageStats} />
                </SectionCard>

                {/* Skill radar — col 2 */}
                <SectionCard title="Skill Profile" badge="6 DIMENSIONS">
                  <SkillRadar data={data.skillRadar} />
                  <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                    {data.skillRadar.map((s) => (
                      <div key={s.subject} className="text-center">
                        <div
                          className="font-mono text-sm font-bold"
                          style={{
                            color:
                              s.score >= 80 ? "#00ff88" : s.score >= 65 ? "#f5a623" : "#f87171",
                          }}
                        >
                          {s.score}
                        </div>
                        <div className="font-mono text-[9px] text-muted">{s.subject}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Career alignment — col 3 */}
                <SectionCard title="Career Alignment" badge="ROLE MATCH">
                  <CareerAlignmentChart data={data.careerAlignment} />
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="font-mono text-[10px] text-muted">
                      Best fit →{" "}
                      <span className="text-accent font-bold">
                        {data.careerAlignment[0]?.role} ({data.careerAlignment[0]?.score}%)
                      </span>
                    </p>
                  </div>
                </SectionCard>
              </div>
              
              <SectionCard title="GitHub Ecosystem" badge="DEPENDENCIES" className="mb-4">
                <div className="flex flex-wrap gap-2 mt-4">
                  {(() => {
                    const depSet = new Set(data.topRepos.flatMap(r => r.dependencyFiles || []));
                    const allDeps = Array.from(depSet);
                    if (allDeps.length === 0) return <span className="text-muted text-xs">No frameworks or major dependencies detected.</span>;
                    return allDeps.map(dep => (
                      <span key={dep} className="px-2 py-1 text-[10px] font-mono border border-accent/20 bg-accent/[0.02] text-text-dim rounded">
                        {dep}
                      </span>
                    ));
                  })()}
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === "repositories" && (
            <>
              <RedFlags flags={data.redFlags} />

              {/* Top repos */}
              <SectionCard title="Top Repositories" badge={`${data.topRepos.length} REPOS`} className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.topRepos.map((repo, i) => (
                    <RepoCard key={repo.name} repo={repo} rank={i + 1} />
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === "intelligence" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ProfileCompleteness score={data.completeness} />
                
                {/* Score breakdown could go here alongside profile completeness to balance layout */}
                <SectionCard title="Score Methodology" badge="6 DIMENSIONS" className="h-full">
                  <div className="flex flex-col gap-3 h-full justify-between">
                    <div className="grid grid-cols-2 gap-2">
                        {data.scoreBreakdown.dimensions.map((dim) => (
                          <div key={dim.label} className="border border-border/50 rounded p-2 bg-surface/30">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-mono text-[9px] text-muted">{dim.label}</span>
                              <span
                                className="font-mono text-[10px] font-bold"
                                style={{
                                  color: dim.score >= 80 ? "#00ff88" : dim.score >= 65 ? "#f5a623" : "#f87171"
                                }}
                              >
                                {dim.score}
                              </span>
                            </div>
                            <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${dim.score}%`,
                                  backgroundColor: dim.score >= 80 ? "#00ff88" : dim.score >= 65 ? "#f5a623" : "#f87171"
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    <p className="font-mono text-[9px] text-accent/60 leading-relaxed border-t border-border/50 pt-3 mt-1">
                      <strong className="text-accent/80">Weighting:</strong> Project Quality (30%), Consistency (20%), Breadth (15%), Depth (15%), Documentation (10%), Community (10%).
                    </p>
                  </div>
                </SectionCard>
              </div>

              {/* Recommendations */}
              <SectionCard
                title="Intelligence Recommendations"
                badge={`${data.recommendations.length} INSIGHTS`}
                className="mb-4"
              >
                <div className="flex flex-col gap-3">
                  {data.recommendations.map((rec, i) => (
                    <RecommendationCard key={rec.id} rec={rec} index={i} />
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === "pro" && (
            <>
              {/* ─── PRO INSIGHTS ────────────────────────────────── */}
              <ProSection analysis={data} />
            </>
          )}
        </div>

        {/* Future Features Roadmap (shown on all tabs effectively at the bottom) */}
        <SectionCard title="Coming Soon" badge="ROADMAP" className="mt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: "⚔️", title: "Comparative Analysis", desc: "Side-by-side profile comparison with diff visualization" },
              { icon: "📈", title: "Timeline View", desc: "Historical score tracking across monthly snapshots" },
              { icon: "👥", title: "Team Dashboard", desc: "Aggregate analysis for GitHub organizations" },
              { icon: "🏷️", title: "README Badge", desc: "Embeddable SVG badge for your portfolio score" },
            ].map((f) => (
              <div
                key={f.title}
                className="border border-border/30 rounded-lg p-3 bg-surface/20 flex items-start gap-3 opacity-60"
              >
                <span className="text-lg">{f.icon}</span>
                <div>
                  <h4 className="font-mono text-xs text-text-dim font-bold">{f.title}</h4>
                  <p className="font-mono text-[10px] text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="font-mono text-xs text-muted">
            Gintel — GitHub Profile Intelligence Analyzer · Built with Next.js + Recharts
          </p>
        </div>
      </main>
    </div>
  );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-text-dim stagger-child">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      {label}
    </div>
  );
}

"use client";

import type { CollaborationProfile } from "@/types/pro";
import { Users, GitPullRequest, MessageSquare, GitFork, Cpu, Shield, Search, Star, Building2 } from "lucide-react";

interface Props {
  collaboration: CollaborationProfile;
}

const STYLE_META: Record<string, { label: string; desc: string; icon: React.ReactNode }> = {
  "solo-builder": { label: "Solo Builder", desc: "You ship independently — deep focus, high autonomy", icon: <Cpu size={16} /> },
  "team-player": { label: "Team Player", desc: "Balanced between PRs and reviews — strong team fit", icon: <Users size={16} /> },
  "mentor": { label: "Mentor", desc: "High review activity + strong documentation — you uplift others", icon: <Shield size={16} /> },
  "code-reviewer": { label: "Code Reviewer", desc: "Reviews outweigh PRs — you're the quality gatekeeper", icon: <Search size={16} /> },
  "community-leader": { label: "Community Leader", desc: "High stars, forks, and followers — you build movements", icon: <Star size={16} /> },
};

export function CollaborationDNA({ collaboration }: Props) {
  const style = STYLE_META[collaboration.style] || STYLE_META["solo-builder"];

  return (
    <div className="space-y-4">
      {/* Collaboration style */}
      <div className="border border-accent/15 rounded-lg p-4 bg-accent/[0.02]">
        <div className="flex items-center gap-3 mb-1">
          <div className="text-accent opacity-80">{style.icon}</div>
          <div>
            <div className="font-mono text-sm text-accent font-bold">{style.label}</div>
            <div className="font-mono text-[10px] text-text-dim">{style.desc}</div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard icon={<GitPullRequest size={12} />} label="Est. PRs" value={collaboration.prMetrics.totalPRs} />
        <MetricCard icon={<MessageSquare size={12} />} label="Issues Opened" value={collaboration.issueMetrics.issuesOpened} />
        <MetricCard icon={<GitFork size={12} />} label="Merge Rate" value={`${collaboration.prMetrics.mergeRate}%`} />
        <MetricCard icon={<Users size={12} />} label="Reviews Given" value={collaboration.prMetrics.reviewsGiven} />
      </div>

      {/* Team signals */}
      <div>
        <span className="font-mono text-xs text-muted mb-2 block">TEAM SIGNALS</span>
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-border/30 rounded-lg p-3">
            <div className={`font-mono text-xs font-bold ${collaboration.teamSignals.averageCommitSize === "atomic" ? "text-accent" :
                collaboration.teamSignals.averageCommitSize === "medium" ? "text-sky" : "text-amber"
              }`}>
              {collaboration.teamSignals.averageCommitSize.charAt(0).toUpperCase() +
                collaboration.teamSignals.averageCommitSize.slice(1)}
            </div>
            <div className="font-mono text-[10px] text-muted">Commit Size</div>
          </div>
          <div className="border border-border/30 rounded-lg p-3">
            <div className="font-mono text-xs font-bold text-text">
              {collaboration.teamSignals.usesConventionalCommits ? "Yes" : "No"}
            </div>
            <div className="font-mono text-[10px] text-muted">Conv. Commits</div>
          </div>
          <div className="border border-border/30 rounded-lg p-3">
            <div className="font-mono text-xs font-bold text-text">
              {collaboration.teamSignals.codeReviewParticipation}%
            </div>
            <div className="font-mono text-[10px] text-muted">Review Score</div>
          </div>
        </div>
      </div>

      {/* External contributions */}
      {collaboration.externalContributions.length > 0 && (
        <div>
          <span className="font-mono text-xs text-muted mb-2 block">EXTERNAL CONTRIBUTIONS</span>
          <div className="space-y-1">
            {collaboration.externalContributions.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-border/15 last:border-0">
                <GitFork size={10} className="text-accent/60" />
                <span className="font-mono text-xs text-text">{c.repo}</span>
                <span className="font-mono text-[10px] text-muted ml-auto">{c.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="border border-border/30 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-accent/60 mb-1">{icon}</div>
      <div className="font-mono text-lg text-text font-bold">{value}</div>
      <div className="font-mono text-[10px] text-muted">{label}</div>
    </div>
  );
}
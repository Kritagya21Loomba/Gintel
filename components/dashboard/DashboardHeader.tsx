"use client";

import { useState } from "react";
import { MapPin, Building, ExternalLink, Users, BookOpen, Download, Loader2 } from "lucide-react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { exportDashboardPDF } from "@/lib/pdf-export";
import type { AnalysisResult } from "@/types";

interface DashboardHeaderProps {
  data: AnalysisResult;
}

function formatUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export function DashboardHeader({ data }: DashboardHeaderProps) {
  const { profile, portfolioScore, archetypes } = data;
  const primaryArchetype = archetypes[0] || { name: "Software Engineer", description: "Standard developer profile." };
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await exportDashboardPDF(profile.username, data);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="border border-border rounded-xl bg-surface/50 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar + identity */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 rounded-full border-2 border-border"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-bg" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-display font-extrabold text-xl text-text">{profile.name}</h1>
              <a
                href={`https://github.com/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted hover:text-accent transition-colors"
              >
                @{profile.username}
              </a>
            </div>

            <p className="font-body text-sm text-text-dim mb-3 max-w-lg">{profile.bio}</p>

            {/* Meta — all links are clickable */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
              {profile.location && (
                <div className="flex items-center gap-1.5 text-muted">
                  <MapPin size={11} />
                  <span className="font-mono text-xs">{profile.location}</span>
                </div>
              )}
              {profile.company && (
                <a
                  href={
                    profile.company.startsWith("@")
                      ? `https://github.com/${profile.company.slice(1)}`
                      : `https://github.com/${profile.company}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted hover:text-accent transition-colors"
                >
                  <Building size={11} />
                  <span className="font-mono text-xs">{profile.company}</span>
                </a>
              )}
              {profile.blog && (
                <a
                  href={formatUrl(profile.blog)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted hover:text-accent transition-colors"
                >
                  <ExternalLink size={11} />
                  <span className="font-mono text-xs underline underline-offset-2">
                    {profile.blog}
                  </span>
                </a>
              )}
            </div>

            {/* Social stats */}
            <div className="flex gap-4">
              <a
                href={`https://github.com/${profile.username}?tab=followers`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <Users size={11} className="text-muted" />
                <span className="font-mono text-xs">
                  <strong className="text-text">{profile.followers}</strong>{" "}
                  <span className="text-muted">followers</span>
                </span>
              </a>
              <a
                href={`https://github.com/${profile.username}?tab=repositories`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <BookOpen size={11} className="text-muted" />
                <span className="font-mono text-xs">
                  <strong className="text-text">{profile.publicRepos}</strong>{" "}
                  <span className="text-muted">repos</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Score + archetype */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <ScoreRing score={portfolioScore} size={100} strokeWidth={7} />
            <p className="font-mono text-[10px] text-muted mt-2 tracking-widest">PORTFOLIO SCORE</p>
          </div>

          <div className="hidden md:block w-px h-20 bg-border" />

          <div className="hidden md:block max-w-[180px]">
            <div className="font-mono text-[10px] text-muted tracking-widest mb-1">PRIMARY ARCHETYPE</div>
            <div className="font-display font-bold text-base text-accent mb-2">{primaryArchetype.name}</div>
            <p className="font-body text-xs text-text-dim leading-relaxed">{primaryArchetype.description}</p>
          </div>
        </div>
      </div>

      {/* Mobile archetype */}
      <div className="md:hidden mt-4 pt-4 border-t border-border/50">
        <div className="font-mono text-[10px] text-muted tracking-widest mb-1">PRIMARY ARCHETYPE</div>
        <div className="font-display font-bold text-base text-accent mb-1">{primaryArchetype.name}</div>
        <p className="font-body text-xs text-text-dim leading-relaxed">{primaryArchetype.description}</p>
      </div>

      {/* Export bar */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
        <span className="font-mono text-[10px] text-muted">
          Analyzed {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </span>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 font-mono text-xs text-muted border border-border rounded-lg px-3 py-1.5 hover:border-accent/30 hover:text-accent transition-colors disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={12} />
              Export PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}

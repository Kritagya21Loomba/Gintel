import { Star, GitFork, FileText } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Repository } from "@/types";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
};

interface RepoCardProps {
  repo: Repository;
  rank: number;
}

export function RepoCard({ repo, rank }: RepoCardProps) {
  const langColor = repo.language ? LANG_COLORS[repo.language] || "#4a5568" : "#4a5568";

  return (
    <div className="border border-border rounded-lg p-4 bg-surface/40 card-hover group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs text-muted flex-shrink-0">#{rank}</span>
          <a
            href={repo.url}
            className="font-display font-semibold text-sm text-text group-hover:text-accent transition-colors truncate"
          >
            {repo.name}
          </a>
          {repo.isForked && (
            <span className="font-mono text-[9px] text-muted border border-border rounded-md px-1.5 py-0.5 flex-shrink-0">
              FORK
            </span>
          )}
        </div>
        {/* Impact score */}
        <div className="flex-shrink-0 text-right">
          <div
            className="font-mono text-xs font-bold"
            style={{
              color:
                repo.impactScore >= 80
                  ? "#00ff88"
                  : repo.impactScore >= 60
                    ? "#f5a623"
                    : "#f87171",
            }}
          >
            {repo.impactScore}
          </div>
          <div className="font-mono text-[9px] text-muted">impact</div>
        </div>
      </div>

      {repo.description && (
        <p className="font-body text-xs text-text-dim mb-3 leading-relaxed line-clamp-2">
          {repo.description}
        </p>
      )}

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {repo.topics.slice(0, 4).map((t) => (
            <span
              key={t}
              className="font-mono text-[9px] text-text-dim border border-border/60 rounded-md px-1.5 py-0.5 bg-surface"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
            <span className="font-mono text-[10px] text-muted">{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Star size={10} className="text-muted" />
          <span className="font-mono text-[10px] text-muted">{formatNumber(repo.stars)}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork size={10} className="text-muted" />
          <span className="font-mono text-[10px] text-muted">{repo.forks}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <FileText size={10} className="text-muted" />
          <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-text-dim"
              style={{ width: `${repo.readmeScore}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-muted">{repo.readmeScore}%</span>
        </div>
      </div>
    </div>
  );
}
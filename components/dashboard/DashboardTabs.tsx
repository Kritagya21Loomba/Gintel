import clsx from "clsx";
import { LayoutDashboard, Fingerprint, FolderGit2, Lightbulb, Sparkles, FileText, Clock, Lock } from "lucide-react";

export type TabId = "overview" | "archetypes" | "repositories" | "recommendations" | "pro" | "cv-insights" | "history";

interface DashboardTabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode; locked?: boolean }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={11} /> },
  { id: "archetypes", label: "Archetypes", icon: <Fingerprint size={11} /> },
  { id: "repositories", label: "Repositories", icon: <FolderGit2 size={11} /> },
  { id: "recommendations", label: "Recommendations", icon: <Lightbulb size={11} /> },
  { id: "pro", label: "Insights", icon: <Sparkles size={11} /> },
  { id: "cv-insights", label: "CV Insights", icon: <FileText size={11} />, locked: true },
  { id: "history", label: "History", icon: <Clock size={11} /> },
];

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <div className="w-full border-b border-border/40 mb-6 overflow-x-auto hide-scrollbar sticky top-[57px] z-10 bg-bg/80 backdrop-blur-md pt-2">
      <div className="flex items-center gap-0.5 min-w-max px-4 sm:px-6 max-w-6xl mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "relative flex items-center gap-1.5 px-3.5 py-2.5 font-mono text-xs transition-colors rounded-t-lg whitespace-nowrap",
                isActive
                  ? "text-accent font-bold bg-accent/[0.03]"
                  : "text-text-dim hover:text-text hover:bg-surface/30"
              )}
            >
              <span className={isActive ? "text-accent" : "text-muted"}>{tab.icon}</span>
              {tab.label}
              {tab.locked && !isActive && (
                <Lock size={9} className="text-muted opacity-60" />
              )}
              {isActive && (
                <>
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent blur-[1px]" />
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent" />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
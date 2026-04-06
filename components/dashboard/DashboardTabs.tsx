import clsx from "clsx";

export type TabId = "overview" | "repositories" | "recommendations" | "pro" | "cv-insights" | "history";

interface DashboardTabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "repositories", label: "Repositories" },
  { id: "recommendations", label: "Recommendations" },
  { id: "pro", label: "Insights" },
  { id: "cv-insights", label: "CV Insights 🔒" },
  { id: "history", label: "History 📈" },
];

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <div className="w-full border-b border-border/40 mb-6 overflow-x-auto hide-scrollbar sticky top-[60px] z-10 bg-bg/80 backdrop-blur-md pt-2">
      <div className="flex items-center gap-1 min-w-max px-4 sm:px-6 max-w-6xl mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "relative flex items-center justify-center px-4 py-2.5 font-mono text-xs transition-colors rounded-t-lg",
                isActive
                  ? "text-accent font-bold bg-accent/[0.03]"
                  : "text-text-dim hover:text-text hover:bg-surface/30"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent blur-[1px]"></span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

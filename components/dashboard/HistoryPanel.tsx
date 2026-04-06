"use client";

import { useState, useEffect } from "react";
import { History, Activity, TrendingUp, Save, Clock, Lock } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import type { AnalysisResult } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface HistoricalSnapshot {
  id: string;
  dateStr: string;
  timestamp: number;
  score: number;
  commits: number;
  stars: number;
}

interface HistoryPanelProps {
  data: AnalysisResult;
}

// 7 days in milliseconds
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; 

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const snapshotData = payload[0].payload as HistoricalSnapshot;

  return (
    <div className="bg-[#0d1117] border border-[#2d4a5e] rounded-md p-3 shadow-xl pointer-events-none">
      <p className="font-mono text-[10px] text-muted mb-2 border-b border-border/40 pb-1">
        Captured: <span className="text-text">{snapshotData.dateStr}</span>
      </p>
      <div className="flex flex-col gap-1.5">
         <div className="flex justify-between items-center gap-4">
            <span className="font-mono text-xs text-text-dim">Portfolio Score</span>
            <span className="font-mono text-xs font-bold text-accent">{snapshotData.score}%</span>
         </div>
         <div className="flex justify-between items-center gap-4">
            <span className="font-mono text-xs text-text-dim">Total Commits</span>
            <span className="font-mono text-xs font-bold text-text">{snapshotData.commits}</span>
         </div>
         <div className="flex justify-between items-center gap-4">
            <span className="font-mono text-xs text-text-dim">Top Repo Stars</span>
            <span className="font-mono text-xs font-bold text-amber">{snapshotData.stars}</span>
         </div>
      </div>
    </div>
  );
}

export function HistoryPanel({ data }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoricalSnapshot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Isolate cache records by GitHub username so Demo Profiles and Live distinct User profiles don't corrupt each other
  const cacheKey = `gintel_history_${data.profile.username}`;

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setHistory(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse history cache:", e);
      }
    }
    setIsLoaded(true);
  }, [cacheKey]);

  const totalCommitsYear = data.totalCommitsYear;
  const topRepoStars = data.topRepos[0]?.stars || 0;
  const currentScore = data.portfolioScore || Math.round((data.completeness?.score / 8) * 100) || 0;

  // Check cooldown rules
  const lastSnapshot = history.length > 0 ? history[history.length - 1] : null;
  const now = Date.now();
  const timeSinceLast = lastSnapshot ? now - lastSnapshot.timestamp : Infinity;
  const onCooldown = timeSinceLast < COOLDOWN_MS;
  const timeRemainingMs = COOLDOWN_MS - timeSinceLast;

  const getCooldownText = () => {
    if (!onCooldown) return "";
    const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Available in ${days}d ${hours}h`;
    return `Available in ${hours}h`;
  };

  const handleRecordSnapshot = () => {
    if (onCooldown) return;

    const today = new Date();
    const dateStr = today.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });

    const newSnapshot: HistoricalSnapshot = {
      id: Date.now().toString(),
      dateStr,
      timestamp: Date.now(),
      score: currentScore,
      commits: totalCommitsYear,
      stars: topRepoStars
    };

    // Sort ascending by time just to be strictly chronological for the chart
    const newHistory = [...history, newSnapshot].sort((a,b) => a.timestamp - b.timestamp);
    
    setHistory(newHistory);
    localStorage.setItem(cacheKey, JSON.stringify(newHistory));
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      <SectionCard title="Longitudinal Analysis" badge="TIMELINE ENGINE">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
             <p className="font-mono text-xs text-text-dim leading-relaxed mb-4">
               The history service allows you to permanently record deterministic snapshots of your GitHub profile over time. 
               Track your score progression, project scale, and commit velocity to identify trends. Data is stored securely in your local environment.
             </p>
             <p className="font-mono text-[10px] text-muted italic flex items-center gap-1.5 border-l border-border/50 pl-2">
               <InfoIcon /> To ensure sustainable polling footprints and meaningful data variances, snapshots are strictly limited to one execution per week.
             </p>
          </div>

          <div className="w-full md:w-auto min-w-[250px] bg-bg border border-border/40 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
             
             {onCooldown ? (
                <>
                  <Lock size={20} className="text-muted mb-2" />
                  <span className="font-mono text-xs text-text font-bold uppercase tracking-wider mb-1">Cooldown Active</span>
                  <span className="font-mono text-xs text-amber animate-pulse">{getCooldownText()}</span>
                  
                  {/* Visual lock bar */}
                  <div className="absolute bottom-0 left-0 h-1 bg-amber/50 transition-all" style={{ width: `${(timeRemainingMs / COOLDOWN_MS) * 100}%` }}></div>
                </>
             ) : (
                <>
                  <Save size={20} className="text-accent mb-2" />
                  <button 
                    onClick={handleRecordSnapshot}
                    className="font-mono text-xs font-bold text-bg bg-accent hover:bg-[#00e67a] active:scale-95 transition-all px-4 py-2 rounded-lg uppercase tracking-wider w-full"
                  >
                    Record Snapshot
                  </button>
                  <span className="font-mono text-[9px] text-muted mt-2">Saves localized state instance</span>
                </>
             )}
          </div>
        </div>

        {history.length === 0 ? (
           <div className="h-64 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center bg-surface/10 opacity-70">
             <History size={32} className="text-muted mb-3" />
             <p className="font-mono text-xs text-text-dim">No historical data recorded yet.</p>
             <p className="font-mono text-[10px] text-muted mt-1">Record your first snapshot above to visualize tracking.</p>
           </div>
        ) : (
           <div className="h-72 border border-border/50 rounded-xl p-4 bg-surface/10">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.5} />
                 <XAxis 
                   dataKey="dateStr" 
                   tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fill: "#6b7280" }}
                   axisLine={{ stroke: "#374151", strokeWidth: 1 }}
                   tickLine={false}
                   tickMargin={12}
                 />
                 <YAxis 
                   domain={['auto', 100]}
                   tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fill: "#6b7280" }}
                   axisLine={false}
                   tickLine={false}
                 />
                 <Tooltip content={<CustomTooltip />} />
                 <Line 
                   type="monotone" 
                   dataKey="score" 
                   stroke="#00ff88" 
                   strokeWidth={3}
                   dot={{ r: 4, fill: "#00ff88", strokeWidth: 2, stroke: "#0d1117" }}
                   activeDot={{ r: 6, fill: "#00ff88", stroke: "#0d1117", strokeWidth: 2 }}
                   animationDuration={1500}
                 />
               </LineChart>
             </ResponsiveContainer>
           </div>
        )}
      </SectionCard>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

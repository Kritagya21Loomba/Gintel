import type { CompletenessScore } from "@/types";
import { SectionCard } from "./SectionCard";
import { CheckCircle2, Circle } from "lucide-react";

interface ProfileCompletenessProps {
  score: CompletenessScore;
}

export function ProfileCompleteness({ score }: ProfileCompletenessProps) {
  const percentage = Math.round((score.score / score.checks.length) * 100);

  return (
    <SectionCard title="Profile Visibility" badge={`${score.score}/${score.checks.length} COMPLETED`} className="mb-4">
      <div className="mb-4">
        <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
          <span>Completeness</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-border/50 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%`, backgroundColor: percentage >= 80 ? '#00ff88' : percentage >= 50 ? '#f5a623' : '#f87171' }} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {score.checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {check.passed ? (
              <CheckCircle2 size={14} className="text-[#00ff88]" />
            ) : (
              <Circle size={14} className="text-muted" />
            )}
            <span className={`font-mono text-[10px] ${check.passed ? 'text-text-dim' : 'text-muted'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

import type { RedFlag } from "@/types";
import { AlertCircle } from "lucide-react";
import { SectionCard } from "./SectionCard";

interface RedFlagsProps {
  flags: RedFlag[];
}

export function RedFlags({ flags }: RedFlagsProps) {
  if (flags.length === 0) return null;

  return (
    <SectionCard title="Attention Needed" badge={`${flags.length} RED FLAGS`} className="mb-4 border-red-500/20 bg-red-500/5">
      <div className="flex flex-col gap-3 mt-2">
        {flags.map((flag) => (
          <div key={flag.id} className="flex gap-3 items-start border border-red-500/10 rounded-lg p-3 bg-red-500/[0.02]">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-display text-sm text-red-500/90 font-semibold mb-1">{flag.title}</h4>
              <p className="font-mono text-[10px] sm:text-xs text-text-dim leading-relaxed">{flag.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, sub, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-lg p-4 bg-surface/60 card-hover",
        accent && "border-accent/20 bg-accent-muted",
        className
      )}
    >
      <p className="font-mono text-xs text-muted mb-1 tracking-wider uppercase">{label}</p>
      <p
        className={cn(
          "font-display font-extrabold text-2xl leading-none",
          accent ? "text-accent" : "text-text"
        )}
      >
        {value}
      </p>
      {sub && <p className="font-mono text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

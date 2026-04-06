import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, badge, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-xl bg-surface/50 overflow-hidden card-hover",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
        <span className="font-mono text-xs text-muted tracking-widest uppercase">{title}</span>
        {badge && (
          <span className="font-mono text-[10px] text-accent/70 border border-accent/20 rounded-md px-2 py-0.5">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
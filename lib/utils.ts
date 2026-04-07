import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

/** Returns a CSS variable reference so score rings/text follow the active theme. */
export function scoreColor(score: number): string {
  if (score >= 80) return "var(--accent)";
  if (score >= 60) return "var(--amber)";
  return "var(--red)";
}

export function impactLabel(impact: "high" | "medium" | "low") {
  return {
    high:   { label: "HIGH IMPACT",   color: "var(--red)" },
    medium: { label: "MED IMPACT",    color: "var(--amber)" },
    low:    { label: "LOW IMPACT",    color: "var(--muted)" },
  }[impact];
}

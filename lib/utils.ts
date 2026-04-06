import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#00ff88";
  if (score >= 60) return "#f5a623";
  return "#f87171";
}

export function impactLabel(impact: "high" | "medium" | "low") {
  return {
    high: { label: "HIGH IMPACT", color: "#f87171" },
    medium: { label: "MED IMPACT", color: "#f5a623" },
    low: { label: "LOW IMPACT", color: "#4a5568" },
  }[impact];
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
  | "matrix"      // original neon green
  | "plasma"      // neon purple/violet
  | "inferno"     // neon orange/red
  | "arctic"      // neon cyan/ice
  | "xray";       // light — high-contrast white/blue x-ray

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  accent: string;       // preview swatch color
}

export const THEMES: Theme[] = [
  {
    id: "matrix",
    label: "Matrix",
    description: "Neon green. Classic.",
    accent: "#00ff88",
  },
  {
    id: "plasma",
    label: "Plasma",
    description: "Electric violet.",
    accent: "#bf5af2",
  },
  {
    id: "inferno",
    label: "Inferno",
    description: "Ember orange.",
    accent: "#ff6b35",
  },
  {
    id: "arctic",
    label: "Arctic",
    description: "Ice-cold cyan.",
    accent: "#00d4ff",
  },
  {
    id: "xray",
    label: "X-Ray",
    description: "Light. Exposed.",
    accent: "#1a6cf6",
  },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "matrix",
  setTheme: () => {},
  themes: THEMES,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("matrix");

  useEffect(() => {
    const stored = localStorage.getItem("gintel-theme") as ThemeId | null;
    if (stored && THEMES.find((t) => t.id === stored)) {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      applyTheme("matrix");
    }
  }, []);

  function setTheme(t: ThemeId) {
    setThemeState(t);
    localStorage.setItem("gintel-theme", t);
    applyTheme(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── CSS variable application ──────────────────────────────────
function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  const vars = THEME_VARS[id];
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // also set data-theme for any CSS selectors
  root.setAttribute("data-theme", id);
}

// Each theme defines every CSS variable used across the app
const THEME_VARS: Record<ThemeId, Record<string, string>> = {
  matrix: {
    "--bg":             "#080c10",
    "--surface":        "#0d1117",
    "--surface-2":      "#111820",
    "--border":         "#1e2d3d",
    "--border-bright":  "#2d4a5e",
    "--accent":         "#00ff88",
    "--accent-dim":     "#00cc6a",
    "--accent-muted":   "rgba(0,255,136,0.08)",
    "--accent-glow":    "rgba(0,255,136,0.25)",
    "--accent-rgb":     "0,255,136",
    "--cyan":           "#22d3ee",
    "--cyan-dim":       "#0891b2",
    "--amber":          "#f5a623",
    "--red":            "#f87171",
    "--sky":            "#38bdf8",
    "--muted":          "#4a5568",
    "--text":           "#e2e8f0",
    "--text-dim":       "#8892a4",
    "--logo-stroke":    "#00ff88",
    "--logo-glow":      "rgba(0,255,136,0.5)",
    "--grid-color":     "rgba(0,255,136,0.03)",
    "--scanline-color": "rgba(0,0,0,0.03)",
  },
  plasma: {
    "--bg":             "#0a0810",
    "--surface":        "#110d1a",
    "--surface-2":      "#17122a",
    "--border":         "#2a1d3d",
    "--border-bright":  "#3d2a5e",
    "--accent":         "#bf5af2",
    "--accent-dim":     "#9333ea",
    "--accent-muted":   "rgba(191,90,242,0.08)",
    "--accent-glow":    "rgba(191,90,242,0.25)",
    "--accent-rgb":     "191,90,242",
    "--cyan":           "#e879f9",
    "--cyan-dim":       "#a21caf",
    "--amber":          "#f5a623",
    "--red":            "#f87171",
    "--sky":            "#c084fc",
    "--muted":          "#5a4a6e",
    "--text":           "#ede9f5",
    "--text-dim":       "#9d8ab4",
    "--logo-stroke":    "#bf5af2",
    "--logo-glow":      "rgba(191,90,242,0.5)",
    "--grid-color":     "rgba(191,90,242,0.03)",
    "--scanline-color": "rgba(0,0,0,0.04)",
  },
  inferno: {
    "--bg":             "#0d0805",
    "--surface":        "#160d08",
    "--surface-2":      "#1e1108",
    "--border":         "#3a1e0d",
    "--border-bright":  "#5a2e14",
    "--accent":         "#ff6b35",
    "--accent-dim":     "#e84f1a",
    "--accent-muted":   "rgba(255,107,53,0.08)",
    "--accent-glow":    "rgba(255,107,53,0.25)",
    "--accent-rgb":     "255,107,53",
    "--cyan":           "#fbbf24",
    "--cyan-dim":       "#d97706",
    "--amber":          "#fb923c",
    "--red":            "#f87171",
    "--sky":            "#fcd34d",
    "--muted":          "#5a3d2a",
    "--text":           "#f5ede8",
    "--text-dim":       "#a8826a",
    "--logo-stroke":    "#ff6b35",
    "--logo-glow":      "rgba(255,107,53,0.5)",
    "--grid-color":     "rgba(255,107,53,0.03)",
    "--scanline-color": "rgba(0,0,0,0.04)",
  },
  arctic: {
    "--bg":             "#030d14",
    "--surface":        "#071421",
    "--surface-2":      "#0c1e2e",
    "--border":         "#102a3e",
    "--border-bright":  "#1a4060",
    "--accent":         "#00d4ff",
    "--accent-dim":     "#00aacc",
    "--accent-muted":   "rgba(0,212,255,0.08)",
    "--accent-glow":    "rgba(0,212,255,0.25)",
    "--accent-rgb":     "0,212,255",
    "--cyan":           "#67e8f9",
    "--cyan-dim":       "#0e7490",
    "--amber":          "#f5a623",
    "--red":            "#f87171",
    "--sky":            "#7dd3fc",
    "--muted":          "#2a4a5e",
    "--text":           "#e0f2fe",
    "--text-dim":       "#7aadcc",
    "--logo-stroke":    "#00d4ff",
    "--logo-glow":      "rgba(0,212,255,0.5)",
    "--grid-color":     "rgba(0,212,255,0.03)",
    "--scanline-color": "rgba(0,0,0,0.04)",
  },
  xray: {
    "--bg":             "#eef2f7",
    "--surface":        "#ffffff",
    "--surface-2":      "#f0f4f9",
    "--border":         "#c8d8e8",
    "--border-bright":  "#a0b8cc",
    "--accent":         "#1a6cf6",
    "--accent-dim":     "#1455cc",
    "--accent-muted":   "rgba(26,108,246,0.08)",
    "--accent-glow":    "rgba(26,108,246,0.2)",
    "--accent-rgb":     "26,108,246",
    "--cyan":           "#0ea5e9",
    "--cyan-dim":       "#0369a1",
    "--amber":          "#d97706",
    "--red":            "#dc2626",
    "--sky":            "#3b82f6",
    "--muted":          "#94a3b8",
    "--text":           "#0f172a",
    "--text-dim":       "#475569",
    "--logo-stroke":    "#1a6cf6",
    "--logo-glow":      "rgba(26,108,246,0.3)",
    "--grid-color":     "rgba(26,108,246,0.04)",
    "--scanline-color": "rgba(0,0,0,0.01)",
  },
};

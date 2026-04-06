import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
        wordmark: ["'Orbitron'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: "#080c10",
        surface: "#0d1117",
        border: "#1e2d3d",
        accent: "#00ff88",
        "accent-dim": "#00cc6a",
        "accent-muted": "rgba(0,255,136,0.08)",
        cyan: "#22d3ee",
        "cyan-dim": "#0891b2",
        amber: "#f5a623",
        sky: "#38bdf8",
        muted: "#4a5568",
        text: "#e2e8f0",
        "text-dim": "#8892a4",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "scan": "scan 3s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "blink": "blink 1s step-end infinite",
        "count-up": "countUp 1.5s ease forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
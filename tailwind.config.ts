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
        mono:      ["'JetBrains Mono'", "monospace"],
        display:   ["'Syne'", "sans-serif"],
        wordmark:  ["'Plus Jakarta Sans'", "sans-serif"],
        body:      ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg:           "var(--bg)",
        surface:      "var(--surface)",
        "surface-2":  "var(--surface-2)",
        border:       "var(--border)",
        "border-bright": "var(--border-bright)",
        accent:       "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        "accent-muted": "var(--accent-muted)",
        cyan:         "var(--cyan)",
        "cyan-dim":   "var(--cyan-dim)",
        amber:        "var(--amber)",
        red:          "var(--red)",
        sky:          "var(--sky)",
        muted:        "var(--muted)",
        text:         "var(--text)",
        "text-dim":   "var(--text-dim)",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease forwards",
        "scan":       "scan 3s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "blink":      "blink 1s step-end infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

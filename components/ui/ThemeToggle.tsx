"use client";

import { useState } from "react";
import { useTheme, THEMES } from "@/lib/theme-context";
import { Palette } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES.find((t) => t.id === theme)!;

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-2">
      {/* Panel */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-bright)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px var(--accent-muted)",
          borderRadius: "16px",
          padding: "12px",
          width: "176px",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(8px) scale(0.97)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.18s ease, transform 0.18s ease",
          transformOrigin: "bottom right",
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: "var(--muted)",
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          Theme
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "7px 10px",
                  borderRadius: "9px",
                  border: active
                    ? `1px solid var(--accent)`
                    : "1px solid transparent",
                  background: active ? "var(--accent-muted)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {/* Swatch */}
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: t.accent,
                    flexShrink: 0,
                    boxShadow: active ? `0 0 6px ${t.accent}` : "none",
                  }}
                />
                <span style={{ flex: 1 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      fontWeight: active ? 700 : 400,
                      color: active ? "var(--accent)" : "var(--text)",
                      display: "block",
                    }}
                  >
                    {t.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "9px",
                      color: "var(--muted)",
                    }}
                  >
                    {t.description}
                  </span>
                </span>
                {active && (
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Change theme"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          padding: "9px 14px",
          borderRadius: "999px",
          border: "1px solid var(--border-bright)",
          background: open ? "var(--accent-muted)" : "var(--surface)",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.3), 0 0 12px var(--accent-glow)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
        }}
      >
        {/* Current swatch */}
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: current.accent,
            flexShrink: 0,
            boxShadow: `0 0 5px ${current.accent}`,
          }}
        />
        <Palette size={13} color="var(--text-dim)" />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "var(--text-dim)",
          }}
        >
          {current.label}
        </span>
      </button>
    </div>
  );
}

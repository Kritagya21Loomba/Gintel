"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "pointer" | "text" | "crosshair" | "wait";

export function CustomCursor() {
  const arrowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const rafId = useRef<number>(0);
  const [mode, setMode] = useState<CursorMode>("default");
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide system cursor globally
    const style = document.createElement("style");
    style.id = "gintel-cursor-style";
    style.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.head.appendChild(style);

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const el = e.target as HTMLElement;
      const isPointer = el.closest("button, a, [role='button'], input[type='checkbox'], input[type='radio'], select");
      const isInput = el.closest("input[type='text'], input[type='email'], input[type='search'], textarea");
      const isCross = el.closest("[data-cursor='crosshair']");

      if (isCross) setMode("crosshair");
      else if (isInput) setMode("text");
      else if (isPointer) setMode("pointer");
      else setMode("default");
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const tick = () => {
      // Arrow follows mouse instantly — tip always at exact cursor position
      if (arrowRef.current) {
        arrowRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafId.current);
      document.getElementById("gintel-cursor-style")?.remove();
    };
  }, []);

  const scale = pressed ? 0.85 : 1;

  return (
    <>
      {/* ── Primary cursor: arrow/ibeam/crosshair — instant, tip-anchored ── */}
      <div
        ref={arrowRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999]"
        style={{
          willChange: "transform",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        {mode === "text" && (
          // I-beam: offset so midpoint is at cursor
          <svg
            width="3" height="24" viewBox="0 0 3 24"
            style={{ display: "block", marginLeft: -1.5, marginTop: -12, transform: `scaleY(${scale})` }}
          >
            <line x1="1.5" y1="0" x2="1.5" y2="24" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="2" x2="3" y2="2" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="0" y1="22" x2="3" y2="22" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
        {mode === "crosshair" && (
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            style={{ display: "block", marginLeft: -12, marginTop: -12, transform: `scale(${scale})` }}
          >
            <line x1="12" y1="0" x2="12" y2="9" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="12" y1="15" x2="12" y2="24" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="0" y1="12" x2="9" y2="12" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="15" y1="12" x2="24" y2="12" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2.5" stroke="#00ff88" strokeWidth="1" fill="none" />
          </svg>
        )}
        {(mode === "default" || mode === "pointer") && (
          // Arrow: marginLeft/Top = 0 so the SVG top-left corner (= arrow tip) is at exact mouse pos
          <svg
            width="20" height="22" viewBox="0 0 20 22"
            style={{ display: "block", marginLeft: 0, marginTop: 0, transform: `scale(${scale})`, transformOrigin: "0 0", transition: "transform 0.1s ease" }}
          >
            <defs>
              <filter id="arrow-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="1.2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path
              d="M2 2 L2 17 L6.5 13 L10 20 L12 19 L8.5 12 L15 12 Z"
              fill="#080c10"
              stroke="#00ff88"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#arrow-glow)"
            />
          </svg>
        )}
      </div>


    </>
  );
}
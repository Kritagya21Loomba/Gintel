"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);
  const isHovering = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      // Dot follows instantly
      dotPos.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    };

    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("select");
      if (isClickable) {
        isHovering.current = true;
        cursor.classList.add("cursor-hover");
      }
    };

    const onLeave = () => {
      isHovering.current = false;
      cursor.classList.remove("cursor-hover");
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let lx = -100, ly = -100;

    const animate = () => {
      lx = lerp(lx, pos.current.x, 0.12);
      ly = lerp(ly, pos.current.y, 0.12);
      cursor.style.transform = `translate(${lx - 16}px, ${ly - 16}px)`;
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    document.documentElement.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(rafId.current);
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* Outer ring - lagging */}
      <div
        ref={cursorRef}
        className="gintel-cursor fixed top-0 left-0 pointer-events-none z-[99999] w-8 h-8"
        style={{ willChange: "transform" }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          {/* Hex outline */}
          <polygon
            points="16,2 28,9 28,23 16,30 4,23 4,9"
            stroke="#00ff88"
            strokeWidth="1"
            fill="none"
            opacity="0.7"
            className="gintel-cursor-hex"
          />
          {/* Corner dots */}
          <circle cx="16" cy="2" r="1" fill="#00ff88" opacity="0.5" />
          <circle cx="28" cy="9" r="1" fill="#00ff88" opacity="0.5" />
          <circle cx="28" cy="23" r="1" fill="#00ff88" opacity="0.5" />
          <circle cx="16" cy="30" r="1" fill="#00ff88" opacity="0.5" />
          <circle cx="4" cy="23" r="1" fill="#00ff88" opacity="0.5" />
          <circle cx="4" cy="9" r="1" fill="#00ff88" opacity="0.5" />
        </svg>
      </div>

      {/* Inner dot - instant */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] w-1.5 h-1.5 rounded-full"
        style={{
          background: "#00ff88",
          boxShadow: "0 0 6px rgba(0,255,136,0.8)",
          willChange: "transform",
        }}
      />

      <style>{`
        .gintel-cursor-hex {
          transition: all 0.2s ease;
        }
        .gintel-cursor.cursor-hover svg polygon {
          stroke: #00ff88;
          opacity: 1;
          filter: drop-shadow(0 0 4px #00ff88);
          transform-origin: center;
          transform: scale(1.2);
        }
        .gintel-cursor.cursor-hover svg circle {
          fill: #00ff88;
          opacity: 1;
        }
        * { cursor: none !important; }
      `}</style>
    </>
  );
}

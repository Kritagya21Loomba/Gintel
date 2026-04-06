"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, LogOut, Home } from "lucide-react";

interface DashboardNavProps {
  isLive?: boolean;
}

export function DashboardNav({ isLive = false }: DashboardNavProps) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-bg/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 font-mono text-xs text-text-dim hover:text-accent transition-colors"
        >
          <Home size={13} />
          Home
        </button>
        <div className="w-px h-4 bg-border" />
        <span className="font-mono text-xs text-accent font-bold tracking-widest">GINTEL</span>
        <span className="font-mono text-xs text-muted">/ Analysis Report</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLive ? "bg-accent" : "bg-amber"}`} />
        <span className="font-mono text-xs text-muted hidden sm:block">
          {isLive ? "LIVE DATA" : "DEMO DATA"}
        </span>
        {session && (
          <>
            <div className="w-px h-4 bg-border ml-1" />
            <div className="flex items-center gap-2 ml-1">
              <img
                src={session.user?.image || ""}
                alt=""
                className="w-5 h-5 rounded-full border border-border"
              />
              <span className="font-mono text-xs text-text-dim hidden sm:block">
                {session.user?.name}
              </span>
            </div>
            <button
              onClick={() => router.push("/signout")}
              className="flex items-center gap-1.5 font-mono text-xs text-text-dim hover:text-red-400 transition-colors ml-1"
            >
              <LogOut size={11} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

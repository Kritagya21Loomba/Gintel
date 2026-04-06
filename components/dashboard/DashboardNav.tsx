"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, LogOut } from "lucide-react";
import { GintelLogo } from "@/components/ui/GintelLogo";

interface DashboardNavProps {
  isLive?: boolean;
}

export function DashboardNav({ isLive = false }: DashboardNavProps) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/50 bg-bg/80 backdrop-blur-md">
      {/* Left: back + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 font-mono text-xs text-text-dim hover:text-accent transition-colors"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="w-px h-4 bg-border" />

        {/* Logo */}
        <div className="flex items-center gap-2">
          <GintelLogo size={22} />
          <span className="font-mono text-accent text-xs font-bold tracking-widest">GINTEL</span>
          <span className="font-mono text-xs text-muted hidden sm:inline">/ Analysis Report</span>
        </div>
      </div>

      {/* Right: live indicator + user */}
      <div className="flex items-center gap-3">
        {/* Live/Demo badge */}
        <div className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 ${isLive ? "border-accent/25 bg-accent/5" : "border-amber/25 bg-amber/5"
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLive ? "bg-accent" : "bg-amber"}`} />
          <span className={`font-mono text-[10px] font-bold tracking-widest hidden sm:block ${isLive ? "text-accent" : "text-amber"
            }`}>
            {isLive ? "LIVE DATA" : "DEMO DATA"}
          </span>
        </div>

        {session && (
          <>
            <div className="flex items-center gap-2 border border-border/50 rounded-full pl-1 pr-2.5 py-1">
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
              className="flex items-center gap-1.5 font-mono text-xs text-text-dim hover:text-red-400 transition-colors"
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
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Github, ArrowRight, Zap, BarChart2, Target, Star, Loader2, Sparkles } from "lucide-react";
import { getMetrics, resetAllMetrics, type PlatformMetrics } from "@/lib/metrics";
import { GintelLogo, LoadingScreen } from "@/components/ui/GintelLogo";

const FEATURES = [
  {
    icon: <Zap size={18} />,
    title: "Developer Identity",
    desc: "Classified into distinct archetypes based on your actual commit patterns, not your job title.",
  },
  {
    icon: <BarChart2 size={18} />,
    title: "Portfolio Score",
    desc: "A 0–100 weighted score across project quality, consistency, depth, and community signals.",
  },
  {
    icon: <Target size={18} />,
    title: "Career Alignment",
    desc: "See which engineering roles your GitHub data maps to — Backend, ML, DevOps, and more.",
  },
  {
    icon: <Star size={18} />,
    title: "CV Intelligence",
    desc: "Upload your CV and get instant, data-backed feedback on impact, verb strength, and keyword density.",
  },
];



function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (!animated.current) {
            animated.current = true;
            const startTime = performance.now();
            const step = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * target));
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <div ref={ref}>{count.toLocaleString()}</div>;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // ?reset=1 wipes all metrics + per-user localStorage cache — use for testing
    if (searchParams.get("reset") === "1") {
      resetAllMetrics();
      router.replace("/");
    }
    setMetrics(getMetrics());
  }, []);



  function handleLoaderComplete() {
    setShowLoader(false);
    setTimeout(() => setContentVisible(true), 50);
  }

  function handleSignIn() {
    signIn("github", { callbackUrl: "/dashboard?mode=live" });
  }

  function handleViewInsights() {
    setLoading(true);
    router.push("/dashboard?mode=live");
  }

  function handleDemoAnalyze() {
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard?mode=mock");
    }, 1200);
  }

  const isLoggedIn = status === "authenticated" && !!session;

  return (
    <>
      {showLoader && <LoadingScreen onComplete={handleLoaderComplete} />}

      <main
        className={`min-h-screen scanlines noise grid-bg relative overflow-hidden transition-opacity duration-500 ${contentVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Ambient glow */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-200px] w-[400px] h-[400px] bg-sky/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className="transition-all duration-700"
              style={{
                filter: contentVisible ? "drop-shadow(0 0 8px rgba(0,255,136,0.4))" : "none",
              }}
            >
              <GintelLogo size={28} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-bold tracking-widest" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--accent)" }}>GINTEL</span>
              <span className="font-mono text-muted text-[10px]" style={{ color: "var(--cyan-dim)" }}>v0.2.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-text-dim hidden md:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "var(--cyan)" }} />
              <span style={{ color: "var(--cyan)" }}>LIVE BETA</span>
            </span>
            {isLoggedIn && (
              <div className="flex items-center gap-2 border border-border/50 rounded-full pl-1 pr-3 py-1">
                <img
                  src={session.user?.image || ""}
                  alt=""
                  className="w-5 h-5 rounded-full border border-border"
                />
                <span className="font-mono text-xs text-accent hidden sm:block">
                  {session.user?.name}
                </span>
              </div>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 border border-border/50 bg-surface/60 rounded-full px-4 py-1.5 mb-10 stagger-child">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--cyan)" }} />
            <span className="font-mono text-xs tracking-widest" style={{ color: "var(--cyan)" }}>
              GITHUB INTELLIGENCE LAYER
            </span>
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-none tracking-tight mb-6 stagger-child" style={{ animationDelay: "0.1s" }}>
            Your GitHub is{" "}
            <span className="text-accent glow-text relative">
              speaking.
              <svg className="absolute -bottom-2 left-0 w-full" height="4" viewBox="0 0 100 4" preserveAspectRatio="none">
                <path d="M0 2 Q25 0 50 2 Q75 4 100 2" stroke="#00ff88" strokeWidth="1" fill="none" opacity="0.5" />
              </svg>
            </span>
            <br />
            Are you listening?
          </h1>

          <p className="font-body text-text-dim text-lg md:text-xl max-w-2xl mx-auto mb-14 stagger-child" style={{ animationDelay: "0.2s" }}>
            Gintel transforms your raw GitHub data into a{" "}
            <strong className="text-text">clear, career-aligned analysis</strong> — identity
            classification, portfolio scoring, and actionable gap detection.
          </p>

          <div className="flex flex-col items-center gap-5 stagger-child" style={{ animationDelay: "0.3s" }}>
            {loading ? (
              <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 text-accent font-mono font-bold text-sm px-10 py-4 rounded-xl">
                <Loader2 size={18} className="animate-spin" />
                Generating insights...
              </div>
            ) : isLoggedIn ? (
              <button
                onClick={handleViewInsights}
                className="group flex items-center gap-3 bg-accent text-bg font-mono font-bold text-sm px-10 py-4 rounded-xl hover:bg-accent-dim transition-all glow-accent hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={20} />
                View Your Insights
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="group flex items-center gap-3 bg-accent text-bg font-mono font-bold text-sm px-10 py-4 rounded-xl hover:bg-accent-dim transition-all glow-accent hover:scale-[1.02] active:scale-[0.98]"
              >
                <Github size={20} />
                Sign in with GitHub to Analyze
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            <button
              onClick={handleDemoAnalyze}
              className="font-mono text-xs text-text-dim hover:text-accent transition-colors underline underline-offset-4"
            >
              or view demo analysis →
            </button>
          </div>

          <div className="mt-16 border border-border/50 rounded-xl bg-surface/50 py-8 px-6 max-w-3xl mx-auto stagger-child" style={{ animationDelay: "0.4s" }}>
            <div className="flex flex-wrap justify-center gap-8 md:gap-0 md:divide-x md:divide-border/50">
              {[
                { label: "Developers analyzed", value: metrics?.developersAnalyzed ?? 0 },
                { label: "Repos scanned", value: metrics?.reposScanned ?? 0 },
                { label: "CVs analyzed", value: metrics?.cvInsightsGenerated ?? 0 },
              ].map((s) => (
                <div key={s.label} className="text-center px-8">
                  <div className="font-display font-extrabold text-3xl" style={{ color: "var(--cyan)" }}>
                    <AnimatedCounter target={s.value} />
                  </div>
                  <div className="font-mono text-xs text-muted mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-4 bg-accent rounded-full" />
            <span className="font-mono text-xs text-muted tracking-widest">CAPABILITIES</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="border border-border rounded-xl p-5 bg-surface/40 card-hover stagger-child group"
                style={{ animationDelay: `${0.5 + i * 0.08}s` }}
              >
                <div className="text-accent mb-4 group-hover:scale-110 transition-transform origin-left">{f.icon}</div>
                <h3 className="font-display font-semibold text-sm text-text mb-2">{f.title}</h3>
                <p className="font-body text-xs text-text-dim leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>



        {/* Footer */}
        <footer className="relative z-10 border-t border-border/30 py-10 px-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <GintelLogo size={16} />
                <span className="font-mono text-xs text-muted">
                  Gintel — Not affiliated with GitHub, Inc.
                </span>
              </div>
              <a
                href="/feedback"
                className="font-mono text-xs border border-border/60 rounded-lg px-4 py-2 text-text-dim hover:border-accent/40 hover:text-accent transition-all"
              >
                Leave a review or report an issue →
              </a>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30" />

            {/* Bottom row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Built by */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-muted tracking-widest">BUILT BY</span>
                <span className="font-mono text-xs text-text">Kritagya Loomba</span>
                <a
                  href="https://github.com/Kritagya21Loomba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text-dim hover:text-accent transition-colors flex items-center gap-1"
                >
                  <Github size={12} />
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/kritagyaloomba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text-dim hover:text-accent transition-colors"
                >
                  LinkedIn
                </a>
              </div>

              {/* Tech stack */}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <span className="font-mono text-[10px] text-muted tracking-widest">MADE WITH</span>
                {["Next.js", "TypeScript", "Tailwind CSS", "NextAuth", "GitHub API"].map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[10px] border border-border/40 rounded px-2 py-0.5 text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
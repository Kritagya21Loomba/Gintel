"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { GintelLogo } from "@/components/ui/GintelLogo";

type FeedbackType = "review" | "bug" | "feature" | "other";

const TYPE_OPTIONS: { value: FeedbackType; label: string; desc: string }[] = [
    { value: "review", label: "⭐ Review", desc: "Share your overall experience" },
    { value: "bug", label: "🐛 Bug Report", desc: "Something isn't working right" },
    { value: "feature", label: "💡 Feature Request", desc: "Suggest something new" },
    { value: "other", label: "✉️ Other", desc: "Anything else on your mind" },
];

export default function FeedbackPage() {
    const router = useRouter();
    const [type, setType] = useState<FeedbackType>("review");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    async function handleSubmit() {
        if (!message.trim()) return;
        setStatus("sending");

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, name, email, message }),
            });

            if (!res.ok) throw new Error("Failed");
            setStatus("sent");
        } catch {
            setStatus("error");
        }
    }

    return (
        <main className="min-h-screen scanlines noise grid-bg relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <GintelLogo size={24} />
                    <span className="font-mono text-sm font-bold tracking-widest" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--accent)" }}>
                        GINTEL
                    </span>
                </div>
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 font-mono text-xs text-text-dim hover:text-accent transition-colors"
                >
                    <ArrowLeft size={14} />
                    Back to home
                </button>
            </nav>

            <div className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-24">
                {/* Header */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 border border-border/50 bg-surface/60 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="font-mono text-xs tracking-widest" style={{ color: "var(--cyan)" }}>
                            FEEDBACK TERMINAL
                        </span>
                    </div>
                    <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-tight tracking-tight mb-3">
                        Tell me what you{" "}
                        <span className="text-accent glow-text">think.</span>
                    </h1>
                    <p className="font-body text-text-dim text-base">
                        Reviews, bugs, ideas, or just a note — all goes directly to Kritagya. No spam, no bots.
                    </p>
                </div>

                {status === "sent" ? (
                    <div className="border border-accent/30 rounded-2xl bg-accent/5 p-10 text-center">
                        <CheckCircle2 size={40} className="text-accent mx-auto mb-4" />
                        <h2 className="font-display font-bold text-xl text-text mb-2">Sent. Thanks.</h2>
                        <p className="font-mono text-sm text-text-dim mb-6">Your message landed. I read every one of these.</p>
                        <button
                            onClick={() => router.push("/")}
                            className="font-mono text-xs text-accent border border-accent/30 rounded-lg px-5 py-2.5 hover:bg-accent/10 transition-all"
                        >
                            ← Back to Gintel
                        </button>
                    </div>
                ) : (
                    <div className="border border-border/50 rounded-2xl bg-surface/30 p-6 sm:p-8 flex flex-col gap-6">

                        {/* Type selector */}
                        <div>
                            <label className="font-mono text-[10px] text-muted tracking-widest block mb-3">
                                TYPE
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {TYPE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setType(opt.value)}
                                        className={`text-left p-3 rounded-xl border transition-all ${type === opt.value
                                                ? "border-accent/50 bg-accent/8 text-accent"
                                                : "border-border/50 bg-surface/20 text-text-dim hover:border-border hover:text-text"
                                            }`}
                                    >
                                        <div className="font-mono text-xs font-semibold mb-0.5">{opt.label}</div>
                                        <div className="font-body text-[11px] opacity-70">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                                    NAME <span className="text-border">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full bg-bg border border-border/50 rounded-lg px-4 py-2.5 font-mono text-sm text-text placeholder-muted focus:outline-none focus:border-accent/40 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                                    EMAIL <span className="text-border">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="reply@example.com"
                                    className="w-full bg-bg border border-border/50 rounded-lg px-4 py-2.5 font-mono text-sm text-text placeholder-muted focus:outline-none focus:border-accent/40 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                                MESSAGE <span className="text-accent">*</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                rows={6}
                                className="w-full bg-bg border border-border/50 rounded-lg px-4 py-3 font-mono text-sm text-text placeholder-muted focus:outline-none focus:border-accent/40 transition-colors resize-none"
                            />
                            <div className="flex justify-end mt-1">
                                <span className={`font-mono text-[10px] ${message.length > 1000 ? "text-amber" : "text-muted"}`}>
                                    {message.length}/1000
                                </span>
                            </div>
                        </div>

                        {/* Error state */}
                        {status === "error" && (
                            <div className="flex items-center gap-3 border border-red-500/30 bg-red-500/5 rounded-lg px-4 py-3">
                                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                                <span className="font-mono text-xs text-red-400">Something went wrong. Try again or email directly.</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!message.trim() || status === "sending"}
                            className="flex items-center justify-center gap-2 bg-accent text-bg font-mono font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-accent-dim transition-all glow-accent hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {status === "sending" ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Send Feedback
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
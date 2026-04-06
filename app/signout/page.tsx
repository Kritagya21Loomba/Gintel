"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, ArrowLeft, Loader2 } from "lucide-react";

export default function SignOutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    // Call signOut without redirect, then manually redirect
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-bg scanlines noise grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 border border-border rounded-xl bg-surface/60 backdrop-blur-md p-10 max-w-md w-full mx-4 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full border border-border bg-surface flex items-center justify-center mx-auto mb-6">
          <LogOut size={24} className="text-accent" />
        </div>

        {/* Heading */}
        <h1 className="font-display font-bold text-2xl text-text mb-2">
          Sign out of Gintel?
        </h1>
        <p className="font-body text-sm text-text-dim mb-8 leading-relaxed">
          Your analysis data is saved locally. You can sign back in anytime to generate fresh insights from your GitHub profile.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-mono font-bold text-sm px-6 py-3 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut size={14} />
                Yes, sign me out
              </>
            )}
          </button>
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 border border-border text-text-dim font-mono text-sm px-6 py-3 rounded-lg hover:border-accent/30 hover:text-accent transition-all"
          >
            <ArrowLeft size={14} />
            Go back
          </button>
        </div>

        {/* Footer note */}
        <p className="font-mono text-[10px] text-muted mt-8">
          GINTEL <span className="text-accent">·</span> v0.2.0
        </p>
      </div>
    </main>
  );
}

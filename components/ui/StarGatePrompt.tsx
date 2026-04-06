import { Lock, Star, Verified } from "lucide-react";

interface StarGatePromptProps {
  onVerify: () => void;
  isLoading: boolean;
}

export function StarGatePrompt({ onVerify, isLoading }: StarGatePromptProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-accent/20 bg-surface/40 p-8 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent backdrop-blur-sm pointer-events-none" />
      
      <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <Lock size={28} className="text-accent" />
        </div>
        
        <h3 className="font-display text-xl font-bold text-text mb-2 tracking-tight">
          CV Insights Locked
        </h3>
        
        <p className="font-body text-sm text-text-dim mb-6 leading-relaxed">
          Unlock granular deterministic resume insights mapped to industry standard heuristics. Simply star the official repository to instantly gain access.
        </p>

        <a 
          href="https://github.com/Kritagya21Loomba/Gintel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-text text-bg px-6 py-2.5 rounded-lg font-mono text-sm font-bold hover:bg-text-dim transition-colors mb-4"
        >
          <Star size={16} />
          Star Kritagya21Loomba/Gintel
        </a>

        <button 
          onClick={onVerify}
          disabled={isLoading}
          className="flex items-center gap-2 text-accent text-sm font-mono font-medium hover:underline disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">Checking...</span>
          ) : (
            <>
              <Verified size={14} />
              I have starred it, Verify Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}

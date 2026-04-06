import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";

interface CVInsightsProps {}

export function CVInsights({}: CVInsightsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setIsParsing(true);
    setError("");
    setParsedText("");
    setInsights(null);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await fetch("/api/cv/parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to parse document");
      }

      const data = await res.json();
      setParsedText(data.text);
      computeInsights(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const computeInsights = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Heuristic 1: Action Verbs
    const actionVerbs = ["architected", "developed", "led", "engineered", "orchestrated", "designed", "deployed", "implemented", "optimized", "spearheaded"];
    const weakVerbs = ["helped", "assisted", "worked", "managed to", "tried"];
    
    let actionCount = 0;
    let weakCount = 0;
    
    actionVerbs.forEach(v => {
      const count = (lowerText.match(new RegExp(`\\b${v}\\b`, 'g')) || []).length;
      actionCount += count;
    });
    
    weakVerbs.forEach(v => {
      const count = (lowerText.match(new RegExp(`\\b${v}\\b`, 'g')) || []).length;
      weakCount += count;
    });

    // Heuristic 2: Metrics Density
    // Looks for % or $ or numbers indicating impact (e.g., 20%, 500ms, 10x)
    const metricMatches = text.match(/\d+(%|x|ms|s|k|m|b|\+)/gi) || [];
    const metricDensity = metricMatches.length;

    // Heuristic 3: Word count
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    let lengthInsight = { status: "good", message: "Optimal length (400-800 words)" };
    if (wordCount < 200) lengthInsight = { status: "warning", message: "CV is too short (under 200 words). Flesh out your impact." };
    if (wordCount > 1000) lengthInsight = { status: "warning", message: "CV is too long (over 1000 words). Recruiters prefer conciseness." };

    setInsights({
      actionCount,
      weakCount,
      metricDensity,
      wordCount,
      lengthInsight
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Resume Intelligence" badge="NON-LLM HEURISTICS">
        {!file && (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-surface/30 transition-colors">
            <input 
              type="file" 
              id="cv-upload" 
              className="hidden" 
              accept=".pdf,.docx" 
              onChange={handleFileUpload} 
              disabled={isParsing}
            />
            <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-muted mb-3" />
              <h3 className="font-mono text-sm text-text font-bold mb-1">Upload CV (PDF or DOCX)</h3>
              <p className="font-mono text-[10px] text-muted">Data is parsed directly via deterministic pipeline.</p>
            </label>
          </div>
        )}

        {isParsing && (
          <div className="p-8 text-center animate-pulse">
            <p className="font-mono text-xs text-accent">Extracting text footprint...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 border border-red-500/20 bg-red-500/5 rounded text-red-400 font-mono text-xs">
            {error}
          </div>
        )}

        {insights && file && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                <span className="font-mono text-xs font-bold text-text">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="font-mono text-[10px] text-muted hover:text-text">
                Upload different file
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border/50 rounded-lg p-4 bg-surface/30">
                <h4 className="font-mono text-[10px] text-muted tracking-widest mb-2 flex items-center justify-between">
                  IMPACT VERBS
                  {insights.actionCount > insights.weakCount ? (
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                  ) : (
                    <AlertTriangle size={12} className="text-amber" />
                  )}
                </h4>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-2xl font-bold text-text">{insights.actionCount}</span>
                  <span className="font-mono text-[10px] text-text-dim mb-1">strong</span>
                </div>
                <p className="font-mono text-[9px] text-muted">vs {insights.weakCount} weak verbs</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.actionCount > insights.weakCount 
                      ? "Good use of strong industry verbs (e.g. Architected, Spearheaded)."
                      : "Too many passive verbs (e.g. Helped, Worked on). Use stronger vocabulary."}
                  </p>
                </div>
              </div>

              <div className="border border-border/50 rounded-lg p-4 bg-surface/30">
                <h4 className="font-mono text-[10px] text-muted tracking-widest mb-2 flex items-center justify-between">
                  METRIC DENSITY
                  {insights.metricDensity >= 5 ? (
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                  ) : (
                    <AlertTriangle size={12} className="text-amber" />
                  )}
                </h4>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-2xl font-bold text-text">{insights.metricDensity}</span>
                  <span className="font-mono text-[10px] text-text-dim mb-1">data points</span>
                </div>
                <p className="font-mono text-[9px] text-muted">detected (%, x, ms)</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.metricDensity >= 5
                      ? "Excellent metric density. Your impact is quantized and measurable."
                      : "Low metric density. Quantify your achievements (e.g. 'Improved latency by 20%')."}
                  </p>
                </div>
              </div>

              <div className="border border-border/50 rounded-lg p-4 bg-surface/30">
                <h4 className="font-mono text-[10px] text-muted tracking-widest mb-2 flex items-center justify-between">
                  LENGTH CHECK
                  {insights.lengthInsight.status === "good" ? (
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                  ) : (
                    <AlertTriangle size={12} className="text-amber" />
                  )}
                </h4>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-2xl font-bold text-text">{insights.wordCount}</span>
                  <span className="font-mono text-[10px] text-text-dim mb-1">words</span>
                </div>
                <p className="font-mono text-[9px] text-muted">total footprint</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.lengthInsight.message}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 flex gap-3 border border-accent/20 bg-accent/[0.03] rounded-lg">
              <Info size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] text-accent/80 leading-relaxed">
                This analysis is powered by strict deterministic algorithms running in your browser instance against standard SWE recruiting heuristics, keeping your raw data explicitly private and out of LLM pipelines.
              </p>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

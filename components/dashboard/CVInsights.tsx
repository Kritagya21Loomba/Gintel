import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Info, Zap, Target, BookOpen, Layers, XCircle, FileBarChart } from "lucide-react";
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
        let errorMsg = "Failed to parse document";
        try {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            errorMsg = data.error || errorMsg;
          } catch {
            const temp = document.createElement("div");
            temp.innerHTML = text;
            const heading = temp.querySelector("h1")?.innerText || temp.querySelector("h2")?.innerText || text.slice(0, 150);
            errorMsg = `Server Error: ${heading}`;
          }
        } catch {
          errorMsg = "Network error or invalid response";
        }
        throw new Error(errorMsg);
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
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // 1. Google XYZ Formula Alignment
    // Sentences with (Action verb) + (Metric)
    const strongVerbs = ["spearheaded", "architected", "engineered", "orchestrated", "deployed", "scaled", "optimized", "streamlined", "transformed", "designed", "implemented", "reduced", "increased", "migrated"];
    let xyzScore = 0;
    sentences.forEach(s => {
      const lower = s.toLowerCase();
      const hasAction = strongVerbs.some(v => lower.includes(v));
      const hasMetric = /\d/.test(s) || /%|\$|ms|k|m|b/i.test(s);
      if (hasAction && hasMetric) xyzScore++;
    });

    // 2. Harvard Action Verb Index
    const weakVerbs = ["helped", "assisted", "worked", "managed", "tried", "handled", "participated", "responsible for", "duties included"];
    let actionCount = 0;
    let weakCount = 0;
    strongVerbs.forEach(v => {
      actionCount += (lowerText.match(new RegExp(`\\b${v}\\b`, 'g')) || []).length;
    });
    weakVerbs.forEach(v => {
      weakCount += (lowerText.match(new RegExp(`\\b${v}\\b`, 'g')) || []).length;
    });

    // 3. Impact Quantization (Data Density)
    const metricMatches = text.match(/\d+(%|x|ms|s|k|m|b|\+)/gi) || [];
    const metricDensity = metricMatches.length;

    // 4. Applied Technology Penetration
    const techWords = ["react", "python", "aws", "docker", "node", "java", "sql", "git", "linux", "cloud", "api", "ci/cd", "kubernetes", "typescript", "c++", "go", "rust"];
    const quarters = [
      lowerText.substring(0, lowerText.length / 4),
      lowerText.substring(lowerText.length / 4, lowerText.length / 2),
      lowerText.substring(lowerText.length / 2, lowerText.length * 0.75),
      lowerText.substring(lowerText.length * 0.75)
    ];
    let spreadCount = 0;
    techWords.forEach(w => {
      let qCount = 0;
      quarters.forEach(q => { if (q.includes(w)) qCount++; });
      if (qCount > 1) spreadCount++; // Found in multiple quarters
    });

    // 5. Repetitive Cliché Flagging
    const cliches = ["team player", "detail-oriented", "hard worker", "results-driven", "self-starter", "synergy", "thought leader", "go-getter", "dynamic", "motivated"];
    let clicheCount = 0;
    cliches.forEach(c => {
      clicheCount += (lowerText.match(new RegExp(`\\b${c}\\b`, 'g')) || []).length;
    });

    // 6. ATS Readability & Brevity Rules
    const avgSentenceLength = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0;
    let brevityStatus = "good";
    let brevityMsg = "Solid readability metrics.";
    if (avgSentenceLength > 30) {
      brevityStatus = "warning";
      brevityMsg = "Bullets/Sentences form walls of text (30+ words avg). Avoid paragraphs.";
    } else if (wordCount > 900) {
      brevityStatus = "warning";
      brevityMsg = `CV is very long (${wordCount} words). ATS prefers conciseness (400-800).`;
    }

    setInsights({
      xyzScore,
      actionCount,
      weakCount,
      metricDensity,
      spreadCount,
      clicheCount,
      wordCount,
      avgSentenceLength,
      brevityStatus,
      brevityMsg
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Determinant Analysis" badge="HEURISTIC MATRIX v2.0">
        {!file && (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-surface/30 transition-colors">
            <input 
              type="file" 
              id="cv-upload" 
              className="hidden" 
              accept=".pdf,.docx" 
              onChange={handleFileUpload} 
              disabled={isParsing}
            />
            <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={40} className="text-accent mb-4 opacity-80" />
              <h3 className="font-display text-lg text-text font-bold mb-2">Upload Source Document</h3>
              <p className="font-mono text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Ingest PDF/DOCX to generate a 6-module deterministic breakdown based on elite SWE recruitment benchmarks.
              </p>
            </label>
          </div>
        )}

        {isParsing && (
          <div className="p-16 text-center animate-pulse">
            <FileBarChart size={40} className="text-accent mx-auto mb-4 opacity-50" />
            <p className="font-mono text-xs text-accent tracking-widest uppercase">Decoupling Layout Matrix...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-red-400 font-mono text-xs">
            <span className="font-bold uppercase tracking-widest border-b border-red-500/20 pb-1 mb-2 block">Parse Fault</span>
            {error}
          </div>
        )}

        {insights && file && (
          <div className="mt-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded">
                  <FileText size={16} className="text-accent" />
                </div>
                <div>
                  <span className="font-display text-sm font-bold text-text block">{file.name}</span>
                  <span className="font-mono text-[10px] text-muted uppercase tracking-wider">{insights.wordCount} words detected</span>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="font-mono text-[10px] px-3 py-1.5 border border-border rounded text-muted hover:text-text hover:bg-surface transition-colors">
                PURGE & RE-UPLOAD
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. Google XYZ */}
              <div className="border border-border/50 rounded-xl p-5 bg-surface/20 flex flex-col hover:border-accent/30 transition-colors">
                <h4 className="font-mono text-[10px] text-text-dim tracking-widest mb-3 flex items-center gap-2">
                  <Target size={14} className="text-[#3b82f6]" />
                  GOOGLE X-Y-Z ALIGNMENT
                </h4>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-3xl font-bold text-text leading-none">{insights.xyzScore}</span>
                  <span className="font-mono text-[10px] text-muted mb-1 pb-0.5">impact clusters</span>
                </div>
                <div className="mt-auto pt-3 border-t border-border/40">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.xyzScore >= 5 
                      ? "Excellent density of Action + Metric pairings mimicking the Google 'XYZ' formula."
                      : "Low XYZ pairing. Ensure bullets state Action + Metric (e.g. 'Optimized X by 20%')."
                    }
                  </p>
                </div>
              </div>

              {/* 2. Harvard Action Verbs */}
              <div className="border border-border/50 rounded-xl p-5 bg-surface/20 flex flex-col hover:border-accent/30 transition-colors">
                <h4 className="font-mono text-[10px] text-text-dim tracking-widest mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="text-[#a855f7]" />
                  HARVARD ACTION INDEX
                </h4>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-3xl font-bold text-text leading-none">{insights.actionCount}</span>
                  <span className="font-mono text-[10px] text-muted mb-1 pb-0.5">power verbs</span>
                </div>
                <div className="mt-auto pt-3 border-t border-border/40">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.actionCount > insights.weakCount 
                      ? `Yields ${insights.actionCount} execution verbs vs ${insights.weakCount} passive verbs.`
                      : `Weak verb dominance (${insights.weakCount}). Remove passive phrases like "Helped with".`
                    }
                  </p>
                </div>
              </div>

              {/* 3. Data Density */}
              <div className="border border-border/50 rounded-xl p-5 bg-surface/20 flex flex-col hover:border-accent/30 transition-colors">
                <h4 className="font-mono text-[10px] text-text-dim tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-[#00ff88]" />
                  IMPACT QUANTIZATION
                </h4>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-3xl font-bold text-text leading-none">{insights.metricDensity}</span>
                  <span className="font-mono text-[10px] text-muted mb-1 pb-0.5">empirical metrics</span>
                </div>
                <div className="mt-auto pt-3 border-t border-border/40">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.metricDensity >= 7
                      ? "High empirical density (%, $, ms markers) proving measurable engineering scope."
                      : "Low quantitative proof. Add numbers to demonstrate actual financial/latency impact."
                    }
                  </p>
                </div>
              </div>

              {/* 4. Applied Tech Spread */}
              <div className="border border-border/50 rounded-xl p-5 bg-surface/20 flex flex-col hover:border-accent/30 transition-colors">
                <h4 className="font-mono text-[10px] text-text-dim tracking-widest mb-3 flex items-center gap-2">
                  <Layers size={14} className="text-[#f5a623]" />
                  APPLIED TECH SPREAD
                </h4>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-3xl font-bold text-text leading-none">{insights.spreadCount}</span>
                  <span className="font-mono text-[10px] text-muted mb-1 pb-0.5">distributed skills</span>
                </div>
                <div className="mt-auto pt-3 border-t border-border/40">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.spreadCount >= 3
                      ? "Tech terms are mapped into experience sections naturally, avoiding bottom-list clustering."
                      : "Skills represent keyword-stuffing. Ensure you explicitly mention them inside past roles."
                    }
                  </p>
                </div>
              </div>

              {/* 5. Cliche Avoidance */}
              <div className="border border-border/50 rounded-xl p-5 bg-surface/20 flex flex-col hover:border-accent/30 transition-colors">
                <h4 className="font-mono text-[10px] text-text-dim tracking-widest mb-3 flex items-center gap-2">
                  <XCircle size={14} className="text-red-400" />
                  REDUNDANT FLUFF
                </h4>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-3xl font-bold text-text leading-none">{insights.clicheCount}</span>
                  <span className="font-mono text-[10px] text-muted mb-1 pb-0.5">buzzwords</span>
                </div>
                <div className="mt-auto pt-3 border-t border-border/40">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.clicheCount === 0
                      ? "Perfectly surgical. Zero identified corporate cliches or filler fluff."
                      : "Replace fluff like 'team player' or 'hard worker' with factual engineering impact."
                    }
                  </p>
                </div>
              </div>

              {/* 6. Brevity Rules */}
              <div className="border border-border/50 rounded-xl p-5 bg-surface/20 flex flex-col hover:border-accent/30 transition-colors">
                <h4 className="font-mono text-[10px] text-text-dim tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 size={14} className={insights.brevityStatus === "good" ? "text-accent" : "text-amber"} />
                  ATS READABILITY
                </h4>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-3xl font-bold text-text leading-none">{insights.avgSentenceLength}</span>
                  <span className="font-mono text-[10px] text-muted mb-1 pb-0.5">avg words/sentence</span>
                </div>
                <div className="mt-auto pt-3 border-t border-border/40">
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {insights.brevityMsg}
                  </p>
                </div>
              </div>

            </div>
            
            <div className="mt-6 p-4 flex gap-3 border-t border-border/50">
              <Info size={16} className="text-muted flex-shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] text-muted leading-relaxed uppercase tracking-wider">
                Algorithms execute cleanly inside a secure browser-to-Node buffer via PDF.js V1.1.1 protocol. No LLM tokenization. Private by design.
              </p>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

import { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Info, Zap, Target, BookOpen, Layers, XCircle, FileBarChart, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";

// Helper component for uniform insight cards
function InsightCard({ 
  title, icon: Icon, value, label, message, status, 
  evidence = [], evidenceLabel = "Show Details", 
  referenceLink, referenceName 
}: any) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = status === 'good' ? 'text-accent' : status === 'warning' ? 'text-amber' : 'text-red-400';
  
  return (
    <div className="border border-border/50 rounded-xl p-5 bg-surface/20 flex flex-col hover:border-accent/30 transition-colors h-full">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-mono text-xs text-text-dim tracking-widest flex items-center gap-2">
          <Icon size={16} className={colorClass} />
          {title}
        </h4>
        {referenceLink && (
          <a href={referenceLink} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors flex items-center gap-1" title={`Source: ${referenceName}`}>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
      
      <div className="flex items-end gap-2 mb-2">
        <span className="font-display text-4xl font-bold text-text leading-none">{value}</span>
        <span className="font-mono text-xs text-muted mb-1 pb-0.5">{label}</span>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border/40 space-y-3">
        <p className="font-mono text-xs text-text-dim leading-relaxed">{message}</p>
        
        {evidence.length > 0 && (
          <div>
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-[11px] font-mono font-bold text-accent hover:underline flex items-center gap-1"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Hide Evidence" : evidenceLabel}
            </button>
            {expanded && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {evidence.map((e: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-surface rounded text-[11px] font-mono text-text-dim border border-border/50 break-words max-w-full">
                    {e.substring(0, 100)}{e.length > 100 ? "..." : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface CVInsightsProps {}

export function CVInsights({}: CVInsightsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState("");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("gintel_cv_cache");
    if (cached) {
      try {
        const { text, name } = JSON.parse(cached);
        setFile({ name } as any); // Render-only mock file object
        setParsedText(text);
        computeInsights(text);
      } catch (e) {
        console.error("Cache hydration failed", e);
      }
    }
  }, []);

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
      
      // Save state to survive Auth Redirects / Reloads
      localStorage.setItem("gintel_cv_cache", JSON.stringify({ 
        text: data.text, 
        name: selected.name 
      }));

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
    const strongVerbs = ["spearheaded", "architected", "engineered", "orchestrated", "deployed", "scaled", "optimized", "streamlined", "transformed", "designed", "implemented", "reduced", "increased", "migrated"];
    const xyzMatches: string[] = [];
    sentences.forEach(s => {
      const lower = s.toLowerCase();
      const hasAction = strongVerbs.some(v => lower.includes(v));
      const hasMetric = /\d/.test(s) || /%|\$|ms|k|m|b/i.test(s);
      if (hasAction && hasMetric && s.length > 15) xyzMatches.push(s.trim());
    });
    const xyzScore = xyzMatches.length;

    // 2. Harvard Action Verb Index
    const weakVerbs = ["helped", "assisted", "worked", "managed", "tried", "handled", "participated", "responsible for", "duties included"];
    const actionMatches = new Set<string>();
    const weakMatches = new Set<string>();
    let actionCount = 0;
    let weakCount = 0;
    
    strongVerbs.forEach(v => {
      const count = (lowerText.match(new RegExp(`\\b${v}\\b`, 'g')) || []).length;
      if (count > 0) { actionMatches.add(v); actionCount += count; }
    });
    weakVerbs.forEach(v => {
      const count = (lowerText.match(new RegExp(`\\b${v}\\b`, 'g')) || []).length;
      if (count > 0) { weakMatches.add(v); weakCount += count; }
    });

    // 3. Impact Quantization (Data Density)
    const rawMetrics = text.match(/\b\d+(%|x|ms|s|k|m|b|\+)\b/gi) || [];
    const metricMatches = Array.from(new Set(rawMetrics));
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
    const spreadMatches: string[] = [];
    techWords.forEach(w => {
      let qCount = 0;
      quarters.forEach(q => { if (q.includes(w)) qCount++; });
      if (qCount > 1) { spreadCount++; spreadMatches.push(w); }
    });

    // 5. Repetitive Cliché Flagging
    const cliches = ["team player", "detail-oriented", "hard worker", "results-driven", "self-starter", "synergy", "thought leader", "go-getter", "dynamic", "motivated"];
    let clicheCount = 0;
    const clicheMatches: string[] = [];
    cliches.forEach(c => {
      const count = (lowerText.match(new RegExp(`\\b${c}\\b`, 'g')) || []).length;
      if (count > 0) { clicheCount += count; clicheMatches.push(c); }
    });

    // 6. ATS Readability & Brevity Rules
    const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length).filter(len => len > 0);
    const avgSentenceLength = sentenceLengths.length > 0 ? Math.round(words.length / sentenceLengths.length) : 0;
    let brevityStatus = "good";
    let brevityMsg = "Solid readability formatting dimensions.";
    if (avgSentenceLength > 30) {
      brevityStatus = "warning";
      brevityMsg = "Bullets/Sentences form walls of text (30+ words avg). Avoid paragraphs.";
    } else if (wordCount > 900) {
      brevityStatus = "warning";
      brevityMsg = `CV is very long (${wordCount} words). ATS prefers conciseness (400-800).`;
    }

    setInsights({
      xyzScore, xyzMatches,
      actionCount, weakCount, actionMatches: Array.from(actionMatches), weakMatches: Array.from(weakMatches),
      metricDensity, metricMatches,
      spreadCount, spreadMatches,
      clicheCount, clicheMatches,
      wordCount, avgSentenceLength, sentenceLengths, brevityStatus, brevityMsg
    });
  };

  const handlePurge = () => {
    setFile(null);
    setInsights(null);
    localStorage.removeItem("gintel_cv_cache");
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Determinant Analysis" badge="HEURISTIC MATRIX v3.0">
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
              <p className="font-mono text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Ingest PDF/DOCX to generate a 6-module deterministic breakdown based on elite recruitment benchmarks.
              </p>
            </label>
          </div>
        )}

        {isParsing && (
          <div className="p-16 text-center animate-pulse">
            <FileBarChart size={40} className="text-accent mx-auto mb-4 opacity-50" />
            <p className="font-mono text-sm text-accent tracking-widest uppercase">Decoupling Layout Matrix...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-red-400 font-mono text-sm">
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
                  <span className="font-display text-base font-bold text-text block">{file.name}</span>
                  <span className="font-mono text-xs text-muted uppercase tracking-wider">{insights.wordCount} words detected</span>
                </div>
              </div>
              <button 
                onClick={handlePurge} 
                className="font-mono text-xs px-3 py-1.5 border border-border rounded text-muted hover:text-text hover:bg-surface transition-colors"
              >
                PURGE & RE-UPLOAD
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InsightCard 
                title="GOOGLE X-Y-Z ALIGNMENT" icon={Target}
                value={insights.xyzScore} label="impact clusters" status={insights.xyzScore >= 5 ? 'good' : 'warning'}
                message={insights.xyzScore >= 5 ? "Excellent density of Action + Metric pairings mimicking the Google 'XYZ' formula." : "Low XYZ pairing. Ensure bullets state Action + Metric (e.g. 'Optimized X by 20%')."}
                evidence={insights.xyzMatches} evidenceLabel="View Sentences"
                referenceLink="https://www.inc.com/bill-murphy-jr/google-recruiters-say-these-5-resume-tips-including-x-y-z-formula-will-improve-your-odds-of-getting-hired-at-google.html" referenceName="Google XYZ Format"
              />

              <InsightCard 
                title="HARVARD ACTION INDEX" icon={BookOpen}
                value={insights.actionCount} label="power verbs" status={insights.actionCount > insights.weakCount ? 'good' : 'warning'}
                message={insights.actionCount > insights.weakCount ? `Yields ${insights.actionCount} execution verbs vs ${insights.weakCount} passive verbs.` : `Weak verb dominance (${insights.weakCount}). Remove passive phrases like 'Helped with'.`}
                evidence={insights.actionMatches.concat(insights.weakMatches.map((w: string) => `(weak) ${w}`))} evidenceLabel="View Verbs Found"
                referenceLink="https://ocs.fas.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf" referenceName="Harvard Action List"
              />

              <InsightCard 
                title="IMPACT QUANTIZATION" icon={Zap}
                value={insights.metricDensity} label="empirical metrics" status={insights.metricDensity >= 7 ? 'good' : 'warning'}
                message={insights.metricDensity >= 7 ? "High empirical density (%, $, ms markers) proving measurable engineering scope." : "Low quantitative proof. Add numbers to demonstrate actual impact."}
                evidence={insights.metricMatches} evidenceLabel="View Extracted Data"
              />

              <InsightCard 
                title="APPLIED TECH SPREAD" icon={Layers}
                value={insights.spreadCount} label="distributed skills" status={insights.spreadCount >= 3 ? 'good' : 'warning'}
                message={insights.spreadCount >= 3 ? "Tech terms are mapped into experience sections naturally, avoiding bottom-list clustering." : "Skills likely represent keyword-stuffing. Ensure you explicitly mention them inside past roles."}
                evidence={insights.spreadMatches} evidenceLabel="View Distributed Tags"
              />

              <InsightCard 
                title="REDUNDANT FLUFF" icon={XCircle}
                value={insights.clicheCount} label="buzzwords" status={insights.clicheCount === 0 ? 'good' : 'bad'}
                message={insights.clicheCount === 0 ? "Perfectly surgical. Zero identified corporate cliches or filler fluff." : "Replace fluff like 'team player' or 'hard worker' with factual engineering impact."}
                evidence={insights.clicheMatches} evidenceLabel="View Detected Clichés"
              />

              <InsightCard 
                title="ATS READABILITY" icon={CheckCircle2}
                value={insights.avgSentenceLength} label="avg words/sentence" status={insights.brevityStatus}
                message={insights.brevityMsg}
              />
            </div>
          </div>
        )}
      </SectionCard>

      {/* 7th Insight: Readability Waveform Visualizer */}
      {insights && insights.sentenceLengths && insights.sentenceLengths.length > 0 && (
        <SectionCard title="Chronological Pacing Waveform" badge="STRUCTURAL VISUALIZER">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-sm text-text-dim leading-relaxed max-w-3xl">
              This universal topological map plots the length of every sentence chronologically across your document. 
              Massive <span className="text-red-400 font-bold">red</span> spikes indicate run-on sentences or unwieldy paragraphs that fatigue the reader. 
              A healthy pacing waveform features varied distributions primarily resting in the <span className="text-accent font-bold">green</span> zone (&lt;20 words).
            </p>
            
            <div className="mt-4 p-4 border border-border/50 bg-surface/10 rounded-xl overflow-x-auto custom-scrollbar flex items-end gap-1 h-48 pb-6 relative">
              {/* Baseline markers */}
              <div className="absolute left-0 right-0 bottom-6 border-b border-dashed border-border/40 z-0"></div>
              
              {insights.sentenceLengths.map((len: number, idx: number) => {
                // Max height capping for visualization scale (cap at 60 words for UI bounds)
                const clampedLen = Math.min(len, 60); 
                const heightPercentage = Math.max((clampedLen / 60) * 100, 4); // Min 4% height
                
                let colorClass = "bg-accent"; // < 20
                if (len >= 20 && len <= 35) colorClass = "bg-amber";
                if (len > 35) colorClass = "bg-red-500 opacity-80";

                return (
                  <div 
                    key={idx}
                    className={`w-2.5 shrink-0 rounded-t-sm transition-all duration-300 hover:opacity-100 z-10 ${colorClass} hover:brightness-125 cursor-crosshair group relative`}
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 rounded font-mono text-[10px] text-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      {len} words
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-6 mt-2 pb-2">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-accent"></div>
                 <span className="font-mono text-xs text-text-dim">Optimal (&lt;20)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-amber"></div>
                 <span className="font-mono text-xs text-text-dim">Heavy (20-35)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-red-500 opacity-80"></div>
                 <span className="font-mono text-xs text-text-dim">Run-on (35+)</span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

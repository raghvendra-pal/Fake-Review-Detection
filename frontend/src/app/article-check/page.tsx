"use client";

import { useState } from "react";
import { Newspaper, Sparkles, AlertCircle, Globe, ShieldCheck, Flame, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { checkArticle } from "@/lib/api";
import { ArticleCheckResult } from "@/lib/types";

export default function ArticleCheckPage() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState(
    "SHOCKING BOMBSHELL: You won't believe what doctors discovered in this miraculous secret cure! Big pharma is terrified!"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArticleCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !url.trim()) {
      setErrorMsg("Please enter article text or a URL.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await checkArticle(url.trim() || undefined, text.trim() || undefined);
      setResult(res);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Article check failed.");
      setLoading(false);
    }
  };

  const sampleArticles = [
    {
      label: "🚨 Sensational Clickbait",
      url: "https://beforeitsnews.com/shocking-cure",
      text: "SHOCKING BOMBSHELL: You won't believe what doctors discovered in this miraculous secret cure! Big pharma is terrified! The real truth exposed!",
    },
    {
      label: "📰 Objective Legacy News",
      url: "https://reuters.com/business/tech-earnings",
      text: "European central bankers met on Thursday to evaluate benchmark interest rates following a modest deceleration in annual consumer price inflation.",
    },
    {
      label: "🎭 Satire / Parody",
      url: "https://theonion.com/study-finds-cats-prefer",
      text: "Nation's felines unanimously agree that sitting inside cardboard boxes provides superior psychological equilibrium, according to a recent satirical survey.",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-semibold mb-3">
          <Newspaper className="w-3.5 h-3.5" />
          News &amp; Media Credibility Inspector
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Article Credibility &amp; Clickbait Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Analyze news articles and blog posts for sensationalism density, clickbait headline markers, emotional manipulation, and publisher domain reputation.
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        {/* Sample selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load sample:</span>
          {sampleArticles.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                setText(sample.text);
                setResult(null);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Article URL (Optional)</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="https://reuters.com/... or https://domain.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ink-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Headline &amp; Body Text</label>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste headline and article paragraphs here..."
            className="w-full p-4 bg-ink-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan font-mono resize-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => handleCheck()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-xs font-bold text-ink-950 shadow-glow-cyan hover:opacity-90 disabled:opacity-40 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning Media Credibility...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Audit Article Credibility
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {/* Main Verdict Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl border ${
                  result.credibility_score >= 70
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-glow-trust"
                    : result.credibility_score >= 45
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-glow-threat"
                }`}
              >
                {result.credibility_score}
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Credibility Index (0–100)
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-0.5">
                  {result.verdict}
                </h3>
                {result.domain_name && (
                  <span className="text-xs text-slate-400 font-mono">
                    Publisher: {result.domain_name} ({result.domain_reputation})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-400 block mb-1">Clickbait Likelihood</span>
              <p
                className={`font-display font-bold text-xl ${
                  result.clickbait_score > 50 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {result.clickbait_score}%
              </p>
              <span className="text-[11px] text-slate-500">Formulaic teaser patterns</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-400 block mb-1">Sensationalism Density</span>
              <p
                className={`font-display font-bold text-xl ${
                  result.sensationalism_score > 40 ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {result.sensationalism_score}%
              </p>
              <span className="text-[11px] text-slate-500">Hyperbolic vocabulary ratio</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-400 block mb-1">Domain Registry Status</span>
              <p className="font-display font-bold text-sm text-white truncate">
                {result.domain_reputation}
              </p>
              <span className="text-[11px] text-slate-500">{result.domain_name || "Self-submitted text"}</span>
            </div>
          </div>

          {/* Key Takeaways */}
          {result.key_takeaways?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Investigative Takeaways:</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.key_takeaways.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-electric-cyan font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flagged Phrases */}
          {result.flagged_phrases?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Flagged Linguistic Markers:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.flagged_phrases.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium"
                    title={p.explanation}
                  >
                    "{p.term}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

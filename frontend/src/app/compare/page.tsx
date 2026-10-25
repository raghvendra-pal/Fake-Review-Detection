"use client";

import { useState } from "react";
import { GitCompare, Trophy, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { compareTargets } from "@/lib/api";
import { CompareResponse } from "@/lib/types";
import { SAMPLE_DATASETS } from "@/lib/sampleConstants";

export default function ComparePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default comparison inputs
  const [targetA_Title, setTargetA_Title] = useState("Product Alpha (Promotional Bot Ring)");
  const [targetA_Text, setTargetA_Text] = useState(
    `Best product ever! Changed my life completely! Must buy right now! 100% recommend!\n` +
    `Item arrived on time. Works great thanks seller. Highly recommended to all buyers!\n` +
    `MIRACLE PRODUCT! Blown away by the unbelievable results! Five stars aren't enough!\n` +
    `Cannot live without this! Absolutely phenomenal quality and flawless performance!`
  );

  const [targetB_Title, setTargetB_Title] = useState("Product Beta (Organic Consumer Reviews)");
  const [targetB_Text, setTargetB_Text] = useState(
    `I've been using this keyboard for about a month now. Overall it works reliably, though the cable is somewhat short.\n` +
    `Purchased after reading comparisons. Bluetooth setup took two minutes. Tactile switches feel pleasant.\n` +
    `Very average. The spacebar has a slight rattle and the Bluetooth occasionally sleeps too aggressively on Windows.\n` +
    `Good budget alternative to custom mechanical builds. It lacks hot-swap sockets, but good value.`
  );

  const handleRunComparison = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const parseTextToReviews = (text: string) => {
      const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 5);
      return lines.map((t, idx) => ({
        reviewer_name: `Reviewer_${idx + 1}`,
        review_text: t,
        rating: 5.0,
      }));
    };

    try {
      const payload = [
        {
          title: targetA_Title.trim() || "Target A",
          reviews: parseTextToReviews(targetA_Text),
        },
        {
          title: targetB_Title.trim() || "Target B",
          reviews: parseTextToReviews(targetB_Text),
        },
      ];

      const res = await compareTargets(payload);
      setResult(res);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Comparison failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-semibold mb-3">
          <GitCompare className="w-3.5 h-3.5" />
          Side-by-Side Comparison
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Compare Review Authenticity
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Evaluate multiple competing products, sellers, or listings side by side to determine which holds genuine consumer trust.
        </p>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target 1 */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <span className="text-xs font-mono font-bold text-electric-cyan uppercase tracking-wider">
            Listing Target 1
          </span>
          <input
            type="text"
            value={targetA_Title}
            onChange={(e) => setTargetA_Title(e.target.value)}
            placeholder="Product A Title"
            className="w-full px-4 py-2 bg-ink-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
          />
          <textarea
            rows={6}
            value={targetA_Text}
            onChange={(e) => setTargetA_Text(e.target.value)}
            placeholder="Paste reviews for Product A (one per line)..."
            className="w-full p-3.5 bg-ink-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan font-mono resize-none"
          />
        </div>

        {/* Target 2 */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <span className="text-xs font-mono font-bold text-electric-blue uppercase tracking-wider">
            Listing Target 2
          </span>
          <input
            type="text"
            value={targetB_Title}
            onChange={(e) => setTargetB_Title(e.target.value)}
            placeholder="Product B Title"
            className="w-full px-4 py-2 bg-ink-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
          />
          <textarea
            rows={6}
            value={targetB_Text}
            onChange={(e) => setTargetB_Text(e.target.value)}
            placeholder="Paste reviews for Product B (one per line)..."
            className="w-full p-3.5 bg-ink-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan font-mono resize-none"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => handleRunComparison()}
          disabled={loading}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-electric-cyan via-electric-blue to-trust-500 text-ink-950 font-display font-bold text-sm shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all hover:scale-[1.02] flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing Multi-Target Comparison...
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" />
              Compare Trust Scores
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Comparison Results Card */}
      {result && (
        <div className="space-y-6 pt-6">
          {/* Winner Banner */}
          <div className="p-6 rounded-3xl bg-emerald-500/[0.08] border border-emerald-500/30 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                Most Authentic Option
              </span>
              <h2 className="font-display font-bold text-xl text-white mt-0.5">
                {result.winner_title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.summary_verdict}</p>
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.targets.map((tgt, idx) => {
              const isWinner = tgt.title === result.winner_title;
              const isHighRisk = tgt.trust_score < 45;

              return (
                <div
                  key={idx}
                  className={`glass-panel p-6 rounded-3xl border transition-all ${
                    isWinner
                      ? "border-emerald-500/40 shadow-glow-trust"
                      : isHighRisk
                      ? "border-rose-500/30"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">{tgt.title}</h3>
                      <span className="text-xs font-mono text-slate-400">
                        {tgt.total_reviews} reviews analyzed
                      </span>
                    </div>
                    {isWinner && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Winner
                      </span>
                    )}
                  </div>

                  {/* Trust Score Banner */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between mb-5">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">
                        Trust Score
                      </span>
                      <span className="font-display font-extrabold text-3xl text-white">
                        {tgt.trust_score}
                        <span className="text-sm text-slate-400 font-normal"> / 100</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">
                        Verdict
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          tgt.trust_score >= 75
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : tgt.trust_score >= 45
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {tgt.verdict}
                      </span>
                    </div>
                  </div>

                  {/* Mini Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Fake Review Prob</span>
                      <span className="font-bold text-white text-sm font-mono">{tgt.fake_probability}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Syndicate Rings</span>
                      <span className="font-bold text-white text-sm font-mono">{tgt.account_rings_detected}</span>
                    </div>
                  </div>

                  {/* Warnings & Strengths */}
                  <div className="space-y-3">
                    {tgt.key_warnings.length > 0 && (
                      <div className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 text-xs text-rose-300 space-y-1">
                        <span className="font-bold block text-[11px]">Identified Risks:</span>
                        {tgt.key_warnings.map((w, i) => (
                          <p key={i} className="text-[11px]">• {w}</p>
                        ))}
                      </div>
                    )}

                    {tgt.key_strengths.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                        <span className="font-bold block text-[11px]">Positive Indicators:</span>
                        {tgt.key_strengths.map((s, i) => (
                          <p key={i} className="text-[11px]">✓ {s}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

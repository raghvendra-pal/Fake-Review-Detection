"use client";

import { useState } from "react";
import { Zap, Sparkles, AlertCircle, Star, CheckCircle, Info, BookOpen, Bot, ShieldCheck } from "lucide-react";
import { quickCheck } from "@/lib/api";
import { QuickCheckResult } from "@/lib/types";

export default function QuickCheckPage() {
  const [text, setText] = useState(
    "Best purchase ever! Changed my life completely! You must buy this right now! 100% recommend to everyone! Five stars aren't enough!"
  );
  const [rating, setRating] = useState<number>(5.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) {
      setErrorMsg("Please enter review text.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await quickCheck(text, rating);
      setResult(res);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Quick check failed.");
      setLoading(false);
    }
  };

  const sampleReviews = [
    {
      label: "🚨 Promotional Deceptive",
      text: "Best product ever! Changed my life completely! You must buy this right now! 100% recommend to everyone! Five stars aren't enough!",
      rating: 5.0,
    },
    {
      label: "🌿 Organic Nuanced",
      text: "I've been using this keyboard for two weeks. Build quality is solid for the price, though the cable is somewhat short. Bluetooth connectivity works reliably.",
      rating: 4.0,
    },
    {
      label: "⚠️ Templated Click-Farm",
      text: "Item arrived on time. Works great thanks seller. Highly recommended to all buyers! Good quality as described.",
      rating: 5.0,
    },
    {
      label: "🤖 Formulaic AI-Bot",
      text: "In conclusion, this headphones represents a seamless blend of modern acoustic engineering and exquisite craftsmanship. Furthermore, it serves as a testament to perfection.",
      rating: 5.0,
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5" />
          Single Review Inspector
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Instant Review Quick Check
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Paste any individual review text to instantly inspect token-level feature attribution, linguistic markers, readability scores, and AI generation likelihood.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        {/* Sample selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load sample:</span>
          {sampleReviews.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(sample.text);
                setRating(sample.rating);
                setResult(null);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Rating:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-amber-400">{rating} Stars</span>
        </div>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste single review text here..."
          className="w-full p-4 bg-ink-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan font-mono resize-none leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleQuickCheck()}
            disabled={loading || !text.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-xs font-bold text-ink-950 shadow-glow-cyan hover:opacity-90 disabled:opacity-40 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Analyzing Tokens..." : "Inspect Review"}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {/* Header Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl border ${
                  result.fake_probability >= 50
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-glow-threat"
                    : result.fake_probability >= 30
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-glow-trust"
                }`}
              >
                {result.trust_score}
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Trust Score (0–100)
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-0.5">
                  {result.verdict}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <span className="text-slate-400 text-[10px] block">Fake Probability</span>
                <span
                  className={`font-bold text-base ${
                    result.fake_probability >= 50 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {result.fake_probability}%
                </span>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
            <span className="font-bold text-white block mb-1">Forensic Analysis Summary:</span>
            {result.explanation}
          </div>

          {/* Token Attribution Heatmap */}
          {result.token_attributions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white">Feature Weight Attribution (Tokens)</span>
                <span className="text-[10px] text-slate-400 font-mono">Top ML coefficients</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.token_attributions.map((token, i) => (
                  <div
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border ${
                      token.type === "suspicious"
                        ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    <span>{token.word}</span>
                    <span className="text-[10px] opacity-75">
                      {token.weight > 0 ? `+${token.weight}` : token.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-electric-cyan" />
                <span>Readability Level</span>
              </div>
              <p className="font-display font-bold text-white text-sm">{result.readability_level}</p>
              <span className="text-[10px] font-mono text-slate-500">
                Score: {result.readability_score} / 100
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Bot className="w-3.5 h-3.5 text-electric-indigo" />
                <span>AI Likelihood</span>
              </div>
              <p className="font-display font-bold text-white text-sm">
                {Math.round(result.ai_generated_likelihood * 100)}%
              </p>
              <span className="text-[10px] text-slate-500">Sentence variance proxy</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Sentiment Polarity</span>
              </div>
              <p className="font-display font-bold text-white text-sm">
                {result.sentiment_polarity > 0 ? `+${result.sentiment_polarity}` : result.sentiment_polarity}
              </p>
              <span className="text-[10px] text-slate-500">-1.0 (Neg) to +1.0 (Pos)</span>
            </div>
          </div>

          {/* Rule Flags */}
          {result.linguistic_flags.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">Triggered Behavioral Rules:</span>
              <div className="flex flex-wrap gap-1.5">
                {result.linguistic_flags.map((flag) => (
                  <span
                    key={flag}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium"
                  >
                    • {flag}
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

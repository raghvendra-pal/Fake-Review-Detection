"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const faqs = [
    {
      q: "How does TrustLens determine whether a review is fake?",
      a: "TrustLens uses an ensemble approach: 1) A trained sublinear TF-IDF + Calibrated Logistic Regression classifier, 2) 8 behavioral heuristics (sentiment-rating mismatch, superlatives, AI sentence burstiness, readability), 3) Account pattern clustering (bot numeric suffixes), and 4) Time-series burst and J-curve distribution detection.",
    },
    {
      q: "What happens if a website blocks automated scraping?",
      a: "Platforms like Amazon and Yelp actively employ anti-bot protections (Cloudflare/CAPTCHA). TrustLens provides graceful fallback mechanisms: you can upload a CSV/JSON file of the reviews, paste review text directly, or run bundled realistic offline demo scenarios.",
    },
    {
      q: "What is Account Intelligence and why is it unique?",
      a: "Most spam checkers only inspect individual review text in isolation. TrustLens clusters accounts by username patterns (e.g. alex_8821, alex_8822), tracks duplicate copy-paste reviews across multiple accounts, and models reviewers as a co-occurrence network graph to uncover coordinated syndicates.",
    },
    {
      q: "Can I export reports for client or legal review?",
      a: "Yes. Every report can be exported as a professional PDF report, a structured CSV spreadsheet of all reviews with flags, or a full JSON machine-readable document.",
    },
    {
      q: "Is the score considered legal proof?",
      a: "No. The Trust Score and verdicts are probabilistic estimates generated via statistical algorithms and supervised ML models to guide consumer research and compliance audits.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center mb-10">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-electric-cyan">
          Frequently Asked Questions
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
          Everything You Need to Know
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
              >
                <span className="font-display font-semibold text-sm text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isOpen ? "transform rotate-180 text-electric-cyan" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 leading-relaxed font-sans border-t border-white/[0.04] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

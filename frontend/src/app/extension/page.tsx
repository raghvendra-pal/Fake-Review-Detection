"use client";

import { useState } from "react";
import {
  Bookmark,
  Puzzle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Download,
  ArrowRight,
  Terminal,
  Zap,
  Globe
} from "lucide-react";
import { BOOKMARKLET_HREF, BOOKMARKLET_RAW_SCRIPT } from "@/lib/bookmarklet";

export default function ExtensionPage() {
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(BOOKMARKLET_HREF);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
  };

  const extensionPath = "d:\\CodeWorks\\AntiGravity\\FakeReviewDetection\\extension";

  const handleCopyPath = () => {
    navigator.clipboard.writeText(extensionPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2500);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 flex flex-col font-sans selection:bg-electric-cyan selection:text-ink-950">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>CLIENT-SIDE BYPASS TOOLS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            Analyze Protected Reviews With <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-electric-cyan">
              Zero Bot Restrictions
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            E-commerce giants like Amazon and Yelp strictly block cloud scrapers.
            Use our <strong>1-Click Bookmarklet</strong> or official <strong>Chrome Extension (Manifest V3)</strong> to extract reviews directly from your active browser tab and inspect them in TrustLens.
          </p>
        </div>

        {/* Section 1: The 1-Click Bookmarklet */}
        <section className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white">Option A: 1-Click Browser Bookmarklet</h2>
                <p className="text-xs text-slate-400">Instant 0-install utility for Chrome, Edge, Brave, Safari, and Firefox.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={BOOKMARKLET_HREF}
                onClick={(e) => {
                  e.preventDefault();
                  alert("Drag this button to your Bookmarks Bar (press Ctrl+Shift+B if hidden)!");
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-ink-950 font-black text-xs shadow-glow-cyan hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-grab active:cursor-grabbing"
                title="Drag to your Bookmarks Bar"
              >
                <span>🛡️ Analyze with TrustLens</span>
              </a>

              <button
                onClick={handleCopyBookmarklet}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedBookmarklet ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3 Step Instruction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-ink-950/60 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-white text-xs">Drag to Bookmarks Bar</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click and drag the green <strong className="text-white">🛡️ Analyze with TrustLens</strong> button directly up into your browser&apos;s Bookmarks bar. (Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Ctrl+Shift+B</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Cmd+Shift+B</kbd> to toggle the bar).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ink-950/60 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-white text-xs">Open Any Product Page</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Navigate to any Amazon, Flipkart, or Trustpilot product listing where customer reviews are visible.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ink-950/60 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-white text-xs">Click Bookmarklet</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click the bookmarklet in your toolbar. It extracts reviewer names, ratings, text, and verified badges and automatically opens the TrustLens forensic report!
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Chrome Extension (Manifest V3) */}
        <section className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-cyan/20 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan">
                <Puzzle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white">Option B: TrustLens Chrome Extension (Manifest V3)</h2>
                <p className="text-xs text-slate-400">Full popup inspector with review previews, CSV/JSON exports, and background sync.</p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan font-mono text-xs font-semibold">
              Manifest V3 Ready
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Installation in Under 30 Seconds</span>
              </h3>

              <ol className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                  <span>
                    Open Google Chrome or Microsoft Edge and navigate to <code className="text-amber-300 font-mono px-1 py-0.5 rounded bg-white/5">chrome://extensions</code> in the URL bar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                  <span>
                    In the top-right corner, toggle the <strong className="text-white">Developer mode</strong> switch to <strong>ON</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                  <span>
                    Click <strong className="text-white">&quot;Load unpacked&quot;</strong> in the top-left toolbar and select the directory:
                  </span>
                </li>
              </ol>

              {/* Path copy box */}
              <div className="p-3 rounded-xl bg-ink-950/80 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Terminal className="w-4 h-4 text-electric-cyan flex-shrink-0" />
                  <span className="font-mono text-xs text-slate-300 truncate">{extensionPath}</span>
                </div>
                <button
                  onClick={handleCopyPath}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 transition-colors"
                >
                  {copiedPath ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Path</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>The TrustLens shield icon will appear in your extensions list. Pin it to your toolbar for 1-click access!</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="p-5 rounded-2xl bg-ink-950/50 border border-white/5 flex flex-col justify-between gap-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono text-slate-400">
                Extension Features
              </h4>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Automatic Platform Detection:</strong> Detects Amazon, Flipkart, Trustpilot, Google Maps, and Yelp.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>1-Click Forensic Analysis:</strong> Submits review data directly to TrustLens backend.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Live On-Page Review Preview:</strong> View ratings and text snippets before launching analysis.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Export as CSV / JSON:</strong> Export parsed review datasets for external analysis or auditing.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Privacy: Runs 100% locally. Zero third-party telemetry.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Supported Platforms Matrix */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-display text-white">Supported Platforms & Extraction Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Amazon</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">100% Supported</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extracts reviewer names, star ratings, review dates, verified purchase flags, and helpful upvote counts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Flipkart</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">100% Supported</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extracts reviewer handles, rating values, certified buyer verification status, and full feedback bodies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Trustpilot</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">100% Supported</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extracts consumer usernames, rating stars, timestamp, review text, and company response flags.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Google Maps</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">100% Supported</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extracts reviewer accounts, star ratings, timestamps, and customer reviews directly from the active place card.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

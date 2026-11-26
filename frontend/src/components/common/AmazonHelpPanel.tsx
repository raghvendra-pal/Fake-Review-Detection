"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Puzzle,
  FileText,
  Upload,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Info
} from "lucide-react";
import { BOOKMARKLET_HREF, BOOKMARKLET_RAW_SCRIPT } from "@/lib/bookmarklet";

interface AmazonHelpPanelProps {
  platformName?: string;
  targetUrl?: string;
  errorMessage?: string;
  onSwitchToTab: (tab: "text" | "file" | "demo") => void;
  onLoadDemo: (demoName: string) => void;
}

export default function AmazonHelpPanel({
  platformName = "Amazon",
  targetUrl,
  errorMessage,
  onSwitchToTab,
  onLoadDemo
}: AmazonHelpPanelProps) {
  const [activeHelpTab, setActiveHelpTab] = useState<"bookmarklet" | "extension" | "manual">("bookmarklet");
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(BOOKMARKLET_HREF);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
  };

  const displayName = platformName.charAt(0).toUpperCase() + platformName.slice(1);

  return (
    <div className="w-full mt-4 p-5 rounded-2xl bg-amber-500/[0.07] border border-amber-500/30 text-xs shadow-2xl backdrop-blur-xl animate-fade-in relative overflow-hidden">
      {/* Background ambient badge */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm">
                How to Analyze {displayName} Reviews
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">
                Anti-Bot Protected
              </span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {errorMessage || `${displayName} blocks automated backend scrapers with bot-detection challenges. To analyze these reviews with 100% fidelity, choose one of the official options below:`}
            </p>
          </div>
        </div>
      </div>

      {/* Solution Selector Tabs */}
      <div className="flex items-center gap-2 my-4 p-1 rounded-xl bg-ink-950/60 border border-white/5">
        <button
          type="button"
          onClick={() => setActiveHelpTab("bookmarklet")}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeHelpTab === "bookmarklet"
              ? "bg-amber-400 text-ink-950 shadow-md font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          1-Click Bookmarklet (0-Install)
        </button>
        <button
          type="button"
          onClick={() => setActiveHelpTab("extension")}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeHelpTab === "extension"
              ? "bg-amber-400 text-ink-950 shadow-md font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Puzzle className="w-3.5 h-3.5" />
          Chrome Extension (Manifest V3)
        </button>
        <button
          type="button"
          onClick={() => setActiveHelpTab("manual")}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeHelpTab === "manual"
              ? "bg-amber-400 text-ink-950 shadow-md font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Paste / CSV / Demo
        </button>
      </div>

      {/* Tab 1 Content: Bookmarklet */}
      {activeHelpTab === "bookmarklet" && (
        <div className="p-4 rounded-xl bg-ink-950/40 border border-white/5 flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-white/10">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-amber-300 font-bold block mb-0.5">
                Drag this button to your bookmarks bar:
              </span>
              <p className="text-slate-300 text-xs">
                Works on Chrome, Edge, Safari, Brave, and Firefox with zero installation.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Draggable bookmarklet link */}
              <a
                href={BOOKMARKLET_HREF}
                onClick={(e) => {
                  e.preventDefault();
                  alert("Drag this button to your browser's Bookmarks bar (Ctrl+Shift+B) to install it, then click it when viewing any Amazon or Flipkart page!");
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-ink-950 font-bold text-xs shadow-lg hover:shadow-emerald-500/20 cursor-grab active:cursor-grabbing flex items-center gap-2 transition-transform hover:scale-105"
                title="Drag to your Bookmarks Bar!"
              >
                <span>🛡️ Analyze with TrustLens</span>
              </a>

              <button
                type="button"
                onClick={handleCopyBookmarklet}
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                title="Copy bookmarklet URL code"
              >
                {copiedBookmarklet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-amber-400 font-bold font-mono text-xs block mb-1">Step 1</span>
              Drag the green button above into your browser Bookmarks Bar (press Ctrl+Shift+B if hidden).
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-amber-400 font-bold font-mono text-xs block mb-1">Step 2</span>
              Open any {displayName} product page and navigate to the customer reviews section.
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-amber-400 font-bold font-mono text-xs block mb-1">Step 3</span>
              Click <strong>Analyze with TrustLens</strong> in your bookmarks — TrustLens extracts the reviews and opens the forensic report!
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 Content: Chrome Extension */}
      {activeHelpTab === "extension" && (
        <div className="p-4 rounded-xl bg-ink-950/40 border border-white/5 flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-white text-xs">TrustLens Browser Extension (Manifest V3)</h5>
              <p className="text-slate-300 text-xs mt-0.5">
                Full-featured background inspector with live review preview, JSON/CSV exports, and 1-click forensic analysis.
              </p>
            </div>
            <Link
              href="/extension"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Install Guide & Download</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-slate-300 text-xs">
            <span>
              Pre-built in the <code className="text-amber-300 font-mono">/extension</code> directory. Load in <strong>chrome://extensions</strong> with Developer Mode in under 30 seconds.
            </span>
          </div>
        </div>
      )}

      {/* Tab 3 Content: Manual & Demos */}
      {activeHelpTab === "manual" && (
        <div className="p-4 rounded-xl bg-ink-950/40 border border-white/5 flex flex-col gap-3">
          <p className="text-slate-300 text-xs">
            You can also import reviews manually or test TrustLens on pre-bundled real-world datasets:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onSwitchToTab("text")}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-1 group-hover:text-electric-cyan">
                <FileText className="w-3.5 h-3.5 text-electric-cyan" />
                <span>Paste Raw Text</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Copy text directly from {displayName} and paste into our text analyzer.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSwitchToTab("file")}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-1 group-hover:text-electric-cyan">
                <Upload className="w-3.5 h-3.5 text-electric-cyan" />
                <span>Upload CSV / Excel</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Upload exported reviews spreadsheet with reviewer names and ratings.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onLoadDemo("ecommerce-burst")}
              className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-1 group-hover:text-rose-300">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>1-Click Amazon Demo</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instant full report of an Amazon Headphone bot ring attack.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

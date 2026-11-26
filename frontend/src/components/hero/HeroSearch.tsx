"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Link as LinkIcon, FileText, Upload, Sparkles,
  ArrowRight, AlertCircle, CheckCircle2, ShieldAlert, Layers
} from "lucide-react";
import { analyzeUrl, analyzeReviews, analyzeFile, getDemo } from "@/lib/api";
import MultiStepLoader from "../common/MultiStepLoader";
import AmazonHelpPanel from "../common/AmazonHelpPanel";

const PLACEHOLDER_URLS = [
  "https://www.amazon.com/dp/B08N5WRWNW (Earbuds)",
  "https://www.yelp.com/biz/bistro-lumiere-austin",
  "https://www.trustpilot.com/review/aura-audio.com",
  "https://maps.google.com/place/coffee-roasters",
  "https://play.google.com/store/apps/details?id=com.app",
];

export default function HeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"url" | "text" | "file" | "demo">("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [targetTitle, setTargetTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blockedFallback, setBlockedFallback] = useState<any | null>(null);

  // Animated Typing Placeholder
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentUrl = PLACEHOLDER_URLS[placeholderIndex];
    const typingSpeed = isDeleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedPlaceholder(currentUrl.slice(0, displayedPlaceholder.length + 1));
        if (displayedPlaceholder.length === currentUrl.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayedPlaceholder(currentUrl.slice(0, displayedPlaceholder.length - 1));
        if (displayedPlaceholder.length === 0) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_URLS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedPlaceholder, isDeleting, placeholderIndex]);

  const handleAnalyzeUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = urlInput.trim();
    if (!target) {
      setErrorMsg("Please enter a valid product or business URL.");
      return;
    }

    setErrorMsg(null);
    setBlockedFallback(null);
    setIsLoading(true);

    try {
      const res = await analyzeUrl(target);
      
      // Check for blocked scraper or graceful fallback response
      if (("is_blocked" in res && res.is_blocked) || ("fallback_options" in res && !res.success)) {
        setIsLoading(false);
        setBlockedFallback(res);
        if ("message" in res && res.message) {
          setErrorMsg(res.message);
        }
        return;
      }

      // Check if backend returned an explicit unblocked failure response
      if ("success" in res && res.success === false) {
        setIsLoading(false);
        const errMsg = (res as any).message || (res as any).detail || "Could not analyze the provided URL.";
        setErrorMsg(errMsg);
        return;
      }

      // Successful analysis: redirect to report
      const report = res as any;
      if (report && report.id) {
        sessionStorage.setItem(`trustlens_report_${report.id}`, JSON.stringify(report));
        router.push(`/report/${report.id}`);
      } else {
        setIsLoading(false);
        const specificError = report?.message || report?.detail || report?.error || "Unable to generate analysis report for this URL. Please verify the URL or try pasting reviews directly.";
        setErrorMsg(specificError);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Failed to analyze URL.");
    }
  };

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) {
      setErrorMsg("Please paste review text to analyze.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Split raw reviews by lines or detect JSON
      let reviewObjects: any[] = [];
      if (textInput.trim().startsWith("[") || textInput.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(textInput);
          reviewObjects = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // Fall back to line by line
        }
      }

      if (reviewObjects.length === 0) {
        const lines = textInput.split("\n").map((l) => l.trim()).filter((l) => l.length > 5);
        reviewObjects = lines.map((text, idx) => ({
          reviewer_name: `Reviewer_${idx + 1}`,
          review_text: text,
          rating: 5.0,
          date: "Recent",
          verified_purchase: false,
        }));
      }

      const res = await analyzeReviews(targetTitle || "Manual Review Batch", reviewObjects);
      sessionStorage.setItem(`trustlens_report_${res.id}`, JSON.stringify(res));
      router.push(`/report/${res.id}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Failed to process reviews.");
    }
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select a CSV, XLSX, or JSON file.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await analyzeFile(selectedFile, targetTitle || undefined);
      sessionStorage.setItem(`trustlens_report_${res.id}`, JSON.stringify(res));
      router.push(`/report/${res.id}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "File upload failed.");
    }
  };

  const handleLoadDemo = async (demoName: string) => {
    setErrorMsg(null);
    setBlockedFallback(null);
    setIsLoading(true);

    try {
      const res = await getDemo(demoName);
      sessionStorage.setItem(`trustlens_report_${res.id}`, JSON.stringify(res));
      router.push(`/report/${res.id}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Failed to load demo scenario.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <MultiStepLoader isLoading={isLoading} />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl mb-4 shadow-glass">
        <button
          onClick={() => { setActiveTab("url"); setErrorMsg(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "url"
              ? "bg-gradient-to-r from-electric-cyan to-electric-blue text-ink-950 shadow-glow-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Paste URL
        </button>
        <button
          onClick={() => { setActiveTab("text"); setErrorMsg(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "text"
              ? "bg-gradient-to-r from-electric-cyan to-electric-blue text-ink-950 shadow-glow-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Paste Text
        </button>
        <button
          onClick={() => { setActiveTab("file"); setErrorMsg(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "file"
              ? "bg-gradient-to-r from-electric-cyan to-electric-blue text-ink-950 shadow-glow-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
        <button
          onClick={() => { setActiveTab("demo"); setErrorMsg(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "demo"
              ? "bg-gradient-to-r from-electric-cyan to-electric-blue text-ink-950 shadow-glow-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          1-Click Demo
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full glass-panel-elevated p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-electric-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-electric-indigo/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tab 1: URL Input */}
        {activeTab === "url" && (
          <form onSubmit={handleAnalyzeUrl} className="flex flex-col gap-3">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-electric-cyan pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={displayedPlaceholder || "Paste product, review, or store link here..."}
                className="w-full pl-12 pr-36 py-4 bg-ink-950/80 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan focus:ring-2 focus:ring-electric-cyan/20 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan via-electric-blue to-trust-500 hover:opacity-90 text-xs font-bold text-ink-950 shadow-glow-cyan transition-all hover:scale-[1.02] flex items-center gap-1.5"
              >
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span>Supports Amazon, Flipkart, Yelp, Google Maps, Trustpilot, Play Store, and generic sites.</span>
              <button
                type="button"
                onClick={() => setUrlInput("https://www.amazon.com/dp/B08N5WRWNW")}
                className="text-electric-cyan hover:underline"
              >
                Try sample link
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Textarea Input */}
        {activeTab === "text" && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Product or Listing Title (e.g. Wireless Noise-Cancelling Earbuds)"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-ink-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
            />
            <textarea
              rows={5}
              placeholder={`Paste reviews here (one per line, or JSON array):\n\nBest headphones ever! Changed my life completely! Must buy!\nWorks okay, but battery life was a bit shorter than expected.\nItem arrived on time. Works great thanks seller.`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-4 bg-ink-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan font-mono resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAnalyzeText}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue hover:opacity-90 text-xs font-bold text-ink-950 shadow-glow-cyan transition-all hover:scale-[1.02] flex items-center gap-1.5"
              >
                Run Forensic Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: File Upload */}
        {activeTab === "file" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Dataset / Store Name (Optional)"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-ink-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
            />
            <label className="border-2 border-dashed border-white/15 hover:border-electric-cyan/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-ink-950/40 hover:bg-white/[0.02]">
              <Upload className="w-8 h-8 text-electric-cyan mb-2" />
              <span className="text-xs font-semibold text-white">
                {selectedFile ? selectedFile.name : "Click or drag & drop CSV, XLSX, or JSON review file"}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Accepted columns: reviewer_name, review_text, rating, date, verified_purchase
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <div className="flex items-center justify-between">
              <a
                href="/sample_reviews_template.csv"
                download
                className="text-[11px] text-slate-400 hover:text-electric-cyan underline"
              >
                Download sample CSV template
              </a>
              <button
                onClick={handleAnalyzeFile}
                disabled={isLoading || !selectedFile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue hover:opacity-90 disabled:opacity-40 text-xs font-bold text-ink-950 shadow-glow-cyan transition-all hover:scale-[1.02] flex items-center gap-1.5"
              >
                Upload & Process Batch
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: 1-Click Demos */}
        {activeTab === "demo" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-300">
              Select a pre-bundled realistic scenario to evaluate TrustLens completely offline:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleLoadDemo("ecommerce-burst")}
                className="p-4 rounded-2xl bg-rose-500/[0.08] hover:bg-rose-500/[0.15] border border-rose-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <span className="text-xs font-bold text-white group-hover:text-rose-300">
                    Spam Burst Campaign
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bot syndicate ring (`mark_88*`), identical copy-pasted text, 24h spike, extreme J-curve.
                </p>
              </button>

              <button
                onClick={() => handleLoadDemo("organic-app")}
                className="p-4 rounded-2xl bg-emerald-500/[0.08] hover:bg-emerald-500/[0.15] border border-emerald-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                    Organic Product
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Mechanical keyboard with natural rating variance, verified buyers, balanced pros/cons.
                </p>
              </button>

              <button
                onClick={() => handleLoadDemo("polarized-brigade")}
                className="p-4 rounded-2xl bg-amber-500/[0.08] hover:bg-amber-500/[0.15] border border-amber-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">
                    Polarized Review Bomb
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Coordinated 1-star attack vs 5-star defensive hype with zero moderate feedback.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Graceful Scraper Fallback & Amazon Help Panel */}
        {blockedFallback && (
          <AmazonHelpPanel
            platformName={blockedFallback.platform || "Amazon"}
            targetUrl={blockedFallback.target_url}
            errorMessage={blockedFallback.message}
            onSwitchToTab={(tab) => {
              setActiveTab(tab);
              setErrorMsg(null);
            }}
            onLoadDemo={handleLoadDemo}
          />
        )}
      </div>

      {/* Live Demonstration Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 text-xs text-slate-400">
        <span className="font-medium text-slate-500">Quick offline demos:</span>
        <button
          onClick={() => handleLoadDemo("ecommerce-burst")}
          className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Bot Ring Attack
        </button>
        <button
          onClick={() => handleLoadDemo("organic-app")}
          className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Organic Verified Product
        </button>
        <button
          onClick={() => handleLoadDemo("polarized-brigade")}
          className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Review Bombing Campaign
        </button>
      </div>
    </div>
  );
}

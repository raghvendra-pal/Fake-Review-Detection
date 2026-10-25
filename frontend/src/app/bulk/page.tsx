"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, Layers, FileSpreadsheet, ArrowRight,
  AlertCircle, CheckCircle2, Download, RefreshCw
} from "lucide-react";
import { analyzeFile, analyzeReviews } from "@/lib/api";
import MultiStepLoader from "@/components/common/MultiStepLoader";

export default function BulkPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchTitle, setBatchTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [activeMode, setActiveMode] = useState<"file" | "paste">("file");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to upload.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await analyzeFile(selectedFile, batchTitle || undefined);
      sessionStorage.setItem(`trustlens_report_${res.id}`, JSON.stringify(res));
      router.push(`/report/${res.id}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Bulk processing failed.");
    }
  };

  const handleTextBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setErrorMsg("Please paste review data.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      let items: any[] = [];
      if (rawText.trim().startsWith("[") || rawText.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(rawText);
          items = Array.isArray(parsed) ? parsed : [parsed];
        } catch {}
      }

      if (items.length === 0) {
        const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 5);
        items = lines.map((text, idx) => ({
          reviewer_name: `Reviewer_${idx + 1}`,
          review_text: text,
          rating: 5.0,
          date: "Recent",
          verified_purchase: false,
        }));
      }

      const res = await analyzeReviews(batchTitle || "Bulk Text Ingestion", items);
      sessionStorage.setItem(`trustlens_report_${res.id}`, JSON.stringify(res));
      router.push(`/report/${res.id}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Failed to process review text.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <MultiStepLoader isLoading={isLoading} />

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-semibold mb-3">
          <Layers className="w-3.5 h-3.5" />
          Bulk Forensic Processor
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Batch Review Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Process hundreds or thousands of customer reviews simultaneously. Detect coordinated bot rings, calculate aggregate trust scores, and export audit-ready reports.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-2xl">
          <button
            onClick={() => { setActiveMode("file"); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === "file"
                ? "bg-gradient-to-r from-electric-cyan to-electric-blue text-ink-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Upload Spreadsheet (CSV/XLSX)
          </button>
          <button
            onClick={() => { setActiveMode("paste"); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === "paste"
                ? "bg-gradient-to-r from-electric-cyan to-electric-blue text-ink-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Paste Multi-Line / JSON
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        {activeMode === "file" ? (
          <form onSubmit={handleFileUpload} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Batch Title / Listing Name
              </label>
              <input
                type="text"
                placeholder="e.g. Amazon Customer Feedback Q3 Batch"
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-ink-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Spreadsheet File (CSV, XLSX, JSON)
              </label>
              <label className="border-2 border-dashed border-white/15 hover:border-electric-cyan/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-ink-950/40 hover:bg-white/[0.02] text-center">
                <FileSpreadsheet className="w-10 h-10 text-electric-cyan mb-3" />
                <span className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : "Choose CSV, XLSX, or JSON file to upload"}
                </span>
                <span className="text-xs text-slate-400 mt-1 max-w-sm">
                  Required column: <code className="text-electric-cyan font-mono">review_text</code>. Optional columns: <code className="text-slate-300 font-mono">reviewer_name, rating, date, verified_purchase</code>.
                </span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href="/sample_reviews_template.csv"
                download
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-electric-cyan transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download format template (CSV)
              </a>

              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-xs font-bold text-ink-950 shadow-glow-cyan hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                Start Bulk Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleTextBatch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Batch Title
              </label>
              <input
                type="text"
                placeholder="e.g. Raw Extracted Review Comments"
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-ink-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Raw Reviews (One review per line, or JSON array)
              </label>
              <textarea
                rows={9}
                placeholder={`Paste raw reviews here (one per line, or valid JSON array):\n\nBest headphones ever! Changed my life completely!\nWorks fine, but battery runs out quickly.\nItem arrived on time. Works great thanks seller.`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-4 bg-ink-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan font-mono resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !rawText.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-xs font-bold text-ink-950 shadow-glow-cyan hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                Process Raw Batch
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

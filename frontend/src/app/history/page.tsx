"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Search, ArrowRight, Download, FileText, AlertCircle, Loader2 } from "lucide-react";
import { listReports, getExportUrl } from "@/lib/api";

export default function HistoryPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    listReports(50, 0)
      .then((data) => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filtered = reports.filter((r) =>
    r.target_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.target_url && r.target_url.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            Audit Vault
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Analysis Report History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and retrieve past forensic reports stored in your database.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-electric-cyan animate-spin mb-3" />
          <span className="text-xs">Loading historical records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-slate-400">
          <History className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-white text-base">No Saved Reports Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">Run an analysis from the home page or bulk analyzer to save audits here.</p>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-xs font-bold text-ink-950 shadow-glow-cyan"
          >
            Start First Analysis
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((rep) => {
            const isHighRisk = rep.trust_score < 45;
            const isSuspicious = rep.trust_score >= 45 && rep.trust_score < 75;

            return (
              <div
                key={rep.id}
                className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-white truncate group-hover:text-electric-cyan transition-colors">
                      {rep.target_title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {rep.source_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span>{rep.created_at ? rep.created_at.slice(0, 10) : "Recent"}</span>
                    <span>•</span>
                    <span>{rep.total_reviews} reviews ({rep.flagged_reviews} flagged)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Trust Score Badge */}
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-extrabold text-xl text-white">
                        {rep.trust_score}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider block ${
                        isHighRisk ? "text-rose-400" : isSuspicious ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {rep.verdict}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={getExportUrl(rep.id, "pdf")}
                      download
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <Link
                      href={`/report/${rep.id}`}
                      className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-colors"
                      title="View Report"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, Star, CheckCircle, AlertTriangle,
  User, ArrowUpDown, ChevronLeft, ChevronRight, ShieldAlert, Sparkles
} from "lucide-react";
import { ReviewForensicResult } from "@/lib/types";

interface ReviewTableProps {
  reviews: ReviewForensicResult[];
  onSelectAccount?: (accountName: string) => void;
}

export default function ReviewTable({ reviews, onSelectAccount }: ReviewTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "flagged" | "authentic">("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"risk_desc" | "risk_asc" | "rating_desc" | "rating_asc">("risk_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Sort Logic
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchText = r.review_text.toLowerCase().includes(q);
          const matchUser = r.reviewer_name.toLowerCase().includes(q);
          if (!matchText && !matchUser) return false;
        }

        // Tab filter
        if (filterTab === "flagged" && !r.is_flagged && r.fake_probability < 50) return false;
        if (filterTab === "authentic" && (r.is_flagged || r.fake_probability >= 50)) return false;

        // Rating filter
        if (ratingFilter !== "all" && Math.round(r.rating) !== parseInt(ratingFilter)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "risk_desc") return b.fake_probability - a.fake_probability;
        if (sortBy === "risk_asc") return a.fake_probability - b.fake_probability;
        if (sortBy === "rating_desc") return b.rating - a.rating;
        if (sortBy === "rating_asc") return a.rating - b.rating;
        return 0;
      });
  }, [reviews, searchTerm, filterTab, ratingFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / pageSize) || 1;
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col w-full glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
      {/* Table Controls Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-ink-950/40">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews by keyword or reviewer username..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-electric-cyan/50 focus:ring-1 focus:ring-electric-cyan/50 transition-all"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Filter */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => { setFilterTab("all"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterTab === "all" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => { setFilterTab("flagged"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterTab === "flagged" ? "bg-rose-500/20 text-rose-300" : "text-slate-400 hover:text-white"
              }`}
            >
              Flagged ({reviews.filter((r) => r.is_flagged || r.fake_probability >= 50).length})
            </button>
            <button
              onClick={() => { setFilterTab("authentic"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterTab === "authentic" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"
              }`}
            >
              Authentic ({reviews.filter((r) => !r.is_flagged && r.fake_probability < 50).length})
            </button>
          </div>

          {/* Rating Dropdown */}
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white/[0.04] border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-electric-cyan"
          >
            <option value="all" className="bg-ink-900 text-white">All Stars</option>
            <option value="5" className="bg-ink-900 text-white">5 Stars</option>
            <option value="4" className="bg-ink-900 text-white">4 Stars</option>
            <option value="3" className="bg-ink-900 text-white">3 Stars</option>
            <option value="2" className="bg-ink-900 text-white">2 Stars</option>
            <option value="1" className="bg-ink-900 text-white">1 Star</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/[0.04] border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-electric-cyan"
          >
            <option value="risk_desc" className="bg-ink-900 text-white">Highest Risk First</option>
            <option value="risk_asc" className="bg-ink-900 text-white">Lowest Risk First</option>
            <option value="rating_desc" className="bg-ink-900 text-white">Rating: High to Low</option>
            <option value="rating_asc" className="bg-ink-900 text-white">Rating: Low to High</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-ink-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 w-44">Reviewer Account</th>
              <th className="py-3 px-3 w-28">Rating</th>
              <th className="py-3 px-3 w-32">Fake Probability</th>
              <th className="py-3 px-4 w-60">Forensic Flags</th>
              <th className="py-3 px-4">Review Content</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No reviews matched your search criteria.
                </td>
              </tr>
            ) : (
              paginatedReviews.map((rev) => {
                const isHigh = rev.fake_probability >= 50;
                const isMed = rev.fake_probability >= 30 && !isHigh;

                return (
                  <tr
                    key={rev.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      rev.is_flagged ? "bg-rose-500/[0.02]" : ""
                    }`}
                  >
                    {/* Reviewer Account */}
                    <td className="py-4 px-4 align-top">
                      <button
                        onClick={() => onSelectAccount && onSelectAccount(rev.reviewer_name)}
                        className="flex items-start gap-2 text-left group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center mt-0.5 text-slate-300 group-hover:border-electric-cyan group-hover:text-electric-cyan transition-colors">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-white group-hover:text-electric-cyan transition-colors block">
                            {rev.reviewer_name}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {rev.review_date || "Recent"}
                          </span>
                          {rev.verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                      </button>
                    </td>

                    {/* Star Rating */}
                    <td className="py-4 px-3 align-top">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white text-xs">{rev.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Fake Probability Chip */}
                    <td className="py-4 px-3 align-top">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${
                          isHigh
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : isMed
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHigh ? "bg-rose-400 animate-pulse" : isMed ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                        />
                        {rev.fake_probability}%
                      </div>
                    </td>

                    {/* Forensic Flags */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {rev.linguistic_flags.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">No heuristic flags</span>
                        )}
                        {rev.linguistic_flags.map((flag) => (
                          <span
                            key={flag}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-medium leading-tight"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>

                      {/* Top Attributed Words */}
                      {rev.top_suspicious_words.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rev.top_suspicious_words.slice(0, 3).map((w, idx) => (
                            <span
                              key={idx}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                w.type === "suspicious"
                                  ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              }`}
                            >
                              {w.word} ({w.weight > 0 ? `+${w.weight}` : w.weight})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Review Text Content */}
                    <td className="py-4 px-4 align-top">
                      <p className="text-slate-200 text-xs leading-relaxed max-w-2xl font-sans">
                        "{rev.review_text}"
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-ink-950/60 text-xs text-slate-400">
        <span>
          Showing <span className="text-white font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
          <span className="text-white font-medium">
            {Math.min(currentPage * pageSize, filteredReviews.length)}
          </span>{" "}
          of <span className="text-white font-medium">{filteredReviews.length}</span> reviews
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-[11px] text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

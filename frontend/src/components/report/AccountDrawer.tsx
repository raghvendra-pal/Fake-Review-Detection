"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, ShieldAlert, Star, Calendar, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import { AccountRiskCard, ReviewForensicResult } from "@/lib/types";

interface AccountDrawerProps {
  account: AccountRiskCard | null;
  reviews: ReviewForensicResult[];
  onClose: () => void;
}

export default function AccountDrawer({ account, reviews, onClose }: AccountDrawerProps) {
  if (!account) return null;

  // Filter reviews matching this account
  const userReviews = reviews.filter(
    (r) => r.reviewer_name.toLowerCase() === account.reviewer_name.toLowerCase()
  );

  const isHighRisk = account.account_risk_score >= 70;
  const isSuspicious = account.account_risk_score >= 40 && !isHighRisk;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg bg-ink-900 border-l border-white/10 shadow-2xl h-full flex flex-col z-10 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-start justify-between bg-ink-950/80 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  isHighRisk
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : isSuspicious
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg tracking-tight">
                  {account.reviewer_name}
                </h3>
                <span className="text-xs font-mono text-slate-400">ID: {account.reviewer_id}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1">
            {/* Account Risk Badge */}
            <div
              className={`p-4 rounded-xl border ${
                isHighRisk
                  ? "bg-rose-500/10 border-rose-500/30"
                  : isSuspicious
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Account Risk Index</span>
                <span
                  className={`font-display font-bold text-2xl ${
                    isHighRisk ? "text-rose-400" : isSuspicious ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {account.account_risk_score} / 100
                </span>
              </div>
              {account.pattern_flag && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/10 text-xs text-amber-300 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  {account.pattern_flag}
                </div>
              )}
            </div>

            {/* Account Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[11px] text-slate-400">Total Reviews Listed</span>
                <p className="font-display font-bold text-lg text-white mt-1">{account.total_reviews}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[11px] text-slate-400">Average Star Rating</span>
                <p className="font-display font-bold text-lg text-amber-400 mt-1 flex items-center gap-1">
                  {account.average_rating} <Star className="w-4 h-4 fill-amber-400" />
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[11px] text-slate-400">5-Star Ratio</span>
                <p className="font-display font-bold text-lg text-white mt-1">{account.five_star_ratio}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[11px] text-slate-400">Rating Variance</span>
                <p className="font-display font-bold text-lg text-white mt-1">{account.rating_variance}</p>
              </div>
            </div>

            {/* Reviews by this user */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Reviews by this Reviewer ({userReviews.length})
              </h4>

              <div className="space-y-3">
                {userReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rev.is_flagged
                        ? "bg-rose-500/[0.06] border-rose-500/20"
                        : "bg-white/[0.02] border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>

                      <span
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          rev.fake_probability >= 50
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {rev.fake_probability}% Fake Prob
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      "{rev.review_text}"
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {rev.linguistic_flags.map((flag) => (
                        <span
                          key={flag}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-amber-300 border border-white/10"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {rev.review_date || "Recent"}
                      </span>
                      {rev.verified_purchase && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

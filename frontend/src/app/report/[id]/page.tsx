"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink, Share2, ArrowLeft, Loader2, AlertCircle,
  FileText, Network, Clock, ShieldCheck, Check, Layers, User
} from "lucide-react";
import { getReport } from "@/lib/api";
import { AnalysisReport, AccountRiskCard } from "@/lib/types";
import TrustGauge from "@/components/report/TrustGauge";
import MetricsGrid from "@/components/report/MetricsGrid";
import NetworkGraph from "@/components/report/NetworkGraph";
import BurstTimeline from "@/components/report/BurstTimeline";
import RatingDistributionChart from "@/components/report/RatingDistributionChart";
import ReviewTable from "@/components/report/ReviewTable";
import AccountDrawer from "@/components/report/AccountDrawer";
import ExportModal from "@/components/report/ExportModal";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "graph" | "timeline" | "summary">("reviews");
  const [selectedAccount, setSelectedAccount] = useState<AccountRiskCard | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!reportId) return;

    // Check session storage first for instant load
    const cached = sessionStorage.getItem(`trustlens_report_${reportId}`);
    if (cached) {
      try {
        setReport(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {}
    }

    // Otherwise fetch from API
    getReport(reportId)
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load report.");
        setLoading(false);
      });
  }, [reportId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleSelectAccountByName = (accountName: string) => {
    if (!report) return;
    const found = report.accounts?.find(
      (a) => a.reviewer_name.toLowerCase() === accountName.toLowerCase()
    );
    if (found) {
      setSelectedAccount(found);
    } else {
      // Create ad-hoc card
      setSelectedAccount({
        reviewer_name: accountName,
        reviewer_id: `usr_${absHash(accountName)}`,
        total_reviews: 1,
        average_rating: 5.0,
        five_star_ratio: 100,
        rating_variance: 0,
        account_risk_score: 50.0,
      });
    }
  };

  function absHash(s: string) {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 1000000;
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-electric-cyan animate-spin mb-4" />
        <p className="font-display font-semibold text-white text-base">Retrieving Forensic Intelligence...</p>
        <p className="text-xs text-slate-400 mt-1">Report ID: {reportId}</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h2 className="font-display font-bold text-xl text-white">Report Unavailable</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mb-6">{error || "Could not find analysis report."}</p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
        >
          Return to Home Search
        </Link>
      </div>
    );
  }

  const ringsDetected = report.network_graph?.rings_detected || 0;
  const burstCount = report.metrics_summary?.burst_windows_detected || 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-white tracking-tight truncate max-w-md sm:max-w-xl">
                {report.target_title}
              </h1>
              {report.target_url && (
                <a
                  href={report.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-electric-cyan transition-colors"
                  title="Open source URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
              <span>Source: {report.source_type.toUpperCase()}</span>
              <span>•</span>
              <span>Report #{report.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share</span>
              </>
            )}
          </button>

          <ExportModal reportId={report.id} reportTitle={report.target_title} />

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-xs font-bold text-ink-950 shadow-glow-cyan hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            New Analysis
          </Link>
        </div>
      </div>

      {/* Hero Overview Grid: Trust Gauge + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Trust Score Gauge */}
        <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <TrustGauge score={report.trust_score} size={220} />

          <div className="mt-6 w-full pt-4 border-t border-white/[0.06] flex items-center justify-around text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Total Reviews</span>
              <span className="font-bold text-white text-base font-mono">{report.total_reviews}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div>
              <span className="text-slate-400 block text-[11px]">Flagged Deceptive</span>
              <span className="font-bold text-rose-400 text-base font-mono">{report.flagged_reviews}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div>
              <span className="text-slate-400 block text-[11px]">Fake Probability</span>
              <span className="font-bold text-white text-base font-mono">{report.fake_probability}%</span>
            </div>
          </div>
        </div>

        {/* Right: Key Metrics Grid */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <MetricsGrid
            fakeProbability={report.fake_probability}
            totalReviews={report.total_reviews}
            flaggedReviews={report.flagged_reviews}
            metrics={report.metrics_summary}
          />

          {/* Quick Notice Banner if anomalies detected */}
          {(ringsDetected > 0 || burstCount > 0) && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-500/[0.08] border border-rose-500/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-rose-300">Coordinated Campaign Signals Flagged: </span>
                <span className="text-slate-300">
                  {ringsDetected > 0 && `${ringsDetected} review syndicate ring(s) detected. `}
                  {burstCount > 0 && `${burstCount} unnatural review frequency spike(s) detected.`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forensic Deep Dive Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "reviews"
                ? "border-electric-cyan text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Per-Review Forensics ({report.reviews?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("graph")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "graph"
                ? "border-electric-cyan text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Network className="w-4 h-4" />
            Reviewer Network Graph {ringsDetected > 0 && `(${ringsDetected} Rings)`}
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-electric-cyan text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Temporal Spikes &amp; Distributions
          </button>

          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "summary"
                ? "border-electric-cyan text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Risk Audit Summary
          </button>
        </div>

        {/* Tab 1: Review Table */}
        {activeTab === "reviews" && (
          <ReviewTable
            reviews={report.reviews || []}
            onSelectAccount={handleSelectAccountByName}
          />
        )}

        {/* Tab 2: Network Graph & Ring Syndicate List */}
        {activeTab === "graph" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden border border-white/10 min-h-[500px]">
              <NetworkGraph
                graphData={report.network_graph}
                onSelectAccount={handleSelectAccountByName}
              />
            </div>

            {/* Syndicate Rings Breakdown */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass-panel p-5 rounded-2xl border border-white/10">
                <h3 className="font-display font-bold text-sm text-white mb-2">
                  Detected Syndicate Rings ({ringsDetected})
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Community detection groups accounts that post duplicate text or share bot-naming suffix patterns.
                </p>

                {ringsDetected === 0 ? (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
                    No coordinated syndicates detected.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.network_graph?.ring_details?.map((ring, idx) => (
                      <div
                        key={ring.ring_id || idx}
                        className="p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-rose-300">{ring.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                            Risk {ring.average_risk}/100
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          <b>{ring.member_count} members</b> linked via {ring.edges_count} co-occurrence edges.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ring.members.map((m) => (
                            <button
                              key={m}
                              onClick={() => handleSelectAccountByName(m)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                            >
                              @{m}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Timeline & Rating Distribution */}
        {activeTab === "timeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <BurstTimeline
                timeline={report.metrics_summary?.burst_timeline || []}
                burstWindowsCount={burstCount}
              />
            </div>
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <RatingDistributionChart
                distribution={report.metrics_summary?.rating_distribution || {}}
                totalReviews={report.total_reviews}
                jCurveDetected={report.metrics_summary?.j_curve_detected || false}
                polarizationDetected={report.metrics_summary?.polarization_detected || false}
                verdictReason={report.metrics_summary?.distribution_verdict}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Risk Audit Summary */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Warnings */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Forensic Risk Warnings ({report.metrics_summary?.key_warnings?.length || 0})
              </h3>
              {report.metrics_summary?.key_warnings?.length === 0 ? (
                <p className="text-xs text-slate-400">No high-severity risks identified.</p>
              ) : (
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {report.metrics_summary?.key_warnings?.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/[0.04] border border-rose-500/10">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Positive Trust Indicators */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Authenticity Indicators ({report.metrics_summary?.positive_indicators?.length || 0})
              </h3>
              {report.metrics_summary?.positive_indicators?.length === 0 ? (
                <p className="text-xs text-slate-400">Minimal positive indicators found.</p>
              ) : (
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {report.metrics_summary?.positive_indicators?.map((ind, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Account Side Drawer */}
      <AccountDrawer
        account={selectedAccount}
        reviews={report.reviews || []}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
}

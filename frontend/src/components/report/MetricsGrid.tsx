"use client";

import { ShieldAlert, Users, Flame, Bot, CheckCircle, BarChart3 } from "lucide-react";
import { MetricsSummary } from "@/lib/types";

interface MetricsGridProps {
  fakeProbability: number;
  totalReviews: number;
  flaggedReviews: number;
  metrics: MetricsSummary;
}

export default function MetricsGrid({
  fakeProbability,
  totalReviews,
  flaggedReviews,
  metrics,
}: MetricsGridProps) {
  const cards = [
    {
      label: "Fake Review Probability",
      value: `${fakeProbability}%`,
      sub: `${flaggedReviews} of ${totalReviews} reviews flagged`,
      icon: ShieldAlert,
      color: fakeProbability >= 50 ? "text-threat-500" : fakeProbability >= 30 ? "text-warning-500" : "text-trust-500",
      bg: fakeProbability >= 50 ? "bg-rose-500/10 border-rose-500/20" : fakeProbability >= 30 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Coordinated Review Rings",
      value: `${metrics.account_rings_detected}`,
      sub: metrics.account_rings_detected > 0 ? "Syndicates with shared text/patterns" : "No bot rings detected",
      icon: Users,
      color: metrics.account_rings_detected > 0 ? "text-threat-500" : "text-trust-500",
      bg: metrics.account_rings_detected > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Spam Burst Spikes",
      value: `${metrics.burst_windows_detected}`,
      sub: metrics.burst_windows_detected > 0 ? "Abnormal short-window posting spikes" : "Natural posting cadence",
      icon: Flame,
      color: metrics.burst_windows_detected > 0 ? "text-warning-500" : "text-trust-500",
      bg: metrics.burst_windows_detected > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "AI-Generated Text Likelihood",
      value: `${metrics.ai_generated_ratio}%`,
      sub: "Low burstiness / templated phrasing",
      icon: Bot,
      color: metrics.ai_generated_ratio >= 40 ? "text-threat-500" : "text-slate-300",
      bg: metrics.ai_generated_ratio >= 40 ? "bg-rose-500/10 border-rose-500/20" : "bg-white/[0.03] border-white/5",
    },
    {
      label: "Verified Purchase Ratio",
      value: `${metrics.verified_purchase_ratio}%`,
      sub: "Confirmed buyer accounts",
      icon: CheckCircle,
      color: metrics.verified_purchase_ratio >= 70 ? "text-trust-500" : "text-slate-400",
      bg: "bg-white/[0.03] border-white/5",
    },
    {
      label: "Rating Distribution Shape",
      value: metrics.j_curve_detected ? "J-Curve Anomaly" : metrics.polarization_detected ? "Polarized Attack" : "Natural Variance",
      sub: metrics.distribution_verdict || "Standard variance",
      icon: BarChart3,
      color: metrics.j_curve_detected || metrics.polarization_detected ? "text-warning-500" : "text-trust-500",
      bg: metrics.j_curve_detected || metrics.polarization_detected ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.01] ${card.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-display font-bold text-2xl tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

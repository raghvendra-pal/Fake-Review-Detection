"use client";

import { Star, AlertTriangle, CheckCircle2 } from "lucide-react";

interface RatingDistributionChartProps {
  distribution: Record<string, number>;
  totalReviews: number;
  jCurveDetected: boolean;
  polarizationDetected: boolean;
  verdictReason?: string;
}

export default function RatingDistributionChart({
  distribution,
  totalReviews,
  jCurveDetected,
  polarizationDetected,
  verdictReason,
}: RatingDistributionChartProps) {
  const stars = ["5", "4", "3", "2", "1"];

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-white">Rating Distribution Pattern</span>
        {jCurveDetected || polarizationDetected ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            {jCurveDetected ? "J-Curve Anomaly" : "Polarized Attack"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Organic Curve
          </span>
        )}
      </div>

      <div className="space-y-2">
        {stars.map((star) => {
          const count = distribution[star] || 0;
          const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 w-12 text-slate-300 font-mono">
                <span>{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>

              <div className="flex-1 h-2 bg-ink-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    star === "5"
                      ? jCurveDetected ? "bg-amber-500 shadow-glow-warning" : "bg-trust-500"
                      : star === "1"
                      ? polarizationDetected ? "bg-rose-500 shadow-glow-threat" : "bg-rose-400"
                      : "bg-electric-cyan"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="w-12 text-right font-mono text-slate-400 text-[11px]">
                {pct}% <span className="text-slate-500">({count})</span>
              </span>
            </div>
          );
        })}
      </div>

      {verdictReason && (
        <p className="text-[11px] text-slate-400 mt-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 leading-relaxed">
          {verdictReason}
        </p>
      )}
    </div>
  );
}

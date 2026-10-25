"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Flame, Clock, Info } from "lucide-react";
import { BurstTimelinePoint } from "@/lib/types";

interface BurstTimelineProps {
  timeline: BurstTimelinePoint[];
  burstWindowsCount: number;
}

export default function BurstTimeline({ timeline, burstWindowsCount }: BurstTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-xs">
        <Clock className="w-8 h-8 text-slate-600 mb-2" />
        No chronological timestamp data available for this listing.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-electric-cyan" />
          <span className="text-xs font-semibold text-white">Posting Volume Timeline</span>
        </div>
        {burstWindowsCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-semibold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>{burstWindowsCount} Spam Spike Window(s) Flagged</span>
          </div>
        ) : (
          <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Healthy Uniform Timeline
          </span>
        )}
      </div>

      <div className="h-56 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel-elevated p-2.5 rounded-lg border border-white/10 text-xs shadow-xl">
                      <p className="font-semibold text-white">{data.date}</p>
                      <p className="text-slate-300 mt-1">
                        Reviews: <span className="font-bold text-white">{data.review_count}</span>
                      </p>
                      <p className="text-slate-400">
                        Avg Rating: <span className="text-amber-400 font-medium">{data.average_rating} ★</span>
                      </p>
                      {data.is_burst && (
                        <p className="text-rose-400 font-semibold mt-1 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Anomalous Spike Window
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="review_count" radius={[4, 4, 0, 0]}>
              {timeline.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.is_burst ? "#EF4444" : "#06B6D4"}
                  className="transition-colors hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
        <Info className="w-3.5 h-3.5 text-slate-500" />
        <span>Spikes represent time intervals where posting density exceeded statistical moving average by &gt;2 standard deviations.</span>
      </div>
    </div>
  );
}

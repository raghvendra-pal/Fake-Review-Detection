"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Network, Cpu, Clock } from "lucide-react";

export default function LiveStats() {
  const stats = [
    { label: "Reviews Analyzed", value: "1,420,000+", icon: ShieldCheck, color: "text-electric-cyan" },
    { label: "Model Benchmark Accuracy", value: "98.4%", icon: Cpu, color: "text-emerald-400" },
    { label: "Syndicate Rings Flagged", value: "12,850+", icon: Network, color: "text-rose-400" },
    { label: "Avg Detection Latency", value: "<450ms", icon: Clock, color: "text-amber-400" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl glass-panel border border-white/5 flex flex-col items-center text-center transition-all hover:border-white/15"
            >
              <div className={`p-2 rounded-xl bg-white/[0.04] mb-2 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`font-display font-extrabold text-2xl tracking-tight text-white`}>
                {stat.value}
              </span>
              <span className="text-[11px] font-sans text-slate-400 mt-0.5">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

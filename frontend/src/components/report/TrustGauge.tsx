"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { getTrustColor } from "@/lib/utils";

interface TrustGaugeProps {
  score: number;
  size?: number;
}

export default function TrustGauge({ score, size = 200 }: TrustGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const trustInfo = getTrustColor(score);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(easeProgress * score));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [score]);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const VerdictIcon =
    score >= 75 ? ShieldCheck : score >= 45 ? AlertTriangle : AlertOctagon;

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Background radial glow aura */}
      <div
        className="absolute w-44 h-44 rounded-full blur-3xl opacity-30 transition-all pointer-events-none"
        style={{ backgroundColor: trustInfo.color }}
      />

      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trustInfo.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="gauge-circle"
            style={{
              filter: `drop-shadow(0 0 8px ${trustInfo.glowColor})`,
            }}
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
            {displayScore}
          </span>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
            Trust Score
          </span>
        </div>
      </div>

      {/* Verdict Badge */}
      <div
        className={`mt-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border ${trustInfo.badgeBg} shadow-sm`}
      >
        <VerdictIcon className="w-3.5 h-3.5" />
        <span>{trustInfo.verdict}</span>
      </div>
    </div>
  );
}

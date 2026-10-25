"use client";

import HeroSearch from "@/components/hero/HeroSearch";
import LiveStats from "@/components/hero/LiveStats";
import HowItWorks from "@/components/hero/HowItWorks";
import FeatureShowcase from "@/components/hero/FeatureShowcase";
import FaqSection from "@/components/hero/FaqSection";
import { ShieldCheck, Sparkles, AlertOctagon } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-grid-pattern overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-electric-cyan/15 via-electric-indigo/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-slate-300 mb-6 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
            <span>Forensic Review & Syndicate Detection v1.0</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-[1.1] mb-6">
            Detect Fake Reviews &amp;{" "}
            <span className="bg-gradient-to-r from-electric-cyan via-electric-blue to-electric-indigo bg-clip-text text-transparent">
              Coordinated Spam Rings
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Paste a link to any product, business, or review listing. TrustLens executes deep ML classification,
            account intelligence clustering, time-series anomaly detection, and reviewer network graphing.
          </p>

          {/* Main Search Component */}
          <HeroSearch />
        </div>
      </section>

      {/* Live Stats */}
      <LiveStats />

      {/* How it works */}
      <HowItWorks />

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* FAQ */}
      <FaqSection />
    </div>
  );
}

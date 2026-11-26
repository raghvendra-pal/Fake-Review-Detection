import Link from "next/link";
import { ShieldCheck, Heart, Terminal, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-ink-950/90 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2 max-w-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-electric-cyan/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-electric-cyan" />
            </div>
            <span className="font-display font-bold text-white text-base">TrustLens Platform</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Next-generation automated forensic intelligence for e-commerce, consumer platforms, and digital media.
            Detects deceptive reviews, coordinated bot syndicates, and spam bursts using hybrid ML & network graphs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs text-slate-400">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[10px]">Tools</span>
            <Link href="/" className="hover:text-white transition-colors">URL Analyzer</Link>
            <Link href="/extension" className="hover:text-white transition-colors">Chrome Extension & Bookmarklet</Link>
            <Link href="/bulk" className="hover:text-white transition-colors">Batch CSV Processor</Link>
            <Link href="/compare" className="hover:text-white transition-colors">Side-by-Side Compare</Link>
            <Link href="/quick-check" className="hover:text-white transition-colors">Single Review Checker</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[10px]">Intelligence</span>
            <Link href="/article-check" className="hover:text-white transition-colors">News Credibility</Link>
            <Link href="/history" className="hover:text-white transition-colors">Analysis History</Link>
            <Link href="/methodology" className="hover:text-white transition-colors">Methodology & Math</Link>
            <Link href="/api-docs" className="hover:text-white transition-colors">OpenAPI Reference</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[10px]">Status & Tech</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API v1.0 Operational
            </span>
            <span className="text-slate-500">FastAPI + Scikit-Learn</span>
            <span className="text-slate-500">Next.js 14 + Tailwind</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500/70" />
          <span><b>Legal Notice:</b> Results are probabilistic algorithmic estimates and analytical indicators, not legal proof.</span>
        </div>
        <p>© {new Date().getFullYear()} TrustLens Technologies. All rights reserved.</p>
      </div>
    </footer>
  );
}

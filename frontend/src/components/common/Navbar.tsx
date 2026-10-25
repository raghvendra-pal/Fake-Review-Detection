"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Sparkles, Layers, GitCompare, Zap, Newspaper, History, BookOpen, Terminal } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: ShieldCheck },
    { href: "/bulk", label: "Bulk Analyzer", icon: Layers },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/quick-check", label: "Quick Check", icon: Zap },
    { href: "/article-check", label: "News Credibility", icon: Newspaper },
    { href: "/history", label: "History", icon: History },
    { href: "/methodology", label: "Methodology", icon: BookOpen },
    { href: "/api-docs", label: "API Docs", icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-ink-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-cyan via-electric-blue to-electric-indigo p-[1.5px] shadow-glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-ink-900 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-electric-cyan" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg text-white tracking-tight">TrustLens</span>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans -mt-0.5">Forensic Review Intelligence</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-electric-cyan" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/quick-check"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-200 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Instant Check
          </Link>
          <Link
            href="/bulk"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-electric-cyan to-electric-blue hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-ink-950 shadow-glow-cyan transition-all hover:scale-[1.02]"
          >
            <Layers className="w-3.5 h-3.5" />
            Analyze Bulk
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  Layers,
  GitCompare,
  Zap,
  Newspaper,
  History,
  BookOpen,
  Terminal,
  Bookmark,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  // 5 Primary Navigation Links
  const primaryNavLinks = [
    { href: "/", label: "Home", icon: ShieldCheck },
    { href: "/quick-check", label: "Quick Check", icon: Zap },
    { href: "/bulk", label: "Bulk Analyzer", icon: Layers },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/history", label: "History", icon: History },
  ];

  // Secondary Links under "More" Dropdown
  const secondaryNavLinks = [
    { href: "/article-check", label: "News Credibility", icon: Newspaper },
    { href: "/extension", label: "Browser Extension", icon: Bookmark },
    { href: "/methodology", label: "Methodology", icon: BookOpen },
    { href: "/api-docs", label: "API Docs", icon: Terminal },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile drawer and dropdown when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  }, [pathname]);

  const isSecondaryActive = secondaryNavLinks.some(
    (link) => pathname === link.href
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-ink-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo - Links to Home */}
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 group flex-shrink-0"
          aria-label="TrustLens Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-cyan via-electric-blue to-electric-indigo p-[1.5px] shadow-glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-ink-900 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-electric-cyan" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg text-white tracking-tight whitespace-nowrap">
                TrustLens
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans -mt-0.5 hidden sm:block whitespace-nowrap">
              Forensic Review Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-1 flex-shrink-0"
          aria-label="Primary Navigation"
        >
          {primaryNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-sm border border-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-electric-cyan" : "text-slate-400"
                  }`}
                />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}

          {/* "More" Dropdown Menu */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              aria-haspopup="true"
              aria-expanded={isMoreOpen}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                isSecondaryActive || isMoreOpen
                  ? "bg-white/[0.08] text-white shadow-sm border border-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span className="whitespace-nowrap">More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180 text-electric-cyan" : "text-slate-400"
                }`}
              />
            </button>

            {isMoreOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-ink-950/95 border border-white/10 shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-fade-in flex flex-col gap-0.5"
                role="menu"
                aria-label="Additional Navigation"
              >
                {secondaryNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname?.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-white/[0.08] text-white font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-electric-cyan" : "text-slate-400"
                        }`}
                      />
                      <span className="whitespace-nowrap">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Action Buttons & Mobile Hamburger */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/quick-check"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-200 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="whitespace-nowrap">Instant Check</span>
          </Link>

          <Link
            href="/bulk"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-electric-cyan to-electric-blue hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-ink-950 shadow-glow-cyan transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Analyze Bulk</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-electric-cyan" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 lg:hidden bg-ink-950/90 backdrop-blur-2xl flex flex-col justify-between p-6 animate-fade-in overflow-y-auto"
          ref={mobileDrawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Menu Navigation
            </span>

            {allNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white font-semibold border border-white/10"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-electric-cyan" : "text-slate-400"
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/quick-check"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Quick Check</span>
            </Link>

            <Link
              href="/bulk"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-xs font-bold text-ink-950 flex items-center justify-center gap-2 shadow-glow-cyan"
            >
              <Layers className="w-4 h-4" />
              <span>Analyze Bulk Reviews</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

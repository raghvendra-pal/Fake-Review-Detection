import {
  Users, Network, Flame, Sparkles, BarChart3,
  FileCheck2, ShieldCheck, Zap
} from "lucide-react";

export default function FeatureShowcase() {
  const features = [
    {
      title: "Account & Username Intelligence",
      description: "Identifies bot farm naming patterns (e.g. `john_8821`, `john_8822`) using RapidFuzz Levenshtein clustering and tracks cross-account duplicate text.",
      icon: Users,
      badge: "Key Differentiator",
      color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      title: "Reviewer Network Graph",
      description: "Interactive physics-driven force-directed graph revealing isolated coordinated syndicates, ring communities, and shared reviewer connections.",
      icon: Network,
      badge: "Interactive Graph",
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Time-Series Spam Burst Detection",
      description: "Detects rapid coordinated review floods using moving-average anomaly scoring and plots spike windows on an interactive timeline.",
      icon: Flame,
      badge: "Temporal Anomaly",
      color: "from-rose-500/20 to-amber-500/20 text-rose-400 border-rose-500/30",
    },
    {
      title: "Explainable AI & Token Attribution",
      description: "Clear word-level highlight attribution showing exactly which deceptive phrases or authentic signals drove the ML model's decision.",
      icon: Sparkles,
      badge: "Explainability",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Rating Distribution Curve Forensics",
      description: "Detects unnatural J-curves (90%+ 5-stars with 0% moderate reviews) and polarized review bombing attacks.",
      icon: BarChart3,
      badge: "Statistical Shape",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      title: "Bulk CSV & Comparison Engine",
      description: "Upload thousands of reviews at once, search and filter with high performance, and compare up to 5 listings side-by-side.",
      icon: FileCheck2,
      badge: "Batch Scale",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-electric-cyan">
          Forensic Capabilities
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mt-2">
          Intelligence Beyond Simple Heuristics
        </h2>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          Built for investigative precision. Uncover coordinated bot syndicates that bypass conventional spam filters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/15 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {f.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white mb-2 group-hover:text-electric-cyan transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {f.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

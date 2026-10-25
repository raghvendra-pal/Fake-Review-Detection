import { Search, Cpu, Network, CheckCircle2, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Input Target",
      description: "Paste a product, store, or business URL, upload a CSV/JSON file, or drop raw review text.",
      icon: Search,
      accent: "text-electric-cyan border-electric-cyan/30 bg-electric-cyan/10",
    },
    {
      step: "02",
      title: "Hybrid NLP & Forensics",
      description: "Trained ML models extract token attributions while 8 linguistic heuristics detect bot patterns.",
      icon: Cpu,
      accent: "text-electric-blue border-electric-blue/30 bg-electric-blue/10",
    },
    {
      step: "03",
      title: "Account & Ring Graph",
      description: "RapidFuzz clusters bot naming conventions and NetworkX detects coordinated syndicate rings.",
      icon: Network,
      accent: "text-electric-indigo border-electric-indigo/30 bg-electric-indigo/10",
    },
    {
      step: "04",
      title: "Bayesian Trust Score",
      description: "Synthesizes multi-factor penalties into an instant 0–100 Trust Score and downloadable PDF report.",
      icon: CheckCircle2,
      accent: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-electric-cyan">
          System Workflow
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mt-2">
          How TrustLens Unmasks Deception
        </h2>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          Standard tools merely check keyword counts. TrustLens executes deep forensic multi-layer analysis from linguistic syntax to graph-level syndicate clustering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between relative group hover:border-white/20 transition-all hover:scale-[1.02]"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono font-bold text-xs text-slate-500">{s.step}</span>
                  <div className={`p-2.5 rounded-xl border ${s.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-base text-white mb-2 group-hover:text-electric-cyan transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {s.description}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

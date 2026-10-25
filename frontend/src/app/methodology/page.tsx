import { BookOpen, Shield, Cpu, Network, Clock, BarChart2, CheckCircle2 } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Transparent Science
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          TrustLens Scoring Methodology
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          How our calibrated multi-factor forensic engine computes the 0–100 Trust Score and isolates coordinated bot syndicates.
        </p>
      </div>

      {/* Math Formulation */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h2 className="font-display font-bold text-lg text-white">1. Master Trust Score Formulation</h2>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The Overall Trust Score \(T \in [0, 100]\) is calculated using a Bayesian-weighted multi-penalty reduction model:
        </p>
        <div className="p-4 rounded-2xl bg-ink-950/80 border border-white/10 font-mono text-xs text-electric-cyan overflow-x-auto">
          T = max(0, min(100, 100 - (P_text + S_ring + S_burst + S_dist + C_campaign)))
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Where <code className="text-white">P_text</code> is the volume-weighted linguistic and ML probability penalty, <code className="text-white">S_ring</code> is the coordinated syndicate ring deduction, <code className="text-white">S_burst</code> is the time-series frequency spike penalty, <code className="text-white">S_dist</code> is the J-curve distribution penalty, and <code className="text-white">C_campaign</code> is the compound penalty applied when multiple bot signatures coincide.
        </p>
      </div>

      {/* Pillars Breakdown */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-white">2. The Four Analytical Pillars</h2>

        {/* Pillar 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">A. Sublinear TF-IDF + Calibrated Linear Ensemble</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Trained on consumer opinion spam benchmarks across Amazon and Yelp review corpuses. Utilizes sublinear term-frequency scaling with unigram and bigram n-grams, coupled with L2-regularized logistic classification and coefficient-based localized token attribution to expose deceptive vocabulary in real time.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-electric-blue/10 border border-electric-blue/30 text-electric-blue">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">B. Eight Behavioral &amp; Linguistic Heuristics</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Evaluates deterministic stylistic indicators: 1) Superlative phrase density, 2) Templated click-farm syntaxes, 3) Extreme length deviations, 4) Capitalization and punctuation shouting, 5) Flesch Reading Ease complexity, 6) Sentiment-to-star discordance, 7) Sentence variance burstiness proxy (AI text likelihood), and 8) Keyword stuffing.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-electric-indigo/10 border border-electric-indigo/30 text-electric-indigo">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">C. Account Intelligence &amp; Co-occurrence Rings</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Reviewers are not evaluated in isolation. RapidFuzz string metrics identify automated bot-naming conventions (e.g. numeric suffixes like <code className="text-white">user_8821</code>, <code className="text-white">user_8822</code>). Text similarity matching identifies verbatim cross-account copy-pasting. Accounts and shared links are compiled into a NetworkX graph where connected component algorithms isolate coordinated syndicates.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-trust-500/10 border border-trust-500/30 text-trust-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">D. Temporal Spikes &amp; Distribution Topology</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Chronological timestamps are discretized into rolling windows. Windows exceeding the moving average by &gt;1.5 standard deviations are flagged as spam bursts. Simultaneously, the rating distribution is evaluated against an organic natural baseline to flag synthetic J-curves (&gt;85% 5-star with hollow middle) or polarized review bombing brigading.
          </p>
        </div>
      </div>

      {/* Ethics & Legal Statement */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2 text-xs text-slate-400 leading-relaxed">
        <h4 className="font-bold text-white text-sm">False-Positive Safeguards &amp; Legal Disclaimer</h4>
        <p>
          TrustLens outputs are probabilistic analytical estimates designed for consumer diligence, market intelligence, and compliance audits. Genuine positive reviews can occasionally trigger linguistic false positives; hence our multi-tiered Bayesian model requires multiple convergent signals (e.g. bot patterns AND cross-account duplicates AND burst spikes) before degrading a listing to "High Risk".
        </p>
      </div>
    </div>
  );
}

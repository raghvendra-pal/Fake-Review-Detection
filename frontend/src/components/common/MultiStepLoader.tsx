"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles, Shield, Cpu, Network, FileText } from "lucide-react";

interface Step {
  label: string;
  icon: any;
  detail: string;
}

const STEPS: Step[] = [
  { label: "Ingesting Review Payload", icon: FileText, detail: "Parsing source data, metadata, and reviews" },
  { label: "Normalizing & Cleaning Syntax", icon: Shield, detail: "Sanitizing tokens, emojis, and linguistic structures" },
  { label: "Executing ML & Explainability Models", icon: Cpu, detail: "Calculating TF-IDF weights and feature attribution" },
  { label: "Constructing Account Graph & Rings", icon: Network, detail: "Clustering usernames and detecting syndicates" },
  { label: "Synthesizing Forensic Trust Report", icon: Sparkles, detail: "Aggregating Bayesian risk scores and metrics" },
];

interface MultiStepLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export default function MultiStepLoader({ isLoading }: MultiStepLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const progress = Math.min(100, Math.round(((currentStep + 1) / STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-electric-cyan/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-electric-cyan animate-spin" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Forensic Pipeline Active</h3>
              <p className="text-xs text-slate-400">Processing multi-factor intelligence checks</p>
            </div>
          </div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/30">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-ink-800 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-electric-cyan via-electric-blue to-trust-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3.5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-white/[0.08] border border-electric-cyan/30 shadow-glow-cyan"
                    : isCompleted
                    ? "bg-white/[0.02] border border-white/5 opacity-80"
                    : "opacity-40"
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-trust-500" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-electric-cyan animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-slate-300"}`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-mono text-electric-cyan animate-pulse">Running...</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{step.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

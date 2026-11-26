import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-signal-amber/10 border border-signal-amber/30 text-signal-amber mb-2 shadow-glow-amber">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-signal-amber px-3 py-1 rounded-full bg-signal-amber/10 border border-signal-amber/20">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400">
            The forensic review page or resource you are looking for has been moved, deleted, or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-neon-blue text-ink-950 font-semibold text-sm hover:opacity-95 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/quick-check"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ink-800 border border-slate-700/60 text-slate-200 font-medium text-sm hover:bg-ink-700 hover:text-white transition-colors"
          >
            <Zap className="w-4 h-4 text-electric-cyan" />
            Quick Check
          </Link>
        </div>
      </div>
    </div>
  );
}

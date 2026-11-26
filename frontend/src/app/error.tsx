"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for telemetry
    console.error("[TrustLens Client Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-signal-crimson/10 border border-signal-crimson/30 text-signal-crimson mb-2 shadow-glow-crimson">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-signal-crimson px-3 py-1 rounded-full bg-signal-crimson/10 border border-signal-crimson/20">
            Runtime Exception
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Something Went Wrong
          </h1>
          <p className="text-sm text-slate-400">
            An unexpected error occurred while rendering this interface. Our diagnostics team has been alerted.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-500 bg-ink-900/80 p-2 rounded-lg border border-slate-800">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-neon-blue text-ink-950 font-semibold text-sm hover:opacity-95 transition-opacity cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ink-800 border border-slate-700/60 text-slate-200 font-medium text-sm hover:bg-ink-700 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

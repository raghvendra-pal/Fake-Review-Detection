"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Code2, X } from "lucide-react";
import { getExportUrl } from "@/lib/api";

interface ExportModalProps {
  reportId: string;
  reportTitle: string;
}

export default function ExportModal({ reportId, reportTitle }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    {
      format: "pdf" as const,
      label: "Download Forensic PDF Report",
      description: "Executive summary, radial gauge, forensic metrics table, and sample flagged reviews formatted for printing.",
      icon: FileText,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      format: "csv" as const,
      label: "Export Raw Reviews as CSV",
      description: "Full spreadsheet of all analyzed reviews, per-review fake probabilities, and rule flags.",
      icon: FileSpreadsheet,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      format: "json" as const,
      label: "Export Complete Report JSON",
      description: "Comprehensive machine-readable JSON blob including full network graph topology and timeline arrays.",
      icon: Code2,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white shadow-sm transition-all hover:scale-[1.02]"
      >
        <Download className="w-3.5 h-3.5 text-electric-cyan" />
        Export Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel-elevated rounded-2xl p-6 shadow-2xl border border-white/10 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-display font-bold text-white text-base">Export Forensic Report</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{reportTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {exportOptions.map((opt) => {
                const Icon = opt.icon;
                const exportUrl = getExportUrl(reportId, opt.format);

                return (
                  <a
                    key={opt.format}
                    href={exportUrl}
                    download
                    onClick={() => setTimeout(() => setIsOpen(false), 300)}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 transition-all group"
                  >
                    <div className={`p-2.5 rounded-lg border ${opt.color} mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-white group-hover:text-electric-cyan transition-colors block">
                        {opt.label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { Terminal, ExternalLink, Code2, ShieldAlert } from "lucide-react";

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/analyze-url",
      desc: "Scrape and analyze any product, store, or business review page with SSRF protection and graceful anti-bot fallback.",
      body: '{\n  "url": "https://www.amazon.com/dp/B08N5WRWNW"\n}',
    },
    {
      method: "POST",
      path: "/api/analyze-reviews",
      desc: "Execute full forensic pipeline on raw array of review objects in JSON format.",
      body: '{\n  "title": "Custom Review Dataset",\n  "reviews": [\n    {\n      "reviewer_name": "alex_881",\n      "review_text": "Best headphones ever! 100% recommend!",\n      "rating": 5.0,\n      "date": "2026-10-15T09:12:00"\n    }\n  ]\n}',
    },
    {
      method: "POST",
      path: "/api/analyze-file",
      desc: "Multipart form upload of CSV, XLSX, or JSON review spreadsheet files.",
      body: 'Form Data:\n- file: [Binary spreadsheet]\n- title: (Optional string title)',
    },
    {
      method: "POST",
      path: "/api/quick-check",
      desc: "Instant single review evaluation returning token-level ML feature attributions, readability, and linguistic flags.",
      body: '{\n  "text": "Best purchase ever! Changed my life completely! Must buy!",\n  "rating": 5.0\n}',
    },
    {
      method: "POST",
      path: "/api/compare",
      desc: "Compare 2 to 5 review listings side by side to establish the winner with highest consumer authenticity.",
      body: '{\n  "targets": [\n    { "title": "Listing A", "reviews": [...] },\n    { "title": "Listing B", "reviews": [...] }\n  ]\n}',
    },
    {
      method: "POST",
      path: "/api/article-check",
      desc: "Inspect news articles or blog posts for clickbait framing, emotional sensationalism, and domain reputation.",
      body: '{\n  "text": "SHOCKING BOMBSHELL: Doctors reveal...",\n  "url": "https://news.example.com/article"\n}',
    },
    {
      method: "GET",
      path: "/api/report/{id}",
      desc: "Retrieve previously generated forensic report by unique UUID with network graph and review records.",
      body: "Path Parameter: id (UUID string)",
    },
    {
      method: "GET",
      path: "/api/report/{id}/export?format=pdf|csv|json",
      desc: "Download full forensic report as formatted PDF, CSV review spreadsheet, or structured JSON.",
      body: "Query Parameter: format=pdf | csv | json",
    },
    {
      method: "GET",
      path: "/api/health",
      desc: "Service health check, model status, and vocabulary metrics.",
      body: "Returns: { status: 'operational', model_loaded: true, ... }",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan text-xs font-semibold mb-2">
            <Terminal className="w-3.5 h-3.5" />
            Developer Platform
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            REST API Reference
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Programmatic access to the TrustLens machine learning models, account graph, and burst detectors.
          </p>
        </div>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white transition-colors"
        >
          <span>Open Interactive Swagger UI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep, idx) => (
          <div
            key={idx}
            className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                  ep.method === "POST"
                    ? "bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {ep.method}
              </span>
              <span className="font-mono text-xs font-semibold text-white">{ep.path}</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">{ep.desc}</p>

            <div className="p-3 rounded-xl bg-ink-950/80 border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
              {ep.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

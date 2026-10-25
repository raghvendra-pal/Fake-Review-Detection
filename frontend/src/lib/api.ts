import {
  AnalysisReport, ScraperFallbackResponse, QuickCheckResult,
  CompareResponse, ArticleCheckResult, DemoItem
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function analyzeUrl(url: string): Promise<AnalysisReport | ScraperFallbackResponse> {
  const res = await fetch(`${API_BASE}/analyze-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Network error occurred." }));
    throw new Error(err.detail || "Failed to analyze URL.");
  }
  return res.json();
}

export async function analyzeReviews(title: string, reviews: any[]): Promise<AnalysisReport> {
  const res = await fetch(`${API_BASE}/analyze-reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, reviews }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Network error occurred." }));
    throw new Error(err.detail || "Failed to analyze reviews.");
  }
  return res.json();
}

export async function analyzeFile(file: File, title?: string): Promise<AnalysisReport> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await fetch(`${API_BASE}/analyze-file`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to parse file." }));
    throw new Error(err.detail || "Failed to process file.");
  }
  return res.json();
}

export async function quickCheck(text: string, rating?: number): Promise<QuickCheckResult> {
  const res = await fetch(`${API_BASE}/quick-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, rating: rating || 5.0 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Quick check failed." }));
    throw new Error(err.detail || "Quick check failed.");
  }
  return res.json();
}

export async function compareTargets(targets: Array<{ title: string; reviews: any[] }>): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targets }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Comparison failed." }));
    throw new Error(err.detail || "Comparison failed.");
  }
  return res.json();
}

export async function checkArticle(url?: string, text?: string): Promise<ArticleCheckResult> {
  const res = await fetch(`${API_BASE}/article-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url || null, text: text || null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Article check failed." }));
    throw new Error(err.detail || "Article check failed.");
  }
  return res.json();
}

export async function getReport(reportId: string): Promise<AnalysisReport> {
  const res = await fetch(`${API_BASE}/report/${reportId}`);
  if (!res.ok) {
    throw new Error("Report not found or expired.");
  }
  return res.json();
}

export async function listReports(limit = 20, offset = 0): Promise<{ total: number; reports: any[] }> {
  const res = await fetch(`${API_BASE}/reports?limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    return { total: 0, reports: [] };
  }
  return res.json();
}

export async function listDemos(): Promise<DemoItem[]> {
  const res = await fetch(`${API_BASE}/demos`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getDemo(name: string): Promise<AnalysisReport> {
  const res = await fetch(`${API_BASE}/demo/${name}`);
  if (!res.ok) {
    throw new Error(`Failed to load demo: ${name}`);
  }
  return res.json();
}

export function getExportUrl(reportId: string, format: "pdf" | "csv" | "json"): string {
  return `${API_BASE}/report/${reportId}/export?format=${format}`;
}

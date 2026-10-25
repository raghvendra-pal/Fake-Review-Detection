import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTrustColor(score: number): {
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  badgeBg: string;
  verdict: "Trustworthy" | "Suspicious" | "High Risk";
} {
  if (score >= 75) {
    return {
      color: "#10B981", // emerald
      bgColor: "rgba(16, 185, 129, 0.12)",
      borderColor: "rgba(16, 185, 129, 0.4)",
      glowColor: "rgba(16, 185, 129, 0.5)",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      verdict: "Trustworthy",
    };
  } else if (score >= 45) {
    return {
      color: "#F59E0B", // amber
      bgColor: "rgba(245, 158, 11, 0.12)",
      borderColor: "rgba(245, 158, 11, 0.4)",
      glowColor: "rgba(245, 158, 11, 0.5)",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      verdict: "Suspicious",
    };
  } else {
    return {
      color: "#EF4444", // coral red
      bgColor: "rgba(239, 68, 68, 0.12)",
      borderColor: "rgba(239, 68, 68, 0.4)",
      glowColor: "rgba(239, 68, 68, 0.5)",
      badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      verdict: "High Risk",
    };
  }
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr || dateStr === "Recent") return "Recent";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

export function truncate(str: string, maxLen: number = 80): string {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

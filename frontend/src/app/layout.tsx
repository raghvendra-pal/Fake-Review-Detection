import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: {
    default: "TrustLens — Fake Review & Spam Campaign Detection Platform",
    template: "%s | TrustLens - Forensic Review Intelligence"
  },
  description: "Enterprise-grade forensic fake review, spam burst, and reviewer syndicate network intelligence platform.",
  keywords: ["fake review detector", "spam review analysis", "trust score", "reviewer network graph", "Amazon fake reviews"],
  authors: [{ name: "TrustLens Security Team" }],
  openGraph: {
    title: "TrustLens — Forensic Fake Review Detection",
    description: "Identify deceptive reviews, bot syndicates, and spam bursts with explainable machine learning and network intelligence.",
    type: "website",
    locale: "en_US",
    siteName: "TrustLens"
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustLens — Forensic Fake Review Detection",
    description: "Enterprise-grade forensic fake review, spam burst, and reviewer network intelligence."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-electric-cyan selection:text-ink-950 overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "TrustLens — Fake Review & Spam Campaign Detection Platform",
  description: "Enterprise-grade forensic fake review, spam burst, and reviewer syndicate network intelligence platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-electric-cyan selection:text-ink-950">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

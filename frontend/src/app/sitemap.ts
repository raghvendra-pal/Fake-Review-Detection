import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trustlens.ai";

  const routes = [
    "",
    "/quick-check",
    "/bulk",
    "/compare",
    "/history",
    "/article-check",
    "/extension",
    "/methodology",
    "/api-docs",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}

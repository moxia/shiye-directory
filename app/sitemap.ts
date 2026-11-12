import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const updated = new Date();
  return ["zh", "en"].map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: updated,
    changeFrequency: "weekly",
    priority: locale === "zh" ? 1 : 0.9,
    alternates: {
      languages: {
        "zh-CN": `${base}/zh`,
        en: `${base}/en`
      }
    }
  }));
}

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { DISTRICTS } from "@/content/districts";
import { KB_ARTICLES } from "@/content/knowledge-base";
import { getPublicObjects } from "@/lib/data/objects";

export const revalidate = 3600; // 1 hour — fresh enough for new listings

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  // Static routes — manually listed so we don't accidentally include /api/* or internals.
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/listings`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/districts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/insights`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/process`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/knowledge`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const districtEntries: MetadataRoute.Sitemap = DISTRICTS.map((d) => ({
    url: `${base}/districts/${d.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const knowledgeEntries: MetadataRoute.Sitemap = KB_ARTICLES.map((a) => ({
    url: `${base}/knowledge/${a.slug}`,
    lastModified: new Date(a.updated),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Active objects — fetched fresh per sitemap regeneration.
  const objects = await getPublicObjects();
  const objectEntries: MetadataRoute.Sitemap = objects.map((o) => ({
    url: `${base}/object/${o.rwNumber}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...districtEntries, ...knowledgeEntries, ...objectEntries];
}

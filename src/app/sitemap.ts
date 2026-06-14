import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { DISTRICTS } from "@/content/districts";
import { KB_ARTICLES } from "@/content/knowledge-base";
import { BLOG_POSTS } from "@/content/blog";
import { DISTRICTS_RU } from "@/content/districts.ru";
import { KB_ARTICLES_RU } from "@/content/knowledge-base.ru";
import { BLOG_POSTS_RU } from "@/content/blog.ru";
import { getPublicObjects } from "@/lib/data/objects";
import { getPublicProjects, projectSlug, isProjectUnit, getDevelopers } from "@/lib/data/projects";

export const revalidate = 3600; // 1 hour — fresh enough for new listings

/**
 * amoCRM `dateAdded` is a Unix-seconds string ("1755018000"); some rows may
 * also carry an ISO date or junk. Return a valid Date or the fallback — never
 * an Invalid Date (which would throw on serialization).
 */
function parseListingDate(raw: string | undefined, fallback: Date): Date {
  if (!raw) return fallback;
  const secs = Number(raw);
  const d = Number.isFinite(secs) && secs > 0 ? new Date(secs * 1000) : new Date(raw);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  // Static routes — manually listed so we don't accidentally include /api/* or internals.
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { en: `${base}/`, ru: `${base}/ru`, "x-default": `${base}/` } },
    },
    { url: `${base}/ru`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/ru/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/ru/services`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/ru/process`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/ru/districts`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ru/listings`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/ru/calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/ru/insights`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/ru/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/ru/knowledge`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/ru/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/ru/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/listings`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/ru/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/districts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/insights`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/process`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${base}/due-diligence`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: { en: `${base}/due-diligence`, ru: `${base}/ru/due-diligence`, "x-default": `${base}/due-diligence` } },
    },
    { url: `${base}/ru/due-diligence`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/knowledge`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/tools/estimate`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/ru/tools/estimate`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${base}/sell`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: { en: `${base}/sell`, ru: `${base}/ru/sell`, "x-default": `${base}/sell` } },
    },
    { url: `${base}/ru/sell`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
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

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.published),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const ruDistrictEntries: MetadataRoute.Sitemap = DISTRICTS_RU.map((d) => ({
    url: `${base}/ru/districts/${d.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const ruKnowledgeEntries: MetadataRoute.Sitemap = KB_ARTICLES_RU.map((a) => ({
    url: `${base}/ru/knowledge/${a.slug}`,
    lastModified: new Date(a.updated),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const ruBlogEntries: MetadataRoute.Sitemap = BLOG_POSTS_RU.map((p) => ({
    url: `${base}/ru/blog/${p.slug}`,
    lastModified: new Date(p.published),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Active objects — fetched fresh per sitemap regeneration. Developer projects
  // (RW-P) and their unit cards (RW-P####-N) are excluded here; projects have
  // their own /projects/[slug] entries, units live on the project page.
  const objects = (await getPublicObjects()).filter(
    (o) => o.type !== "Project" && !isProjectUnit(o.rwNumber),
  );
  const objectEntries: MetadataRoute.Sitemap = objects.flatMap((o) => {
    // Image sitemap: cover + a few gallery shots per listing — property photos
    // are a real discovery channel via Google Images.
    const images = [o.coverImage, ...(o.gallery ?? [])]
      .filter((u): u is string => !!u)
      .filter((u, i, arr) => arr.indexOf(u) === i)
      .slice(0, 4);
    const languages = {
      en: `${base}/object/${o.rwNumber}`,
      ru: `${base}/ru/object/${o.rwNumber}`,
    };
    // Honest lastmod from the listing's own date — `now` on every entry tells
    // Google "everything changed this hour", which erodes trust in the signal.
    // dateAdded comes from amoCRM as a Unix-seconds STRING ("1755018000"), not
    // ISO; new Date(thatString) is Invalid → toISOString() throws and kills the
    // whole sitemap prerender. Parse seconds when numeric, tolerate ISO, fall
    // back to `now` on anything unparseable.
    const lastModified = parseListingDate(o.dateAdded, now);
    return [
      {
        url: `${base}/object/${o.rwNumber}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images,
        alternates: { languages },
      },
      {
        url: `${base}/ru/object/${o.rwNumber}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        images,
        alternates: { languages },
      },
    ];
  });

  const projects = await getPublicProjects();
  const projectEntries: MetadataRoute.Sitemap = projects.flatMap((p) => {
    const slug = projectSlug(p, projects);
    const languages = { en: `${base}/projects/${slug}`, ru: `${base}/ru/projects/${slug}` };
    return [
      { url: `${base}/projects/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8, alternates: { languages } },
      { url: `${base}/ru/projects/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6, alternates: { languages } },
    ];
  });

  const developers = await getDevelopers();
  const developerEntries: MetadataRoute.Sitemap = developers.flatMap((d) => [
    { url: `${base}/developers/${d.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${base}/ru/developers/${d.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 },
  ]);

  return [
    ...staticEntries,
    ...districtEntries,
    ...knowledgeEntries,
    ...blogEntries,
    ...ruDistrictEntries,
    ...ruKnowledgeEntries,
    ...ruBlogEntries,
    ...objectEntries,
    ...projectEntries,
    ...developerEntries,
  ];
}

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { DISTRICTS } from "@/content/districts";
import { KB_ARTICLES } from "@/content/knowledge-base";
import { BLOG_POSTS } from "@/content/blog";
import { getPublicObjects } from "@/lib/data/objects";
import { getPublicProjects, projectSlug, isProjectUnit, getDevelopers } from "@/lib/data/projects";
import { getPublishedEstates } from "@/content/land-estates";
import { parseListingDate } from "@/lib/utils/listing-date";

export const revalidate = 3600; // 1 hour — fresh enough for new listings

type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/**
 * Static pages don't change every hour, but `lastModified: now` said exactly
 * that on every regeneration — a signal Google learns to ignore. Bump this
 * date when static copy actually changes (content pages carry their own).
 */
const STATIC_LASTMOD = new Date("2026-09-04");

/**
 * Every public page exists in EN and RU (`/ru/...`). Emit the pair with
 * hreflang alternates on BOTH entries — an EN entry without alternates told
 * crawlers the RU mirror was a separate, unrelated page (184 of 528 URLs had
 * them before the 2026-09-03 audit).
 */
function pair(
  base: string,
  path: string,
  changeFrequency: Freq,
  priority: number,
  ruPriority: number,
  lastModified: Date = STATIC_LASTMOD,
  extra: Pick<MetadataRoute.Sitemap[number], "images"> = {},
): MetadataRoute.Sitemap {
  const en = `${base}${path === "/" ? "/" : path}`;
  const ru = `${base}/ru${path === "/" ? "" : path}`;
  const languages = { en, ru, "x-default": en };
  return [
    { url: en, lastModified, changeFrequency, priority, alternates: { languages }, ...extra },
    { url: ru, lastModified, changeFrequency, priority: ruPriority, alternates: { languages }, ...extra },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  // Static routes — manually listed so we don't accidentally include /api/* or
  // internals. `/saved` is deliberately absent: it is noindex.
  const staticPaths: Array<[string, Freq, number, number]> = [
    ["/", "weekly", 1, 0.7],
    ["/listings", "daily", 0.9, 0.7],
    ["/leasehold", "monthly", 0.8, 0.6],
    ["/projects", "weekly", 0.8, 0.6],
    ["/developers", "weekly", 0.7, 0.5],
    ["/estates", "weekly", 0.8, 0.6],
    ["/districts", "monthly", 0.7, 0.6],
    ["/insights", "monthly", 0.7, 0.5],
    ["/tools/zoning", "monthly", 0.5, 0.5],
    ["/tools/estimate", "monthly", 0.8, 0.6],
    ["/services", "monthly", 0.6, 0.5],
    ["/process", "monthly", 0.6, 0.5],
    ["/about", "monthly", 0.5, 0.5],
    ["/due-diligence", "monthly", 0.7, 0.5],
    ["/knowledge", "weekly", 0.7, 0.5],
    ["/blog", "weekly", 0.6, 0.5],
    ["/faq", "monthly", 0.7, 0.5],
    ["/contact", "monthly", 0.5, 0.5],
    ["/sell", "monthly", 0.8, 0.6],
    ["/calculator", "monthly", 0.7, 0.5],
    ["/match", "monthly", 0.7, 0.5],
    ["/privacy", "yearly", 0.3, 0.3],
    ["/credits", "yearly", 0.3, 0.3],
  ];
  const staticEntries = staticPaths.flatMap(([path, freq, p, rp]) => pair(base, path, freq, p, rp));

  // Districts, guides and posts share slugs across locales (content files are
  // mirrored), so the EN list drives both entries of each pair.
  const districtEntries = DISTRICTS.flatMap((d) =>
    pair(base, `/districts/${d.slug}`, "monthly", 0.7, 0.5),
  );
  const knowledgeEntries = KB_ARTICLES.flatMap((a) =>
    pair(base, `/knowledge/${a.slug}`, "monthly", 0.6, 0.5, new Date(a.updated)),
  );
  const blogEntries = BLOG_POSTS.flatMap((p) =>
    pair(base, `/blog/${p.slug}`, "monthly", 0.6, 0.5, new Date(p.published)),
  );

  // Active objects — fetched fresh per sitemap regeneration. Developer projects
  // (RW-P) and their unit cards (RW-P####-N) are excluded here; projects have
  // their own /projects/[slug] entries, units live on the project page.
  const objects = (await getPublicObjects()).filter(
    (o) => o.type !== "Project" && !isProjectUnit(o.rwNumber),
  );
  const objectEntries = objects.flatMap((o) => {
    // Image sitemap: cover + a few gallery shots per listing — property photos
    // are a real discovery channel via Google Images.
    const images = [o.coverImage, ...(o.gallery ?? [])]
      .filter((u): u is string => !!u)
      .filter((u, i, arr) => arr.indexOf(u) === i)
      .slice(0, 4);
    // Honest lastmod from the listing's own date. dateAdded comes from amoCRM
    // as a Unix-seconds STRING ("1755018000"), not ISO; new Date(thatString)
    // is Invalid → toISOString() throws and kills the whole sitemap prerender.
    // parseListingDate handles seconds/ISO and falls back to `now`.
    const lastModified = parseListingDate(o.dateAdded, now);
    return pair(base, `/object/${o.rwNumber}`, "weekly", 0.8, 0.6, lastModified, { images });
  });

  const projects = await getPublicProjects();
  const projectEntries = projects.flatMap((p) => {
    const slug = projectSlug(p, projects);
    const lastModified = parseListingDate(p.dateAdded, now);
    return [
      ...pair(base, `/projects/${slug}`, "weekly", 0.8, 0.6, lastModified),
      // Ход стройки — своя страница только у проектов с фотоотчётами.
      ...((p.constructionUpdates?.length ?? 0) > 0
        ? pair(base, `/projects/${slug}/construction`, "weekly", 0.5, 0.4, lastModified)
        : []),
    ];
  });

  const developers = await getDevelopers();
  const developerEntries = developers.flatMap((d) =>
    pair(base, `/developers/${d.slug}`, "weekly", 0.6, 0.5),
  );

  // Land estates (подборки участков) — content-driven, only published ones.
  const estateEntries = getPublishedEstates().flatMap((e) =>
    pair(base, `/estates/${e.slug}`, "weekly", 0.8, 0.6),
  );

  return [
    ...staticEntries,
    ...districtEntries,
    ...knowledgeEntries,
    ...blogEntries,
    ...objectEntries,
    ...projectEntries,
    ...developerEntries,
    ...estateEntries,
  ];
}

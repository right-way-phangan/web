import type {
  DeveloperProfile,
  DeveloperTimelineEntry,
  ResolvedTimelineEntry,
} from "./types";
import { arqa } from "./arqa";

const profiles: Record<string, DeveloperProfile> = {
  [arqa.slug]: arqa,
};

/** Curated profile for a developer slug, or null when only the catalog group exists. */
export function getDeveloperProfile(slug: string): DeveloperProfile | null {
  return profiles[slug] ?? null;
}

/** Slugs of all curated profiles — unioned into generateStaticParams so a profile page survives catalog drift. */
export function profileSlugs(): string[] {
  return Object.keys(profiles);
}

/**
 * Attach catalog hrefs to timeline entries. The href map is built by the page —
 * projectSlug() lives in a server-only module, so it can't be imported here
 * (and this module stays importable from tests). It is keyed by RW number, so
 * project landings (rwNumber) and object pages (objectRw) share one lookup.
 */
export function resolveTimeline(
  entries: DeveloperTimelineEntry[],
  hrefByRw: Record<string, string>,
): ResolvedTimelineEntry[] {
  return entries.map((entry) => {
    const rw = entry.rwNumber ?? entry.objectRw;
    return { ...entry, href: rw ? hrefByRw[rw] : undefined };
  });
}

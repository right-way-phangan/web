import "server-only";
import { listCatalogElements, AmoApiError } from "@/lib/amocrm/client";
import { mapElementToObject } from "@/lib/amocrm/mapper";
import { backendFetch } from "@/lib/api/backend";
import type { RealEstateObject, ObjectStatus } from "@/types/object";

/**
 * Cache TTL for catalog fetches (Next.js fetch revalidation).
 * 5 min — balances freshness vs amoCRM API rate limits.
 */
export const CATALOG_REVALIDATE_SECONDS = 300;

const PUBLIC_STATUSES: ObjectStatus[] = ["Active"];

/**
 * Migration off amoCRM (Phase A): when OBJECTS_API_URL is set, objects come from
 * the own DB via the backend API (RealEstateObject JSON, same shape) instead of
 * the amoCRM catalog. Unset → amoCRM (current prod behavior, untouched).
 * The API already returns the public set sorted; getAllObjects returns all.
 */
const OBJECTS_API_URL = process.env.OBJECTS_API_URL;

async function apiObjects(path: string): Promise<RealEstateObject[]> {
  const res = await backendFetch(path, { next: { revalidate: CATALOG_REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`objects API ${path} → ${res.status}`);
  return (await res.json()) as RealEstateObject[];
}

/**
 * Fetch all objects from the amoCRM catalog and return only those that
 * should be publicly visible: Active status, has RW number, AND has at least
 * one photo (coverImage). Photo-less objects stay in amoCRM but are hidden
 * from the site until a photo is uploaded — at which point they reappear
 * automatically on the next cache refresh. No manual re-listing needed.
 * See task: "Right Way — мои задачи.md" → «Наполнить фото скрытые объекты».
 *
 * Server-only — uses long-lived amoCRM token. Cached per CATALOG_REVALIDATE_SECONDS.
 * Returns [] on API failure rather than throwing — listing page degrades gracefully.
 */
export async function getPublicObjects(): Promise<RealEstateObject[]> {
  if (OBJECTS_API_URL) {
    try {
      return await apiObjects("/objects");
    } catch (err) {
      console.error("[objects] own-API failed:", err);
      return [];
    }
  }
  try {
    const elements = await listCatalogElements();
    const all = elements.map(mapElementToObject);
    return all
      .filter(
        (o) => o.rwNumber && PUBLIC_STATUSES.includes(o.status) && !!o.coverImage,
      )
      .sort(sortByRecentAndPremium);
  } catch (err) {
    if (err instanceof AmoApiError) {
      console.error(`[objects] amoCRM ${err.status}:`, err.body.slice(0, 200));
    } else {
      console.error("[objects] unexpected:", err);
    }
    return [];
  }
}

/**
 * Sort premium features first (beachfront → sea-view → mountain-view), then by
 * date_added desc. All public objects already have a cover photo (filtered in
 * getPublicObjects), so the coverImage term below is now effectively constant.
 */
function sortByRecentAndPremium(a: RealEstateObject, b: RealEstateObject) {
  const score = (o: RealEstateObject) =>
    (o.coverImage ? 8 : 0) +
    (o.beachfront ? 4 : 0) +
    (o.seaView ? 2 : 0) +
    (o.mountainView ? 1 : 0);
  const sd = score(b) - score(a);
  if (sd !== 0) return sd;
  const ad = a.dateAdded ?? "";
  const bd = b.dateAdded ?? "";
  return bd.localeCompare(ad);
}

export async function getObjectByRwNumber(
  rw: string,
): Promise<RealEstateObject | null> {
  const all = await getPublicObjects();
  return all.find((o) => o.rwNumber === rw) ?? null;
}

/**
 * Fetch ALL catalog objects regardless of status (Active/Sold/Reserved/…).
 * Used only to resolve a project's unit cards — a project page must show sold
 * and reserved units (with their status badge), not just the publicly listable
 * Active ones. Returns [] on failure. Do NOT use for the public listings grid.
 */
export async function getAllObjects(): Promise<RealEstateObject[]> {
  if (OBJECTS_API_URL) {
    try {
      return await apiObjects("/objects/all");
    } catch (err) {
      console.error("[objects:all] own-API failed:", err);
      return [];
    }
  }
  try {
    const elements = await listCatalogElements();
    return elements
      .map(mapElementToObject)
      .filter((o) => o.rwNumber);
  } catch (err) {
    if (err instanceof AmoApiError) {
      console.error(`[objects:all] amoCRM ${err.status}:`, err.body.slice(0, 200));
    } else {
      console.error("[objects:all] unexpected:", err);
    }
    return [];
  }
}

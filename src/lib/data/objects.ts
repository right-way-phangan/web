import "server-only";
import { listCatalogElements, AmoApiError } from "@/lib/amocrm/client";
import { mapElementToObject } from "@/lib/amocrm/mapper";
import type { RealEstateObject, ObjectStatus } from "@/types/object";

/**
 * Cache TTL for catalog fetches (Next.js fetch revalidation).
 * 5 min — balances freshness vs amoCRM API rate limits.
 */
export const CATALOG_REVALIDATE_SECONDS = 300;

const PUBLIC_STATUSES: ObjectStatus[] = ["Active"];

/**
 * Fetch all objects from the amoCRM catalog and return only those that
 * should be publicly visible (Active status, has RW number).
 *
 * Server-only — uses long-lived amoCRM token. Cached per CATALOG_REVALIDATE_SECONDS.
 * Returns [] on API failure rather than throwing — listing page degrades gracefully.
 */
export async function getPublicObjects(): Promise<RealEstateObject[]> {
  try {
    const elements = await listCatalogElements();
    const all = elements.map(mapElementToObject);
    return all
      .filter((o) => o.rwNumber && PUBLIC_STATUSES.includes(o.status))
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
 * Sort: beachfront/sea-view first, then by date_added desc.
 * Keeps the most photogenic listings near the top of /listings.
 */
function sortByRecentAndPremium(a: RealEstateObject, b: RealEstateObject) {
  const score = (o: RealEstateObject) =>
    (o.beachfront ? 4 : 0) + (o.seaView ? 2 : 0) + (o.mountainView ? 1 : 0);
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

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

/**
 * Strip CRM-internal fields before an object can reach a public page. These
 * end up serialized into the RSC payload of /listings et al., so anything left
 * here is world-readable in the page source: ownerName carries seller contacts,
 * docs holds non-public document URLs, driveFolder links the object's Drive
 * folder. No public component reads them — admin reads go through
 * getAllObjects, which stays unsanitized.
 */
export function sanitizePublicObject(o: RealEstateObject): RealEstateObject {
  const { ownerName, driveFolder, docs, circleCode, ddLawyer, ...pub } = o;
  void ownerName;
  void driveFolder;
  void docs;
  void circleCode;
  void ddLawyer; // имя юриста — внутреннее; публично только ddStatus/ddDate
  return pub;
}

/**
 * Drop the full photo gallery for list/map views — cards render coverImage
 * only, and serializing every object's gallery into the /listings RSC payload
 * is what pushed the page over 500 KB. Detail pages resolve their own object
 * (getObjectByRwNumber) and keep the gallery.
 */
export function slimObjectForList(o: RealEstateObject): RealEstateObject {
  const { gallery, ...slim } = o;
  void gallery;
  return slim;
}

/**
 * Tighter cut than slimObjectForList: exactly the fields ObjectCard renders.
 * For card strips serialized into widely-shared RSC payloads (homepage
 * FeaturedListings, the root not-found embedded into every page) — a full
 * object would leak galleries, raw descriptions and RU-sourced notes into
 * every page's HTML.
 */
export function slimObjectForCard(o: RealEstateObject): RealEstateObject {
  return {
    id: o.id,
    rwNumber: o.rwNumber,
    titleEn: o.titleEn,
    type: o.type,
    status: o.status,
    district: o.district,
    documentType: o.documentType,
    priceThb: o.priceThb,
    pricePerRai: o.pricePerRai,
    rentPerRaiMonth: o.rentPerRaiMonth,
    areaRai: o.areaRai,
    areaSqm: o.areaSqm,
    bedrooms: o.bedrooms,
    coverImage: o.coverImage,
    dateAdded: o.dateAdded,
    seaView: o.seaView,
    beachfront: o.beachfront,
    mountainView: o.mountainView,
    jungleView: o.jungleView,
    flatLand: o.flatLand,
    quiet: o.quiet,
    electricity: o.electricity,
  };
}

// Last successful fetch, kept per server instance: an amoCRM hiccup serves
// slightly stale inventory instead of an empty site. Survives only within a
// warm lambda — a cold start during an outage still degrades to [] (alerted
// by the prod-smoke workflow).
let lastGoodPublic: RealEstateObject[] | null = null;
let lastGoodAll: RealEstateObject[] | null = null;

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
      lastGoodPublic = (await apiObjects("/objects")).map(sanitizePublicObject);
      return lastGoodPublic;
    } catch (err) {
      console.error("[objects] own-API failed:", err);
      return lastGoodPublic ?? [];
    }
  }
  try {
    const elements = await listCatalogElements();
    const all = elements.map(mapElementToObject);
    lastGoodPublic = all
      .filter(
        (o) => o.rwNumber && PUBLIC_STATUSES.includes(o.status) && !!o.coverImage,
      )
      .map(sanitizePublicObject)
      .sort(sortByRecentAndPremium);
    return lastGoodPublic;
  } catch (err) {
    if (err instanceof AmoApiError) {
      console.error(`[objects] amoCRM ${err.status}:`, err.body.slice(0, 200));
    } else {
      console.error("[objects] unexpected:", err);
    }
    return lastGoodPublic ?? [];
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
      lastGoodAll = await apiObjects("/objects/all");
      return lastGoodAll;
    } catch (err) {
      console.error("[objects:all] own-API failed:", err);
      return lastGoodAll ?? [];
    }
  }
  try {
    const elements = await listCatalogElements();
    lastGoodAll = elements
      .map(mapElementToObject)
      .filter((o) => o.rwNumber);
    return lastGoodAll;
  } catch (err) {
    if (err instanceof AmoApiError) {
      console.error(`[objects:all] amoCRM ${err.status}:`, err.body.slice(0, 200));
    } else {
      console.error("[objects:all] unexpected:", err);
    }
    return lastGoodAll ?? [];
  }
}

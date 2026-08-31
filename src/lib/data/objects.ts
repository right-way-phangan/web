import "server-only";
import { unstable_cache } from "next/cache";
import { listCatalogElements, AmoApiError } from "@/lib/amocrm/client";
import { mapElementToObject } from "@/lib/amocrm/mapper";
import { backendFetch } from "@/lib/api/backend";
import { proxyR2Url, proxyR2VideoUrl } from "@/lib/storage/r2-public";
import { getUsdPerThb } from "@/lib/data/fx";
import { haversineMeters } from "@/lib/utils/geo";
import { normalizeTenure } from "@/lib/utils/tenure";
import type { RealEstateObject, ObjectStatus, NearbyListing } from "@/types/object";

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
  const {
    ownerName, contacts, driveFolder, docs, circleCode, ddLawyer, ddChecklist,
    outreachStatus, outreachNote, outreachDate, outreachAttempts,
    reasonForSelling, timeOnMarketMonths,
    needsReview,
    ...pub
  } = o;
  void ownerName;
  void needsReview;
  void reasonForSelling; // мотивация продавца — внутренний переговорный сигнал
  void timeOnMarketMonths; // время на рынке — внутренний сигнал переоценки
  void contacts; // контакты продавца (имя/телефон/мессенджеры) — строго внутренние
  void driveFolder;
  void docs;
  void circleCode;
  void ddLawyer; // имя юриста — внутреннее; публично только ddStatus/ddDate
  void ddChecklist;
  void outreachStatus; // обзвон собственников — целиком внутреннее
  void outreachNote;
  void outreachDate;
  void outreachAttempts;
  // r2.dev is state-blocked for entire countries (Indonesia et al.) — public
  // pages serve photos through the same-origin /media/r2/* proxy instead.
  return {
    ...pub,
    coverImage: pub.coverImage && proxyR2Url(pub.coverImage),
    gallery: pub.gallery?.map(proxyR2Url),
    floorplanUrls: pub.floorplanUrls?.map(proxyR2Url),
    constructionUpdates: pub.constructionUpdates?.map((u) => ({
      ...u,
      photos: u.photos.map(proxyR2Url),
    })),
    // Videos use a dedicated route handler (not the cached rewrite) — Vercel's
    // edge mis-serves Range requests off the rewrite cache. See proxyR2VideoUrl.
    videoUrls: pub.videoUrls?.map(proxyR2VideoUrl),
  };
}

/**
 * Drop the full photo gallery for list/map views — cards render coverImage
 * only, and serializing every object's gallery into the /listings RSC payload
 * is what pushed the page over 500 KB. Detail pages resolve their own object
 * (getObjectByRwNumber) and keep the gallery.
 */
export function slimObjectForList(o: RealEstateObject): RealEstateObject {
  const { gallery, constructionUpdates, descriptionRaw, ...slim } = o;
  void gallery;
  void constructionUpdates; // десятки URL фото со стройки — только на своей странице
  // legacy-заметки amoCRM: на карточке объекта не рендерятся (решение 2026-06-17),
  // но уезжали в RSC-payload /listings — десятки описаний в исходнике страницы.
  // Лендинги проектов читают своё поле напрямую и этим срезом не ходят.
  void descriptionRaw;
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
    priceUsd: o.priceUsd,
    pricePerRai: o.pricePerRai,
    rentPerRaiMonth: o.rentPerRaiMonth,
    rentPerMonth: o.rentPerMonth,
    areaRai: o.areaRai,
    areaSqm: o.areaSqm,
    bedrooms: o.bedrooms,
    // зона + тип дороги → чип зоны и флаги «проверить» на карточке/в сравнении
    zone: o.zone,
    roadType: o.roadType,
    // compare-таблица на /saved читает форму владения
    tenure: o.tenure,
    leaseTermYears: o.leaseTermYears,
    coverImage: o.coverImage,
    dateAdded: o.dateAdded,
    // ранжирование похожих (dist2) и карты работают по координатам — публичны
    lat: o.lat,
    lng: o.lng,
    seaView: o.seaView,
    beachfront: o.beachfront,
    mountainView: o.mountainView,
    jungleView: o.jungleView,
    flatLand: o.flatLand,
    quiet: o.quiet,
    electricity: o.electricity,
  };
}

/**
 * Other published listings near a plot — straight-line within `radiusM`,
 * nearest first, capped at `limit`. Feeds the object map's "nearby" pins.
 * Self and coord-less objects are excluded. Returns [] without origin coords.
 */
export function nearbyListings(
  catalog: RealEstateObject[],
  origin: { rwNumber?: string; lat?: number; lng?: number },
  { radiusM = 6000, limit = 8 }: { radiusM?: number; limit?: number } = {},
): NearbyListing[] {
  if (origin.lat == null || origin.lng == null) return [];
  const oLat = origin.lat;
  const oLng = origin.lng;
  return catalog
    .filter((o) => o.rwNumber && o.rwNumber !== origin.rwNumber && o.lat != null && o.lng != null)
    .map((o) => ({ o, d: haversineMeters(oLat, oLng, o.lat as number, o.lng as number) }))
    .filter((x) => x.d <= radiusM)
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(({ o }) => ({
      rw: o.rwNumber as string,
      lat: o.lat as number,
      lng: o.lng as number,
      title: o.titleEn || (o.rwNumber as string),
      type: o.type ?? "",
      priceThb: o.priceThb,
    }));
}

/**
 * Attach the "≈ $" hint to every priced object once per fetch — cards across
 * the site read o.priceUsd instead of each page threading an FX rate down
 * through client components. Rate is day-cached with a constant fallback.
 */
async function withUsd(objs: RealEstateObject[]): Promise<RealEstateObject[]> {
  const rate = await getUsdPerThb();
  return objs.map((o) =>
    o.priceThb ? { ...o, priceUsd: Math.round(o.priceThb * rate) } : o,
  );
}

// Last successful fetch, kept per server instance: an amoCRM hiccup serves
// slightly stale inventory instead of an empty site. Survives only within a
// warm lambda — a cold start during an outage still degrades to [] (alerted
// by the prod-smoke workflow).
let lastGoodPublic: RealEstateObject[] | null = null;
let lastGoodAll: RealEstateObject[] | null = null;

async function apiObjects(path: string): Promise<RealEstateObject[]> {
  // Cache via unstable_cache (its own keyspace + explicit "catalog" tag) rather
  // than fetch-level `next.revalidate`. The raw fetch is `no-store` so it does
  // not also land in the sticky fetch Data Cache — for the low-traffic
  // /objects/all entry that cache could wedge stale for hours (a deleted object
  // kept 200-ing its "unavailable" page; neither a redeploy nor `vercel cache
  // purge` cleared it). This keyspace refreshes on the 300s TTL and busts
  // instantly on revalidateTag("catalog") — see POST /api/revalidate-catalog.
  const load = unstable_cache(
    async () => {
      const res = await backendFetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`objects API ${path} → ${res.status}`);
      const objs = (await res.json()) as RealEstateObject[];
      // DB stores raw enum labels ("Freehold (Thai)", "Mixed / N.A.") — normalize
      // once at the data-layer edge so filters and includes("Leasehold") work.
      return objs.map((o) => ({ ...o, tenure: normalizeTenure(o.tenure) }));
    },
    ["catalog", path],
    { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] },
  );
  return load();
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
      lastGoodPublic = await withUsd(
        (await apiObjects("/objects"))
          // Страховка своей стороны: тот же гейт, что и в ветке amoCRM ниже.
          // На живом пути он держался только на backend, а его вет-гейт фото
          // fail-open — скриншот прайса мог стать публичной обложкой.
          .filter((o) => o.rwNumber && PUBLIC_STATUSES.includes(o.status) && !!o.coverImage)
          .map(sanitizePublicObject),
      );
      return lastGoodPublic;
    } catch (err) {
      console.error("[objects] own-API failed:", err);
      return lastGoodPublic ?? [];
    }
  }
  try {
    const elements = await listCatalogElements();
    const all = elements.map(mapElementToObject);
    lastGoodPublic = await withUsd(
      all
        .filter(
          (o) => o.rwNumber && PUBLIC_STATUSES.includes(o.status) && !!o.coverImage,
        )
        .map(sanitizePublicObject)
        .sort(sortByRecentAndPremium),
    );
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
 * Resolve an RW number that is NOT publicly listable (Sold/Reserved/photo-less)
 * so its detail URL can render an "unavailable" page instead of a 404 — shared
 * links to sold listings keep landing on live inventory. Returns the object
 * sanitized and without gallery; null when the number never existed.
 */
export async function getAnyObjectByRwNumber(
  rw: string,
): Promise<RealEstateObject | null> {
  const all = await getAllObjects();
  const found = all.find((o) => o.rwNumber === rw);
  // Card fields only: the object feeds the client-side related strip, so a
  // fuller cut would serialize description/notes into the page payload.
  return found ? slimObjectForCard(sanitizePublicObject(found)) : null;
}

/**
 * Admin-only: the full, UNsanitized object (keeps driveFolder, docs, owner,
 * coords). For authenticated /admin pages that link out to the object's Drive
 * folder or working docs — never call from a public page (would leak
 * sanitizePublicObject fields into world-readable page source).
 */
export async function getAdminObjectByRwNumber(
  rw: string,
): Promise<RealEstateObject | null> {
  const all = await getAllObjects();
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

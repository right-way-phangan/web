import type { RealEstateObject, ObjectType, TenureType } from "@/types/object";

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export interface ListingsFilter {
  type: ObjectType[];        // multi: Land/Villa/House/Apartment/Project
  district: string[];        // multi
  tenure: TenureType[];      // multi: Freehold/Leasehold
  bedroomsMin?: number;      // min beds (Villa/House/Apartment)
  priceMinThb?: number;      // min asking price (THB)
  priceMaxThb?: number;      // max asking price (THB)
  beachfront: boolean;
  seaView: boolean;
  mountainView: boolean;
  sort: SortOption;
}

const VALID_TYPES: ObjectType[] = ["Land", "Villa", "House", "Apartment", "Project"];
const VALID_TENURES: TenureType[] = ["Freehold", "Leasehold"];
const VALID_SORTS: SortOption[] = ["featured", "newest", "price-asc", "price-desc"];

/** URL price params are in millions of THB (e.g. ?pmin=10&pmax=20). */
function parseMillions(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const m = Number(raw);
  return Number.isFinite(m) && m > 0 ? m * 1_000_000 : undefined;
}

function multi<T extends string>(raw: string | undefined, allowed: readonly T[]): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
}

/**
 * Parse Next.js searchParams (Record<string, string|string[]|undefined>) into typed filter state.
 * Drops invalid values silently — never throws, so a bad URL just shows an unfiltered list.
 */
export function parseListingsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): ListingsFilter {
  const get = (key: string): string | undefined => {
    const v = raw[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const bedroomsRaw = get("bedrooms");
  const bedroomsMin = bedroomsRaw ? Number(bedroomsRaw) : undefined;

  const sortRaw = get("sort");
  const sort: SortOption =
    sortRaw && (VALID_SORTS as readonly string[]).includes(sortRaw)
      ? (sortRaw as SortOption)
      : "featured";

  return {
    type: multi(get("type"), VALID_TYPES),
    district: (get("district") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    tenure: multi(get("tenure"), VALID_TENURES),
    bedroomsMin: Number.isFinite(bedroomsMin) && bedroomsMin! > 0 ? bedroomsMin : undefined,
    priceMinThb: parseMillions(get("pmin")),
    priceMaxThb: parseMillions(get("pmax")),
    beachfront: get("beachfront") === "1",
    seaView: get("seaview") === "1",
    mountainView: get("mountainview") === "1",
    sort,
  };
}

/**
 * Build a predicate function from filter state. Empty arrays = no filter
 * for that dimension (passes all).
 */
export function makeFilterPredicate(f: ListingsFilter): (o: RealEstateObject) => boolean {
  return (o) => {
    if (f.type.length > 0 && !f.type.includes(o.type)) return false;
    if (f.district.length > 0 && (!o.district || !f.district.includes(o.district))) return false;
    if (f.tenure.length > 0) {
      const owned = new Set(o.tenure ?? []);
      const anyMatch = f.tenure.some((t) => owned.has(t));
      if (!anyMatch) return false;
    }
    if (f.bedroomsMin !== undefined) {
      if (!o.bedrooms || o.bedrooms < f.bedroomsMin) return false;
    }
    if (f.priceMinThb !== undefined) {
      if (!o.priceThb || o.priceThb < f.priceMinThb) return false;
    }
    if (f.priceMaxThb !== undefined) {
      if (!o.priceThb || o.priceThb > f.priceMaxThb) return false;
    }
    if (f.beachfront && !o.beachfront) return false;
    if (f.seaView && !o.seaView) return false;
    if (f.mountainView && !o.mountainView) return false;
    return true;
  };
}

export function applySort(objects: RealEstateObject[], sort: SortOption): RealEstateObject[] {
  if (sort === "newest") {
    return [...objects].sort((a, b) =>
      (b.dateAdded ?? "").localeCompare(a.dateAdded ?? ""),
    );
  }
  if (sort === "price-asc" || sort === "price-desc") {
    // Objects without a price always sink to the bottom, regardless of direction.
    return [...objects].sort((a, b) => {
      if (a.priceThb == null && b.priceThb == null) return 0;
      if (a.priceThb == null) return 1;
      if (b.priceThb == null) return -1;
      return sort === "price-asc"
        ? a.priceThb - b.priceThb
        : b.priceThb - a.priceThb;
    });
  }
  // 'featured' is already the upstream default sort in getPublicObjects()
  return objects;
}

/**
 * Has any filter been applied? Used by UI to show "Clear all" affordance.
 */
export function isFiltered(f: ListingsFilter): boolean {
  return (
    f.type.length > 0 ||
    f.district.length > 0 ||
    f.tenure.length > 0 ||
    f.bedroomsMin !== undefined ||
    f.priceMinThb !== undefined ||
    f.priceMaxThb !== undefined ||
    f.beachfront ||
    f.seaView ||
    f.mountainView ||
    f.sort !== "featured"
  );
}

/**
 * Short human label for a filter set — e.g. "Land in Sri Thanu · up to ฿20M ·
 * sea view". Used to title a saved search. Returns "All listings" when nothing
 * is active. The trailing sort is intentionally omitted (not part of intent).
 */
export function describeFilter(f: ListingsFilter, query?: string): string {
  const bits: string[] = [];
  if (query?.trim()) bits.push(`"${query.trim()}"`);
  if (f.type.length) bits.push(f.type.join(" / "));
  if (f.district.length) bits.push(`in ${f.district.join(", ")}`);
  if (f.priceMinThb) bits.push(`from ฿${f.priceMinThb / 1_000_000}M`);
  if (f.priceMaxThb) bits.push(`up to ฿${f.priceMaxThb / 1_000_000}M`);
  if (f.bedroomsMin) bits.push(`${f.bedroomsMin}+ bed`);
  if (f.tenure.length) bits.push(f.tenure.join(" / "));
  if (f.beachfront) bits.push("beachfront");
  if (f.seaView) bits.push("sea view");
  if (f.mountainView) bits.push("mountain view");
  return bits.length ? bits.join(" · ") : "All listings";
}

/**
 * Human-readable summary of the active filters (+ optional NL query) — used to
 * pre-fill the "Send a brief" message when a search returns nothing, so the
 * visitor's intent isn't lost.
 */
export function summarizeForBrief(f: ListingsFilter, query?: string): string | undefined {
  const bits: string[] = [];
  if (f.type.length) bits.push(f.type.join(" / "));
  if (f.district.length) bits.push(`in ${f.district.join(", ")}`);
  if (f.priceMinThb) bits.push(`from ฿${f.priceMinThb / 1_000_000}M`);
  if (f.priceMaxThb) bits.push(`up to ฿${f.priceMaxThb / 1_000_000}M`);
  if (f.bedroomsMin) bits.push(`${f.bedroomsMin}+ bed`);
  if (f.tenure.length) bits.push(f.tenure.join(" / "));
  if (f.beachfront) bits.push("beachfront");
  if (f.seaView) bits.push("sea view");
  if (f.mountainView) bits.push("mountain view");

  if (!query && bits.length === 0) return undefined;

  const lines = ["Hi — I couldn't find a match on the site for what I'm after."];
  if (query) lines.push(`I searched: "${query}".`);
  if (bits.length) lines.push(`Criteria: ${bits.join(", ")}.`);
  lines.push("Could you send any private or upcoming listings that fit?");
  return lines.join("\n");
}

/**
 * Extract distinct option lists from a population, for filter dropdowns.
 * District/type lists adapt to the actual catalog content.
 */
export function deriveFilterOptions(objects: RealEstateObject[]) {
  const districts = new Set<string>();
  const types = new Set<ObjectType>();
  for (const o of objects) {
    if (o.district) districts.add(o.district);
    types.add(o.type);
  }
  return {
    districts: [...districts].sort(),
    types: VALID_TYPES.filter((t) => types.has(t)),
  };
}

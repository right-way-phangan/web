import type { RealEstateObject, ObjectType, TenureType } from "@/types/object";

export type SortOption = "featured" | "newest";

export interface ListingsFilter {
  type: ObjectType[];        // multi: Land/Villa/House/Apartment/Project
  district: string[];        // multi
  tenure: TenureType[];      // multi: Freehold/Leasehold
  bedroomsMin?: number;      // min beds (Villa/House/Apartment)
  beachfront: boolean;
  seaView: boolean;
  mountainView: boolean;
  sort: SortOption;
}

const VALID_TYPES: ObjectType[] = ["Land", "Villa", "House", "Apartment", "Project"];
const VALID_TENURES: TenureType[] = ["Freehold", "Leasehold"];
const VALID_SORTS: SortOption[] = ["featured", "newest"];

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
    f.beachfront ||
    f.seaView ||
    f.mountainView ||
    f.sort !== "featured"
  );
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

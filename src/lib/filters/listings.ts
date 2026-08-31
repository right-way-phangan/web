import type { RealEstateObject, ObjectType, TenureType } from "@/types/object";
import { escalatedLeaseTotalThb } from "@/lib/objects/lease-format";

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

/**
 * Buy vs Rent view. The market is pivoting toward leasehold land, so /listings
 * carries a Buy/Rent toggle: the *price dimension* (filter range, sort, map pins,
 * card headline) switches between the sale price (`priceThb`) in Buy mode and the
 * monthly lease rate (`rentPerRaiMonth`) in Rent mode. The toggle also partitions
 * inventory — see `makeFilterPredicate`: a listing with a monthly rent is a rental
 * (Rent tab); everything else is for sale (Buy tab).
 */
export type ViewMode = "buy" | "rent";

export interface ListingsFilter {
  mode: ViewMode;            // buy (sale price) | rent (monthly lease)
  type: ObjectType[];        // multi: Land/Villa/House/Apartment/Project
  district: string[];        // multi
  tenure: TenureType[];      // multi: Freehold/Leasehold
  bedroomsMin?: number;      // min beds (Villa/House/Apartment)
  priceMinThb?: number;      // min asking price (THB) — Buy mode
  priceMaxThb?: number;      // max asking price (THB) — Buy mode
  rentMinThb?: number;       // min monthly rent (THB/rai/mo) — Rent mode
  rentMaxThb?: number;       // max monthly rent (THB/rai/mo) — Rent mode
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

/** URL rent params are in thousands of THB/mo (e.g. ?rmin=10&rmax=30). */
function parseThousands(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const k = Number(raw);
  return Number.isFinite(k) && k > 0 ? k * 1_000 : undefined;
}

/**
 * The monthly rent a rental is ranked/filtered by: whole-unit rent for buildings
 * (villa/house — THB/month), or the per-rai land lease rate (THB/rai/month).
 * One object carries only one of the two, so the coalesce picks the right figure.
 */
export function monthlyRentOf(o: RealEstateObject): number | undefined {
  return o.rentPerMonth ?? o.rentPerRaiMonth;
}

/**
 * A lease of this many years or more reads as an acquisition, not a short-term
 * rental. Phangan leaseholds publish at 30 years; genuine short tenancies are
 * ≤ 1 year — 3 cleanly separates the two.
 */
const LONG_LEASE_MIN_YEARS = 3;

/**
 * A long leasehold (a multi-year land/villa lease) is a purchase route, not a
 * rental — the buyer acquires the home for decades. It browses under Buy even
 * though it carries a monthly rate. Short tenancies (no term, or < 3 years) stay
 * rentals.
 */
export function isLongLeaseAcquisition(o: RealEstateObject): boolean {
  return (o.leaseTermYears ?? 0) >= LONG_LEASE_MIN_YEARS;
}

/**
 * The whole-plot THB figure a Buy listing is ranked/filtered by: the sale price,
 * or — for a long leasehold priced by rent — the indexed lease total over the
 * term (per-rai rents are scaled by the plot area when known), the same figure
 * the card and the price headline print.
 * This lets leaseholds sort and range-filter alongside freehold sale prices
 * instead of sinking for lack of a `priceThb`.
 */
export function acquisitionValueThb(o: RealEstateObject): number | undefined {
  if (o.priceThb) return o.priceThb;
  if (!isLongLeaseAcquisition(o) || !o.leaseTermYears) return undefined;
  const monthly =
    o.rentPerMonth ?? (o.rentPerRaiMonth && o.areaRai ? o.rentPerRaiMonth * o.areaRai : undefined);
  // Индексация обязательна: карточка и заголовок цены показывают
  // escalatedLeaseTotalThb, и плоский total пускал в «до ฿20M» объект,
  // открывающийся как «≈ ฿22.9M всего». Фильтр и витрина считают одинаково.
  return monthly
    ? escalatedLeaseTotalThb(monthly, o.leaseTermYears, o.leaseEscPercent, o.leaseEscPeriodYears)
    : undefined;
}

/**
 * The price figure a listing is ranked/filtered by, given the active view:
 * acquisition value (Buy — sale price or lease total) or monthly rent (Rent).
 * Used by the sort so one accessor keeps every surface consistent.
 */
export function priceFieldOf(o: RealEstateObject, mode: ViewMode): number | undefined {
  return mode === "rent" ? monthlyRentOf(o) : acquisitionValueThb(o);
}

/**
 * A (short-term) rental: priced by a monthly rate but NOT a multi-year lease.
 * A long leasehold is an acquisition and belongs in Buy — see
 * `isLongLeaseAcquisition` — even though it carries a monthly figure.
 */
export function isRental(o: RealEstateObject): boolean {
  const hasMonthly = o.rentPerMonth != null || o.rentPerRaiMonth != null;
  // Цена продажи и leasehold-тенура — признаки приобретения: объект остаётся во
  // вкладке Buy, даже если у него заодно указана помесячная ставка. Без этого
  // лизхолд без проставленного срока («срок обсуждается») выпадал из
  // ?tenure=Leasehold, хотя секция /leasehold его показывала и туда же вела
  // кнопкой, а вилла с ценой И арендной ставкой исчезала из Buy целиком.
  if (o.priceThb != null || (o.tenure ?? []).includes("Leasehold")) return false;
  return hasMonthly && !isLongLeaseAcquisition(o);
}

/**
 * The home type a developer project sells, inferred from its title — so a
 * "Project" surfaces under the Villa/House/Apartment chip a buyer reaches for
 * ("Atmos Villas" → Villa). Null when the title carries no clear keyword, in
 * which case the project still matches its own "Project" type.
 */
function projectHomeType(o: RealEstateObject): ObjectType | null {
  if (o.type !== "Project") return null;
  const s = o.titleEn?.toLowerCase() ?? "";
  // Pick the keyword that leads the title (the head noun), not a fixed order —
  // "Ocean Dream House … designer villa" is a House, not a Villa.
  const at = (re: RegExp): number => re.exec(s)?.index ?? Infinity;
  const candidates: Array<[number, ObjectType]> = [
    [at(/\bvillas?\b/), "Villa"],
    [at(/\b(?:houses?|homes?)\b/), "House"],
    [at(/\b(?:apartments?|condos?|studios?|duplex(?:es)?)\b/), "Apartment"],
  ];
  candidates.sort((a, b) => a[0] - b[0]);
  return candidates[0][0] === Infinity ? null : candidates[0][1];
}

/**
 * Does an object match a selected Type chip? A project matches its own
 * "Project" type and, additionally, the home type it offers — so type=Villa
 * includes villa projects (Atmos), not just standalone villas.
 */
export function matchesTypeFilter(o: RealEstateObject, types: ObjectType[]): boolean {
  if (types.length === 0) return true;
  if (types.includes(o.type)) return true;
  const home = projectHomeType(o);
  return home != null && types.includes(home);
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

  const mode: ViewMode = get("mode") === "rent" ? "rent" : "buy";

  return {
    mode,
    type: multi(get("type"), VALID_TYPES),
    district: (get("district") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    tenure: multi(get("tenure"), VALID_TENURES),
    bedroomsMin: Number.isFinite(bedroomsMin) && bedroomsMin! > 0 ? bedroomsMin : undefined,
    priceMinThb: parseMillions(get("pmin")),
    priceMaxThb: parseMillions(get("pmax")),
    rentMinThb: parseThousands(get("rmin")),
    rentMaxThb: parseThousands(get("rmax")),
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
    // Buy/Rent partition: the Rent tab shows only rentals (a monthly rate is
    // set); the Buy tab shows everything else. Keeps the toggle a clean split
    // instead of mixing two price axes in one list.
    if (f.mode === "rent" ? !isRental(o) : isRental(o)) return false;

    if (!matchesTypeFilter(o, f.type)) return false;
    if (f.district.length > 0 && (!o.district || !f.district.includes(o.district))) return false;
    if (f.tenure.length > 0) {
      const owned = new Set(o.tenure ?? []);
      const anyMatch = f.tenure.some((t) => owned.has(t));
      if (!anyMatch) return false;
    }
    if (f.bedroomsMin !== undefined) {
      if (!o.bedrooms || o.bedrooms < f.bedroomsMin) return false;
    }
    // Price range runs on the active dimension (sale price vs monthly rent).
    if (f.mode === "rent") {
      const rent = monthlyRentOf(o);
      if (f.rentMinThb !== undefined && (!rent || rent < f.rentMinThb)) return false;
      if (f.rentMaxThb !== undefined && (!rent || rent > f.rentMaxThb)) return false;
    } else {
      // Buy range runs on the acquisition value — sale price, or a long
      // leasehold's total lease cost — so leaseholds match a ฿-range too.
      const val = acquisitionValueThb(o);
      if (f.priceMinThb !== undefined && (!val || val < f.priceMinThb)) return false;
      if (f.priceMaxThb !== undefined && (!val || val > f.priceMaxThb)) return false;
    }
    if (f.beachfront && !o.beachfront) return false;
    if (f.seaView && !o.seaView) return false;
    if (f.mountainView && !o.mountainView) return false;
    return true;
  };
}

export function applySort(
  objects: RealEstateObject[],
  sort: SortOption,
  mode: ViewMode = "buy",
): RealEstateObject[] {
  if (sort === "newest") {
    return [...objects].sort((a, b) =>
      (b.dateAdded ?? "").localeCompare(a.dateAdded ?? ""),
    );
  }
  if (sort === "price-asc" || sort === "price-desc") {
    // Sort by the active price dimension (sale price in Buy, monthly rent in
    // Rent). Objects without that figure always sink to the bottom.
    return [...objects].sort((a, b) => {
      const pa = priceFieldOf(a, mode);
      const pb = priceFieldOf(b, mode);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return sort === "price-asc" ? pa - pb : pb - pa;
    });
  }
  // 'featured' is already the upstream default sort in getPublicObjects()
  return objects;
}

/**
 * Has any filter been applied? Used by UI to show "Clear all" affordance.
 */
export function isFiltered(f: ListingsFilter): boolean {
  // `mode` is a view toggle, not a filter — "Clear all" keeps the visitor on the
  // Buy/Rent tab they chose and only drops the criteria below.
  return (
    f.type.length > 0 ||
    f.district.length > 0 ||
    f.tenure.length > 0 ||
    f.bedroomsMin !== undefined ||
    f.priceMinThb !== undefined ||
    f.priceMaxThb !== undefined ||
    f.rentMinThb !== undefined ||
    f.rentMaxThb !== undefined ||
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
  if (f.mode === "rent") bits.push("For rent");
  if (query?.trim()) bits.push(`"${query.trim()}"`);
  if (f.type.length) bits.push(f.type.join(" / "));
  if (f.district.length) bits.push(`in ${f.district.join(", ")}`);
  if (f.mode === "rent") {
    if (f.rentMinThb) bits.push(`from ฿${f.rentMinThb / 1_000}K/mo`);
    if (f.rentMaxThb) bits.push(`up to ฿${f.rentMaxThb / 1_000}K/mo`);
  } else {
    if (f.priceMinThb) bits.push(`from ฿${f.priceMinThb / 1_000_000}M`);
    if (f.priceMaxThb) bits.push(`up to ฿${f.priceMaxThb / 1_000_000}M`);
  }
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
  if (f.mode === "rent") bits.push("for rent");
  if (f.type.length) bits.push(f.type.join(" / "));
  if (f.district.length) bits.push(`in ${f.district.join(", ")}`);
  if (f.mode === "rent") {
    if (f.rentMinThb) bits.push(`from ฿${f.rentMinThb / 1_000}K/mo`);
    if (f.rentMaxThb) bits.push(`up to ฿${f.rentMaxThb / 1_000}K/mo`);
  } else {
    if (f.priceMinThb) bits.push(`from ฿${f.priceMinThb / 1_000_000}M`);
    if (f.priceMaxThb) bits.push(`up to ฿${f.priceMaxThb / 1_000_000}M`);
  }
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
  let hasRentals = false;
  for (const o of objects) {
    if (o.district) districts.add(o.district);
    types.add(o.type);
    if (isRental(o)) hasRentals = true;
  }
  return {
    districts: [...districts].sort(),
    types: VALID_TYPES.filter((t) => types.has(t)),
    // Drives the Buy/Rent toggle: with no rentals in the catalog (leaseholds
    // browse under Buy), the Rent tab would be a dead empty state.
    hasRentals,
  };
}

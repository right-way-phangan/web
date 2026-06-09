/**
 * Enum dictionaries — mirror of bot/dictionaries.py (single source of truth for
 * the amoCRM catalog 9077 enums). Used by the admin object form (selects) and
 * the object writer (validation). Values must match the catalog enum `value`
 * strings; the writer resolves them to enum_id case-insensitively at runtime.
 *
 * If an enum changes in amoCRM, update bot/dictionaries.py first, then sync
 * here. The writer fails soft on unknown values (skips the field), so a drift
 * degrades gracefully rather than breaking submission.
 */

export const DISTRICTS = [
  "Sri Thanu", "Madeau Wan", "Haad Yao", "Ban Tai", "Chaloklum",
  "Khao Khao Haeng", "Nai Wok", "Wok Tum", "Ban Khai", "Haad Salad",
  "Ban Nai Suan", "Phangan Hospital area", "Haad Rin", "Ban Nok",
  "Mae Haad", "Coconut lane area", "Thong Nai Pan", "Thong Nai Pan Noi",
  "Then Sadet", "Bottle Beach", "Hin Kong",
] as const;

// Document type — only the land document. NOT to be confused with Tenure.
export const DOCUMENT_TYPES = [
  "Chanote", "Nor Sor 3 Gor", "Nor Sor 3",
  "Sor Kor 1", "Sor Por Kor", "Por Bor Tor 5",
  "Condominium Title", "No documents / Possession only",
] as const;

// Tenure — ownership mode. Multi-select: an object can be offered in several at once.
export const TENURE_TYPES = [
  "Freehold (Thai)", "Leasehold", "Thai Company (foreign-controlled)",
  "Usufruct / Right of Habitation", "Superficies",
  "Condominium Foreign Quota", "Mixed / N.A.",
] as const;

// Object type — values present as enums in the catalog TYPE field.
// "Project" = off-plan developer project (single off-plan villa or multi-unit
// complex) → RW-P series.
export const OBJECT_TYPES = [
  "Land", "Villa", "House", "Apartment", "Townhouse", "Hotel", "Business", "Project",
] as const;

// Listing status (catalog STATUS enum). Only these are offered in intake;
// "Archive" exists in amoCRM but is not a publishable choice.
export const STATUSES = ["Active", "Reserved", "Sold", "Withdrawn"] as const;

// Construction stage (off-plan). Orthogonal to type.
export const STAGES = ["Ready", "Under construction", "Off-plan"] as const;
// Furnishing (buildings / projects).
export const FURNISHINGS = ["Full", "Partial", "None"] as const;

export const ZONES = ["Green", "Yellow", "Orange", "Red", "Purple", "Unknown"] as const;
export const ROAD_TYPES = ["Country", "Government", "Concrete", "Cement", "Dirt", "Private", "Asphalt"] as const;
export const WATER_TYPES = ["PWA", "Well", "Tank only", "None", "Unknown"] as const;
export const INTERNET_TYPES = ["Fiber", "4G/5G", "Limited", "None", "Unknown"] as const;
export const TERRAIN_TYPES = ["Flat", "Gentle slope", "Steep", "Mixed"] as const;
export const CONDITIONS = ["New", "Like new", "Good", "Needs minor work", "Major renovation"] as const;

// Feature checkboxes (all types) → boolean custom fields.
export const FEATURES = [
  { code: "SEA_VIEW", label: "Sea view" },
  { code: "MOUNTAIN_VIEW", label: "Mountain view" },
  { code: "JUNGLE_VIEW", label: "Jungle view" },
  { code: "BEACHFRONT", label: "Beachfront" },
  { code: "QUIET", label: "Quiet" },
  { code: "ELECTRICITY", label: "Electricity" },
] as const;

// Villa/House extra feature checkboxes.
export const VILLA_FEATURES = [
  { code: "POOL", label: "Pool" },
  { code: "PRIVATE_GARDEN", label: "Private garden" },
  { code: "PARKING", label: "Parking" },
  { code: "GATED", label: "Gated" },
] as const;

export type ObjectTypeValue = (typeof OBJECT_TYPES)[number];

/**
 * RW-number series prefix by object type (canonical scheme, CLAUDE.md):
 * Land → L, Villa/House → V, Apartment → A, Project → P.
 */
export function rwPrefixForType(type: string): string {
  switch (type) {
    case "Land":
      return "RW-L";
    case "Villa":
    case "House":
    case "Townhouse":
      return "RW-V";
    case "Apartment":
      return "RW-A";
    case "Project":
      return "RW-P";
    default:
      return "RW-X";
  }
}

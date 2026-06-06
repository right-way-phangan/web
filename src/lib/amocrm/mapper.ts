import type { AmoCatalogElement, AmoCustomFieldValue } from "./types";
import type {
  ObjectType,
  ObjectStatus,
  TenureType,
  RealEstateObject,
  Condition,
  DocumentType,
  RoadType,
  Stage,
  Furnishing,
} from "@/types/object";

function cfMap(el: AmoCatalogElement): Map<string, AmoCustomFieldValue> {
  const m = new Map<string, AmoCustomFieldValue>();
  for (const cf of el.custom_fields_values ?? []) {
    if (cf.field_code) m.set(cf.field_code, cf);
  }
  return m;
}

const str = (cf?: AmoCustomFieldValue) =>
  cf?.values?.[0]?.value != null ? String(cf.values[0].value) : undefined;
const num = (cf?: AmoCustomFieldValue) => {
  const v = cf?.values?.[0]?.value;
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const bool = (cf?: AmoCustomFieldValue) => cf?.values?.[0]?.value === true;
const multi = (cf?: AmoCustomFieldValue): string[] =>
  (cf?.values ?? []).map((v) => String(v.value)).filter(Boolean);

export function mapElementToObject(el: AmoCatalogElement): RealEstateObject {
  const cf = cfMap(el);

  return {
    id: el.id,
    rwNumber: str(cf.get("RW_NUMBER")) ?? el.name,
    circleCode: str(cf.get("CIRCLE_CODE")),
    titleEn: str(cf.get("TITLE_EN")) ?? el.name,

    type: (str(cf.get("TYPE")) as ObjectType) ?? "Land",
    status: (str(cf.get("STATUS")) as ObjectStatus) ?? "Active",
    district: str(cf.get("DISTRICT")),
    zone: str(cf.get("ZONE")),
    documentType: str(cf.get("DOC_TYPE")) as DocumentType | undefined,
    tenure: multi(cf.get("TENURE_TYPE")) as TenureType[],

    areaRai: num(cf.get("AREA_RAI")),
    areaSqm: num(cf.get("AREA_SQM")),
    altitude: num(cf.get("ALTITUDE")),
    terrain: str(cf.get("TERRAIN")),

    priceThb: num(cf.get("PRICE_THB")),
    pricePerRai: num(cf.get("PRICE_PER_RAI")),

    rentPerRaiMonth: num(cf.get("RENT_PER_RAI_MONTH")),
    leaseTermYears: num(cf.get("LEASE_TERM_YEARS")),
    leaseEscPercent: num(cf.get("LEASE_ESC_PERCENT")),
    leaseEscPeriodYears: num(cf.get("LEASE_ESC_PERIOD")),
    leaseEscNotes: str(cf.get("LEASE_ESC_NOTES")),
    leaseAdditionalTerms: str(cf.get("LEASE_ADD_TERMS")),

    bedrooms: num(cf.get("BEDROOMS")),
    bathrooms: num(cf.get("BATHROOMS")),
    buildYear: num(cf.get("BUILD_YEAR")),
    condition: str(cf.get("CONDITION")) as Condition | undefined,
    pool: bool(cf.get("POOL")),
    privateGarden: bool(cf.get("PRIVATE_GARDEN")),
    parking: bool(cf.get("PARKING")),
    gated: bool(cf.get("GATED")),

    seaView: bool(cf.get("SEA_VIEW")),
    beachfront: bool(cf.get("BEACHFRONT")),
    mountainView: bool(cf.get("MOUNTAIN_VIEW")),
    jungleView: bool(cf.get("JUNGLE_VIEW")),
    flatLand: bool(cf.get("FLAT_LAND")),
    quiet: bool(cf.get("QUIET")),
    electricity: bool(cf.get("ELECTRICITY")),

    roadType: str(cf.get("ROAD_TYPE")) as RoadType | undefined,
    waterType: str(cf.get("WATER_TYPE")),
    internetType: str(cf.get("INTERNET_TYPE")),

    stage: str(cf.get("STAGE")) as Stage | undefined,
    developer: str(cf.get("DEVELOPER")),
    completion: str(cf.get("COMPLETION")),
    paymentTerms: str(cf.get("PAYMENT_TERMS")),
    furnishing: str(cf.get("FURNISHING")) as Furnishing | undefined,
    netYieldPct: num(cf.get("NET_YIELD_PCT")),
    estNetIncomeYear: num(cf.get("EST_NET_INCOME_YEAR")),
    leasePrepayment: num(cf.get("LEASE_PREPAYMENT")),
    unitsTotal: num(cf.get("UNITS_TOTAL")),
    unitsAvailable: num(cf.get("UNITS_AVAILABLE")),

    ownerName: str(cf.get("OWNER")),
    buildingRules: str(cf.get("BUILDING_RULES")),
    reasonForSelling: str(cf.get("REASON_FOR_SELLING")),
    timeOnMarketMonths: num(cf.get("TIME_ON_MARKET_MONTHS")),
    dateAdded: str(cf.get("DATE_ADDED")),

    driveFolder: str(cf.get("DRIVE_FOLDER")),
    locationUrl: str(cf.get("LOCATION_URL")),
    ...parseLatLng(str(cf.get("LOCATION_URL"))),
    siteUrl: str(cf.get("SITE_URL")),
    descriptionRaw: str(cf.get("DESCRIPTION_RAW")),

    ...parsePhotos(str(cf.get("PHOTOS"))),
    docs: parseDocs(str(cf.get("DOCS"))),
  };
}

/** Extensions that mark a file as a document, never a public photo. */
const DOC_URL_EXT = /\.(pdf|docx?|xlsx?|pptx?|csv|txt|rtf|dwg|dxf|zip|rar|7z|kml|kmz|gpx)(\?|$)/i;

/** Parse DOCS — JSON array of {name,url}. Non-public; for the CRM card only. */
function parseDocs(
  raw: string | undefined,
): Array<{ name: string; url: string }> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const items = parsed.filter(
        (x): x is { name: string; url: string } =>
          x && typeof x.url === "string" && x.url.startsWith("http"),
      );
      return items.length ? items : undefined;
    }
  } catch {
    // ignore malformed
  }
  return undefined;
}

/**
 * Pull lat/lng out of a Google Maps location URL. Handles the bot's
 * `?q=LAT,LNG` form and the `@LAT,LNG` form. Returns {} when not parseable —
 * so an object simply has no map pin rather than a broken one.
 */
function parseLatLng(url: string | undefined): { lat?: number; lng?: number } {
  if (!url) return {};
  const m = url.match(/[@?q=]?(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (!m) return {};
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  // Sanity: Koh Phangan sits near 9.7°N, 100°E — keep only plausible coords.
  if (lat < 9 || lat > 10.5 || lng < 99 || lng > 101) return {};
  return { lat, lng };
}

/**
 * PHOTOS is a textarea custom field holding a JSON array of public image URLs
 * uploaded to Vercel Blob during the Drive→Blob migration. Returns
 * {coverImage, gallery} so the spread above keeps the field-list flat.
 */
function parsePhotos(raw: string | undefined): {
  coverImage?: string;
  gallery?: string[];
} {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Publication rule (read-side guard): drop any non-image URL that may
      // have slipped into PHOTOS, so documents never render on the site.
      const urls = parsed.filter(
        (x): x is string =>
          typeof x === "string" && x.startsWith("http") && !DOC_URL_EXT.test(x),
      );
      if (urls.length === 0) return {};
      return { coverImage: urls[0], gallery: urls };
    }
  } catch {
    // Field present but not valid JSON — ignore silently, fall back to placeholder.
  }
  return {};
}

import type { AmoCatalogElement, AmoCustomFieldValue } from "./types";
import type {
  ObjectType,
  ObjectStatus,
  TenureType,
  RealEstateObject,
  Condition,
  DocumentType,
  RoadType,
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

    ownerName: str(cf.get("OWNER")),
    buildingRules: str(cf.get("BUILDING_RULES")),
    reasonForSelling: str(cf.get("REASON_FOR_SELLING")),
    timeOnMarketMonths: num(cf.get("TIME_ON_MARKET_MONTHS")),
    dateAdded: str(cf.get("DATE_ADDED")),

    driveFolder: str(cf.get("DRIVE_FOLDER")),
    locationUrl: str(cf.get("LOCATION_URL")),
    siteUrl: str(cf.get("SITE_URL")),
    descriptionRaw: str(cf.get("DESCRIPTION_RAW")),
  };
}

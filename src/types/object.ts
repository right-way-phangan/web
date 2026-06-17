/**
 * Domain type — RealEstateObject — normalized view of an amoCRM catalog element.
 * Used by all UI components. Mapper lives in `src/lib/amocrm/mapper.ts`.
 */

export type ObjectType =
  | "Land" | "Villa" | "House" | "Apartment"
  | "Townhouse" | "Hotel" | "Business" | "Project";
export type ObjectStatus = "Active" | "Hold" | "Sold" | "Withdrawn" | "Reserved";
export type TenureType = "Freehold" | "Leasehold";
export type DocumentType = "Chanote" | "NS3" | "NS3K" | "Other";
export type RoadType = "Concrete" | "Asphalt" | "Dirt" | "None";
export type Condition = "New" | "Good" | "Needs renovation" | "Off-plan";
export type Stage = "Ready" | "Under construction" | "Off-plan";
export type Furnishing = "Full" | "Partial" | "None";

/** Роль контакта по объекту — кто это в сделке. */
export type ContactRole = "owner" | "broker" | "caretaker" | "lawyer" | "other";

/**
 * Контакт продавца по объекту («кто собственник / с кем связываться»).
 * Конфиденциально (PII): режется в sanitizePublicObject, на публичный сайт не
 * попадает. Несколько на объект, у каждого роль и свои каналы связи.
 */
export interface ObjectContact {
  id?: number;
  role: ContactRole;
  name?: string;
  phone?: string;
  line?: string;       // основной канал у тайских собственников
  whatsapp?: string;
  telegram?: string;
  note?: string;
  isPrimary?: boolean; // с кого начинать — показывается в обзвоне и таблице
}

export interface RealEstateObject {
  // Identity
  id: number;             // amoCRM element id
  rwNumber: string;       // RW-L0001 / RW-V0001 / RW-A0001 / RW-P0001
  circleCode?: string;    // legacy migration code
  titleEn: string;

  // Classification
  type: ObjectType;
  status: ObjectStatus;
  district?: string;
  zone?: string;
  documentType?: DocumentType;
  tenure?: TenureType[];

  // Geometry
  areaRai?: number;
  areaSqm?: number;
  areaNote?: string;       // free-text area breakdown (plot/living/terrace/pool…)
  altitude?: number;
  terrain?: string;

  // Pricing (Land sale)
  priceThb?: number;
  pricePerRai?: number;
  /** Derived at fetch time from the daily THB→USD rate — not stored in CRM. */
  priceUsd?: number;

  // Pricing (Leasehold)
  rentPerRaiMonth?: number;
  /**
   * Whole-unit monthly rent for buildings (villa/house/apartment), THB/month.
   * The Rent view's price axis for non-land; land uses rentPerRaiMonth instead.
   */
  rentPerMonth?: number;
  leaseTermYears?: number;
  leaseEscPercent?: number;
  leaseEscPeriodYears?: number;
  leaseEscNotes?: string;
  leaseAdditionalTerms?: string;

  // Building (Villa/House/Apartment)
  bedrooms?: number;
  bathrooms?: number;
  buildYear?: number;
  condition?: Condition;
  pool?: boolean;
  privateGarden?: boolean;
  parking?: boolean;
  gated?: boolean;

  // Features
  seaView: boolean;
  beachfront: boolean;
  mountainView: boolean;
  jungleView: boolean;
  flatLand: boolean;
  quiet: boolean;
  electricity: boolean;

  // Infrastructure
  roadType?: RoadType;
  waterType?: string;
  internetType?: string;

  // Off-plan / developer project
  stage?: Stage;
  developer?: string;
  completion?: string;        // "Q4 2026" / "~8 months from start"
  paymentTerms?: string;
  furnishing?: Furnishing;
  netYieldPct?: number;
  estNetIncomeYear?: number;  // THB/year
  leasePrepayment?: number;   // leasehold land lump sum, THB
  unitsTotal?: number;
  unitsAvailable?: number;

  // Developer-project landing extras (parsed from textarea custom fields)
  videoUrls?: string[];                       // VIDEO_URLS — one URL per line
  floorplanUrls?: string[];                   // FLOORPLAN_URLS — image URL per line
  priceStages?: Array<{ label: string; value: string }>; // PRICE_STAGES — "stage | price"
  timeline?: Array<{ date: string; event: string }>;     // TIMELINE — "date | event"
  team?: Array<{ role: string; name: string }>;          // TEAM — "role | name"

  // Operational
  ownerName?: string;             // legacy free-text owner (мигрирован в contacts)
  contacts?: ObjectContact[];     // структурные контакты продавца — НЕ публичное
  buildingRules?: string;
  reasonForSelling?: string;
  timeOnMarketMonths?: number;
  dateAdded?: string;

  // Due diligence (двухуровневая система, чек-лист DD v0.2 2026-06-12)
  ddStatus?: string;   // Pending | Vetted | Full DD | Red flag
  ddDate?: string;     // YYYY-MM-DD — дата вердикта
  ddLawyer?: string;   // кто дал вердикт — НЕ публичное (режется в sanitizePublicObject)
  ddChecklist?: Record<string, boolean>; // пункты V1–V7 — НЕ публичное

  // Обзвон собственников (/admin/outreach) — НЕ публичное
  outreachStatus?: string; // confirmed | archived | leasehold_ok | no_answer
  outreachNote?: string;
  outreachDate?: string;
  outreachAttempts?: number;

  // External
  driveFolder?: string;       // Google Drive
  locationUrl?: string;       // Google Maps
  lat?: number;               // parsed from locationUrl, for map pins
  lng?: number;
  plotPolygon?: Array<[number, number]>; // traced plot contour, [lat, lng] ring (own DB only)
  siteUrl?: string;           // current Laravel site (legacy)

  // Photos (resolved separately from Drive). Public.
  coverImage?: string;
  gallery?: string[];

  // Documents / working files — NON-public. Kept on the card, never rendered
  // on the site. Publication rule: only photos go public; docs stay internal.
  docs?: Array<{ name: string; url: string }>;

  // Description
  descriptionRaw?: string;    // legacy amoCRM notes — archived, NOT shown publicly
  descriptionManualEn?: string; // deliberate manual override (admin) — wins over auto
  descriptionManualRu?: string;
}

/** Compact neighbour for the object map's "other listings nearby" pins. */
export interface NearbyListing {
  rw: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
  priceThb?: number;
}

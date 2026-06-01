/**
 * Domain type — RealEstateObject — normalized view of an amoCRM catalog element.
 * Used by all UI components. Mapper lives in `src/lib/amocrm/mapper.ts`.
 */

export type ObjectType = "Land" | "Villa" | "House" | "Apartment" | "Project";
export type ObjectStatus = "Active" | "Hold" | "Sold" | "Withdrawn" | "Reserved";
export type TenureType = "Freehold" | "Leasehold";
export type DocumentType = "Chanote" | "NS3" | "NS3K" | "Other";
export type RoadType = "Concrete" | "Asphalt" | "Dirt" | "None";
export type Condition = "New" | "Good" | "Needs renovation" | "Off-plan";

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
  altitude?: number;
  terrain?: string;

  // Pricing (Land sale)
  priceThb?: number;
  pricePerRai?: number;

  // Pricing (Leasehold)
  rentPerRaiMonth?: number;
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

  // Operational
  ownerName?: string;
  buildingRules?: string;
  reasonForSelling?: string;
  timeOnMarketMonths?: number;
  dateAdded?: string;

  // External
  driveFolder?: string;       // Google Drive
  locationUrl?: string;       // Google Maps
  siteUrl?: string;           // current Laravel site (legacy)

  // Photos (resolved separately from Drive)
  coverImage?: string;
  gallery?: string[];

  // Description
  descriptionRaw?: string;    // legacy textarea
}

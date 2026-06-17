/**
 * Auto-generated listing descriptions — replaces the old free-text amoCRM notes.
 *
 * Two layers, mirroring object-title.ts:
 *  - buildObjectDescription(): pure, deterministic, dependency-free. Composes a
 *    readable, informative, SEO/GEO-friendly description (lead + context + key
 *    facts) in EN or RU straight from the object's structured fields. Works today
 *    with no API key.
 *  - [LATER] an async generateObjectDescription() Claude-polish wrapper can be
 *    added here exactly like generateObjectTitle() once ANTHROPIC_API_KEY is on —
 *    it would take this template output as the grounding facts and return prose,
 *    always falling back to the template. Kept template-only for now by choice.
 *
 * House rules honoured: no price / no commission segment in the prose (those live
 * in the structured spec table); the manual `descriptionRaw` override always wins
 * at the call site (the human "lock"). The lead sentence is answer-shaped so AI
 * answer engines (GEO) can lift it cleanly; the bullets are scannable for SEO.
 */
import type { RealEstateObject } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";

export interface ObjectDescription {
  /** One answer-shaped sentence — "what is this". */
  lead: string;
  /** 1–2 sentences of context (location character, access, tenure, vetting). */
  body: string;
  /** Scannable key facts. */
  bullets: string[];
}

// ---- deterministic variety (FNV-1a + fmix32), same approach as object-title ----
function seed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
function pick<T>(rw: string, salt: string, arr: readonly T[]): T {
  return arr[seed(`${rw}:${salt}`) % arr.length];
}
function tidy(s: string): string {
  return s.replace(/\s+/g, " ").replace(/\s+([,.])/g, "$1").replace(/,\s*,/g, ",").trim();
}
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

type FeatureKey = "beachfront" | "seaView" | "mountainView" | "jungle" | "flat" | null;

// Inland districts where "the heart of the island" reads naturally (matches the
// hand-written /districts copy + object-title.ts).
const CENTRAL = new Set(["Madeau Wan", "Ban Nai Suan", "Coconut lane area", "Wok Tum"]);

interface Facts {
  rw: string;
  isLand: boolean;
  isProject: boolean;
  district?: string;
  central: boolean;
  rai?: number;
  sqm?: number;
  beds?: number;
  baths?: number;
  doc?: RealEstateObject["documentType"];
  freehold: boolean;
  leasehold: boolean;
  feature: FeatureKey;
  flat: boolean;
  quiet: boolean;
  road?: RealEstateObject["roadType"];
  electricity: boolean;
  water?: string;
  internet?: string;
  pool: boolean;
  garden: boolean;
  parking: boolean;
  gated: boolean;
  brandNew: boolean;
  buildYear?: number;
  furnished: boolean;
  developer?: string;
  completion?: string;
  unitsTotal?: number;
  unitsAvailable?: number;
  vetted: boolean;
}

function primaryFeature(o: RealEstateObject): FeatureKey {
  if (o.beachfront) return "beachfront";
  if (o.seaView) return "seaView";
  if (o.mountainView) return "mountainView";
  if (o.jungleView) return "jungle";
  if (o.flatLand) return "flat";
  return null;
}

function extract(o: RealEstateObject): Facts {
  const tenure = o.tenure ?? [];
  return {
    rw: o.rwNumber || `${o.type}${o.district ?? ""}`,
    isLand: o.type === "Land",
    isProject: o.type === "Project" || o.stage === "Off-plan",
    district: o.district,
    central: o.district ? CENTRAL.has(o.district) : false,
    rai: o.areaRai,
    sqm: o.areaSqm,
    beds: o.bedrooms,
    baths: o.bathrooms,
    doc: o.documentType,
    freehold: tenure.includes("Freehold"),
    leasehold: tenure.includes("Leasehold"),
    feature: primaryFeature(o),
    flat: !!o.flatLand,
    quiet: !!o.quiet,
    road: o.roadType,
    electricity: !!o.electricity,
    water: o.waterType,
    internet: o.internetType,
    pool: !!o.pool,
    garden: !!o.privateGarden,
    parking: !!o.parking,
    gated: !!o.gated,
    brandNew: o.condition === "New",
    buildYear: o.buildYear,
    furnished: o.furnishing === "Full" || o.furnishing === "Partial",
    developer: o.developer,
    completion: o.completion,
    unitsTotal: o.unitsTotal,
    unitsAvailable: o.unitsAvailable,
    vetted: o.ddStatus === "Vetted" || o.ddStatus === "Full DD",
  };
}

// ---------------------------------------------------------------- localisation
const L = {
  en: {
    docLabel: { Chanote: "Chanote", NS3: "Nor Sor 3", NS3K: "Nor Sor 3 Gor", Other: "title deed" },
    featAdj: {
      beachfront: "beachfront",
      seaView: "sea-view",
      mountainView: "mountain-view",
      jungle: "jungle",
      flat: "level",
    } as Record<NonNullable<FeatureKey>, string>,
    featNoun: {
      beachfront: "direct beach access",
      seaView: "open sea views",
      mountainView: "green mountain views",
      jungle: "lush jungle privacy",
      flat: "flat, build-ready ground",
    } as Record<NonNullable<FeatureKey>, string>,
    landNoun: ["building plot", "land plot", "plot"],
    onKoh: "on Koh Phangan",
    inHeart: "in the heart of the island",
    roads: { Concrete: "concrete road", Asphalt: "asphalt road", Dirt: "dirt track", None: "no road access yet" },
    bullets: {
      rai: (n: number) => `${n} rai`,
      sqm: (n: number) => `${n.toLocaleString("en-US")} m²`,
      bedbath: (b?: number, ba?: number) =>
        [b ? `${b} bed` : "", ba ? `${ba} bath` : ""].filter(Boolean).join(" · "),
      tenure: (fh: boolean, lh: boolean) => (fh && lh ? "Freehold or leasehold" : lh ? "Leasehold" : fh ? "Freehold" : ""),
      built: (y: number) => `Built ${y}`,
      brandNew: "Brand-new",
      pool: "Private pool",
      garden: "Private garden",
      parking: "Parking",
      gated: "Gated",
      furnished: "Furnished",
      power: "Electricity connected",
      vetted: "Vetted — Right Way DD (zone, title, access)",
      unitsLeft: (a: number, t: number) => `${a} of ${t} units available`,
      completion: (c: string) => `Completion ${c}`,
      developer: (d: string) => `Developer: ${d}`,
    },
  },
  ru: {
    docLabel: { Chanote: "Chanote", NS3: "Nor Sor 3", NS3K: "Nor Sor 3 Gor", Other: "документ о праве" },
    featAdj: {
      beachfront: "на первой линии",
      seaView: "с видом на море",
      mountainView: "с видом на горы",
      jungle: "в окружении джунглей",
      flat: "ровный",
    } as Record<NonNullable<FeatureKey>, string>,
    featNoun: {
      beachfront: "выходом прямо к пляжу",
      seaView: "открытым видом на море",
      mountainView: "зелёным видом на горы",
      jungle: "уединением среди джунглей",
      flat: "ровным участком под застройку",
    } as Record<NonNullable<FeatureKey>, string>,
    landNoun: ["участок под застройку", "земельный участок", "участок"],
    onKoh: "на Ко Пангане",
    inHeart: "в центральной части острова",
    roads: { Concrete: "бетонная дорога", Asphalt: "асфальтовая дорога", Dirt: "грунтовая дорога", None: "подъезд пока не готов" },
    bullets: {
      rai: (n: number) => `${n.toLocaleString("ru-RU")} рай`,
      sqm: (n: number) => `${n.toLocaleString("ru-RU")} м²`,
      bedbath: (b?: number, ba?: number) =>
        [b ? `${b} сп.` : "", ba ? `${ba} с/у` : ""].filter(Boolean).join(" · "),
      tenure: (fh: boolean, lh: boolean) => (fh && lh ? "Фрихолд или лизхолд" : lh ? "Лизхолд" : fh ? "Фрихолд" : ""),
      built: (y: number) => `Построен ${y}`,
      brandNew: "Новый",
      pool: "Свой бассейн",
      garden: "Свой сад",
      parking: "Парковка",
      gated: "Закрытая территория",
      furnished: "С мебелью",
      power: "Электричество подключено",
      vetted: "Vetted — проверка Right Way (зона, документ, доступ)",
      unitsLeft: (a: number, t: number) => `Свободно ${a} из ${t} юнитов`,
      completion: (c: string) => `Срок сдачи ${c}`,
      developer: (d: string) => `Застройщик: ${d}`,
    },
  },
} as const;

function where(f: Facts, locale: Locale): string {
  const d = f.district;
  const t = L[locale];
  if (!d) return t.onKoh;
  if (f.central) return pick(f.rw, "loc", locale === "ru" ? [`в районе ${d}`, t.inHeart] : [`in ${d}`, t.inHeart]);
  return locale === "ru" ? `в районе ${d}` : pick(f.rw, "loc", [`in ${d}`, `in ${d}, Koh Phangan`]);
}

// Primary view feature as a TRAILING clause (never a pre-noun adjective — keeps
// both languages grammatical). "flat" carries no clause; it surfaces in body.
function featClause(f: Facts, locale: Locale): string {
  if (!f.feature || f.feature === "flat") return "";
  return locale === "ru" ? ` с ${L.ru.featNoun[f.feature]}` : ` with ${L.en.featNoun[f.feature]}`;
}

function leadEn(f: Facts): string {
  const t = L.en;
  const loc = where(f, "en");
  const fc = featClause(f, "en");
  if (f.isProject) {
    const units = f.unitsTotal ? `, ${f.unitsAvailable ?? f.unitsTotal} of ${f.unitsTotal} units available` : "";
    return tidy(`An off-plan ${f.pool ? "pool " : ""}villa project ${loc}${fc}${units}.`);
  }
  if (f.isLand) {
    const noun = pick(f.rw, "noun", t.landNoun);
    const size = f.rai ? `${f.rai}-rai ` : "";
    return tidy(`A ${size}${noun} ${loc}${fc}.`);
  }
  const beds = f.beds ? `${f.beds}-bedroom ` : "";
  const noun = f.pool ? "pool villa" : "home";
  const lead = f.brandNew ? "A brand-new" : "A";
  return tidy(`${lead} ${beds}${noun} ${loc}${fc}.`);
}

function leadRu(f: Facts): string {
  const t = L.ru;
  const loc = where(f, "ru");
  const fc = featClause(f, "ru");
  if (f.isProject) {
    const units = f.unitsTotal ? `, свободно ${f.unitsAvailable ?? f.unitsTotal} из ${f.unitsTotal} юнитов` : "";
    return tidy(`Строящийся проект ${f.pool ? "вилл с бассейном" : "вилл"} ${loc}${fc}${units}.`);
  }
  if (f.isLand) {
    const noun = pick(f.rw, "noun", t.landNoun);
    const size = f.rai ? `, ${f.rai.toLocaleString("ru-RU")} рай` : "";
    return tidy(`${cap(noun)} ${loc}${fc}${size}.`);
  }
  const beds = f.beds ? `${f.beds}-спальная ` : "";
  const noun = f.pool ? "вилла с бассейном" : "дом";
  const newLead = f.brandNew ? "Новая " : "";
  return tidy(`${newLead}${beds}${noun} ${loc}${fc}.`);
}

function bodyEn(f: Facts): string {
  const parts: string[] = [];
  if (f.quiet) parts.push("Set in a quiet, private spot");
  else if (f.central) parts.push("Central and well-connected");
  if (f.flat && f.isLand) parts.push("the ground is level and build-ready");
  // Guard the map lookup: roadType in the DB can be a dirty value outside the
  // enum (e.g. "Government Road") → skip rather than render "undefined".
  if (f.road && f.road !== "None" && L.en.roads[f.road]) parts.push(`reached by ${L.en.roads[f.road]}`);
  let s = parts.length ? tidy(parts.join(", ")) + "." : "";
  if (s) s = s.charAt(0).toUpperCase() + s.slice(1);
  if (f.leasehold && !f.freehold) s += " Offered on a registered long lease.";
  if (f.vetted) s += " Listing-vetted by Right Way — zone, title type and access checked before publication.";
  return tidy(s);
}

function bodyRu(f: Facts): string {
  const parts: string[] = [];
  if (f.quiet) parts.push("Расположен в тихом, уединённом месте");
  else if (f.central) parts.push("Центрально и с удобным доступом");
  if (f.flat && f.isLand) parts.push("участок ровный, готов под застройку");
  if (f.road && f.road !== "None" && L.ru.roads[f.road]) parts.push(`подъезд — ${L.ru.roads[f.road]}`);
  let s = parts.length ? tidy(parts.join(", ")) + "." : "";
  if (s) s = s.charAt(0).toUpperCase() + s.slice(1);
  if (f.leasehold && !f.freehold) s += " Оформляется в долгосрочную аренду (registered lease).";
  if (f.vetted) s += " Объект проверен Right Way — зона, тип документа и доступ подтверждены до публикации.";
  return tidy(s);
}

function bullets(f: Facts, locale: Locale): string[] {
  const b = L[locale].bullets;
  const out: string[] = [];
  if (f.isLand && f.rai) out.push(b.rai(f.rai));
  else if (f.sqm) out.push(b.sqm(f.sqm));
  const bb = b.bedbath(f.beds, f.baths);
  if (!f.isLand && bb) out.push(bb);
  const tenure = b.tenure(f.freehold, f.leasehold);
  // Fall back to the raw value if documentType isn't a known enum key (dirty data).
  const docLabel = f.doc ? (L[locale].docLabel[f.doc] ?? f.doc) : "";
  if (docLabel || tenure) out.push([docLabel, tenure].filter(Boolean).join(" · "));
  if (f.isProject) {
    if (f.unitsTotal && f.unitsAvailable != null) out.push(b.unitsLeft(f.unitsAvailable, f.unitsTotal));
    if (f.completion) out.push(b.completion(f.completion));
    if (f.developer) out.push(b.developer(f.developer));
  } else {
    if (f.brandNew) out.push(b.brandNew);
    else if (f.buildYear) out.push(b.built(f.buildYear));
    if (f.pool) out.push(b.pool);
    if (f.gated) out.push(b.gated);
    if (f.furnished) out.push(b.furnished);
    if (f.garden) out.push(b.garden);
    if (f.parking) out.push(b.parking);
  }
  if (f.electricity) out.push(b.power);
  // Vetted is stated as a body sentence (richer for trust/GEO), not duplicated here.
  // Cap to keep the list scannable; lead with the most search-relevant facts.
  return out.filter(Boolean).slice(0, 7);
}

/**
 * Pure, deterministic description from the object's structured fields.
 */
export function buildObjectDescription(o: RealEstateObject, locale: Locale): ObjectDescription {
  const f = extract(o);
  return {
    lead: locale === "ru" ? leadRu(f) : leadEn(f),
    body: locale === "ru" ? bodyRu(f) : bodyEn(f),
    bullets: bullets(f, locale),
  };
}

/**
 * Plain-text flatten for meta description / JSON-LD (lead + body + bullets).
 * `cleanMetaDescription` at the call site trims it to the SEO length.
 */
export function objectDescriptionText(o: RealEstateObject, locale: Locale): string {
  const d = buildObjectDescription(o, locale);
  const sep = locale === "ru" ? "Ключевое: " : "Key facts: ";
  return tidy([d.lead, d.body, d.bullets.length ? sep + d.bullets.join("; ") + "." : ""].filter(Boolean).join(" "));
}

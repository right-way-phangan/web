/**
 * SEO-friendly listing-title generator for new objects.
 *
 * Two layers, mirroring the image classifier pattern (lib/classify/image-doc.ts):
 *  - buildTemplateTitle(): pure, deterministic, dependency-free. Composes a
 *    correct, appealing, varied EN title from the object's attributes. Works
 *    today with no API key, and is reused as the render-time fallback in the
 *    amoCRM mapper for any title-less (legacy/bot) object.
 *  - generateObjectTitle(): async wrapper that asks Claude for an extra-polished
 *    title when ANTHROPIC_API_KEY is set, and falls back to the template
 *    otherwise (or on any failure / suspicious output).
 *
 * Titles are sentence-case, anchor on the district, never include price, and
 * mention at most one standout feature — matching the house style of the
 * existing hand-written listing titles.
 */

export interface TitleAttrs {
  rwNumber: string; // stable variety seed → avoids duplicate titles
  type: string; // OBJECT_TYPES value
  district?: string;
  rai?: number; // land plot size (rounded)
  bedrooms?: number;
  unitsTotal?: number; // off-plan complex size
  documentType?: string; // "Chanote", "Nor Sor 3 Gor", …
  beachfront?: boolean;
  seaView?: boolean;
  mountainView?: boolean;
  jungleView?: boolean;
  flat?: boolean; // flat / level terrain
  quiet?: boolean;
  pool?: boolean;
  brandNew?: boolean; // condition New
  offplan?: boolean; // Project / off-plan stage
}

// ---- deterministic variety ----
// FNV-1a hash. Each phrasing slot draws from an independently *salted* hash of
// the RW number, so two similar objects (same district/feature/size) decorrelate
// across slots instead of collapsing onto one identical title.
function seed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Avalanche (MurmurHash3 fmix32): FNV's low bits are weak, and the pickers
  // take `% len` of them — without this, near-identical RW strings cluster onto
  // the same choice and produce duplicate titles.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
type Picker = <T>(arr: readonly T[], salt: string) => T;
function makePick(rw: string): Picker {
  return <T>(arr: readonly T[], salt: string): T => arr[seed(`${rw}:${salt}`) % arr.length];
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
function tidy(s: string): string {
  return s.replace(/\s+/g, " ").replace(/\s+([,.])/g, "$1").trim();
}

type FeatureKey = "beachfront" | "seaView" | "mountainView" | "jungle" | "flat" | null;

// Highest-impact feature wins (the one buyers search and pay for).
function primaryFeature(a: TitleAttrs): FeatureKey {
  if (a.beachfront) return "beachfront";
  if (a.seaView) return "seaView";
  if (a.mountainView) return "mountainView";
  if (a.jungleView || a.quiet) return "jungle";
  if (a.flat) return "flat";
  return null;
}

// Feature expressed as an adjective placed before the noun.
const FEATURE_ADJ: Record<NonNullable<FeatureKey>, readonly string[]> = {
  beachfront: ["beachfront"],
  seaView: ["sea-view", "sea-view", "panoramic sea-view"],
  mountainView: ["mountain-view"],
  jungle: ["jungle", "secluded jungle"],
  flat: ["level", "easy-build"],
};
// Feature expressed as a trailing clause ("… with sweeping sea views").
const FEATURE_CLAUSE: Record<NonNullable<FeatureKey>, readonly string[]> = {
  beachfront: ["direct beach access", "absolute beachfront"],
  seaView: ["sweeping sea views", "panoramic sea views", "open sea views"],
  mountainView: ["mountain views", "green mountain views"],
  jungle: ["lush jungle privacy", "a quiet jungle setting"],
  flat: ["a flat, build-ready aspect", "level, easy-build ground"],
};
// Neutral evocative adjective when there is no standout feature.
const EVOCATIVE = ["Prime", "Sought-after", "Rare", "Exceptional", "Well-placed"] as const;

const LAND_NOUNS = ["plot", "land plot", "building plot", "plot of land"] as const;

// Inland districts where "the heart of the island" reads naturally — matches
// the house style of the hand-written copy (/districts, existing titles).
const CENTRAL = new Set(["Madeau Wan", "Ban Nai Suan", "Coconut lane area", "Wok Tum"]);

function buildingNouns(a: TitleAttrs): readonly string[] {
  switch (a.type) {
    case "Villa":
      return a.pool ? ["pool villa", "villa"] : ["villa", "residence"];
    case "House":
      return a.pool ? ["pool home", "home"] : ["home", "house", "residence"];
    case "Apartment":
      return ["apartment", "residence"];
    case "Townhouse":
      return ["townhouse"];
    case "Hotel":
      return ["hotel", "hospitality property"];
    case "Business":
      return ["commercial property", "business premises"];
    default:
      return ["property"];
  }
}

function where(a: TitleAttrs, p: Picker, allowKoh = true): string {
  const d = a.district;
  if (!d) return "on Koh Phangan";
  if (CENTRAL.has(d)) return p([`in ${d}`, `in ${d}`, "in the heart of the island"], "loc");
  if (allowKoh) return p([`in ${d}`, `in ${d}`, `in ${d}`, `in ${d}, Koh Phangan`], "loc");
  return `in ${d}`;
}

function landTitle(a: TitleAttrs, p: Picker): string {
  const noun = p(LAND_NOUNS, "noun");
  const size = a.rai && a.rai >= 1 ? `${a.rai}-rai` : "";
  const feat = primaryFeature(a);
  const loc = where(a, p);

  // No standout feature → lead with an evocative adjective or the document type.
  if (!feat) {
    if (a.documentType === "Chanote" && seed(`${a.rwNumber}:doc`) % 2 === 0) {
      return tidy(`Chanote ${size} ${noun} ${loc}`);
    }
    return tidy(`${p(EVOCATIVE, "evoc")} ${size} ${noun} ${loc}`);
  }

  const variant = seed(`${a.rwNumber}:var`) % 3;
  if (variant === 0) return tidy(`${cap(p(FEATURE_ADJ[feat], "adj"))} ${size} ${noun} ${loc}`);
  if (variant === 1) {
    const clause = p(FEATURE_CLAUSE[feat], "clause");
    return tidy(`${cap(size || noun)}${size ? ` ${noun}` : ""} with ${clause} ${loc}`);
  }
  return tidy(`${p(EVOCATIVE, "evoc")} ${p(FEATURE_ADJ[feat], "adj")} ${size} ${noun} ${loc}`);
}

function buildingTitle(a: TitleAttrs, p: Picker): string {
  const beds = a.bedrooms ? `${a.bedrooms}-bedroom` : "";
  const noun = p(buildingNouns(a), "noun");
  const feat = primaryFeature(a);
  const loc = where(a, p);
  const newLead = a.brandNew ? "Brand-new" : "";

  if (!feat) {
    const lead = newLead || p(EVOCATIVE, "evoc");
    return tidy(`${lead} ${beds} ${noun} ${loc}`);
  }

  const variant = seed(`${a.rwNumber}:var`) % 3;
  if (variant === 0) {
    const adj = p(FEATURE_ADJ[feat], "adj");
    return tidy(`${newLead ? `${newLead} ${adj}` : cap(adj)} ${beds} ${noun} ${loc}`);
  }
  if (variant === 1) {
    const clause = p(FEATURE_CLAUSE[feat], "clause");
    const head = newLead ? `${newLead} ${beds} ${noun}` : `${cap(beds || noun)}${beds ? ` ${noun}` : ""}`;
    return tidy(`${head} with ${clause} ${loc}`);
  }
  const lead = newLead || p(EVOCATIVE, "evoc");
  return tidy(`${lead} ${p(FEATURE_ADJ[feat], "adj")} ${beds} ${noun} ${loc}`);
}

function projectTitle(a: TitleAttrs, p: Picker): string {
  const many = (a.unitsTotal ?? 0) > 1;
  const beds = a.bedrooms ? `${a.bedrooms}-bedroom` : "";
  const core = `${a.pool ? "pool " : ""}${many ? "villas" : "villa"}`;
  const feat = primaryFeature(a);
  const loc = where(a, p);
  const lead = seed(`${a.rwNumber}:lead`) % 2 === 0 ? "Off-plan" : "New-build";

  if (feat && seed(`${a.rwNumber}:fv`) % 2 === 0) {
    return tidy(`${lead} ${p(FEATURE_ADJ[feat], "adj")} ${beds} ${core} ${loc}`);
  }
  return tidy(`${lead} ${beds} ${core} ${loc}`);
}

/**
 * Pure, deterministic title from attributes. Always returns a non-empty,
 * sentence-cased English string ≤ ~70 chars.
 */
export function buildTemplateTitle(a: TitleAttrs): string {
  const p = makePick(a.rwNumber || `${a.type}${a.district ?? ""}`);
  let title: string;
  if (a.type === "Project" || a.offplan) title = projectTitle(a, p);
  else if (a.type === "Land") title = landTitle(a, p);
  else if (["Villa", "House", "Apartment", "Townhouse", "Hotel", "Business"].includes(a.type))
    title = buildingTitle(a, p);
  else title = tidy(`${p(EVOCATIVE, "evoc")} ${a.type.toLowerCase()} ${where(a, p)}`);

  title = cap(tidy(title));

  // Length guard: fall back to a compact, feature-anchored form.
  if (title.length > 72) {
    const feat = primaryFeature(a);
    const noun = a.type === "Land" ? "plot" : p(buildingNouns(a), "noun");
    const adj = feat ? p(FEATURE_ADJ[feat], "adj") : "";
    title = cap(tidy(`${adj} ${noun} ${where(a, p, false)}`));
  }
  return title;
}

// ---- LLM polish layer (optional, auto-enabled when the key is present) ----

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
const API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You write listing titles for a boutique real-estate agency on Koh Phangan, Thailand.
Write ONE English title for the property described by the user's JSON facts.

Rules:
- Sentence case (capitalise only the first word and proper nouns / Koh Phangan / Chanote).
- 4–10 words, at most ~65 characters.
- Anchor on the property type and the district.
- Mention at most ONE standout feature (sea view, beachfront, etc.) — never list several.
- Appealing but factual: no hype words like "luxury", "paradise", "dream", "best".
- No price, no numbers except bedroom/rai counts, no emoji, no quotes, no trailing punctuation.
- Output ONLY the title text, nothing else.`;

function factsFor(a: TitleAttrs): string {
  const feat =
    a.beachfront ? "beachfront"
    : a.seaView ? "sea view"
    : a.mountainView ? "mountain view"
    : a.jungleView ? "jungle view"
    : a.quiet ? "quiet location"
    : a.flat ? "flat / build-ready" : undefined;
  const facts: Record<string, unknown> = {
    type: a.offplan || a.type === "Project" ? "off-plan villa project" : a.type,
    district: a.district,
    standoutFeature: feat,
    documentType: a.documentType,
  };
  if (a.rai) facts.plotSizeRai = a.rai;
  if (a.bedrooms) facts.bedrooms = a.bedrooms;
  if (a.pool) facts.pool = true;
  if (a.brandNew) facts.condition = "brand new";
  return JSON.stringify(facts);
}

/** Reject LLM output that isn't a clean single-line EN title. */
function sanitiseLlm(raw: string): string | null {
  let t = (raw ?? "").split("\n")[0].trim();
  t = t.replace(/^["'“”«»]+|["'“”«»]+$/g, "").replace(/[.;]+$/g, "").trim();
  t = t.replace(/\s+/g, " ");
  if (!t) return null;
  if (/[А-Яа-яЁё]/.test(t)) return null; // must be English
  if (!/[A-Za-z]/.test(t)) return null;
  if (t.length < 8 || t.length > 90) return null;
  return cap(t);
}

async function llmTitle(a: TitleAttrs): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 40,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: factsFor(a) }],
      }),
    });
    if (!resp.ok) {
      console.error(`[title] anthropic ${resp.status}`);
      return null;
    }
    const data = (await resp.json()) as { content?: Array<{ text?: string }> };
    const text = (data.content ?? []).map((c) => c.text ?? "").join(" ");
    return sanitiseLlm(text);
  } catch (err) {
    console.error("[title] call failed:", err);
    return null;
  }
}

/**
 * Generate the listing title for a new object. Uses Claude when available for
 * extra polish, always with a deterministic template fallback so creation never
 * depends on the LLM.
 */
export async function generateObjectTitle(a: TitleAttrs): Promise<string> {
  return (await llmTitle(a)) ?? buildTemplateTitle(a);
}

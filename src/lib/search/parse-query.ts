import "server-only";
import type { ObjectType, TenureType } from "@/types/object";

/**
 * Natural-language listings search. Turns a free-text query like
 * "flat land near the beach, quiet, under 20M" into the URL params the existing
 * /listings filter understands (type, district, tenure, bedrooms, pmin, pmax,
 * beachfront, seaview, mountainview).
 *
 * Uses Claude when ANTHROPIC_API_KEY is set; otherwise falls back to a heuristic
 * parser so the feature works today and upgrades automatically once the key is
 * added (mirrors lib/classify/image-doc.ts).
 */

export interface ParsedQuery {
  params: Record<string, string>;
  interpreted: string[]; // human-readable chips, e.g. ["Land", "≤ ฿20M", "Beachfront"]
}

const TYPES: ObjectType[] = ["Land", "Villa", "House", "Apartment", "Project"];
const TENURES: TenureType[] = ["Freehold", "Leasehold"];

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export async function parseSearchQuery(
  text: string,
  validDistricts: string[],
): Promise<ParsedQuery> {
  const trimmed = text.trim();
  if (!trimmed) return { params: {}, interpreted: [] };

  if (process.env.ANTHROPIC_API_KEY) {
    const viaLlm = await parseWithClaude(trimmed, validDistricts).catch(() => null);
    if (viaLlm) return viaLlm;
  }
  return parseHeuristic(trimmed, validDistricts);
}

// ---- Shared: structured filter → URL params + chips ----

interface FilterDraft {
  type?: string[];
  district?: string[];
  tenure?: string[];
  bedroomsMin?: number;
  priceMinMThb?: number; // millions THB
  priceMaxMThb?: number;
  beachfront?: boolean;
  seaView?: boolean;
  mountainView?: boolean;
}

function draftToResult(d: FilterDraft, validDistricts: string[]): ParsedQuery {
  const params: Record<string, string> = {};
  const interpreted: string[] = [];

  const types = (d.type ?? []).filter((t): t is ObjectType =>
    (TYPES as string[]).includes(t),
  );
  if (types.length) {
    params.type = types.join(",");
    interpreted.push(...types);
  }

  const districts = (d.district ?? []).filter((x) => validDistricts.includes(x));
  if (districts.length) {
    params.district = districts.join(",");
    interpreted.push(...districts);
  }

  const tenures = (d.tenure ?? []).filter((t): t is TenureType =>
    (TENURES as string[]).includes(t),
  );
  if (tenures.length) {
    params.tenure = tenures.join(",");
    interpreted.push(...tenures);
  }

  if (d.bedroomsMin && d.bedroomsMin > 0) {
    params.bedrooms = String(d.bedroomsMin);
    interpreted.push(`${d.bedroomsMin}+ bed`);
  }
  if (d.priceMinMThb && d.priceMinMThb > 0) {
    params.pmin = String(d.priceMinMThb);
    interpreted.push(`≥ ฿${d.priceMinMThb}M`);
  }
  if (d.priceMaxMThb && d.priceMaxMThb > 0) {
    params.pmax = String(d.priceMaxMThb);
    interpreted.push(`≤ ฿${d.priceMaxMThb}M`);
  }
  if (d.beachfront) {
    params.beachfront = "1";
    interpreted.push("Beachfront");
  }
  if (d.seaView) {
    params.seaview = "1";
    interpreted.push("Sea view");
  }
  if (d.mountainView) {
    params.mountainview = "1";
    interpreted.push("Mountain view");
  }

  return { params, interpreted };
}

// ---- Heuristic parser (no API key) ----

/** "20m" / "20 million" / "20,000,000" / "1.5m" → millions of THB. */
function parseAmountM(raw: string): number | undefined {
  const s = raw.toLowerCase().replace(/[, ]/g, "");
  const m = s.match(/(\d+(?:\.\d+)?)(m|k|million|млн)?/);
  if (!m) return undefined;
  let n = parseFloat(m[1]);
  const unit = m[2];
  if (unit === "k") n = n / 1000;
  else if (!unit && n >= 100000) n = n / 1_000_000; // bare big number = raw THB
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;
}

export function parseHeuristic(text: string, validDistricts: string[]): ParsedQuery {
  const t = ` ${text.toLowerCase()} `;
  const d: FilterDraft = {};

  // Types
  const type: string[] = [];
  if (/\bland|plot|rai\b/.test(t)) type.push("Land");
  if (/\bvilla|villas\b/.test(t)) type.push("Villa");
  if (/\bhouse|home\b/.test(t)) type.push("House");
  if (/\bapartment|condo|condominium\b/.test(t)) type.push("Apartment");
  if (/\bproject|off-?plan|new build|new-build\b/.test(t)) type.push("Project");
  if (type.length) d.type = [...new Set(type)];

  // Tenure
  const tenure: string[] = [];
  if (/\bfreehold\b/.test(t)) tenure.push("Freehold");
  if (/\bleasehold|lease\b/.test(t)) tenure.push("Leasehold");
  if (tenure.length) d.tenure = tenure;

  // Features
  if (/beach\s?front|on the beach|beachfront/.test(t)) d.beachfront = true;
  if (/sea\s?view|ocean view|sea-view/.test(t)) d.seaView = true;
  if (/mountain\s?view|hill\s?view/.test(t)) d.mountainView = true;

  // Bedrooms
  const bed = t.match(/(\d+)\s*[-\s]?\+?\s*(?:bed|bedroom|br|bdr)/);
  if (bed) d.bedroomsMin = parseInt(bed[1], 10);

  // Price
  const between = t.match(/(?:between\s*)?([\d.,]+\s*[mk]?)\s*(?:-|–|to|and)\s*([\d.,]+\s*[mk]?)/);
  if (between) {
    const lo = parseAmountM(between[1]);
    const hi = parseAmountM(between[2]);
    if (lo) d.priceMinMThb = Math.min(lo, hi ?? lo);
    if (hi) d.priceMaxMThb = Math.max(lo ?? hi, hi);
  } else {
    const under = t.match(/(?:under|below|up to|less than|max|<)\s*([\d.,]+\s*[mk]?)/);
    if (under) d.priceMaxMThb = parseAmountM(under[1]);
    const over = t.match(/(?:over|above|from|more than|min|>)\s*([\d.,]+\s*[mk]?)/);
    if (over) d.priceMinMThb = parseAmountM(over[1]);
  }

  // Districts — match any known district name appearing in the text.
  const districts = validDistricts.filter((name) =>
    t.includes(` ${name.toLowerCase()}`),
  );
  if (districts.length) d.district = districts;

  return draftToResult(d, validDistricts);
}

// ---- Claude parser (API key present) ----

async function parseWithClaude(
  text: string,
  validDistricts: string[],
): Promise<ParsedQuery | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const system = `You convert a property-search phrase into a JSON filter for listings on Koh Phangan, Thailand.
Return ONLY a JSON object (no prose) with any of these optional keys:
- type: array of ${JSON.stringify(TYPES)}
- district: array, each MUST be one of ${JSON.stringify(validDistricts)}
- tenure: array of ${JSON.stringify(TENURES)}
- bedroomsMin: integer
- priceMinMThb: number (millions of Thai baht)
- priceMaxMThb: number (millions of Thai baht)
- beachfront: boolean
- seaView: boolean
- mountainView: boolean
Omit keys you are unsure about. "under 20m" → priceMaxMThb 20. "3 bed" → bedroomsMin 3.`;

  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system,
      messages: [{ role: "user", content: text }],
    }),
  });
  if (!resp.ok) {
    console.error(`[nl-search] anthropic ${resp.status}`);
    return null;
  }
  const data = (await resp.json()) as { content?: Array<{ type: string; text?: string }> };
  const raw = (data.content ?? []).map((c) => c.text ?? "").join("");
  const jsonText = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  if (!jsonText) return null;
  let draft: FilterDraft;
  try {
    draft = JSON.parse(jsonText);
  } catch {
    return null;
  }
  return draftToResult(draft, validDistricts);
}

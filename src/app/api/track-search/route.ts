import { backendFetch, BACKEND_URL } from "@/lib/api/backend";
import { isFirstParty } from "@/lib/api/first-party";
import { rateLimit } from "@/lib/ratelimit";
import { DISTRICTS } from "@/lib/amocrm/dictionaries";

/**
 * Demand beacon for FILTER selections on /listings (NL search is logged
 * server-side in the action). The filter bar posts a settled filter snapshot
 * here; we forward to the backend POST /track/search through the bearer-token
 * proxy. Always 204 — a demand counter must never surface errors to a visitor.
 */
const TYPES = new Set(["Land", "Villa", "House", "Apartment", "Project"]);
// Районы — по тому же справочнику, что и форма ввода объекта: без allow-set
// произвольная строка из анонимного POST становилась строкой отчёта /admin/demand.
const DISTRICT_SET = new Set<string>(DISTRICTS);
const FEATURES = new Set(["beachfront", "seaView", "mountainView"]);

function strArr(v: unknown, allow?: Set<string>, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  const out = v.filter((x): x is string => typeof x === "string").map((s) => s.slice(0, 60));
  return (allow ? out.filter((x) => allow.has(x)) : out).slice(0, max);
}
function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function POST(req: Request): Promise<Response> {
  if (BACKEND_URL) {
    try {
      const b = (await req.json()) as Record<string, unknown>;
      const payload = {
        kind: "filter" as const,
        types: strArr(b.types, TYPES),
        districts: strArr(b.districts, DISTRICT_SET),
        tenure: strArr(b.tenure, new Set(["Freehold", "Leasehold"])),
        features: strArr(b.features, FEATURES),
        priceMinM: num(b.priceMinM),
        priceMaxM: num(b.priceMaxM),
        bedroomsMin: num(b.bedroomsMin),
        resultCount: num(b.resultCount),
        locale: typeof b.locale === "string" ? b.locale.slice(0, 5) : null,
      };
      // Only forward events that actually express demand (some filter set).
      const hasIntent =
        payload.types.length ||
        payload.districts.length ||
        payload.tenure.length ||
        payload.features.length ||
        payload.priceMinM != null ||
        payload.priceMaxM != null ||
        payload.bedroomsMin != null;
      // Same-origin + per-IP ceiling: this feeds the /admin/demand report, so a
      // scripted POST loop would fabricate "demand" for a district.
      if (hasIntent && isFirstParty(req) && (await rateLimit("track-search", 60, 10 * 60))) {
        await backendFetch("/track/search", {
   scope: "track",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(payload),
        });
      }
    } catch {
      /* malformed body or backend down — drop the event */
    }
  }
  return new Response(null, { status: 204 });
}

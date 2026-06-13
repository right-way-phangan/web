import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/**
 * Demand beacon for FILTER selections on /listings (NL search is logged
 * server-side in the action). The filter bar posts a settled filter snapshot
 * here; we forward to the backend POST /track/search through the bearer-token
 * proxy. Always 204 — a demand counter must never surface errors to a visitor.
 */
const TYPES = new Set(["Land", "Villa", "House", "Apartment", "Project"]);
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
        districts: strArr(b.districts),
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
      if (hasIntent) {
        await backendFetch("/track/search", {
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

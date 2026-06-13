import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/**
 * First-party listing-view beacon. The object page sends {rw} here
 * (sendBeacon, see components/objects/track-view.tsx); we forward it to the
 * backend's POST /track/view, which keeps the daily counter in Postgres.
 *
 * Proxied through Next because the backend requires a Bearer token that must
 * not reach the browser. Always answers 204 — a view counter must never
 * surface errors to the visitor.
 */
export async function POST(req: Request): Promise<Response> {
  if (BACKEND_URL) {
    try {
      const { rw } = (await req.json()) as { rw?: unknown };
      const rwNumber = String(rw ?? "");
      // RW-L0001 / RW-V0012 / RW-P0001-3 / legacy RW-05xx
      if (/^RW-[A-Z]?\d{3,5}(-\d{1,3})?$/i.test(rwNumber)) {
        await backendFetch("/track/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ rw: rwNumber }),
        });
      }
    } catch {
      /* malformed body or backend down — drop the hit */
    }
  }
  return new Response(null, { status: 204 });
}

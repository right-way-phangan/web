import { backendFetch, BACKEND_URL } from "@/lib/api/backend";
import { isFirstParty } from "@/lib/api/first-party";
import { rateLimit } from "@/lib/ratelimit";

/**
 * Engagement-event beacon proxy → backend POST /track/event (bearer token stays
 * server-side). Validates kind so a stray POST can't grow garbage. Always 204.
 * Same-origin + per-IP ceiling, like track-view: these counters feed the
 * engagement index and "hot lead" ranking, so a curl loop must not move them.
 */
const KINDS = new Set([
  "wa_click", "tg_click", "phone_click", "email_click",
  "save", "calc", "brochure", "share",
  "form_start", "form_submit",
  // On-page engagement (object detail behavior funnel):
  "dwell_30s", "scroll_50", "scroll_90", "gallery_open", "contact_reach",
]);

export async function POST(req: Request): Promise<Response> {
  if (BACKEND_URL) {
    try {
      const { kind, rw, vid } = (await req.json()) as { kind?: unknown; rw?: unknown; vid?: unknown };
      const k = String(kind ?? "");
      const rwNumber = String(rw ?? "");
      const rwOk = rwNumber === "" || /^RW-[A-Z]?\d{3,5}(-\d{1,3})?$/i.test(rwNumber);
      // Anonymous browser id only (alnum, capped) — links the action to a journey.
      const rawVid = String(vid ?? "");
      const v = /^[A-Za-z0-9_-]{1,64}$/.test(rawVid) ? rawVid : undefined;
      if (KINDS.has(k) && rwOk && isFirstParty(req) && (await rateLimit("track-event", 120, 10 * 60))) {
        await backendFetch("/track/event", {
   scope: "track",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(v ? { kind: k, rw: rwNumber, vid: v } : { kind: k, rw: rwNumber }),
        });
      }
    } catch {
      /* drop */
    }
  }
  return new Response(null, { status: 204 });
}

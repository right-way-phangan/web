import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/**
 * Engagement-event beacon proxy → backend POST /track/event (bearer token stays
 * server-side). Validates kind so a stray POST can't grow garbage. Always 204.
 */
const KINDS = new Set([
  "wa_click", "tg_click", "phone_click", "email_click",
  "save", "calc", "brochure", "share",
  "form_start", "form_submit",
]);

export async function POST(req: Request): Promise<Response> {
  if (BACKEND_URL) {
    try {
      const { kind, rw } = (await req.json()) as { kind?: unknown; rw?: unknown };
      const k = String(kind ?? "");
      const rwNumber = String(rw ?? "");
      const rwOk = rwNumber === "" || /^RW-[A-Z]?\d{3,5}(-\d{1,3})?$/i.test(rwNumber);
      if (KINDS.has(k) && rwOk) {
        await backendFetch("/track/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ kind: k, rw: rwNumber }),
        });
      }
    } catch {
      /* drop */
    }
  }
  return new Response(null, { status: 204 });
}

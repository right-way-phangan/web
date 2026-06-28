import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/**
 * Referral-source beacon proxy → backend POST /track/referral. Source is a
 * classified token (ai:* / search:* / social:* / ref:host / direct), produced
 * client-side by lib/analytics/referrer.ts. Always 204.
 */
export async function POST(req: Request): Promise<Response> {
  if (BACKEND_URL) {
    try {
      const { source, path } = (await req.json()) as { source?: unknown; path?: unknown };
      const s = String(source ?? "").slice(0, 40);
      // Landing pathname only — no query string, no identity. Backend logs it
      // for ai:* sources (which page the assistant cited).
      const rawPath = String(path ?? "");
      const p = /^\/[A-Za-z0-9/_-]{0,200}$/.test(rawPath) ? rawPath : undefined;
      if (/^[a-z]+:[a-z0-9.\-]+$/i.test(s) || s === "direct") {
        await backendFetch("/track/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(p ? { source: s, path: p } : { source: s }),
        });
      }
    } catch {
      /* drop */
    }
  }
  return new Response(null, { status: 204 });
}

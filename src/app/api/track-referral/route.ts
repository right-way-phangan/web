import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/**
 * Referral-source beacon proxy → backend POST /track/referral. Source is a
 * classified token (ai:* / search:* / social:* / ref:host / direct), produced
 * client-side by lib/analytics/referrer.ts. Always 204.
 */
export async function POST(req: Request): Promise<Response> {
  if (BACKEND_URL) {
    try {
      const { source } = (await req.json()) as { source?: unknown };
      const s = String(source ?? "").slice(0, 40);
      if (/^[a-z]+:[a-z0-9.\-]+$/i.test(s) || s === "direct") {
        await backendFetch("/track/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ source: s }),
        });
      }
    } catch {
      /* drop */
    }
  }
  return new Response(null, { status: 204 });
}

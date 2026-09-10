import { isFirstParty } from "@/lib/api/first-party";
import { rateLimit } from "@/lib/ratelimit";
import { reportSiteError } from "@/lib/notify/site-error";

/**
 * Маячок клиентских ошибок (см. lib/report-client-error.ts). Только со своих
 * страниц и не чаще 20 в час с IP; дальше — отпечаток, дедуп и Telegram.
 */
export async function POST(req: Request): Promise<Response> {
  if (!isFirstParty(req)) return new Response(null, { status: 403 });
  if (!(await rateLimit("track-error", 20, 3600))) return new Response(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return new Response(null, { status: 400 });
  }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const message = str(body.message, 500)?.trim();
  if (!message) return new Response(null, { status: 400 });

  await reportSiteError({
    source: "client",
    message,
    stack: str(body.stack, 2000),
    url: str(body.url, 500),
    digest: str(body.digest, 64),
    ua: req.headers.get("user-agent") ?? undefined,
  });
  return new Response(null, { status: 204 });
}

import "server-only";
import { headers } from "next/headers";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/** Best-effort client IP from the Vercel/proxy headers. */
async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

/**
 * Per-IP rate limit, backed by the backend's Postgres counter (POST /ratelimit).
 * Returns true when the action is allowed.
 *
 * Fail-OPEN by design: if the backend is unreachable we let the request through
 * rather than locking out real visitors — a throttle is a guard rail, not the
 * primary auth control (login still verifies the password, the form still has a
 * honeypot). The bearer token to the backend stays server-side.
 */
export async function rateLimit(
  scope: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  if (!BACKEND_URL) return true; // local dev without backend → don't block
  try {
    const ip = await clientIp();
    const res = await backendFetch("/ratelimit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ key: `${scope}:${ip}`, limit, windowSec }),
    });
    if (!res.ok) return true; // backend hiccup → fail open
    const { allowed } = (await res.json()) as { allowed?: boolean };
    return allowed !== false;
  } catch {
    return true; // network/parse error → fail open
  }
}

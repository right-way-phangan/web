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
 * Public forms fail open so a backend hiccup does not lose a lead. Callers can
 * opt into fail-closed for credential-bearing routes such as admin login.
 */
export async function rateLimit(
  scope: string,
  limit: number,
  windowSec: number,
  options?: { failClosed?: boolean },
): Promise<boolean> {
  const fallback = !options?.failClosed;
  if (!BACKEND_URL) return fallback; // local dev without backend → don't block
  try {
    const ip = await clientIp();
    const res = await backendFetch("/ratelimit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ key: `${scope}:${ip}`, limit, windowSec }),
    });
    if (!res.ok) return fallback;
    const { allowed } = (await res.json()) as { allowed?: boolean };
    return allowed !== false;
  } catch {
    return fallback;
  }
}

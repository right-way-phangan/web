import "server-only";

/**
 * Single fetch helper for the own backend (objects + CRM). Adds the bearer
 * token when OBJECTS_API_TOKEN is set (the VPS API requires it; local dev
 * leaves both unset, so calls stay open). Server-only — the token is a server
 * secret and must never reach the client bundle.
 *
 * `scope: "track"` sends the narrower OBJECTS_API_TRACK_TOKEN (accepted by the
 * backend only on /track/* and /ratelimit) so the public beacon routes never
 * hold the full-access secret. Falls back to the full token until the track
 * token is provisioned in Vercel — the rollout is additive.
 */
export const BACKEND_URL = process.env.OBJECTS_API_URL;
const TOKEN = process.env.OBJECTS_API_TOKEN;
const TRACK_TOKEN = process.env.OBJECTS_API_TRACK_TOKEN;

export type BackendInit = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
  scope?: "track";
};

export function backendFetch(path: string, init: BackendInit = {}): Promise<Response> {
  const { scope, ...rest } = init;
  const headers = new Headers(rest.headers);
  const token = scope === "track" ? (TRACK_TOKEN ?? TOKEN) : TOKEN;
  if (token) headers.set("authorization", `Bearer ${token}`);
  return fetch(`${BACKEND_URL}${path}`, { ...rest, headers });
}

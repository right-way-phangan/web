import "server-only";

/**
 * Single fetch helper for the own backend (objects + CRM). Adds the bearer
 * token when OBJECTS_API_TOKEN is set (the VPS API requires it; local dev
 * leaves both unset, so calls stay open). Server-only — the token is a server
 * secret and must never reach the client bundle.
 */
export const BACKEND_URL = process.env.OBJECTS_API_URL;
const TOKEN = process.env.OBJECTS_API_TOKEN;

export function backendFetch(
  path: string,
  init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (TOKEN) headers.set("authorization", `Bearer ${TOKEN}`);
  return fetch(`${BACKEND_URL}${path}`, { ...init, headers });
}

import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ENABLED, SESSION_COOKIE, verifySession } from "./session";

export type ActionRole = "staff" | "admin";

/** Pure role policy, kept testable separately from Next request APIs. */
export function canRunAction(role: string | null, required: ActionRole): boolean {
  if (required === "admin") return role === "admin";
  return role === "admin" || role === "agent";
}

async function currentRole(): Promise<string | null> {
  if (AUTH_ENABLED) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return (await verifySession(token))?.role ?? null;
  }

  // Server Actions are callable endpoints. In the legacy Basic Auth mode they
  // must verify the same credential themselves instead of assuming middleware
  // always ran before the action.
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  const auth = (await headers()).get("authorization");
  if (!user || !pass || !auth?.startsWith("Basic ")) return null;
  try {
    const decoded = atob(auth.slice(6));
    const idx = decoded.indexOf(":");
    const gotUser = idx >= 0 ? decoded.slice(0, idx) : decoded;
    const gotPass = idx >= 0 ? decoded.slice(idx + 1) : "";
    return safeEqual(gotUser, user) && safeEqual(gotPass, pass) ? "admin" : null;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Server-action backstop. Do not rely on the /admin middleware alone. */
export async function requireActionRole(required: ActionRole): Promise<void> {
  const role = await currentRole();
  if (canRunAction(role, required)) return;
  redirect(AUTH_ENABLED && role ? "/admin/crm" : AUTH_ENABLED ? "/admin/login" : "/admin");
}

/** Compatibility helper for existing admin-only actions. */
export async function isAdmin(): Promise<boolean> {
  return canRunAction(await currentRole(), "admin");
}

/** Same, for staff-level actions that report a result instead of redirecting. */
export async function isStaff(): Promise<boolean> {
  return canRunAction(await currentRole(), "staff");
}

export async function requireAdmin(): Promise<void> {
  await requireActionRole("admin");
}

export async function requireStaff(): Promise<void> {
  await requireActionRole("staff");
}

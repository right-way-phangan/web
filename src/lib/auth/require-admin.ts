import "server-only";

import { cookies } from "next/headers";
import { AUTH_ENABLED, SESSION_COOKIE, verifySession } from "./session";

/** Server-action backstop for operations an agent must not invoke directly. */
export async function isAdmin(): Promise<boolean> {
  // Basic Auth is the single shared administrator credential in legacy mode.
  if (!AUTH_ENABLED) return true;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return (await verifySession(token))?.role === "admin";
}

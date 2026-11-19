import "server-only";
import { cookies } from "next/headers";
import { AUTH_ENABLED, SESSION_COOKIE, verifySession } from "./session";
import type { AdminLang } from "@/lib/i18n/admin-translate";

/** /admin UI language of the signed-in user (users.lang in the session). Admin/no session → ru. */
export async function currentAdminLang(): Promise<AdminLang> {
  if (!AUTH_ENABLED) return "ru";
  const s = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return s?.lang === "en" || s?.lang === "th" ? s.lang : "ru";
}

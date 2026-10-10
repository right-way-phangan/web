export type AdminRole = "admin" | "agent" | "partner";

const AGENT_PATHS = ["/admin/crm", "/admin/objects", "/admin/new"];

/** Partner (developer's rep) sees only the lead board and a lead card — nothing else in /admin. */
const PARTNER_PATH = /^\/admin\/crm(\/\d+)?\/?$/;

/** Agent works only with CRM and property intake/catalogue. Unknown role → nothing. */
export function canAccessAdminPath(role: string, pathname: string): boolean {
  if (role === "admin") return true;
  if (role === "partner") return PARTNER_PATH.test(pathname);
  if (role !== "agent") return false;
  return AGENT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

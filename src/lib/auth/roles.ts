export type AdminRole = "admin" | "agent" | "partner";

// Agent = hired sales agent (TH/EN speaking). Their own leads, the catalogue,
// object intake. NOT the company base: contacts book, export, import, archive
// triage, stats/health — those stay admin-only.
const AGENT_PATHS = ["/admin/objects", "/admin/new", "/admin/api/parcel-trace"];
const AGENT_CRM = /^\/admin\/crm(\/(\d+|today|tasks|calendar|new|help))?\/?$/;

/** Partner (developer's rep) sees only the lead board and a lead card — nothing else in /admin. */
const PARTNER_PATH = /^\/admin\/crm(\/\d+)?\/?$/;

/** Agent works only with CRM and property intake/catalogue. Unknown role → nothing. */
export function canAccessAdminPath(role: string, pathname: string): boolean {
  if (role === "admin") return true;
  if (role === "partner") return PARTNER_PATH.test(pathname);
  if (role !== "agent") return false;
  if (AGENT_CRM.test(pathname)) return true;
  return AGENT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

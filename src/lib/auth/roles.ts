export type AdminRole = "admin" | "agent";

const AGENT_PATHS = ["/admin/crm", "/admin/objects", "/admin/new"];

/** Agent works only with CRM and property intake/catalogue. */
export function canAccessAdminPath(role: string, pathname: string): boolean {
  if (role === "admin") return true;
  return AGENT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ENABLED, SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/**
 * /admin/* gate. Two modes:
 *  - AUTH_SECRET set  → per-user session cookie (Phase B); unauthenticated →
 *    redirect to /admin/login. Multiple users + roles, no per-seat license.
 *  - AUTH_SECRET unset → shared HTTP Basic Auth (ADMIN_USER/ADMIN_PASSWORD),
 *    the current prod behavior. Fails closed if creds are missing.
 */
function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Right Way Admin", charset="UTF-8"' },
  });
}

export async function middleware(req: NextRequest) {
  // Phase B: cookie-session auth.
  if (AUTH_ENABLED) {
    if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (session) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Fallback: shared Basic Auth.
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return unauthorized();

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }
  const idx = decoded.indexOf(":");
  const gotUser = idx >= 0 ? decoded.slice(0, idx) : decoded;
  const gotPass = idx >= 0 ? decoded.slice(idx + 1) : "";

  if (gotUser !== user || gotPass !== pass) return unauthorized();
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";

/**
 * HTTP Basic Auth gate for /admin/*. Credentials in env: ADMIN_USER /
 * ADMIN_PASSWORD. Fails closed — if either is unset, all /admin access is
 * denied (so a misconfigured deploy never exposes the intake form).
 *
 * This is intentionally lightweight (single shared login) for Phase 1. A
 * proper multi-user auth is tracked in open questions.
 */
function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Right Way Admin", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest) {
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

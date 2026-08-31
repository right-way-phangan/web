import { SignJWT, jwtVerify } from "jose";

/**
 * Signed session cookie (Auth.js-style, hand-rolled on jose to avoid a beta
 * next-auth dependency in the live build). Edge-safe — used by middleware and
 * server actions. Active only when AUTH_SECRET is set; otherwise /admin falls
 * back to shared Basic Auth (current prod behavior).
 */
export const SESSION_COOKIE = "rw_session";
/**
 * Session lifetime. Long enough that the installed CRM PWA doesn't re-ask login
 * every week, short enough to bound a stolen/stale cookie: there is no
 * server-side revocation, so this window IS the revocation delay.
 */
export const SESSION_DAYS = 14;
/**
 * Domain separation: AUTH_SECRET also signs client `/match/saved/*` links, and
 * nothing stops another service from reusing the same secret. iss/aud + a fixed
 * algorithm make sure only tokens minted by signSession() open the admin.
 */
const ISSUER = "rightway:web";
const AUDIENCE = "rightway:admin";
const SECRET = process.env.AUTH_SECRET;
export const AUTH_ENABLED = Boolean(SECRET);
const key = SECRET ? new TextEncoder().encode(SECRET) : null;

export interface SessionUser {
  id: number;
  email: string;
  name?: string | null;
  role: string;
}

export async function signSession(user: SessionUser): Promise<string> {
  if (!key) throw new Error("AUTH_SECRET is not set");
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key);
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!key || !token) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    // Сессия без роли/id — не сессия: без этой проверки role становится строкой
    // "undefined", а id — NaN, и fail-closed держится только на roles.ts.
    if (typeof payload.role !== "string" || !payload.role) return null;
    if (typeof payload.id !== "number" || !Number.isFinite(payload.id)) return null;
    return {
      id: payload.id,
      email: String(payload.email ?? ""),
      name: (payload.name as string | null) ?? null,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

import { SignJWT, jwtVerify } from "jose";

/**
 * Signed session cookie (Auth.js-style, hand-rolled on jose to avoid a beta
 * next-auth dependency in the live build). Edge-safe — used by middleware and
 * server actions. Active only when AUTH_SECRET is set; otherwise /admin falls
 * back to shared Basic Auth (current prod behavior).
 */
export const SESSION_COOKIE = "rw_session";
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
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!key || !token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return {
      id: Number(payload.id),
      email: String(payload.email),
      name: (payload.name as string | null) ?? null,
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

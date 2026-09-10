import "server-only";
import { SignJWT, jwtVerify } from "jose";

/**
 * Подписанная ссылка на партнёрский отчёт застройщика (/partner/<token>).
 *
 * Пивот «витрина как продукт»: застройщик видит просмотры, клики и лиды по
 * своим проектам без логина и без таблицы в БД — токен сам несёт slug и срок,
 * подпись на AUTH_SECRET (тот же секрет, что у админ-сессий, но другая
 * audience — админский JWT здесь не пройдёт, и наоборот). Отзыв ссылки —
 * смена секрета или истечение срока; на 180 дней для term-sheet-разговоров
 * этого достаточно.
 */
const SECRET = process.env.AUTH_SECRET;
const key = SECRET ? new TextEncoder().encode(SECRET) : null;
const ISSUER = "rightway:web";
const AUDIENCE = "rightway:partner";

export const PARTNER_LINKS_ENABLED = Boolean(key);
export const PARTNER_TOKEN_DAYS = 180;

export async function signPartnerToken(developerSlug: string): Promise<string> {
  if (!key) throw new Error("AUTH_SECRET is not set");
  return new SignJWT({ d: developerSlug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${PARTNER_TOKEN_DAYS}d`)
    .sign(key);
}

/** Slug застройщика из токена или null (подделка, истёк, чужая audience). */
export async function verifyPartnerToken(token?: string): Promise<string | null> {
  if (!key || !token) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return typeof payload.d === "string" && payload.d ? payload.d : null;
  } catch {
    return null;
  }
}

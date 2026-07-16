import "server-only";
import { createHmac } from "crypto";

/**
 * HMAC-токен доступа к сохранённому профилю подбора — как shortlist-token, но
 * для match_profiles. Ссылка /match/saved/<id>-<sig> живёт, пока жив профиль,
 * ничего не хранит и не перечисляется. Fail-closed: без секрета не подписываем.
 */
const SECRET = process.env.AUTH_SECRET || process.env.OBJECTS_API_TOKEN;

function secretOrThrow(): string {
  if (!SECRET)
    throw new Error("match-token: set AUTH_SECRET or OBJECTS_API_TOKEN");
  return SECRET;
}

export function makeMatchToken(profileId: number): string {
  const sig = createHmac("sha256", secretOrThrow())
    .update(`match:${profileId}`)
    .digest("base64url")
    .slice(0, 16);
  return `${profileId}-${sig}`;
}

/** Возвращает profileId, если токен подлинный, иначе null. */
export function verifyMatchToken(token: string): number | null {
  if (!SECRET) return null;
  const m = /^(\d+)-([A-Za-z0-9_-]{16})$/.exec(token);
  if (!m) return null;
  const id = Number(m[1]);
  return makeMatchToken(id) === token ? id : null;
}

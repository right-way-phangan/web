import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// HMAC-подпись вместо таблицы токенов: ссылка /s/<leadId>-<sig> живёт, пока
// жив лид, ничего не хранит и не перечисляется подбором (16 base64url-знаков).
// Fail-closed: без секрета не подписываем и не верифицируем (раньше тут стоял
// хардкод-дефолт "rw-shortlist-dev" — любой, кто его знал, мог ковать ссылки).
const SECRET = process.env.AUTH_SECRET || process.env.OBJECTS_API_TOKEN;

function secretOrThrow(): string {
  if (!SECRET) throw new Error("shortlist-token: set AUTH_SECRET or OBJECTS_API_TOKEN");
  return SECRET;
}

export function makeShortlistToken(leadId: number): string {
  const sig = createHmac("sha256", secretOrThrow())
    .update(`shortlist:${leadId}`)
    .digest("base64url")
    .slice(0, 16);
  return `${leadId}-${sig}`;
}

/** Returns the leadId when the token is genuine, else null. */
export function verifyShortlistToken(token: string): number | null {
  if (!SECRET) return null; // fail-closed: нет секрета — нет валидных токенов
  const m = /^(\d+)-([A-Za-z0-9_-]{16})$/.exec(token);
  if (!m) return null;
  const id = Number(m[1]);
  const expected = makeShortlistToken(id);
  // Constant-time compare; lengths differ only for a zero-padded id, which is
  // not a token we ever issued.
  if (expected.length !== token.length) return null;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token)) ? id : null;
}

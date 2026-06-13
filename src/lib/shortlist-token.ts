import "server-only";
import { createHmac } from "crypto";

// HMAC-подпись вместо таблицы токенов: ссылка /s/<leadId>-<sig> живёт, пока
// жив лид, ничего не хранит и не перечисляется подбором (16 base64url-знаков).
const SECRET =
  process.env.AUTH_SECRET || process.env.OBJECTS_API_TOKEN || "rw-shortlist-dev";

export function makeShortlistToken(leadId: number): string {
  const sig = createHmac("sha256", SECRET)
    .update(`shortlist:${leadId}`)
    .digest("base64url")
    .slice(0, 16);
  return `${leadId}-${sig}`;
}

/** Returns the leadId when the token is genuine, else null. */
export function verifyShortlistToken(token: string): number | null {
  const m = /^(\d+)-([A-Za-z0-9_-]{16})$/.exec(token);
  if (!m) return null;
  const id = Number(m[1]);
  return makeShortlistToken(id) === token ? id : null;
}

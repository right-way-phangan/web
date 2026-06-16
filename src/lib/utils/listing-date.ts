/**
 * Tolerant parser for an object's `dateAdded`. It is stored as a Unix-seconds
 * string ("1755018000") — both for own-DB rows (backend fills it from
 * `created_at`) and amoCRM legacy — but some callers may pass an ISO date.
 * Handles both and never returns an Invalid Date: empty/garbage → `fallback`.
 * Use everywhere instead of raw `Date.parse` / `new Date(dateAdded)`, which
 * silently break on Unix-seconds strings.
 */
export function parseListingDate(raw: string | undefined | null, fallback: Date): Date {
  if (!raw) return fallback;
  const secs = Number(raw);
  const d = Number.isFinite(secs) && secs > 0 ? new Date(secs * 1000) : new Date(raw);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

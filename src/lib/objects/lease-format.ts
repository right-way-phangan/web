/**
 * Lease-commitment formatting for the object price headline. Pure (no React /
 * currency context) so the wording is unit-tested directly.
 */

/** Flat cost of a whole-plot monthly rent over the lease term (pre-indexation). */
export function leaseTotalThb(rentPerMonth: number, years: number): number {
  return rentPerMonth * 12 * years;
}

/**
 * Lease line under the monthly rent: "30-year lease · ≈ ฿14.4M total +
 * indexation". The total is omitted when unknown (per-rai rents, whose
 * whole-plot cost needs the plot area). "+ indexation" flags that the flat
 * total is a floor when the lease escalates.
 */
export function leaseLine(
  locale: "en" | "ru",
  years: number,
  totalStr: string | undefined,
  hasEsc: boolean,
): string {
  const esc = hasEsc ? (locale === "ru" ? " + индексация" : " + indexation") : "";
  const head = locale === "ru" ? `лизинг ${years} лет` : `${years}-year lease`;
  if (!totalStr) return head + esc;
  const total = locale === "ru" ? `≈ ${totalStr} всего` : `≈ ${totalStr} total`;
  return `${head} · ${total}${esc}`;
}

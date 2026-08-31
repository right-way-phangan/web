/**
 * Lease-commitment formatting for the object price headline. Pure (no React /
 * currency context) so the wording is unit-tested directly.
 */

/** Flat cost of a whole-plot monthly rent over the lease term (pre-indexation). */
export function leaseTotalThb(rentPerMonth: number, years: number): number {
  return rentPerMonth * 12 * years;
}

/**
 * Lease total with indexation: the rent steps up by `escPct`% every
 * `escEveryYears` years, so later years cost more than the flat total implies.
 * Falls back to the flat total when the escalation terms are unknown. Pure so
 * it's unit-tested directly.
 */
export function escalatedLeaseTotalThb(
  rentPerMonth: number,
  years: number,
  escPct?: number,
  escEveryYears?: number,
): number {
  if (!escPct || !escEveryYears || escEveryYears <= 0) return leaseTotalThb(rentPerMonth, years);
  // Шаг индексации меньше года смысла не имеет, а дробное значение из данных
  // (escEveryYears = 1e-9) раскручивало цикл на 3·10^10 итераций прямо в рендере.
  const period = Math.max(1, Math.floor(escEveryYears));
  const step = 1 + escPct / 100;
  let total = 0;
  let rate = rentPerMonth;
  let remaining = years;
  while (remaining > 0) {
    const block = Math.min(period, remaining);
    total += rate * 12 * block;
    remaining -= block;
    rate *= step;
  }
  return Math.round(total);
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

/**
 * THB price formatting for public listings.
 *
 * Per-listing asking prices are shown on the site (always allowed by policy —
 * only the *segment range* "15-50M premium" stays out of marketing copy). Land
 * also carries a price-per-rai figure.
 */

/** Full precision: "฿8,400,000". */
export function formatPriceTHB(thb: number): string {
  return `฿${Math.round(thb).toLocaleString("en-US")}`;
}

/**
 * Compact for cards: "฿8.4M" / "฿950K". Keeps grids tidy at premium price
 * points where full numbers are long.
 */
export function formatPriceCompact(thb: number): string {
  if (thb >= 1_000_000) {
    const m = thb / 1_000_000;
    const digits = m >= 100 || Number.isInteger(m) ? 0 : 1;
    return `฿${m.toFixed(digits)}M`;
  }
  if (thb >= 1_000) {
    return `฿${Math.round(thb / 1_000)}K`;
  }
  return `฿${Math.round(thb).toLocaleString("en-US")}`;
}

/** "฿2.1M / rai" — only meaningful for land. */
export function formatPricePerRai(thbPerRai: number): string {
  return `${formatPriceCompact(thbPerRai)} / rai`;
}

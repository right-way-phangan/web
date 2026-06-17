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

/**
 * Monthly lease rate for the Rent view — compact like a sale price but with a
 * per-month marker. `suffix` is localized ("/mo" / "/мес") so map pins and
 * cards read right in both languages: "฿25K/mo".
 */
export function formatRentCompact(thbPerMonth: number, suffix = "/mo"): string {
  return `${formatPriceCompact(thbPerMonth)}${suffix}`;
}

/** "≈ $260K" — compact dollar hint for cards (o.priceUsd is pre-derived). */
export function formatUsdCompact(usd: number): string {
  if (usd >= 1_000_000) {
    const m = usd / 1_000_000;
    return `≈ $${m.toFixed(m >= 100 || Number.isInteger(m) ? 0 : 1)}M`;
  }
  if (usd >= 1_000) return `≈ $${Math.round(usd / 1_000)}K`;
  return `≈ $${Math.round(usd).toLocaleString("en-US")}`;
}

/**
 * "≈ $445,000" — dollar hint next to the THB headline price. Rounded to
 * 3 significant figures: the FX rate moves daily, false precision would
 * just look wrong tomorrow.
 */
export function formatApproxUSD(thb: number, usdPerThb: number): string {
  const usd = thb * usdPerThb;
  const magnitude = 10 ** Math.max(Math.floor(Math.log10(usd)) - 2, 0);
  const rounded = Math.round(usd / magnitude) * magnitude;
  return `≈ $${rounded.toLocaleString("en-US")}`;
}

import "server-only";

/**
 * THB→USD rate for the "≈ $—" hint next to asking prices: international
 * buyers think in dollars, and a baht figure alone forces mental math.
 * The hint is approximate by design — daily precision is more than enough.
 *
 * Source: fawazahmed0/currency-api (keyless, CDN-served, 200+ currencies).
 * Cached for a day; on any failure we fall back to a conservative constant
 * so the page never blocks or breaks on the FX fetch.
 */
const FX_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/thb.json";

/** ~33 THB/USD — mid-2026 ballpark, refreshed by the live fetch above. */
const FALLBACK_USD_PER_THB = 0.0303;

export async function getUsdPerThb(): Promise<number> {
  try {
    const res = await fetch(FX_URL, { next: { revalidate: 86_400 } });
    if (!res.ok) throw new Error(`fx ${res.status}`);
    const data = (await res.json()) as { thb?: { usd?: number } };
    const rate = data.thb?.usd;
    if (typeof rate !== "number" || rate <= 0 || rate > 1) {
      throw new Error(`fx implausible rate: ${rate}`);
    }
    return rate;
  } catch (err) {
    console.error("[fx] falling back to constant:", err);
    return FALLBACK_USD_PER_THB;
  }
}

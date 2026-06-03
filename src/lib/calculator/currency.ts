/**
 * Currency display for the calculator. All maths stays in THB; this only
 * converts for display. Mirrors bot/miniapp/roi.html: live rates from
 * open.er-api.com (THB base) with a static fallback.
 */
export type Currency = "THB" | "USD" | "EUR" | "RUB";

export const CURRENCIES: Currency[] = ["THB", "USD", "EUR", "RUB"];

// Foreign units per 1 THB (approx mid-rates, fallback when live fetch fails).
export const DEFAULT_RATES: Record<Currency, number> = {
  THB: 1,
  USD: 1 / 35,
  EUR: 1 / 38,
  RUB: 1 / 0.38,
};

const SYMBOL: Record<Currency, string> = { THB: "฿", USD: "$", EUR: "€", RUB: "₽" };

export function formatMoney(
  thb: number,
  currency: Currency,
  rates: Record<Currency, number>,
  opts: { compact?: boolean } = {},
): string {
  const compact = opts.compact ?? true;
  const v = thb * (rates[currency] ?? 1);
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  let s: string;
  if (compact) {
    if (abs >= 1_000_000) s = (abs / 1_000_000).toFixed(2).replace(/\.0+$/, "") + "M";
    else if (abs >= 1_000) s = Math.round(abs / 1_000) + "K";
    else s = Math.round(abs).toString();
  } else {
    s = Math.round(abs).toLocaleString("en-US");
  }
  const sym = SYMBOL[currency];
  return currency === "RUB" ? `${sign}${s} ${sym}` : `${sign}${sym}${s}`;
}

/** Best-effort live rates (THB base). Returns null on any failure. */
export async function fetchRates(): Promise<Record<Currency, number> | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/THB", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data?.rates;
    if (!r || typeof r.USD !== "number") return null;
    return {
      THB: 1,
      USD: r.USD,
      EUR: r.EUR ?? DEFAULT_RATES.EUR,
      RUB: r.RUB ?? DEFAULT_RATES.RUB,
    };
  } catch {
    return null;
  }
}

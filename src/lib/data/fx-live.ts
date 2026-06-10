/**
 * Живые рыночные курсы к THB (справочно). Источник — open.er-api.com (free,
 * без ключа, есть RUB). Кэш 6 ч через Next revalidate. При ошибке → null,
 * дашборд тихо показывает только учётные курсы.
 *
 * Учётные курсы (FX в finance.ts) остаются базой для расчётов THB — они
 * стабильны и совпадают с трекером/Google-таблицей (важно для предоплаченных
 * сумм). Рыночные — только для информации «сколько это сейчас».
 */

export type LiveRates = { USD: number; RUB: number; EUR: number; date: string };

export async function getLiveRatesTHB(): Promise<LiveRates | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 21600 }, // 6 часов
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Record<string, number>;
    };
    const r = data.rates;
    if (data.result !== "success" || !r?.THB || !r.RUB || !r.EUR) return null;
    // rates[X] = X за 1 USD. Нужен курс валюты → THB.
    return {
      USD: r.THB, // THB за 1 USD
      EUR: r.THB / r.EUR, // THB за 1 EUR
      RUB: r.THB / r.RUB, // THB за 1 RUB
      date: data.time_last_update_utc?.slice(0, 16) ?? new Date().toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

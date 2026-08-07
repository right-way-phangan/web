"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Currency, DEFAULT_RATES, fetchRates, formatMoney } from "@/lib/calculator/currency";

interface Ctx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Форматировать сумму THB в выбранной валюте (компактно: ฿8.4M / $240K). */
  fmt: (thb: number) => string;
  /** Полная точность (заголовок цены, спецификация): ฿8,400,000 / $240,000. */
  fmtFull: (thb: number) => string;
}

const CurrencyCtx = createContext<Ctx | null>(null);
const KEY = "rw-currency";

/** Валюты переключателя (฿/$/₽) — общий для всего каталога (участки/проекты/объекты). */
export const TOGGLE_CURRENCIES: Currency[] = ["THB", "USD", "RUB"];
const SYMBOL: Record<Currency, string> = { THB: "฿", USD: "$", EUR: "€", RUB: "₽" };

/**
 * Компактный формат, идентичный каталожному `formatPriceCompact` (1 знак у
 * миллионов), но в выбранной валюте. Своя реализация, чтобы каталог не получил
 * косметической регрессии от двухзначного `formatMoney({compact})`. THB-ветка
 * детерминирована (тот же код на сервере и клиенте) → нет hydration-mismatch.
 */
function formatCompact(thb: number, currency: Currency, rates: Record<Currency, number>): string {
  const v = thb * (rates[currency] ?? 1);
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  let s: string;
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    s = `${m >= 100 || Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
  } else if (abs >= 1_000) {
    s = `${Math.round(abs / 1_000)}K`;
  } else {
    s = Math.round(abs).toLocaleString("en-US");
  }
  return currency === "RUB" ? `${sign}${s} ${SYMBOL[currency]}` : `${sign}${SYMBOL[currency]}${s}`;
}

/**
 * Провайдер валюты для витрин (участки/проекты): суммы хранятся в THB, здесь —
 * только отображение. Живой курс `fetchRates` (open.er-api, THB-база) с откатом
 * на `DEFAULT_RATES`. Выбор запоминается в localStorage (общий ключ → курс
 * переносится между страницами). Вне провайдера хук безопасно отдаёт THB.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("THB");
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Currency | null;
      if (saved && TOGGLE_CURRENCIES.includes(saved)) setCurrencyState(saved);
    } catch {
      /* приватный режим */
    }
    fetchRates().then((r) => r && setRates(r));
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* приватный режим */
    }
  };

  const fmt = (thb: number) => formatCompact(thb, currency, rates);
  const fmtFull = (thb: number) => formatMoney(thb, currency, rates, { compact: false });

  return (
    <CurrencyCtx.Provider value={{ currency, setCurrency, fmt, fmtFull }}>
      {children}
    </CurrencyCtx.Provider>
  );
}

export function useCurrency(): Ctx {
  return (
    useContext(CurrencyCtx) ?? {
      currency: "THB",
      setCurrency: () => {},
      fmt: (thb: number) => formatCompact(thb, "THB", DEFAULT_RATES),
      fmtFull: (thb: number) => formatMoney(thb, "THB", DEFAULT_RATES, { compact: false }),
    }
  );
}

/** Сегментированный переключатель ฿ / $ / ₽. */
export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className={`inline-flex shrink-0 rounded-full border border-forest-500/15 bg-cream-50 p-0.5 ${className ?? ""}`}>
      {TOGGLE_CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          // Сегмент рисуется на 24px, а нажимается на 44: невидимый
          // псевдоэлемент добирает высоту, размер плашки не меняется.
          className={`relative rounded-full px-2.5 py-1 text-xs font-medium transition-colors before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] ${
            currency === c ? "bg-forest-900 text-cream-50" : "text-forest-500/70 hover:text-forest-900"
          }`}
        >
          {SYMBOL[c]}
        </button>
      ))}
    </div>
  );
}

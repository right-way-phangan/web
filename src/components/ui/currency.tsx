"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Currency, DEFAULT_RATES, fetchRates, formatMoney } from "@/lib/calculator/currency";

interface Ctx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Форматировать сумму THB в выбранной валюте (компактно). */
  fmt: (thb: number) => string;
}

const CurrencyCtx = createContext<Ctx | null>(null);
const KEY = "rw-currency";

/** Валюты переключателя (฿/$/₽) — общий для страниц участков и проектов. */
export const TOGGLE_CURRENCIES: Currency[] = ["THB", "USD", "RUB"];
const SYMBOL: Record<Currency, string> = { THB: "฿", USD: "$", EUR: "€", RUB: "₽" };

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

  const fmt = (thb: number) => formatMoney(thb, currency, rates);

  return <CurrencyCtx.Provider value={{ currency, setCurrency, fmt }}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency(): Ctx {
  return (
    useContext(CurrencyCtx) ?? {
      currency: "THB",
      setCurrency: () => {},
      fmt: (thb: number) => formatMoney(thb, "THB", DEFAULT_RATES),
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
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            currency === c ? "bg-forest-900 text-cream-50" : "text-forest-500/70 hover:text-forest-900"
          }`}
        >
          {SYMBOL[c]}
        </button>
      ))}
    </div>
  );
}

/**
 * Финансовый трекер Right Way — источник данных для дашборда /admin/finance.
 *
 * Это «учётный» снимок текущих расходов (pre-incorporation OpEx), движений по
 * сделкам и постоянных расходов. Ведётся в коде (версионируется в git) — правим
 * здесь, дашборд обновляется при деплое. Зеркалит документ
 * `docs/strategy/Right Way — учёт расходов (OpEx tracker).md` и Google-таблицу
 * «Right Way — Финансы (мастер)».
 *
 * THB/мес считается из priceOrig × курс (см. FX), период year нормализуется /12.
 * Так единый источник правды — цена в исходной валюте, а не дублированный THB.
 */

export type Currency = "USD" | "RUB" | "EUR" | "THB";
export type Period = "month" | "year" | "none";

/** Статусы подписок. `leak` — утечка (не расход RW, к отвязке). */
export type SubStatus = "active" | "paid" | "free" | "pending" | "leak";

/** Курсы к THB. Учётные, обновляются вручную при сверке. */
export const FX_DATE = "2026-06-10";
export const FX: Record<Currency, number> = { USD: 36.5, RUB: 0.42, EUR: 39.5, THB: 1 };

export type Subscription = {
  item: string;
  provider: string;
  plan: string;
  priceOrig: number;
  currency: Currency;
  period: Period;
  payment: string;
  status: SubStatus;
  note?: string;
};

/** Текущие подписки/сервисы (OpEx). Источник — OpEx tracker §2/§3. */
export const subscriptions: Subscription[] = [
  { item: "Claude Code (ИИ-ассистент)", provider: "Anthropic", plan: "Max 20x", priceOrig: 200, currency: "USD", period: "month", payment: "личная карта", status: "active" },
  { item: "CRM", provider: "amoCRM", plan: "Расширенный, 1 польз.", priceOrig: 11988, currency: "RUB", period: "year", payment: "личная карта", status: "paid", note: "оплачено до 09.01.2027" },
  { item: "Домен rightwaygroup.co", provider: "GoDaddy", plan: "renewal", priceOrig: 30, currency: "USD", period: "year", payment: "личная карта", status: "active" },
  { item: "Хостинг сайта", provider: "Vercel", plan: "Hobby", priceOrig: 0, currency: "USD", period: "none", payment: "—", status: "free" },
  { item: "Telegram-бот", provider: "venv/локально", plan: "—", priceOrig: 0, currency: "USD", period: "none", payment: "—", status: "free" },
  { item: "Презентации", provider: "Gamma", plan: "Free", priceOrig: 0, currency: "USD", period: "none", payment: "—", status: "pending", note: "не активирован" },
  { item: "LLM API (бот/RAG)", provider: "Anthropic API", plan: "pay-as-you-go", priceOrig: 0, currency: "USD", period: "none", payment: "—", status: "pending", note: "ждёт Wise" },
  { item: "Корп. хранилище", provider: "Google Workspace", plan: "—", priceOrig: 0, currency: "USD", period: "none", payment: "—", status: "pending", note: "после юр.лица" },
  { item: "DigitalOcean (Circle)", provider: "DigitalOcean", plan: "droplet", priceOrig: 12, currency: "USD", period: "month", payment: "карта …4673", status: "leak", note: "утечка — к отвязке" },
];

export type RecurringStatus = "active" | "planned" | "scalable" | "future";

export type Recurring = {
  item: string;
  thbPerMonth: number;
  when: string;
  status: RecurringStatus;
};

/** Постоянные расходы помимо подписок (текущие + будущие). OpEx tracker §5. */
export const recurring: Recurring[] = [
  { item: "Co. Ltd. recurring (bookkeeping/audit/tax/секретарь)", thbPerMonth: 18000, when: "Этап 1 (после регистрации)", status: "planned" },
  { item: "Google Workspace (~$6/польз.)", thbPerMonth: 220, when: "Этап 1", status: "planned" },
  { item: "Агент — base salary", thbPerMonth: 40000, when: "при найме (Q4 2026+)", status: "planned" },
  { item: "Аренда офиса (home-office)", thbPerMonth: 5000, when: "при найме агента (опц.)", status: "planned" },
  { item: "Маркетинг (Google Ads и пр.)", thbPerMonth: 60000, when: "по мере роста", status: "scalable" },
  { item: "Полноценный офис", thbPerMonth: 0, when: "Q2 2027 (если 4+ агентов)", status: "future" },
];

export type Deal = {
  closingDate: string;
  object: string;
  type: string;
  dealAmount: number;
  commissionGross: number;
  referral: number;
  coAgency: number;
  dealCosts: number;
  netRW: number;
  source: string;
};

/** Закрытые сделки (приходы). Пока пусто — стадия запуска. OpEx tracker §4. */
export const deals: Deal[] = [];

// ── Хелперы расчёта ────────────────────────────────────────────────────────

/** THB/мес для подписки: цена × курс, год → /12, нулевые/none → 0. */
export function thbPerMonth(s: Subscription): number {
  if (s.priceOrig === 0 || s.period === "none") return 0;
  const base = s.priceOrig * FX[s.currency];
  return s.period === "year" ? base / 12 : base;
}

/** OpEx активных THB/мес (всё кроме утечки). */
export function opexActiveMonthly(): number {
  return subscriptions
    .filter((s) => s.status !== "leak")
    .reduce((sum, s) => sum + thbPerMonth(s), 0);
}

/** Утечка THB/мес (статус leak). */
export function leakMonthly(): number {
  return subscriptions
    .filter((s) => s.status === "leak")
    .reduce((sum, s) => sum + thbPerMonth(s), 0);
}

/** Постоянные расходы по статусу, THB/мес. */
export function recurringByStatus(status: RecurringStatus): number {
  return recurring.filter((r) => r.status === status).reduce((s, r) => s + r.thbPerMonth, 0);
}

/** Чистый приход по сделкам (Net RW). */
export function dealsNet(): number {
  return deals.reduce((s, d) => s + d.netRW, 0);
}

/** Баланс месяца: приходы − OpEx активных − постоянные активные. */
export function monthlyBalance(): number {
  return dealsNet() - opexActiveMonthly() - recurringByStatus("active");
}

/** Структура OpEx по статьям (только ненулевые, без утечки) — для донат-графика. */
export function opexBreakdown(): Array<{ label: string; value: number }> {
  return subscriptions
    .filter((s) => s.status !== "leak")
    .map((s) => ({ label: s.item, value: thbPerMonth(s) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Формат THB: "7 811 ฿". */
export function fmtTHB(n: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n)) + " ฿";
}

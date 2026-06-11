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

export type RecurringStatus = "active" | "planned" | "on_hire" | "scalable" | "future";

export type Recurring = {
  item: string;
  thbPerMonth: number;
  when: string;
  status: RecurringStatus;
};

/**
 * Постоянные расходы помимо подписок. OpEx tracker §5. Статусы:
 *  active — уже идёт · planned — обязательно после регистрации Co.Ltd ·
 *  on_hire — при найме агента · scalable — масштабируемо · future — далеко.
 */
export const recurring: Recurring[] = [
  { item: "Co. Ltd. recurring (bookkeeping/audit/tax/секретарь)", thbPerMonth: 18000, when: "Этап 1 (после регистрации)", status: "planned" },
  { item: "Google Workspace (~$6/польз.)", thbPerMonth: 220, when: "Этап 1", status: "planned" },
  { item: "Агент — base salary", thbPerMonth: 40000, when: "при найме (Q4 2026+)", status: "on_hire" },
  { item: "Аренда офиса (home-office)", thbPerMonth: 5000, when: "при найме агента (опц.)", status: "on_hire" },
  { item: "Маркетинг (Google Ads и пр.)", thbPerMonth: 60000, when: "по мере роста", status: "scalable" },
  { item: "Полноценный офис", thbPerMonth: 0, when: "Q2 2027 (если 4+ агентов)", status: "future" },
];

export type LedgerEntry = {
  date: string; // ISO или "" если ещё не оплачено/неизвестно
  item: string;
  amountOrig: number | null;
  currency: Currency;
  thb: number | null;
  account: string;
  kind: "OpEx" | "leak" | "deal" | "one-time" | "income";
  receipt: boolean;
};

/**
 * Журнал фактических платежей (pre-incorporation). OpEx tracker §8.
 * Основа для возмещения основателю через director's loan после Co.Ltd.
 */
export const ledger: LedgerEntry[] = [
  { date: "2026-01-09", item: "amoCRM Расширенный (год)", amountOrig: 11988, currency: "RUB", thb: 5035, account: "личная", kind: "OpEx", receipt: false },
  { date: "", item: "amoCRM пакет «Доп. лимиты API»", amountOrig: null, currency: "RUB", thb: null, account: "личная", kind: "OpEx", receipt: false },
  { date: "", item: "GoDaddy renewal домена", amountOrig: 30, currency: "USD", thb: 1095, account: "личная", kind: "OpEx", receipt: false },
  { date: "", item: "Claude Max 20x (ежемесячно)", amountOrig: 200, currency: "USD", thb: 7300, account: "личная", kind: "OpEx", receipt: false },
  { date: "", item: "DigitalOcean (Circle)", amountOrig: 12, currency: "USD", thb: 438, account: "карта …4673", kind: "leak", receipt: false },
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

export type PlannedQuarter = { q: string; deals: number; thb: number };

/** Плановый график приходов Year 1 (финмодель, сценарий A — база). */
export const plannedRevenue: PlannedQuarter[] = [
  { q: "Q1 · Aug–Oct", deals: 1, thb: 960000 },
  { q: "Q2 · Nov–Jan", deals: 1, thb: 960000 },
  { q: "Q3 · Feb–Apr", deals: 2, thb: 1920000 },
  { q: "Q4 · May–Jul", deals: 2, thb: 1920000 },
];

// ── Хелперы расчёта ────────────────────────────────────────────────────────

/** THB/мес для подписки: цена × курс, год → /12, нулевые/none → 0. */
export function thbPerMonth(s: Subscription): number {
  if (s.priceOrig === 0 || s.period === "none") return 0;
  const base = s.priceOrig * FX[s.currency];
  return s.period === "year" ? base / 12 : base;
}

/** OpEx активных THB/мес (всё кроме утечки). Принимает live-данные или код по умолчанию. */
export function opexActiveMonthly(subs: Subscription[] = subscriptions): number {
  return subs.filter((s) => s.status !== "leak").reduce((sum, s) => sum + thbPerMonth(s), 0);
}

/** Утечка THB/мес (статус leak). */
export function leakMonthly(subs: Subscription[] = subscriptions): number {
  return subs.filter((s) => s.status === "leak").reduce((sum, s) => sum + thbPerMonth(s), 0);
}

/** Постоянные расходы по статусу, THB/мес. */
export function recurringByStatus(status: RecurringStatus, recs: Recurring[] = recurring): number {
  return recs.filter((r) => r.status === status).reduce((s, r) => s + r.thbPerMonth, 0);
}

/** Чистый приход по сделкам (Net RW). */
export function dealsNet(dls: Deal[] = deals): number {
  return dls.reduce((s, d) => s + d.netRW, 0);
}

/** Баланс месяца: приходы − OpEx активных − постоянные активные. */
export function monthlyBalance(subs: Subscription[] = subscriptions, dls: Deal[] = deals): number {
  return dealsNet(dls) - opexActiveMonthly(subs) - recurringByStatus("active");
}

/** Структура OpEx по статьям (только ненулевые, без утечки) — для донат-графика. */
export function opexBreakdown(
  subs: Subscription[] = subscriptions,
): Array<{ label: string; value: number }> {
  return subs
    .filter((s) => s.status !== "leak")
    .map((s) => ({ label: s.item, value: thbPerMonth(s) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Ожидаемый постоянный OpEx после регистрации Co.Ltd (без найма): подписки + обязательная операционка. */
export function stage1MonthlyForecast(subs: Subscription[] = subscriptions): number {
  return opexActiveMonthly(subs) + recurringByStatus("planned");
}

/** Сумма понесённых платежей в ledger (pre-incorporation, к возмещению основателю). */
export function ledgerTotalTHB(led: LedgerEntry[] = ledger): number {
  return led
    .filter((e) => e.kind !== "leak" && e.kind !== "income")
    .reduce((s, e) => s + (e.thb ?? 0), 0);
}

/** Сумма доходов в ledger. */
export function ledgerIncomeTHB(led: LedgerEntry[] = ledger): number {
  return led.filter((e) => e.kind === "income").reduce((s, e) => s + (e.thb ?? 0), 0);
}

export type MonthPoint = { month: string; spent: number; income: number };

/**
 * Динамика по месяцам из ledger: траты (всё, что не доход — реальный отток,
 * включая утечку) и доходы. Записи без даты/суммы не попадают.
 */
export function ledgerMonthlySeries(led: LedgerEntry[] = ledger): MonthPoint[] {
  const map = new Map<string, MonthPoint>();
  for (const e of led) {
    if (!e.date || e.thb == null) continue;
    const m = e.date.slice(0, 7);
    const p = map.get(m) ?? { month: m, spent: 0, income: 0 };
    if (e.kind === "income") p.income += e.thb;
    else p.spent += e.thb;
    map.set(m, p);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

/** Формат THB: "7 811 ฿". */
export function fmtTHB(n: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n)) + " ฿";
}

export type DisplayCurrency = "THB" | "USD";

/** Формат суммы (в THB на входе) в выбранной валюте отображения. */
export function fmtMoney(thb: number, currency: DisplayCurrency = "THB"): string {
  if (currency === "USD") {
    const usd = thb / FX.USD;
    return "$" + new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(usd));
  }
  return fmtTHB(thb);
}

/**
 * Машиночитаемая сводка — мост к личному проекту «Сам себе я».
 * Пока компании нет, OpEx RW = личные расходы основателя (категория «Бизнес / Right Way»).
 */
export function financeSummary(
  subs: Subscription[] = subscriptions,
  led: LedgerEntry[] = ledger,
  dls: Deal[] = deals,
) {
  const opex = opexActiveMonthly(subs);
  return {
    date: FX_DATE,
    currency: "THB" as const,
    opexMonthly: Math.round(opex),
    opexYearly: Math.round(opex * 12),
    opexMonthlyUSD: Math.round(opex / FX.USD),
    leakMonthly: Math.round(leakMonthly(subs)),
    dealsNet: Math.round(dealsNet(dls)),
    monthlyBalance: Math.round(monthlyBalance(subs, dls)),
    stage1Forecast: Math.round(stage1MonthlyForecast(subs)),
    preIncorporationPaid: Math.round(ledgerTotalTHB(led)),
    note: "Pre-incorporation: OpEx RW оплачивается лично основателем = личный расход (категория «Бизнес / Right Way»). После Co.Ltd — возмещение через director's loan.",
  };
}

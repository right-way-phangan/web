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

/** Плановый график приходов Year 1 (финмодель v0.2, сценарий A — база, 5%). */
export const plannedRevenue: PlannedQuarter[] = [
  { q: "Q1 · Aug–Oct", deals: 1, thb: 750000 },
  { q: "Q2 · Nov–Jan", deals: 1, thb: 1000000 },
  { q: "Q3 · Feb–Apr", deals: 2, thb: 2200000 },
  { q: "Q4 · May–Jul", deals: 2, thb: 2400000 },
];

// ── Личные расходы + runway (bootstrap) ─────────────────────────────────────
//
// Временно (пока компании нет) ведём личные расходы здесь же, чтобы видеть ОДИН
// runway: бизнес-burn крошечный, реальный счётчик выживания — личные траты до
// первой сделки. См. финмодель «Старт почти без капитала» + OpEx tracker §1.
// estimate=true — прикидка, заменить реальной цифрой.

export type PersonalExpense = {
  item: string;
  thbPerMonth: number;
  estimate?: boolean;
  note?: string;
};

/**
 * Личные расходы основателя в месяц (Панган, режим bootstrap).
 * 🔒 ПРИВАТНО: реальные суммы НЕ в публичном репо — они в приватной Google-таблице,
 * лист `Personal` (item | thb | estimate | note). Здесь пусто; дашборд подставляет
 * значения из таблицы (см. loadPersonalFromSheet). Fallback без таблицы — пусто.
 */
export const personalExpenses: PersonalExpense[] = [];

/** Наличные на руках (THB). 🔒 Приватно: реальное — лист `Runway` таблицы (cash). */
export const cashOnHand = 0;

/** Дебиторка — мне должны (THB). 🔒 Приватно: реальное — лист `Receivables` таблицы. */
export type Receivable = {
  from: string;
  thb: number;
  due: string; // ISO срок погашения
  status: "overdue" | "expected";
  note?: string;
};

export const receivables: Receivable[] = [];

/** Вся дебиторка, THB. */
export function receivablesTotal(rec: Receivable[] = receivables): number {
  return rec.reduce((s, r) => s + r.thb, 0);
}

/** Просроченная (взыскать сейчас) дебиторка, THB. */
export function receivablesOverdue(rec: Receivable[] = receivables): number {
  return rec.filter((r) => r.status === "overdue").reduce((s, r) => s + r.thb, 0);
}

/** Сумма личных расходов в месяц. */
export function personalMonthly(exp: PersonalExpense[] = personalExpenses): number {
  return exp.reduce((s, e) => s + e.thbPerMonth, 0);
}

/**
 * Совокупный burn в месяц на время bootstrap: бизнес OpEx (активный, без утечки)
 * + активные постоянные расходы + личные расходы. Это «сколько горит» всего.
 */
export function combinedBurnMonthly(
  subs: Subscription[] = subscriptions,
  exp: PersonalExpense[] = personalExpenses,
): number {
  return opexActiveMonthly(subs) + recurringByStatus("active") + personalMonthly(exp);
}

/** На сколько месяцев хватит наличных при заданном burn. null если cash не задан. */
export function runwayMonths(cash: number, burn: number): number | null {
  if (cash <= 0 || burn <= 0) return null;
  return cash / burn;
}

/**
 * Текущий регулярный доход в месяц (THB). 0 — pre-revenue (старая компания
 * закрывается, у RW ещё нет сделок). Может прийти из таблицы (лист Runway).
 */
export const monthlyIncome = 0;

/** Чистый отток в месяц: burn − доход (положительное = проедание наличных). */
export function netBurnMonthly(
  subs: Subscription[] = subscriptions,
  exp: PersonalExpense[] = personalExpenses,
  income: number = monthlyIncome,
): number {
  return combinedBurnMonthly(subs, exp) - income;
}

/**
 * Дата, когда наличные кончатся при заданном чистом оттоке/мес. null если
 * оттока нет (доход ≥ burn) или нет наличных. Месяц ≈ 30.44 дня.
 */
export function cashOutDate(
  cash: number,
  netBurnPerMonth: number,
  from: Date = new Date(),
): Date | null {
  if (cash <= 0 || netBurnPerMonth <= 0) return null;
  const days = (cash / netBurnPerMonth) * 30.44;
  const d = new Date(from);
  d.setDate(d.getDate() + Math.round(days));
  return d;
}

/** Рычаги экономии (THB/мес), которые можно включить в режиме bootstrap. */
export type SavingLever = { label: string; thbPerMonth: number; note?: string };
export const savingsLevers: SavingLever[] = [
  { label: "Виза → DTV (вместо border run)", thbPerMonth: 8000, note: "нужен барьер 500k на счету 3 мес" },
  { label: "Claude Max → Pro", thbPerMonth: 3650, note: "движок остаётся, лимит меньше" },
  { label: "Еда: готовка вместо кафе", thbPerMonth: 6000, note: "оценка" },
];

/** Суммарная экономия при включении всех рычагов, THB/мес. */
export function leversTotal(lev: SavingLever[] = savingsLevers): number {
  return lev.reduce((s, l) => s + l.thbPerMonth, 0);
}

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

export type DisplayCurrency = "THB" | "USD" | "RUB";

/**
 * Формат суммы (в THB на входе) в выбранной валюте отображения.
 * fx — курсы пересчёта: по умолчанию учётные FX; страница передаёт live-курс
 * для RUB (заработок в ฿, переводы домой в ₽ — важен рыночный курс «сейчас»).
 * USD остаётся учётным, чтобы $-цены подписок сходились round-trip ($200 = $200).
 */
export function fmtMoney(
  thb: number,
  currency: DisplayCurrency = "THB",
  fx: Record<Currency, number> = FX,
): string {
  if (currency === "USD") {
    const usd = thb / fx.USD;
    return "$" + new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(usd));
  }
  if (currency === "RUB") {
    const rub = thb / fx.RUB;
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(rub)) + " ₽";
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
    opexMonthlyRUB: Math.round(opex / FX.RUB),
    leakMonthly: Math.round(leakMonthly(subs)),
    dealsNet: Math.round(dealsNet(dls)),
    monthlyBalance: Math.round(monthlyBalance(subs, dls)),
    stage1Forecast: Math.round(stage1MonthlyForecast(subs)),
    preIncorporationPaid: Math.round(ledgerTotalTHB(led)),
    note: "Pre-incorporation: OpEx RW оплачивается лично основателем = личный расход (категория «Бизнес / Right Way»). После Co.Ltd — возмещение через director's loan.",
  };
}

// ── Дневник разовых трат: личное/бизнес + категории ─────────────────────────
//
// Источник — лист `Transactions` мастер-таблицы (loadTransactionsFromSheet),
// куда пишет Telegram-бот (голос/текст) и форма /admin/finance/add. Отдельно
// от ledger (у того семантика pre-incorporation возмещений). Личные суммы
// приватны — лежат в таблице, не в коде. Дашборд сводит разрез личное/бизнес.

export type TxScope = "личное" | "бизнес";

export type Transaction = {
  date: string; // ISO YYYY-MM-DD
  scope: TxScope;
  amountOrig: number;
  currency: Currency;
  thb: number;
  category: string;
  note: string;
  account: string;
  source: string; // bot-voice | bot-text | bot-cmd | web | …
};

/** Категории по сферам — синхронны с `bot/finance_writer.py`. «Прочее» в конце. */
export const BUSINESS_CATEGORIES = [
  "ИИ/софт", "Хостинг/домены", "CRM", "Маркетинг/реклама", "Юр/бухгалтерия",
  "Хранилище", "Транспорт по делам", "Представительские", "Прочее",
] as const;
export const PERSONAL_CATEGORIES = [
  "Продукты", "Кафе/рестораны", "Транспорт/байк/бензин", "Жильё/аренда",
  "Связь/интернет", "Здоровье", "Виза/документы", "Быт", "Развлечения", "Прочее",
] as const;

/** Список категорий для сферы (для формы/валидации). */
export function categoriesForScope(scope: TxScope): readonly string[] {
  return scope === "бизнес" ? BUSINESS_CATEGORIES : PERSONAL_CATEGORIES;
}

/** Текущая дата 'YYYY-MM-DD' в таймзоне Бангкока (день траты — местный). */
export function bangkokToday(now: Date = new Date()): string {
  // en-CA даёт ISO-формат YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Текущий месяц 'YYYY-MM' в таймзоне Бангкока. */
export function currentYM(now: Date = new Date()): string {
  return bangkokToday(now).slice(0, 7);
}

/** Траты за месяц ym (по префиксу ISO-даты). */
export function txInMonth(txs: Transaction[], ym: string): Transaction[] {
  return txs.filter((t) => t.date.startsWith(ym));
}

export type TxTotals = { personal: number; business: number; total: number };

/** Суммы THB по сферам. */
export function txTotals(txs: Transaction[]): TxTotals {
  let personal = 0;
  let business = 0;
  for (const t of txs) {
    if (t.scope === "бизнес") business += t.thb;
    else personal += t.thb;
  }
  return { personal, business, total: personal + business };
}

/** Разбивка THB по категориям внутри сферы (для доната), по убыванию. */
export function txBreakdown(
  txs: Transaction[],
  scope: TxScope,
): Array<{ label: string; value: number }> {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.scope !== scope) continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.thb);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);
}

export type TxMonthSplit = { month: string; personal: number; business: number };

/** Помесячный разрез личное/бизнес (для тренда). */
export function txMonthlySplit(txs: Transaction[]): TxMonthSplit[] {
  const map = new Map<string, TxMonthSplit>();
  for (const t of txs) {
    if (!t.date) continue;
    const m = t.date.slice(0, 7);
    const p = map.get(m) ?? { month: m, personal: 0, business: 0 };
    if (t.scope === "бизнес") p.business += t.thb;
    else p.personal += t.thb;
    map.set(m, p);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

// ── Две кассы: личное / Right Way (гибрид: старт + авто-вычет трат) ──────────
//
// Каждая касса — текущий остаток наличных, заданный на дату (as-of), от которого
// автоматически вычитаются траты дневника той же сферы с датой ≥ as-of. Источник
// стартовых сумм — лист `Wallets` (личное/бизнес · баланс · дата), правится через
// /admin/finance/wallets. Это «сколько у меня» (личное) и «сколько в компании»
// (Right Way) раздельно. Пре-инкорпорейшн бизнес-касса часто ≤ 0 (вложено лично).

export type Wallet = { scope: TxScope; balance: number; asOf: string };

export type WalletState = {
  scope: TxScope;
  start: number; // заданный остаток на дату asOf
  asOf: string; // ISO-дата, с которой вычитаются траты
  spent: number; // потрачено по сфере с asOf
  current: number; // start − spent
};

/** Текущий остаток кассы = старт − траты сферы с даты as-of (ISO-сравнение строк). */
export function walletState(w: Wallet, txs: Transaction[]): WalletState {
  const spent = txs
    .filter((t) => t.scope === w.scope && t.date >= w.asOf)
    .reduce((s, t) => s + t.thb, 0);
  return { scope: w.scope, start: w.balance, asOf: w.asOf, spent, current: w.balance - spent };
}

/** Касса сферы из набора (или нулевая на fallback-дату, если не задана). */
export function walletFor(scope: TxScope, wallets: Wallet[], fallbackDate: string): Wallet {
  return wallets.find((w) => w.scope === scope) ?? { scope, balance: 0, asOf: fallbackDate };
}

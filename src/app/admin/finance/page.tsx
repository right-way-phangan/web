import type { Metadata } from "next";
import { FinanceDonut } from "@/components/admin/finance-donut";
import { FinanceTrend } from "@/components/admin/finance-trend";
import {
  subscriptions,
  recurring,
  deals,
  ledger,
  plannedRevenue,
  thbPerMonth,
  opexActiveMonthly,
  leakMonthly,
  recurringByStatus,
  dealsNet,
  monthlyBalance,
  stage1MonthlyForecast,
  ledgerTotalTHB,
  ledgerIncomeTHB,
  ledgerMonthlySeries,
  opexBreakdown,
  personalExpenses,
  cashOnHand,
  monthlyIncome,
  receivables,
  receivablesTotal,
  receivablesSummary,
  personalMonthly,
  combinedBurnMonthly,
  runwayMonths,
  netBurnMonthly,
  cashOutDate,
  savingsLevers,
  leversTotal,
  currentYM,
  txInMonth,
  txTotals,
  txBreakdown,
  bangkokToday,
  walletFor,
  walletStates,
  debtsSummary,
  upcomingPayments,
  budgetVsActual,
  goalProgress,
  fmtMoney,
  FX,
  FX_DATE,
  type SubStatus,
  type RecurringStatus,
  type Currency,
  type DisplayCurrency,
} from "@/lib/data/finance";
import { getLiveRatesTHB } from "@/lib/data/fx-live";
import {
  loadFinanceFromSheet,
  loadRunwayFromSheet,
  loadTransactionsFromSheet,
  loadWalletsFromSheet,
  loadDebtsFromSheet,
  loadPaymentsFromSheet,
  loadBudgetFromSheet,
  loadGoalsFromSheet,
} from "@/lib/data/finance-sheet";
import { getLeads, getEvents } from "@/lib/data/leads";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Финансы",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  hint,
  accent,
  negative,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-5 " +
        (accent ? "border-brass-500/30 bg-brass-500/[0.06]" : "border-forest-900/10 bg-cream-50")
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-forest-900/45">{label}</p>
      <p
        className={
          "mt-1 text-3xl font-semibold " + (negative ? "text-brass-600" : "text-forest-900")
        }
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-forest-900/50">{hint}</p>}
    </div>
  );
}

const SUB_BADGE: Record<SubStatus, { label: string; cls: string }> = {
  active: { label: "актив", cls: "bg-forest-900/10 text-forest-900/70" },
  paid: { label: "оплачено", cls: "bg-forest-50 text-forest-500" },
  free: { label: "free", cls: "bg-forest-900/5 text-forest-900/45" },
  pending: { label: "ожидает", cls: "bg-brass-500/10 text-brass-600" },
  leak: { label: "утечка", cls: "bg-red-50 text-red-600" },
};

const REC_BADGE: Record<RecurringStatus, { label: string; cls: string }> = {
  active: { label: "активно", cls: "bg-forest-900/10 text-forest-900/70" },
  planned: { label: "Этап 1", cls: "bg-brass-500/10 text-brass-600" },
  on_hire: { label: "при найме", cls: "bg-brass-500/5 text-brass-600/80" },
  scalable: { label: "масштаб.", cls: "bg-forest-900/5 text-forest-900/55" },
  future: { label: "далеко", cls: "bg-forest-900/5 text-forest-900/40" },
};

const CUR_SIGN: Record<string, string> = { USD: "$", RUB: "₽", EUR: "€", THB: "฿" };

function priceLabel(s: (typeof subscriptions)[number]): string {
  if (s.priceOrig === 0) return "—";
  const sign = CUR_SIGN[s.currency];
  const amount = new Intl.NumberFormat("ru-RU").format(s.priceOrig);
  const per = s.period === "month" ? "/мес" : s.period === "year" ? "/год" : "";
  const head = s.currency === "USD" ? `${sign}${amount}` : `${amount} ${sign}`;
  return `${head}${per}`;
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ cur?: string; added?: string; wallets?: string }>;
}) {
  const { cur: curParam, added, wallets: walletsSaved } = await searchParams;
  const cur: DisplayCurrency = curParam === "usd" ? "USD" : curParam === "rub" ? "RUB" : "THB";

  const [
    live, sheet, runwaySheet, crmLeads, crmEvents,
    txSheet, walletsSheet, debtsSheet, paymentsSheet, budgetSheet, goalsSheet,
  ] = await Promise.all([
    getLiveRatesTHB(),
    loadFinanceFromSheet(),
    loadRunwayFromSheet(),
    getLeads(),
    getEvents(500),
    loadTransactionsFromSheet(),
    loadWalletsFromSheet(),
    loadDebtsFromSheet(),
    loadPaymentsFromSheet(),
    loadBudgetFromSheet(),
    loadGoalsFromSheet(),
  ]);

  // Рубли пересчитываем по живому рыночному курсу (переводы домой в ₽ — важен
  // курс «сейчас»), fallback — учётный. USD остаётся учётным (round-trip $-цен).
  const fxDisp: Record<Currency, number> = { ...FX, RUB: live?.RUB ?? FX.RUB };
  const money = (n: number) => fmtMoney(n, cur, fxDisp);

  // Журнал сделок — Won-лиды из CRM: дата выигрыша из событий стадий,
  // комиссия = факт (commissionValue) либо расчёт по формуле max(5%; 150k).
  const wonAt = new Map<number, string>();
  for (const e of crmEvents) {
    if (e.type === "stage" && e.toStage === "Won" && e.leadId != null && !wonAt.has(e.leadId)) {
      wonAt.set(e.leadId, e.createdAt); // события идут desc → первое = последний выигрыш
    }
  }
  const crmDeals = crmLeads
    .filter((l) => l.status === "won")
    .map((l) => ({
      id: l.id,
      name: l.contactName || l.name,
      rw: l.rwNumber ?? null,
      when: wonAt.get(l.id) ?? l.updatedAt ?? l.createdAt,
      value: l.dealValue ?? null,
      commission:
        l.commissionValue ?? (l.dealValue ? Math.max(l.dealValue * 0.05, 150_000) : null),
      isFact: l.commissionValue != null,
    }))
    .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  const crmCommissionTotal = crmDeals.reduce((s, d) => s + (d.commission ?? 0), 0);

  // Подписки и журнал — из таблицы (live) или из кода (fallback).
  const subs = sheet?.subscriptions ?? subscriptions;
  const led = sheet?.ledger ?? ledger;
  const liveData = sheet !== null;

  const opex = opexActiveMonthly(subs);
  const leak = leakMonthly(subs);
  const balance = monthlyBalance(subs);
  const plannedRecurring = recurringByStatus("planned");
  const onHireRecurring = recurringByStatus("on_hire");
  const stage1 = stage1MonthlyForecast(subs);
  const preIncorpPaid = ledgerTotalTHB(led);
  const ledgerIncome = ledgerIncomeTHB(led);
  const monthSeries = ledgerMonthlySeries(led);
  const breakdown = opexBreakdown(subs);
  const maxRev = Math.max(...plannedRevenue.map((q) => q.thb));
  const totalRev = plannedRevenue.reduce((s, q) => s + q.thb, 0);
  const claudeShare = breakdown.length
    ? Math.round((breakdown[0].value / breakdown.reduce((s, x) => s + x.value, 0)) * 100)
    : 0;

  // Runway (bootstrap): личные расходы + бизнес-burn = «сколько горит» всего.
  // Наличные/доход — из таблицы (лист Runway), иначе из кода. Чистый отток =
  // burn − доход; делим наличные на него → месяцы и дата истечения кэша.
  // Личные цифры — из приватной таблицы (листы Runway/Personal/Receivables),
  // иначе из кода (пусто — реальные суммы не лежат в публичном репо).
  const cash = runwaySheet?.cashOnHand ?? cashOnHand;
  const income = runwaySheet?.monthlyIncome ?? monthlyIncome;
  const personal = runwaySheet?.personalExpenses ?? personalExpenses;
  const recs = runwaySheet?.receivables ?? receivables;
  const hasPersonal = personal.length > 0 || cash > 0;
  const personalTotal = personalMonthly(personal);
  const combinedBurn = combinedBurnMonthly(subs, personal);
  const netBurn = netBurnMonthly(subs, personal, income);
  const runway = runwayMonths(cash, netBurn);
  const receivableTotal = receivablesTotal(recs);
  const recvSum = receivablesSummary(recs);
  const runwayWithRec = runwayMonths(cash + receivableTotal, netBurn);
  const outDate = cashOutDate(cash, netBurn);
  const leversSaving = leversTotal();
  const burnAfterCuts = combinedBurn - leversSaving;
  const dateFmt = (d: Date) =>
    d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

  // Дни на наличные (острый runway) + календарь дат-платежей (лист Payments).
  const cashDays = netBurn > 0 ? Math.round((cash / netBurn) * 30) : null;
  const upcoming = upcomingPayments(paymentsSheet ?? [], bangkokToday(), 45);
  const paySym: Record<string, string> = { THB: "฿", RUB: "₽", USD: "$", EUR: "€" };
  const fmtCur2 = (n: number, c: string) =>
    `${new Intl.NumberFormat("ru-RU").format(Math.round(n))} ${paySym[c] ?? c}`;
  const dueLabel = (days: number) =>
    days === 0 ? "сегодня" : days === 1 ? "завтра" : `через ${days} дн.`;

  // Дневник трат (лист Transactions): разрез личное/бизнес за текущий месяц.
  const allTx = txSheet ?? [];
  const txYM = currentYM();
  const monthTx = txInMonth(allTx, txYM);
  const txT = txTotals(monthTx);
  const personalBreakdown = txBreakdown(monthTx, "личное");
  const businessBreakdown = txBreakdown(monthTx, "бизнес");
  const recentTx = [...monthTx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const pct = (part: number) => (txT.total ? `${Math.round((part / txT.total) * 100)}%` : undefined);

  // Бюджет vs факт за текущий месяц (лист Budget): контроль burn, перерасход — красным.
  const budgetLines = budgetVsActual(budgetSheet ?? [], monthTx)
    .filter((b) => b.limit > 0)
    .sort((a, b) => b.pct - a.pct);
  const budgetOver = budgetLines.filter((b) => b.over).length;
  const budgetLimitTotal = budgetLines.reduce((s, b) => s + b.limit, 0);
  const budgetActualTotal = budgetLines.reduce((s, b) => s + b.actual, 0);

  // Две кассы (лист Wallets): «реальный кошелёк + долг RW». Личная вычитает ВСЕ
  // траты (реальные деньги на руках), бизнес — только бизнес-траты (долг RW тебе).
  const today = bangkokToday();
  const allWallets = walletsSheet ?? [];
  const hasWallets = allWallets.length > 0;
  const { personal: personalWallet, business: businessWallet } = walletStates(
    walletFor("личное", allWallets, today),
    walletFor("бизнес", allWallets, today),
    allTx,
    fxDisp,
  );
  const debtSum = debtsSummary(debtsSheet ?? [], fxDisp);
  // Симулятор первой сделки: комиссия → месяцы runway + закрытие долгов людям.
  const peopleDebtThb = (debtsSheet ?? [])
    .filter((d) => d.type.toLowerCase().startsWith("люди") && d.remaining > 0)
    .reduce((s, d) => s + d.remaining * (fxDisp[d.currency] ?? 1), 0);
  const dealScenarios = [500_000, 750_000, 1_000_000].map((commission) => ({
    commission,
    months: netBurn > 0 ? commission / netBurn : null,
    clearsPeople: peopleDebtThb > 0 && commission >= peopleDebtThb,
    afterPeople: Math.max(commission - peopleDebtThb, 0),
  }));
  const goals = (goalsSheet ?? []).map(goalProgress);
  const debtSymbols: Record<string, string> = { THB: "฿", RUB: "₽", USD: "$", EUR: "€" };
  const debtByCur = Object.entries(debtSum.byCurrency)
    .map(([c, v]) => `${new Intl.NumberFormat("ru-RU").format(Math.round(v as number))} ${debtSymbols[c] ?? c}`)
    .join(" · ");
  // Состав наличной кассы по валютам (только ненулевые): «36 000 ฿ · 200 000 ₽ · $100».
  const cashMix = (w: { thb: number; rub: number; usd: number }): string => {
    const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n));
    const parts: string[] = [];
    if (w.thb) parts.push(`${fmt(w.thb)} ฿`);
    if (w.rub) parts.push(`${fmt(w.rub)} ₽`);
    if (w.usd) parts.push(`$${fmt(w.usd)}`);
    return parts.join(" · ");
  };
  const asOfFmt = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <section className="px-4 py-8 md:px-8">

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            Admin · Финансы
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">
            Финансовый дашборд
          </h1>
          <p className="mt-1 text-sm text-forest-900/60">
            Текущие расходы, движения по сделкам и план. Цифры пересчитываются автоматически.
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-forest-900/45">
            <span
              className={
                "h-1.5 w-1.5 rounded-full " + (liveData ? "bg-emerald-500" : "bg-panel/30")
              }
            />
            {liveData
              ? "Источник: Google-таблица (live, кэш 60 с)"
              : "Источник: код (таблица не подключена)"}
          </p>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-full border border-forest-900/15 text-sm">
          {(["THB", "USD", "RUB"] as const).map((c) => {
            const on = cur === c;
            return (
              <Link
                key={c}
                href={c === "THB" ? "/admin/finance" : `/admin/finance?cur=${c.toLowerCase()}`}
                className={
                  "px-3 py-1.5 font-medium transition " +
                  (on ? "bg-panel text-panel-fg" : "text-forest-900/60 hover:bg-forest-900/5")
                }
              >
                {c}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Две кассы: личное / Right Way (старт + авто-вычет трат) */}
      {walletsSaved && (
        <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✅ Кассы обновлены.
        </p>
      )}
      <div className="mb-7">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-forest-900/50">
            💼 Сколько денег где
          </h2>
          <Link
            href="/admin/finance/wallets"
            className="text-xs font-medium text-forest-900/55 hover:text-brass-600"
          >
            ✏️ Обновить кассы
          </Link>
        </div>
        {!hasWallets ? (
          <div className="rounded-2xl border border-dashed border-forest-900/15 bg-cream-50 p-5 text-sm text-forest-900/55">
            Задай стартовые остатки двух касс —{" "}
            <Link href="/admin/finance/wallets" className="font-medium text-brass-600">
              «Обновить кассы»
            </Link>{" "}
            — и здесь будет видно, сколько 🏠 личных денег и 🏢 у Right Way, с авто-вычетом трат
            дневника.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* 🏠 Личные — реальные деньги на руках (минус ВСЕ траты) */}
              <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-forest-900/45">
                  🏠 Личные деньги · на руках
                </p>
                <p
                  className={
                    "mt-1 text-3xl font-semibold tabular-nums " +
                    (personalWallet.current < 0 ? "text-red-600" : "text-forest-900")
                  }
                >
                  {money(personalWallet.current)}
                </p>
                {cashMix(personalWallet) && (
                  <p className="mt-1 text-xs text-forest-900/60">💵 {cashMix(personalWallet)}</p>
                )}
                <p className="mt-0.5 text-xs text-forest-900/50">
                  старт {money(personalWallet.start)} ({asOfFmt(personalWallet.asOf)})
                  {personalWallet.spent > 0 ? ` − все траты ${money(personalWallet.spent)}` : ""}
                </p>
              </div>
              {/* 🏢 Right Way — позиция: минус = компания должна тебе */}
              <div className="rounded-2xl border border-brass-500/30 bg-brass-500/[0.06] p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-forest-900/45">
                  🏢 Right Way{businessWallet.current < 0 ? " · должна тебе" : " · в кассе"}
                </p>
                <p
                  className={
                    "mt-1 text-3xl font-semibold tabular-nums " +
                    (businessWallet.current < 0 ? "text-red-600" : "text-forest-900")
                  }
                >
                  {money(businessWallet.current)}
                </p>
                {cashMix(businessWallet) && (
                  <p className="mt-1 text-xs text-forest-900/60">💵 {cashMix(businessWallet)}</p>
                )}
                <p className="mt-0.5 text-xs text-forest-900/50">
                  {businessWallet.current < 0
                    ? `вложено лично, к возмещению · бизнес-траты ${money(businessWallet.spent)}`
                    : `старт ${money(businessWallet.start)} (${asOfFmt(businessWallet.asOf)})${
                        businessWallet.spent > 0 ? ` − бизнес ${money(businessWallet.spent)}` : ""
                      }`}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-forest-900/45">
              🏠 — реальные деньги на руках (минус <strong>все</strong> траты, включая бизнес с личной
              карты). 🏢 — позиция Right Way: минус = вложено лично, компания вернёт после первых сделок
              (director&apos;s loan).
            </p>
          </>
        )}
      </div>

      {/* Долги — кому и сколько (живой трекер, лист Debts) */}
      {debtsSheet && debtSum.creditors > 0 && (
        <div className="mb-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-forest-900/50">
              📕 Долги — кому и сколько
            </h2>
            <Link
              href="/admin/finance/debts"
              className="text-xs font-medium text-forest-900/55 hover:text-brass-600"
            >
              Все долги →
            </Link>
          </div>
          <Link
            href="/admin/finance/debts"
            className="block rounded-2xl border border-forest-900/10 bg-cream-50 p-5 transition hover:border-brass-500/40"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm text-forest-900/70">
                <strong className="text-forest-900">{debtSum.creditors}</strong> кредиторов · осталось{" "}
                <strong className="text-forest-900">{money(debtSum.thbTotal)}</strong>
                {debtByCur && <span className="text-forest-900/45"> ({debtByCur})</span>}
              </p>
              {debtSum.items[0] && (
                <p className="text-xs text-forest-900/55">
                  первой:{" "}
                  <strong className="text-forest-900/80">{debtSum.items[0].creditor}</strong>{" "}
                  {new Intl.NumberFormat("ru-RU").format(Math.round(debtSum.items[0].remaining))}{" "}
                  {debtSymbols[debtSum.items[0].currency] ?? debtSum.items[0].currency}
                </p>
              )}
            </div>
            <p className="mt-2 text-xs text-forest-900/45">
              Стратегия: Инне частями + мелких закрывать целиком, чтобы кредиторов становилось меньше.
              Гасить — бот <code className="rounded bg-cream-100 px-1">/payback</code>.
            </p>
          </Link>
        </div>
      )}

      {/* Дебиторка — кто должен мне (зеркало долгов, лист Receivables) */}
      {recvSum.count > 0 && (
        <div className="mb-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-forest-900/50">
              💵 Должны мне — спасательный круг
            </h2>
            <Link
              href="/admin/finance/receivables"
              className="text-xs font-medium text-forest-900/55 hover:text-brass-600"
            >
              Вся дебиторка →
            </Link>
          </div>
          <Link
            href="/admin/finance/receivables"
            className="block rounded-2xl border border-brass-500/30 bg-brass-500/[0.06] p-5 transition hover:border-brass-500/60"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm text-forest-900/70">
                <strong className="text-forest-900">{recvSum.count}</strong> позиций · должны{" "}
                <strong className="text-forest-900">{money(recvSum.total)}</strong>
              </p>
              {recvSum.nearest && (
                <p className="text-xs text-forest-900/55">
                  ближайший:{" "}
                  <strong className="text-forest-900/80">{recvSum.nearest.from}</strong>{" "}
                  {money(recvSum.nearest.thb)}
                  {recvSum.nearest.due ? ` · ${recvSum.nearest.due}` : ""}
                </p>
              )}
            </div>
            <p className="mt-2 text-xs text-forest-900/45">
              Пришёл платёж — бот <code className="rounded bg-cream-100 px-1">/received</code>: остаток ↓,
              наличные ↑, дальше пусти на долги.
            </p>
          </Link>
        </div>
      )}

      {/* Сводка */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="OpEx активных / мес"
          value={money(opex)}
          hint={
            "≈ " +
            (["THB", "USD", "RUB"] as const)
              .filter((c) => c !== cur)
              .map((c) => fmtMoney(opex, c, fxDisp))
              .join(" · ") +
            ` · ${claudeShare}% — Claude`
          }
          accent
        />
        <Stat label="OpEx / год" value={money(opex * 12)} hint="текущий run-rate" />
        <Stat
          label="Приходы по сделкам"
          value={money(dealsNet())}
          hint={deals.length ? `${deals.length} сделок` : "стадия запуска"}
        />
        <Stat
          label="Баланс месяца"
          value={money(balance)}
          hint="приходы − расходы"
          negative={balance < 0}
        />
      </div>

      {/* Runway / выживание (bootstrap) */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        🪙 Runway / выживание (bootstrap){" "}
        <span className="font-normal normal-case text-forest-900/40">
          — личные + бизнес, пока нет компании и капитала
        </span>
      </h2>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Чистый отток / мес"
          value={money(netBurn)}
          hint={
            income > 0
              ? `burn ${money(combinedBurn)} − доход ${money(income)}`
              : `личные ${money(personalTotal)} + бизнес ${money(opex)} · дохода нет`
          }
          negative
        />
        <Stat
          label="Наличные сейчас"
          value={money(cash)}
          hint={`+ дебиторка ${money(receivableTotal)} (к получению)`}
        />
        <Stat
          label="🔴 Деньги кончатся"
          value={outDate ? dateFmt(outDate) : income >= combinedBurn ? "не убывают" : "—"}
          hint={
            runway != null
              ? `${cashDays != null ? `≈${cashDays} дн · ` : ""}${runway.toFixed(1)} мес на наличные`
              : "впиши наличные"
          }
          negative
        />
        <Stat
          label="Runway с дебиторкой"
          value={runwayWithRec != null ? `${runwayWithRec.toFixed(1)} мес` : "—"}
          hint="наличные + долги ÷ отток"
          accent
        />
      </div>
      {upcoming.length > 0 && (
        <div className="mb-4 rounded-2xl border border-forest-900/10 bg-panel p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-forest-900/50">
              📅 Ближайшие платежи
            </h3>
            <span className="text-[11px] text-forest-900/40">чтобы ничего не застало врасплох</span>
          </div>
          <ul className="space-y-1.5">
            {upcoming.map((p) => {
              const soon = p.daysUntil <= 3;
              return (
                <li
                  key={p.title + p.nextDate}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm"
                >
                  <span className="text-forest-900/80">
                    <span className={soon ? "font-semibold text-red-600" : "text-forest-900/55"}>
                      {dueLabel(p.daysUntil)}
                    </span>{" "}
                    · {p.title}
                    {p.note && <span className="ml-1 text-xs text-forest-900/45">— {p.note}</span>}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-forest-900">
                    {fmtCur2(p.amount, p.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-forest-900/10 bg-cream-50 px-4 py-3 text-xs text-forest-900/60">
        <span className="font-medium text-forest-900/75">Рычаги экономии:</span>
        {savingsLevers.map((l) => (
          <span key={l.label}>
            {l.label} <span className="tabular-nums text-forest-900/80">−{money(l.thbPerMonth)}</span>
          </span>
        ))}
        <span className="ml-auto">
          burn после всех:{" "}
          <span className="font-medium text-forest-900">{money(burnAfterCuts)}/мес</span> (−
          {money(leversSaving)})
        </span>
      </div>
      <p className="mb-4 text-xs text-forest-900/45">
        ⚠️ Это <strong>операционный</strong> runway (жильё + жизнь + бизнес). Он <strong>не</strong>{" "}
        включает личные долговые обязательства (содержание детей, кредиты, налоги) — они в проекте
        «Сам себе Я» и сильно больше; полную картину своди там.
      </p>
      {netBurn > 0 && peopleDebtThb > 0 && (
        <div className="mb-6 rounded-2xl border border-brass-500/30 bg-brass-500/[0.06] p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-forest-900/55">
            🚀 Первая сделка = личное выживание
          </h3>
          <p className="mt-1 text-xs text-forest-900/50">
            Комиссия с одной сделки покрывает месяцы runway и закрывает долги людям одним заходом.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {dealScenarios.map((s) => (
              <div key={s.commission} className="rounded-xl border border-forest-900/10 bg-panel p-4">
                <p className="text-sm font-semibold text-forest-900">{money(s.commission)}</p>
                <p className="mt-1 text-xs text-forest-900/60">
                  {s.months != null ? `+${s.months.toFixed(1)} мес runway` : "—"}
                </p>
                <p className="mt-0.5 text-xs">
                  {s.clearsPeople ? (
                    <span className="text-emerald-600">
                      ✅ закрывает всех людей + ещё {money(s.afterPeople)}
                    </span>
                  ) : (
                    <span className="text-forest-900/45">часть людей (из {money(peopleDebtThb)})</span>
                  )}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-forest-900/45">
            Поэтому первая сделка — не «бизнес-цель», а личное выживание. Долги людям сейчас:{" "}
            {money(peopleDebtThb)}.
          </p>
        </div>
      )}
      {goals.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
            🎯 Финансовые цели
          </h3>
          <div className="space-y-3">
            {goals.map((g) => (
              <div key={g.name} className="rounded-2xl border border-forest-900/10 bg-panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className="text-sm font-medium text-forest-900">{g.name}</p>
                  <p className="text-sm tabular-nums text-forest-900/70">
                    {money(g.saved)} / {money(g.target)} · {g.pct}%
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-forest-900/10">
                  <div
                    className={"h-full rounded-full " + (g.pct >= 100 ? "bg-emerald-500" : "bg-brass-500")}
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-forest-900/45">
                  {g.left > 0 ? `осталось накопить ${money(g.left)}` : "✅ цель достигнута"}
                  {g.deadline ? ` · к ${g.deadline}` : ""}
                  {g.note ? ` · ${g.note}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!hasPersonal && (
        <div className="mb-8 rounded-2xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-sm text-forest-900/55">
          🔒 Личные цифры ведутся <strong>приватно</strong> — не в публичном репо. Заполни листы{" "}
          <code>Runway</code> / <code>Personal</code> / <code>Receivables</code> в финансовой
          Google-таблице, и runway появится здесь. Полная картина — личный проект «Сам себе Я».
        </div>
      )}
      {hasPersonal && (
      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-cream-50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-900/45">
              <th className="px-4 py-2.5 font-medium">Личная статья</th>
              <th className="px-4 py-2.5 text-right font-medium">THB / мес</th>
              <th className="px-4 py-2.5 font-medium">Примечание</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/5">
            {personal.map((e) => (
              <tr key={e.item}>
                <td className="px-4 py-2.5 font-medium text-forest-900">
                  {e.item}
                  {e.estimate && (
                    <span className="ml-2 rounded bg-brass-500/10 px-1.5 py-0.5 text-[11px] font-medium text-brass-600">
                      оценка
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                  {money(e.thbPerMonth)}
                </td>
                <td className="px-4 py-2.5 text-xs text-forest-900/45">{e.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-forest-900/10 font-medium">
              <td className="px-4 py-2.5 text-forest-900/70">Итого личных / мес</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                {money(personalTotal)}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
          </tfoot>
        </table>
        <p className="border-t border-forest-900/5 px-4 py-2 text-xs text-forest-900/45">
          Цель bootstrap — дожить до первой сделки (комиссия ~750k–1 000k ฿ перекрывает всё). При
          burn {money(combinedBurn)}/мес на 4–6 мес нужно ≈ {money(combinedBurn * 4)}–
          {money(combinedBurn * 6)}. Главный рычаг — домик и виза (DTV вместо border run). 🔒 Цифры
          правятся в приватной Google-таблице (листы Personal / Runway), не в публичном репо.
        </p>
      </div>
      )}

      {/* Дебиторка — мне должны */}
      {recs.length > 0 && (
      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-cream-50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-900/45">
              <th className="px-4 py-2.5 font-medium">Мне должны (дебиторка)</th>
              <th className="px-4 py-2.5 text-right font-medium">THB</th>
              <th className="px-4 py-2.5 font-medium">Срок</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/5">
            {recs.map((r) => (
              <tr key={r.from} className={r.status === "overdue" ? "bg-red-50/40" : undefined}>
                <td className="px-4 py-2.5 font-medium text-forest-900">
                  {r.from}
                  {r.note && <span className="ml-2 text-xs text-forest-900/45">{r.note}</span>}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                  {money(r.thb)}
                </td>
                <td className="px-4 py-2.5 text-xs text-forest-900/55">
                  {r.due}
                  {r.status === "overdue" && (
                    <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
                      просрочен
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-forest-900/10 font-medium">
              <td className="px-4 py-2.5 text-forest-900/70">Итого к получению</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                {money(receivableTotal)}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
          </tfoot>
        </table>
        <p className="border-t border-forest-900/5 px-4 py-2 text-xs text-forest-900/45">
          🔒 Приватно: данные из листа <code>Receivables</code> таблицы (детали — личный проект
          «Сам себе Я»). Сбор этих долгов — фактический runway: главный приоритет кэша до первой
          сделки.
        </p>
      </div>
      )}

      {/* Дневник трат — личное / бизнес */}
      {added && (
        <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ✅ Трата записана.
        </p>
      )}
      {budgetLines.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
            🎯 Бюджет vs факт
            <span className="font-normal normal-case text-forest-900/40">
              — лимиты по категориям, {txYM}
            </span>
            {budgetOver > 0 && (
              <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium normal-case text-red-600">
                ⚠️ перерасход в {budgetOver}
              </span>
            )}
          </h2>
          <div className="rounded-2xl border border-forest-900/10 bg-panel p-4">
            <div className="mb-3 flex flex-wrap justify-between gap-2 text-xs text-forest-900/55">
              <span>
                Факт <strong className="text-forest-900">{money(budgetActualTotal)}</strong> из{" "}
                {money(budgetLimitTotal)}
              </span>
              <span>
                {budgetLimitTotal > 0 ? Math.round((budgetActualTotal / budgetLimitTotal) * 100) : 0}%
                месячного лимита
              </span>
            </div>
            <ul className="space-y-2.5">
              {budgetLines.map((b) => (
                <li key={b.scope + b.category}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-forest-900/80">
                      {b.scope === "бизнес" ? "🏢" : "🏠"} {b.category}
                    </span>
                    <span
                      className={
                        b.over ? "font-semibold tabular-nums text-red-600" : "tabular-nums text-forest-900/70"
                      }
                    >
                      {money(b.actual)} / {money(b.limit)} · {b.pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-forest-900/10">
                    <div
                      className={
                        "h-full rounded-full " +
                        (b.over ? "bg-red-500" : b.pct >= 80 ? "bg-amber-500" : "bg-brass-500")
                      }
                      style={{ width: `${Math.min(b.pct, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-forest-900/45">
              Факт — из дневника трат за {txYM}. Bootstrap: чем меньше, тем лучше; красное = перерасход
              лимита.
            </p>
          </div>
        </div>
      )}
      <h2 className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        🧾 Траты — личное / бизнес
        <span className="font-normal normal-case text-forest-900/40">
          — дневник (бот + форма), {txYM}
        </span>
        <Link
          href="/admin/finance/add"
          className="ml-auto rounded-full bg-panel px-3 py-1 text-xs font-medium normal-case text-panel-fg transition hover:bg-panel/90"
        >
          ＋ Добавить трату
        </Link>
      </h2>
      {txT.total === 0 ? (
        <div className="mb-8 rounded-2xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-sm text-forest-900/55">
          Пока нет записей за {txYM}. Жми <strong>«＋ Добавить трату»</strong> или надиктуй боту 🎤
          голосовое («800 бат бензин») — появится здесь с разрезом 🏠 личное / 🏢 бизнес.
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Всего трат / мес" value={money(txT.total)} accent />
            <Stat label="🏠 Личное / мес" value={money(txT.personal)} hint={pct(txT.personal)} />
            <Stat label="🏢 Бизнес / мес" value={money(txT.business)} hint={pct(txT.business)} />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {personalBreakdown.length > 0 && (
              <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-6">
                <p className="mb-4 text-sm font-medium text-forest-900">🏠 Личное по категориям</p>
                <FinanceDonut
                  segments={personalBreakdown}
                  centerValue={money(txT.personal)}
                  centerLabel="личное"
                  currency={cur}
                  fx={fxDisp}
                />
              </div>
            )}
            {businessBreakdown.length > 0 && (
              <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-6">
                <p className="mb-4 text-sm font-medium text-forest-900">🏢 Бизнес по категориям</p>
                <FinanceDonut
                  segments={businessBreakdown}
                  centerValue={money(txT.business)}
                  centerLabel="бизнес"
                  currency={cur}
                  fx={fxDisp}
                />
              </div>
            )}
          </div>
          <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-cream-50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-900/45">
                  <th className="px-4 py-2.5 font-medium">Дата</th>
                  <th className="px-4 py-2.5 font-medium">Сфера</th>
                  <th className="px-4 py-2.5 font-medium">Категория</th>
                  <th className="px-4 py-2.5 font-medium">Заметка</th>
                  <th className="px-4 py-2.5 text-right font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-900/5">
                {recentTx.map((t, i) => (
                  <tr key={`${t.date}-${i}`}>
                    <td className="px-4 py-2.5 tabular-nums text-forest-900/55">{t.date.slice(5)}</td>
                    <td className="px-4 py-2.5 text-forest-900/65">
                      {t.scope === "бизнес" ? "🏢" : "🏠"} {t.scope}
                    </td>
                    <td className="px-4 py-2.5 text-forest-900/75">{t.category}</td>
                    <td className="px-4 py-2.5 text-forest-900/55">{t.note}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                      {money(t.thb)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-forest-900/5 px-4 py-2 text-xs text-forest-900/45">
              Последние записи за {txYM}. Полный журнал — лист <code>Transactions</code> таблицы. Ввод:
              форма выше или 🎤 голосовое боту.
            </p>
          </div>
        </>
      )}

      {/* Структура расходов */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Структура расходов (OpEx / мес)
      </h2>
      <div className="mb-8 rounded-2xl border border-forest-900/10 bg-cream-50 p-6">
        <FinanceDonut
          segments={breakdown}
          centerValue={money(opex)}
          centerLabel="в месяц"
          currency={cur}
          fx={fxDisp}
        />
      </div>

      {/* Подписки */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Подписки и сервисы
      </h2>
      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-cream-50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-900/45">
              <th className="px-4 py-2.5 font-medium">Статья</th>
              <th className="px-4 py-2.5 font-medium">Провайдер</th>
              <th className="px-4 py-2.5 font-medium">Цена</th>
              <th className="px-4 py-2.5 text-right font-medium">THB / мес</th>
              <th className="px-4 py-2.5 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/5">
            {subs.map((s) => {
              const badge = SUB_BADGE[s.status];
              const thb = thbPerMonth(s);
              return (
                <tr key={s.item} className={s.status === "leak" ? "bg-red-50/40" : undefined}>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-forest-900">{s.item}</span>
                    {s.note && (
                      <span className="ml-2 text-xs text-forest-900/45">{s.note}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-forest-900/65">{s.provider}</td>
                  <td className="px-4 py-2.5 text-forest-900/65">{priceLabel(s)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                    {thb > 0 ? money(thb) : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={"rounded px-1.5 py-0.5 text-[11px] font-medium " + badge.cls}
                    >
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-forest-900/10 font-medium">
              <td className="px-4 py-2.5 text-forest-900/70" colSpan={3}>
                Итого активных (без утечки)
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                {money(opex)}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
            {leak > 0 && (
              <tr className="text-xs text-red-600/80">
                <td className="px-4 py-1.5" colSpan={3}>
                  🔴 Утечка Circle (к отвязке)
                </td>
                <td className="px-4 py-1.5 text-right tabular-nums">{money(leak)}</td>
                <td className="px-4 py-1.5" />
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Постоянные расходы */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Постоянные расходы (план){" "}
        <span className="font-normal normal-case text-forest-900/40">
          — появятся в Этапе 1, сейчас 0
        </span>
      </h2>

      {/* Прогноз будущего run-rate */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-forest-900/10 bg-cream-50 px-4 py-3">
          <p className="text-xs text-forest-900/45">Сейчас постоянных / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">{money(0)}</p>
          <p className="text-xs text-forest-900/45">home-office solo</p>
        </div>
        <div className="rounded-xl border border-brass-500/30 bg-brass-500/[0.06] px-4 py-3">
          <p className="text-xs text-forest-900/45">После Co. Ltd ≈ / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">{money(stage1)}</p>
          <p className="text-xs text-forest-900/45">подписки + операционка {money(plannedRecurring)}</p>
        </div>
        <div className="rounded-xl border border-forest-900/10 bg-cream-50 px-4 py-3">
          <p className="text-xs text-forest-900/45">+ при найме агента / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">+{money(onHireRecurring)}</p>
          <p className="text-xs text-forest-900/45">зарплата + офис</p>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-cream-50">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-forest-900/5">
            {recurring.map((r) => {
              const badge = REC_BADGE[r.status];
              return (
                <tr key={r.item}>
                  <td className="px-4 py-2.5 font-medium text-forest-900">{r.item}</td>
                  <td className="px-4 py-2.5 text-forest-900/55">{r.when}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                    {r.thbPerMonth > 0 ? money(r.thbPerMonth) + " / мес" : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={"rounded px-1.5 py-0.5 text-[11px] font-medium " + badge.cls}
                    >
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-forest-900/10 font-medium">
              <td className="px-4 py-2.5 text-forest-900/70" colSpan={2}>
                Итого плановых / мес
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                {money(plannedRecurring)}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Журнал платежей (ledger) */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Журнал платежей{" "}
        <span className="font-normal normal-case text-forest-900/40">
          — pre-incorporation, к возмещению основателю
        </span>
      </h2>
      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-cream-50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-900/45">
              <th className="px-4 py-2.5 font-medium">Дата</th>
              <th className="px-4 py-2.5 font-medium">Статья</th>
              <th className="px-4 py-2.5 font-medium">Счёт</th>
              <th className="px-4 py-2.5 text-right font-medium">THB</th>
              <th className="px-4 py-2.5 font-medium">Чек</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/5">
            {led.map((e, i) => (
              <tr
                key={`${e.item}-${i}`}
                className={
                  e.kind === "leak"
                    ? "bg-red-50/40"
                    : e.kind === "income"
                      ? "bg-emerald-50/40"
                      : undefined
                }
              >
                <td className="px-4 py-2.5 tabular-nums text-forest-900/55">{e.date || "—"}</td>
                <td className="px-4 py-2.5 font-medium text-forest-900">{e.item}</td>
                <td className="px-4 py-2.5 text-forest-900/55">{e.account}</td>
                <td
                  className={
                    "px-4 py-2.5 text-right tabular-nums " +
                    (e.kind === "income" ? "font-medium text-emerald-700" : "text-forest-900")
                  }
                >
                  {e.thb != null ? (e.kind === "income" ? "+" : "") + money(e.thb) : "?"}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={
                      "rounded px-1.5 py-0.5 text-[11px] font-medium " +
                      (e.receipt
                        ? "bg-forest-900/10 text-forest-900/70"
                        : "bg-brass-500/10 text-brass-600")
                    }
                  >
                    {e.receipt ? "есть" : "нет"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-forest-900/10 font-medium">
              <td className="px-4 py-2.5 text-forest-900/70" colSpan={3}>
                Понесено (к возмещению, без утечки)
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                {money(preIncorpPaid)}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
            {ledgerIncome > 0 && (
              <tr className="font-medium text-emerald-700">
                <td className="px-4 py-2.5" colSpan={3}>
                  Доходы (журнал)
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">+{money(ledgerIncome)}</td>
                <td className="px-4 py-2.5" />
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Динамика по месяцам */}
      {monthSeries.length > 0 && (
        <>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
            Динамика по месяцам{" "}
            <span className="font-normal normal-case text-forest-900/40">
              — из журнала платежей, записи без даты не учитываются
            </span>
          </h2>
          <div className="mb-8 rounded-2xl border border-forest-900/10 bg-cream-50 p-6">
            <FinanceTrend data={monthSeries} currency={cur} fx={fxDisp} />
          </div>
        </>
      )}

      {/* Сделки — живой журнал Won-лидов из CRM */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Журнал сделок (Won){" "}
        {crmDeals.length > 0 && (
          <span className="normal-case text-forest-900/40">
            · {crmDeals.length} · комиссия {money(crmCommissionTotal)}
          </span>
        )}
      </h2>
      {crmDeals.length === 0 ? (
        <div className="mb-4 rounded-2xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-sm text-forest-900/55">
          Пока нет закрытых сделок (стадия запуска). Первая сделка — Этап 1. Комиссия
          max(5%; 150k): сделка 20M ≈ 1 000k ฿ перекроет ~10 лет текущего OpEx.
        </div>
      ) : (
        <div className="mb-4 overflow-x-auto rounded-2xl border border-forest-900/10 bg-cream-50">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-900/40">
                <th className="px-4 py-2 font-medium">Дата</th>
                <th className="px-4 py-2 font-medium">Клиент</th>
                <th className="px-4 py-2 font-medium">Объект</th>
                <th className="px-4 py-2 text-right font-medium">Сделка</th>
                <th className="px-4 py-2 text-right font-medium">Комиссия</th>
              </tr>
            </thead>
            <tbody>
              {crmDeals.map((d) => (
                <tr key={d.id} className="border-b border-forest-900/5 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 text-forest-900/60">
                    {new Date(d.when).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Bangkok",
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={{ pathname: `/admin/crm/${d.id}` }}
                      className="text-forest-900 hover:text-brass-600"
                    >
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-forest-900/60">{d.rw ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-forest-900/70">
                    {d.value != null ? money(d.value) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-emerald-700">
                    {d.commission != null ? money(d.commission) : "—"}
                    {d.commission != null && (
                      <span className="ml-1 text-[10px] font-normal text-forest-900/40">
                        {d.isFact ? "факт" : "≈расчёт"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-forest-900/5 px-4 py-2 text-xs text-forest-900/45">
            Факт-комиссию (co-agency 50/50, referral −20%) вносите на карточке лида — поле
            «Комиссия (факт)» появляется после 🏆 Победа.
          </p>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-forest-900/10 bg-cream-50 p-6">
        <p className="mb-4 text-sm font-medium text-forest-900">
          Плановый график приходов — Year 1{" "}
          <span className="font-normal text-forest-900/45">(финмодель, сценарий A)</span>
        </p>
        <ul className="space-y-3">
          {plannedRevenue.map((q) => {
            const w = (q.thb / maxRev) * 100;
            return (
              <li key={q.q}>
                <div className="mb-1 flex items-baseline justify-between text-xs text-forest-900/60">
                  <span>
                    {q.q} · {q.deals} {q.deals === 1 ? "сделка" : "сделки"}
                  </span>
                  <span className="font-medium text-forest-900">{money(q.thb)}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-forest-900/5">
                  <div
                    className="h-2.5 rounded-full bg-brass-500"
                    style={{ width: `${w}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-forest-900/45">
          Итого Year 1: 6 сделок · {money(totalRev)} приходов · EBITDA ~4.25M ฿. Первая же сделка
          перекрывает ~10 лет текущего OpEx.
        </p>
      </div>

      <div className="space-y-1 text-xs text-forest-900/40">
        <p>
          Учётные курсы (для расчётов, {FX_DATE}): $1 = {FX.USD} ฿ · 1₽ = {FX.RUB} ฿ · 1€ ={" "}
          {FX.EUR} ฿
        </p>
        {live ? (
          <p>
            Рыночные сейчас (live): $1 = {live.USD.toFixed(2)} ฿ · 1₽ = {live.RUB.toFixed(3)} ฿ ·
            1€ = {live.EUR.toFixed(2)} ฿ · обновлено {live.date}
          </p>
        ) : (
          <p>Рыночные курсы временно недоступны.</p>
        )}
        <p>
          Бат → рубль (перевод домой): 1 ฿ ≈{" "}
          {live
            ? `${(1 / live.RUB).toFixed(2)} ₽ по рынку — ₽-суммы выше пересчитаны по нему`
            : `${(1 / FX.RUB).toFixed(2)} ₽ по учётному курсу (рынок недоступен)`}
        </p>
        <p>Источник цифр — финансовый трекер проекта.</p>
      </div>
    </section>
  );
}

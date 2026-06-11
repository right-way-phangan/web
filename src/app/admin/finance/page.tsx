import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
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
  fmtMoney,
  FX,
  FX_DATE,
  type SubStatus,
  type RecurringStatus,
  type DisplayCurrency,
} from "@/lib/data/finance";
import { getLiveRatesTHB } from "@/lib/data/fx-live";
import { loadFinanceFromSheet } from "@/lib/data/finance-sheet";
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
        (accent ? "border-brass-500/30 bg-brass-500/[0.06]" : "border-forest-900/10 bg-white")
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
  searchParams: Promise<{ cur?: string }>;
}) {
  const { cur: curParam } = await searchParams;
  const cur: DisplayCurrency = curParam === "usd" ? "USD" : "THB";
  const money = (n: number) => fmtMoney(n, cur);

  const [live, sheet] = await Promise.all([getLiveRatesTHB(), loadFinanceFromSheet()]);

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

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="finance" />

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
                "h-1.5 w-1.5 rounded-full " + (liveData ? "bg-emerald-500" : "bg-forest-900/30")
              }
            />
            {liveData
              ? "Источник: Google-таблица (live, кэш 60 с)"
              : "Источник: код (таблица не подключена)"}
          </p>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-full border border-forest-900/15 text-sm">
          {(["THB", "USD"] as const).map((c) => {
            const on = cur === c;
            return (
              <Link
                key={c}
                href={c === "THB" ? "/admin/finance" : "/admin/finance?cur=usd"}
                className={
                  "px-3 py-1.5 font-medium transition " +
                  (on ? "bg-forest-900 text-white" : "text-forest-900/60 hover:bg-forest-900/5")
                }
              >
                {c}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Сводка */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="OpEx активных / мес"
          value={money(opex)}
          hint={`≈ ${fmtMoney(opex, cur === "THB" ? "USD" : "THB")} · ${claudeShare}% — Claude`}
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

      {/* Структура расходов */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Структура расходов (OpEx / мес)
      </h2>
      <div className="mb-8 rounded-2xl border border-forest-900/10 bg-white p-6">
        <FinanceDonut
          segments={breakdown}
          centerValue={money(opex)}
          centerLabel="в месяц"
          currency={cur}
        />
      </div>

      {/* Подписки */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Подписки и сервисы
      </h2>
      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
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
        <div className="rounded-xl border border-forest-900/10 bg-white px-4 py-3">
          <p className="text-xs text-forest-900/45">Сейчас постоянных / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">{money(0)}</p>
          <p className="text-xs text-forest-900/45">home-office solo</p>
        </div>
        <div className="rounded-xl border border-brass-500/30 bg-brass-500/[0.06] px-4 py-3">
          <p className="text-xs text-forest-900/45">После Co. Ltd ≈ / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">{money(stage1)}</p>
          <p className="text-xs text-forest-900/45">подписки + операционка {money(plannedRecurring)}</p>
        </div>
        <div className="rounded-xl border border-forest-900/10 bg-white px-4 py-3">
          <p className="text-xs text-forest-900/45">+ при найме агента / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">+{money(onHireRecurring)}</p>
          <p className="text-xs text-forest-900/45">зарплата + офис</p>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
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
      <div className="mb-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
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
          <div className="mb-8 rounded-2xl border border-forest-900/10 bg-white p-6">
            <FinanceTrend data={monthSeries} currency={cur} />
          </div>
        </>
      )}

      {/* Сделки */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Движения по сделкам
      </h2>
      <div className="mb-4 rounded-2xl border border-dashed border-forest-900/15 bg-white p-6 text-sm text-forest-900/55">
        Пока нет закрытых сделок (стадия запуска). Первая сделка — Этап 1. Комиссия Hybrid C
        (~4.8%): сделка 20M ≈ 960k ฿ перекроет ~10 лет текущего OpEx.
      </div>

      <div className="mb-6 rounded-2xl border border-forest-900/10 bg-white p-6">
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
          Итого Year 1: 6 сделок · {money(totalRev)} приходов · EBITDA ~4.0M ฿. Первая же сделка
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
        <p>Источник цифр — финансовый трекер проекта.</p>
      </div>
    </section>
  );
}

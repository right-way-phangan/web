import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { FinanceDonut } from "@/components/admin/finance-donut";
import {
  subscriptions,
  recurring,
  deals,
  ledger,
  thbPerMonth,
  opexActiveMonthly,
  leakMonthly,
  recurringByStatus,
  dealsNet,
  monthlyBalance,
  stage1MonthlyForecast,
  ledgerTotalTHB,
  opexBreakdown,
  fmtTHB,
  FX,
  FX_DATE,
  type SubStatus,
  type RecurringStatus,
} from "@/lib/data/finance";

export const metadata: Metadata = {
  title: "Финансы",
  robots: { index: false, follow: false },
};

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

export default function FinancePage() {
  const opex = opexActiveMonthly();
  const leak = leakMonthly();
  const balance = monthlyBalance();
  const plannedRecurring = recurringByStatus("planned");
  const onHireRecurring = recurringByStatus("on_hire");
  const stage1 = stage1MonthlyForecast();
  const preIncorpPaid = ledgerTotalTHB();
  const breakdown = opexBreakdown();
  const claudeShare = breakdown.length
    ? Math.round((breakdown[0].value / breakdown.reduce((s, x) => s + x.value, 0)) * 100)
    : 0;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="finance" />

      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · Финансы
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">
          Финансовый дашборд
        </h1>
        <p className="mt-1 text-sm text-forest-900/60">
          Текущие расходы, движения по сделкам и план. База — THB. Данные ведутся в коде, цифры
          пересчитываются автоматически.
        </p>
      </div>

      {/* Сводка */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="OpEx активных / мес"
          value={fmtTHB(opex)}
          hint={`≈ $${Math.round(opex / FX.USD)} · ${claudeShare}% — Claude`}
          accent
        />
        <Stat label="OpEx / год" value={fmtTHB(opex * 12)} hint="текущий run-rate" />
        <Stat
          label="Приходы по сделкам"
          value={fmtTHB(dealsNet())}
          hint={deals.length ? `${deals.length} сделок` : "стадия запуска"}
        />
        <Stat
          label="Баланс месяца"
          value={fmtTHB(balance)}
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
          centerValue={fmtTHB(opex)}
          centerLabel="в месяц"
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
            {subscriptions.map((s) => {
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
                    {thb > 0 ? fmtTHB(thb) : "—"}
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
                {fmtTHB(opex)}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
            {leak > 0 && (
              <tr className="text-xs text-red-600/80">
                <td className="px-4 py-1.5" colSpan={3}>
                  🔴 Утечка Circle (к отвязке)
                </td>
                <td className="px-4 py-1.5 text-right tabular-nums">{fmtTHB(leak)}</td>
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
          <p className="mt-0.5 text-xl font-semibold text-forest-900">{fmtTHB(0)}</p>
          <p className="text-xs text-forest-900/45">home-office solo</p>
        </div>
        <div className="rounded-xl border border-brass-500/30 bg-brass-500/[0.06] px-4 py-3">
          <p className="text-xs text-forest-900/45">После Co. Ltd ≈ / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">{fmtTHB(stage1)}</p>
          <p className="text-xs text-forest-900/45">подписки + операционка {fmtTHB(plannedRecurring)}</p>
        </div>
        <div className="rounded-xl border border-forest-900/10 bg-white px-4 py-3">
          <p className="text-xs text-forest-900/45">+ при найме агента / мес</p>
          <p className="mt-0.5 text-xl font-semibold text-forest-900">+{fmtTHB(onHireRecurring)}</p>
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
                    {r.thbPerMonth > 0 ? fmtTHB(r.thbPerMonth) + " / мес" : "—"}
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
                {fmtTHB(plannedRecurring)}
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
            {ledger.map((e, i) => (
              <tr key={`${e.item}-${i}`} className={e.kind === "leak" ? "bg-red-50/40" : undefined}>
                <td className="px-4 py-2.5 tabular-nums text-forest-900/55">{e.date || "—"}</td>
                <td className="px-4 py-2.5 font-medium text-forest-900">{e.item}</td>
                <td className="px-4 py-2.5 text-forest-900/55">{e.account}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-forest-900">
                  {e.thb != null ? fmtTHB(e.thb) : "?"}
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
                {fmtTHB(preIncorpPaid)}
              </td>
              <td className="px-4 py-2.5" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Сделки */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Движения по сделкам
      </h2>
      <div className="mb-6 rounded-2xl border border-dashed border-forest-900/15 bg-white p-6 text-sm text-forest-900/55">
        Пока нет закрытых сделок (стадия запуска). Первая сделка — Этап 1. Комиссия Hybrid C
        (~4.8%): сделка 20M ≈ 960k ฿ перекроет ~10 лет текущего OpEx.
      </div>

      <p className="text-xs text-forest-900/40">
        Курсы на {FX_DATE}: $1 = {FX.USD} ฿ · 1₽ = {FX.RUB} ฿ · 1€ = {FX.EUR} ฿ (обновляются
        вручную). Источник цифр — финансовый трекер проекта.
      </p>
    </section>
  );
}

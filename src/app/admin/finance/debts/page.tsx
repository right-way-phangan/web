import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { loadDebtsFromSheet } from "@/lib/data/finance-sheet";
import { getLiveRatesTHB } from "@/lib/data/fx-live";
import { debtsSummary, fmtTHB, FX, type Currency } from "@/lib/data/finance";

export const metadata: Metadata = {
  title: "Долги",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SYM: Record<string, string> = { THB: "฿", RUB: "₽", USD: "$", EUR: "€" };
function fmtCur(amount: number, currency: string): string {
  return `${Math.round(amount).toLocaleString("ru-RU")} ${SYM[currency] ?? currency}`;
}

const PRIORITY_FLAG: Record<string, string> = { "1": "🔴", "2": "🟠" };

export default async function DebtsPage() {
  const [debts, live] = await Promise.all([loadDebtsFromSheet(), getLiveRatesTHB()]);
  const fxDisp: Record<Currency, number> = { ...FX, RUB: live?.RUB ?? FX.RUB };
  const summary = debtsSummary(debts ?? [], fxDisp);
  const totalInitial = (debts ?? []).reduce((s, d) => s + d.initial, 0);
  const totalRemaining = (debts ?? []).reduce((s, d) => s + d.remaining, 0);
  const closedCount = (debts ?? []).filter((d) => d.remaining <= 0).length;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="finance" />
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · Финансы
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900">Долги — кому и сколько</h1>
        <p className="mb-6 mt-1 text-sm text-forest-900/60">
          Стратегия: <strong>Инне частями</strong> (переживает) + <strong>мелких закрывать целиком</strong>,
          чтобы число кредиторов уменьшалось. Гасить — командой бота{" "}
          <code className="rounded bg-cream-100 px-1">/payback Пашка 1100</code>.
        </p>

        {debts == null ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Лист «Debts» недоступен (нет ключей сервис-аккаунта или листа). Появится после первой записи бота.
          </p>
        ) : summary.creditors === 0 ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            ✅ Активных долгов нет.
          </p>
        ) : (
          <>
            {/* Свод */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-forest-900/10 bg-panel p-4">
                <p className="text-xs text-forest-900/50">Кредиторов</p>
                <p className="mt-1 text-2xl font-semibold text-forest-900">{summary.creditors}</p>
                {closedCount > 0 && (
                  <p className="mt-0.5 text-xs text-emerald-600">закрыто: {closedCount}</p>
                )}
              </div>
              <div className="rounded-xl border border-forest-900/10 bg-panel p-4">
                <p className="text-xs text-forest-900/50">Осталось (≈ ฿)</p>
                <p className="mt-1 text-2xl font-semibold text-forest-900">{fmtTHB(summary.thbTotal)}</p>
                <p className="mt-0.5 text-xs text-forest-900/45">
                  {Object.entries(summary.byCurrency)
                    .map(([cur, val]) => fmtCur(val as number, cur))
                    .join(" · ")}
                </p>
              </div>
              <div className="rounded-xl border border-forest-900/10 bg-panel p-4">
                <p className="text-xs text-forest-900/50">Погашено</p>
                <p className="mt-1 text-2xl font-semibold text-forest-900">
                  {totalInitial > 0 ? Math.round(((totalInitial - totalRemaining) / totalInitial) * 100) : 0}%
                </p>
                <p className="mt-0.5 text-xs text-forest-900/45">от изначального</p>
              </div>
            </div>

            {/* Список по приоритету */}
            <ul className="mt-6 space-y-2">
              {summary.items.map((d) => {
                const pct = d.initial > 0 ? Math.round((d.paid / d.initial) * 100) : 0;
                return (
                  <li
                    key={d.creditor}
                    className="rounded-xl border border-forest-900/10 bg-panel p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium text-forest-900">
                        <span className="mr-1">{PRIORITY_FLAG[d.priority] ?? "·"}</span>
                        {d.creditor}
                        {d.type && (
                          <span className="ml-2 rounded bg-cream-100 px-1.5 py-0.5 text-[11px] text-forest-900/50">
                            {d.type}
                          </span>
                        )}
                      </p>
                      <p className="shrink-0 font-semibold text-forest-900">
                        {fmtCur(d.remaining, d.currency)}
                      </p>
                    </div>
                    {d.note && <p className="mt-1 text-xs text-forest-900/55">{d.note}</p>}
                    {d.paid > 0 && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest-900/10">
                          <div className="h-full rounded-full bg-brass-500" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-forest-900/45">
                          погашено {fmtCur(d.paid, d.currency)} из {fmtCur(d.initial, d.currency)} ({pct}%)
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <Link
          href="/admin/finance"
          className="mt-6 inline-block text-sm text-forest-900/55 hover:text-brass-600"
        >
          ← К финансовому дашборду
        </Link>
      </div>
    </section>
  );
}

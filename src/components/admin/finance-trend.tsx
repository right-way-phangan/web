/**
 * График динамики по месяцам — пары столбиков «траты / доходы» из ledger.
 * Без чарт-либ: flex-колонки с высотой в процентах от максимума.
 */
import { fmtMoney, type Currency, type DisplayCurrency, type MonthPoint } from "@/lib/data/finance";

const MONTHS_RU = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

function monthLabel(m: string): string {
  const [y, mm] = m.split("-");
  const name = MONTHS_RU[Number(mm) - 1] ?? mm;
  return `${name} ’${y.slice(2)}`;
}

export function FinanceTrend({
  data,
  currency,
  fx,
}: {
  data: MonthPoint[];
  currency: DisplayCurrency;
  fx?: Record<Currency, number>;
}) {
  const max = Math.max(...data.map((d) => Math.max(d.spent, d.income)), 1);
  return (
    <div>
      <div className="flex items-end gap-4 overflow-x-auto pb-1 sm:gap-6">
        {data.map((d) => {
          const hSpent = Math.max((d.spent / max) * 100, d.spent > 0 ? 3 : 0);
          const hIncome = Math.max((d.income / max) * 100, d.income > 0 ? 3 : 0);
          return (
            <div key={d.month} className="flex min-w-[72px] flex-1 flex-col items-center">
              <div className="flex h-36 w-full items-end justify-center gap-1.5">
                <div className="flex h-full w-7 flex-col items-center justify-end">
                  {d.spent > 0 && (
                    <span className="mb-0.5 text-[10px] tabular-nums text-forest-900/55">
                      {fmtMoney(d.spent, currency, fx)}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t bg-brass-500"
                    style={{ height: `${hSpent}%` }}
                  />
                </div>
                <div className="flex h-full w-7 flex-col items-center justify-end">
                  {d.income > 0 && (
                    <span className="mb-0.5 text-[10px] tabular-nums text-emerald-700">
                      {fmtMoney(d.income, currency, fx)}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t bg-emerald-600"
                    style={{ height: `${hIncome}%` }}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-forest-900/55">{monthLabel(d.month)}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-forest-900/55">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brass-500" /> траты
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> доходы
        </span>
      </div>
    </div>
  );
}

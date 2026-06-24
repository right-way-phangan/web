import { fmtMoney, type Currency, type DisplayCurrency } from "@/lib/data/finance";

/**
 * Лёгкий SVG-донат для структуры расходов. Server component, без client JS и
 * без графических библиотек. Сегменты рисуются через stroke-dasharray на
 * окружности с pathLength=100 (значения = проценты).
 */

// Палитра сегментов через CSS-переменные (globals.css): светлая = брендовые
// hex (brass → forest → светлые), тёмная = читаемый набор на графите (золото/
// бронза/шалфей вместо тёмно-зелёных, которые на графите исчезают).
const COLORS = [
  "var(--seg-1)",
  "var(--seg-2)",
  "var(--seg-3)",
  "var(--seg-4)",
  "var(--seg-5)",
  "var(--seg-6)",
  "var(--seg-7)",
];

export function FinanceDonut({
  segments,
  centerValue,
  centerLabel,
  currency = "THB",
  fx,
}: {
  segments: Array<{ label: string; value: number }>;
  centerValue: string;
  centerLabel: string;
  currency?: DisplayCurrency;
  fx?: Record<Currency, number>;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0">
        <svg viewBox="0 0 42 42" className="h-44 w-44">
          <circle cx="21" cy="21" r="15.915" fill="none" style={{ stroke: "var(--donut-track)" }} strokeWidth="5" />
          {segments.map((seg, i) => {
            const pct = (seg.value / total) * 100;
            const dash = `${pct} ${100 - pct}`;
            const offset = 25 - acc; // старт сверху (25 = четверть назад)
            acc += pct;
            return (
              <circle
                key={seg.label}
                cx="21"
                cy="21"
                r="15.915"
                fill="none"
                style={{ stroke: COLORS[i % COLORS.length] }}
                strokeWidth="5"
                strokeDasharray={dash}
                strokeDashoffset={offset}
                pathLength={100}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-forest-900">{centerValue}</span>
          <span className="text-[10px] uppercase tracking-wide text-forest-900/45">
            {centerLabel}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-1.5">
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * 100;
          return (
            <li key={seg.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-forest-900/75">{seg.label}</span>
              <span className="shrink-0 tabular-nums text-forest-900/50">
                {fmtMoney(seg.value, currency, fx)}
              </span>
              <span className="w-12 shrink-0 text-right font-medium tabular-nums text-forest-900">
                {pct.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

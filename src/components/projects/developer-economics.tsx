import { Info } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { formatPriceTHB } from "@/lib/utils/price";
import { ECONOMICS_LABELS, type ProjectEconomics } from "@/content/projects/economics";
import { cn } from "@/lib/utils/cn";

/**
 * The rental economics a developer publishes for its own project, shown as-is
 * next to our ROI calculator: the promise and the independent check side by
 * side. Our caveats sit under the table, not hidden in a footnote.
 */
export function DeveloperEconomics({
  economics,
  locale,
}: {
  economics: ProjectEconomics;
  locale: Locale;
}) {
  const t = ECONOMICS_LABELS[locale];
  const { formats } = economics;
  const pct = (n: number) => `${n.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}%`;

  const rows: Array<{ label: string; value: (f: (typeof formats)[number]) => string; strong?: boolean; negative?: boolean }> = [
    { label: t.entry, value: (f) => formatPriceTHB(f.entryThb) },
    { label: t.grossRevenue, value: (f) => formatPriceTHB(f.grossRevenue) },
    { label: t.opex, value: (f) => `−${formatPriceTHB(f.opex)}`, negative: true },
    { label: t.operatingProfit, value: (f) => formatPriceTHB(f.operatingProfit) },
    { label: t.managementFee, value: (f) => `−${formatPriceTHB(f.managementFee)}`, negative: true },
    { label: t.netOwnerIncome, value: (f) => formatPriceTHB(f.netOwnerIncome), strong: true },
    { label: t.netMonthly, value: (f) => formatPriceTHB(f.netMonthly) },
    { label: t.yieldPct, value: (f) => pct(f.yieldPct), strong: true },
    { label: t.payback, value: (f) => t.years(f.paybackYears) },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-forest-500/70">{t.lede}</p>

      {/* Four columns do not fit a phone — the table scrolls inside its own box. */}
      <div className="overflow-x-auto rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5">
        <table className="w-full min-w-[34rem] border-collapse rounded-core bg-cream-50 text-sm shadow-bezel">
          <thead>
            <tr className="border-b border-forest-500/10">
              <th scope="col" className="px-4 py-3 text-left font-medium text-forest-500/60">
                <span className="sr-only">{t.heading}</span>
              </th>
              {formats.map((f) => (
                <th
                  key={f.id}
                  scope="col"
                  className="px-4 py-3 text-right text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-brass-600"
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-forest-500/10 last:border-0">
                <th
                  scope="row"
                  className={cn(
                    "px-4 py-3 text-left font-normal",
                    row.strong ? "text-forest-900" : "text-forest-500/70",
                  )}
                >
                  {row.label}
                </th>
                {formats.map((f) => (
                  <td
                    key={f.id}
                    className={cn(
                      "num px-4 py-3 text-right tabular-nums",
                      row.strong
                        ? "font-medium text-forest-900"
                        : row.negative
                          ? "text-forest-500/60"
                          : "text-forest-900/80",
                    )}
                  >
                    {row.value(f)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-forest-500/60">
        <span className="font-medium text-forest-500/75">{t.sourceLabel}: </span>
        {economics.source[locale]}
      </p>

      <div className="rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5">
        <div className="rounded-core bg-cream-50 p-5 shadow-bezel">
          <h3 className="flex items-center gap-2 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
            <Info className="h-3.5 w-3.5" aria-hidden />
            {t.caveatsLabel}
          </h3>
          <ul className="mt-3 space-y-2.5">
            {economics.caveats.map((c) => (
              <li key={c.en} className="flex gap-2.5 text-sm leading-relaxed text-forest-500/75">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass-500/60" />
                <span>{c[locale]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

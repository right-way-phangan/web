import Link from "next/link";
import type { Route } from "next";
import { Landmark } from "lucide-react";
import type { SalePriceStats } from "@/lib/data/sale-prices";
import { DISTRICT_PAGE_SLUGS } from "@/lib/data/rental-market";
import { formatPriceCompact } from "@/lib/utils/price";
import type { Locale } from "@/lib/i18n/dictionaries";

const SP = {
  en: {
    title: "Land prices by district",
    intro: (median: string, sample: number): React.ReactNode => (
      <>
        Median asking price per rai across our live land listings. The island-wide median is{" "}
        <strong className="text-forest-900">{median}</strong> from {sample} priced plots. Bars show
        where each district sits against the most expensive.
      </>
    ),
    plots: (n: number) => `${n} ${n === 1 ? "plot" : "plots"}`,
    footnote:
      "Medians from a live snapshot of active listings — indicative, not a valuation. Plots vary by access, zoning, and frontage.",
    ctaPre: "Own land or a villa here? ",
    ctaLink: "Get a free estimate of your property",
    ctaPost: " — built on this same data.",
  },
  ru: {
    title: "Цены на землю по районам",
    intro: (median: string, sample: number): React.ReactNode => (
      <>
        Медианная цена за рай по нашим активным земельным объявлениям. Медиана по острову —{" "}
        <strong className="text-forest-900">{median}</strong> из {sample} участков с ценой. Полоски
        показывают, где каждый район относительно самого дорогого.
      </>
    ),
    plots: (n: number) => `${n} ${pluralPlots(n)}`,
    footnote:
      "Медианы по живому срезу активных объявлений — ориентир, не оценка. Участки различаются по доступу, зонированию и фронту.",
    ctaPre: "Владеете тут участком или виллой? ",
    ctaLink: "Получите бесплатную оценку",
    ctaPost: " — по этим же данным.",
  },
} as const;

function pluralPlots(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "участок";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "участка";
  return "участков";
}

/**
 * Sale-price-by-district section for /insights. Pairs the rental yield data with
 * the actual asking-price side of the market — the headline is median land price
 * per rai, ranked by district. Pure CSS bars (no chart lib) to match the rental
 * section and keep the bundle lean.
 */
export function SalePrices({
  stats,
  locale = "en",
}: {
  stats: SalePriceStats;
  locale?: Locale;
}) {
  const t = SP[locale];
  const base = locale === "ru" ? "/ru" : "";
  const landRows = stats.rows.filter((r) => r.landPerRaiMedian != null);
  if (landRows.length === 0) return null;

  const max = Math.max(...landRows.map((r) => r.landPerRaiMedian ?? 0), 1);
  const medianAll = stats.landPerRaiMedianAll
    ? `${formatPriceCompact(stats.landPerRaiMedianAll)}/${locale === "ru" ? "рай" : "rai"}`
    : "—";

  return (
    <section>
      <header className="mb-6 flex items-start gap-3">
        <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-brass-500" />
        <div>
          <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">{t.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-forest-500/70">
            {t.intro(medianAll, stats.landSampleAll)}
          </p>
        </div>
      </header>

      <div className="space-y-3 rounded-sm border border-forest-500/10 bg-cream-50 px-5 py-6 md:px-7">
        {landRows.map((r) => {
          const value = r.landPerRaiMedian ?? 0;
          const pct = Math.max(4, Math.round((value / max) * 100));
          const slug = districtSlug(r.district);
          const hasPage = slug && DISTRICT_PAGE_SLUGS.has(slug);
          return (
            <div
              key={r.district}
              className="grid grid-cols-[minmax(7rem,9rem)_1fr_auto] items-center gap-3 md:gap-4"
            >
              <div className="min-w-0">
                {hasPage ? (
                  <Link
                    href={`${base}/districts/${slug}` as Route}
                    className="block truncate text-sm font-medium text-forest-900 underline-offset-2 hover:text-brass-500 hover:underline"
                  >
                    {r.district}
                  </Link>
                ) : (
                  <span className="block truncate text-sm font-medium text-forest-900">
                    {r.district}
                  </span>
                )}
                <div className="truncate text-[11px] text-forest-500/55">{t.plots(r.landCount)}</div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-forest-500/8">
                <div
                  className="h-full rounded-full bg-forest-500/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-20 text-right text-sm font-semibold tabular-nums text-forest-900">
                {formatPriceCompact(value)}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-forest-500/45">{t.footnote}</p>
      <p className="mt-4 text-sm text-forest-900/80">
        {t.ctaPre}
        <Link
          href={`${base}/tools/estimate` as Route}
          className="font-medium text-brass-500 underline underline-offset-2 hover:text-brass-600"
        >
          {t.ctaLink}
        </Link>
        {t.ctaPost}
      </p>
    </section>
  );
}

/** Lowercase, space→hyphen — matches the district page slug convention. */
function districtSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

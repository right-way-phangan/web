import Link from "next/link";
import type { Route } from "next";
import { Landmark } from "lucide-react";
import type { SalePriceStats } from "@/lib/data/sale-prices";
import { DISTRICT_PAGE_SLUGS } from "@/lib/data/rental-market";
import { formatPriceCompact } from "@/lib/utils/price";

/**
 * Sale-price-by-district section for /insights. Pairs the rental yield data with
 * the actual asking-price side of the market — the headline is median land price
 * per rai, ranked by district. Pure CSS bars (no chart lib) to match the rental
 * section and keep the bundle lean.
 */
export function SalePrices({ stats }: { stats: SalePriceStats }) {
  const landRows = stats.rows.filter((r) => r.landPerRaiMedian != null);
  if (landRows.length === 0) return null;

  const max = Math.max(...landRows.map((r) => r.landPerRaiMedian ?? 0), 1);

  return (
    <section>
      <header className="mb-6 flex items-start gap-3">
        <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-brass-500" />
        <div>
          <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">
            Land prices by district
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-forest-500/70">
            Median asking price per rai across our live land listings. The
            island-wide median is{" "}
            <strong className="text-forest-900">
              {stats.landPerRaiMedianAll
                ? `${formatPriceCompact(stats.landPerRaiMedianAll)}/rai`
                : "—"}
            </strong>{" "}
            from {stats.landSampleAll} priced plots. Bars show where each district
            sits against the most expensive.
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
                    href={`/districts/${slug}` as Route}
                    className="block truncate text-sm font-medium text-forest-900 underline-offset-2 hover:text-brass-500 hover:underline"
                  >
                    {r.district}
                  </Link>
                ) : (
                  <span className="block truncate text-sm font-medium text-forest-900">
                    {r.district}
                  </span>
                )}
                <div className="truncate text-[11px] text-forest-500/55">
                  {r.landCount} {r.landCount === 1 ? "plot" : "plots"}
                </div>
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

      <p className="mt-3 text-[11px] text-forest-500/45">
        Medians from a live snapshot of active listings — indicative, not a
        valuation. Plots vary by access, zoning, and frontage.
      </p>
    </section>
  );
}

/** Lowercase, space→hyphen — matches the district page slug convention. */
function districtSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

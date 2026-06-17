import Link from "next/link";
import type { Route } from "next";
import { ExternalLink } from "lucide-react";
import type { LandEstate, EstatePlot } from "@/content/land-estates";
import { plotPriceVisible } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { formatPriceCompact } from "@/lib/utils/price";
import { localePath } from "@/lib/i18n/locale-path";
import { cn } from "@/lib/utils/cn";
import { AvailabilityBar } from "@/components/projects/availability-bar";
import { PlotStatusBadge } from "./plot-status-badge";

interface Props {
  estate: LandEstate;
  locale: Locale;
}

/**
 * Таблица участков подборки + сводные счётчики и прогресс-бар занятости.
 * Каждый ряд: лот, площадь, вид владения, цена/аренда (только для свободных и
 * резерва), статусный бейдж. Лоты с привязкой к реальной карточке (rwNumber) и
 * статусом «свободен» кликабельны → /object/RW-L####.
 */
export function EstatePlotsTable({ estate, locale }: Props) {
  const t = getEstatesDict(locale);
  const total = estate.plots.length;
  const available = estate.plots.filter((p) => p.status === "available").length;

  return (
    <div className="space-y-6">
      {/* Сводные счётчики */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={total} label={t.plots} />
        <Stat value={available} label={t.available} highlight={available > 0} />
        <Stat value={estate.plots.filter((p) => p.status === "sold").length} label={t.sold} muted />
        <Stat value={estate.plots.filter((p) => p.status === "rented").length} label={t.rented} muted />
      </div>

      <div className="space-y-2">
        <AvailabilityBar total={total} available={available} />
        {available <= 0 ? (
          <p className="text-sm text-forest-500/70">{t.soldOut}</p>
        ) : available <= 2 ? (
          <p className="text-sm font-medium text-brass-600">{t.plotsLeft(available)}</p>
        ) : (
          <p className="text-sm text-forest-500/70">{t.availableOf(available, total)}</p>
        )}
      </div>

      {/* Заголовок таблицы (desktop) */}
      <div className="hidden border-b border-forest-500/10 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-forest-500/50 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-3">
        <span>{t.table.plot}</span>
        <span>{t.table.area}</span>
        <span>{t.table.tenure}</span>
        <span className="text-right">{t.table.price}</span>
        <span className="justify-self-end">{t.table.statusCol}</span>
      </div>

      <dl className="divide-y divide-forest-500/10 border-b border-forest-500/10">
        {estate.plots.map((plot) => (
          <PlotRow key={plot.code} plot={plot} locale={locale} />
        ))}
      </dl>
    </div>
  );
}

function PlotRow({ plot, locale }: { plot: EstatePlot; locale: Locale }) {
  const t = getEstatesDict(locale);
  const taken = plot.status === "sold" || plot.status === "rented";

  const area = plot.areaRai
    ? `${plot.areaRai} ${locale === "ru" ? "рай" : "rai"}`
    : plot.areaSqm
      ? `${plot.areaSqm.toLocaleString()} m²`
      : "—";

  const priceNode = plotPriceVisible(plot.status) ? (
    plot.tenure === "Leasehold" && plot.rentPerRaiMonth ? (
      <span className="num text-forest-900">
        {formatPriceCompact(plot.rentPerRaiMonth)}
        <span className="ml-1 font-sans text-[11px] text-forest-500/55">{t.perRaiMonth}</span>
      </span>
    ) : plot.priceThb ? (
      <span className="num text-forest-900">{formatPriceCompact(plot.priceThb)}</span>
    ) : (
      <span className="text-forest-500/55">{t.priceOnRequest}</span>
    )
  ) : (
    <span className="text-forest-500/35">—</span>
  );

  const inner = (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 py-3.5 sm:grid-cols-[auto_1fr_auto_auto_auto]",
        taken && "opacity-70",
      )}
    >
      <dt className="text-sm font-medium text-forest-900">{plot.code}</dt>
      <dd className="text-sm text-forest-500/75 sm:order-none order-3 col-span-2 sm:col-span-1">
        {area}
        {plot.note ? (
          <span className="block text-xs text-forest-500/50 sm:inline sm:before:mx-1.5 sm:before:content-['·']">
            {plot.note[locale]}
          </span>
        ) : null}
      </dd>
      <dd className="hidden text-sm text-forest-500/70 sm:block">{t.tenure[plot.tenure]}</dd>
      <dd className="text-sm sm:text-right">{priceNode}</dd>
      <dd className="justify-self-end">
        <PlotStatusBadge status={plot.status} locale={locale} />
      </dd>
    </div>
  );

  // Кликабельны только свободные лоты с реальной карточкой каталога.
  const reachable = plot.status === "available" && !!plot.rwNumber;
  if (reachable) {
    return (
      <Link
        href={localePath(locale, `/object/${plot.rwNumber}`) as Route}
        className="group block transition-colors hover:bg-forest-500/5"
      >
        <div className="relative">
          {inner}
          <ExternalLink className="pointer-events-none absolute right-0 top-3.5 h-3.5 w-3.5 text-forest-500/0 transition-colors group-hover:text-brass-500 sm:hidden" />
        </div>
      </Link>
    );
  }
  return inner;
}

function Stat({
  value,
  label,
  highlight,
  muted,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-3.5">
      <div
        className={cn(
          "num text-2xl",
          highlight ? "text-brass-500" : muted ? "text-forest-500/50" : "text-forest-900",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-forest-500/55">{label}</div>
    </div>
  );
}

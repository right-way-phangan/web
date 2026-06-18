"use client";

import { ArrowRight } from "lucide-react";
import type { LandEstate, EstatePlot } from "@/content/land-estates";
import { plotPriceVisible } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { formatPriceCompact } from "@/lib/utils/price";
import { cn } from "@/lib/utils/cn";
import { AvailabilityBar } from "@/components/projects/availability-bar";
import { PlotStatusBadge } from "./plot-status-badge";

interface Props {
  /** Полная подборка — для сводных счётчиков. */
  estate: LandEstate;
  /** Отфильтрованный/отсортированный список лотов для строк. */
  plots: EstatePlot[];
  locale: Locale;
  hovered: string | null;
  onHover: (code: string | null) => void;
  onEnquire: (code: string) => void;
  /** Открыть драуэр лота (по клику на код участка). */
  onOpenLot: (code: string) => void;
}

/**
 * Таблица участков: сводные счётчики + прогресс-бар (по всей подборке) и строки
 * по отфильтрованному списку. Строка подсвечивается при наведении на неё или на
 * лот в схеме плана (hovered). У свободных лотов — чип вида и кнопка «Запросить».
 */
export function EstatePlotsTable({ estate, plots, locale, hovered, onHover, onEnquire, onOpenLot }: Props) {
  const t = getEstatesDict(locale);
  const total = estate.plots.length;
  const available = estate.plots.filter((p) => p.status === "available").length;

  return (
    <div className="space-y-6">
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

      <div className="hidden border-b border-forest-500/10 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-forest-500/50 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-3">
        <span>{t.table.plot}</span>
        <span>{t.table.area}</span>
        <span>{t.table.tenure}</span>
        <span className="text-right">{t.table.price}</span>
        <span className="justify-self-end">{t.table.statusCol}</span>
      </div>

      {plots.length === 0 ? (
        <p className="py-8 text-center text-sm text-forest-500/60">{t.noMatch}</p>
      ) : (
        <dl className="divide-y divide-forest-500/10 border-b border-forest-500/10">
          {plots.map((plot) => (
            <PlotRow
              key={plot.code}
              plot={plot}
              locale={locale}
              hovered={hovered === plot.code}
              onHover={onHover}
              onEnquire={onEnquire}
              onOpenLot={onOpenLot}
            />
          ))}
        </dl>
      )}
    </div>
  );
}

function PlotRow({
  plot,
  locale,
  hovered,
  onHover,
  onEnquire,
  onOpenLot,
}: {
  plot: EstatePlot;
  locale: Locale;
  hovered: boolean;
  onHover: (code: string | null) => void;
  onEnquire: (code: string) => void;
  onOpenLot: (code: string) => void;
}) {
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

  const viewChip = (
    <span
      className="inline-flex items-center gap-1 text-[11px] text-forest-500/55"
      title={plot.seaView ? t.view.sea : t.view.mountain}
    >
      <span aria-hidden>{plot.seaView ? "🌊" : "⛰"}</span>
      <span className="sr-only">{plot.seaView ? t.view.sea : t.view.mountain}</span>
    </span>
  );

  return (
    <div
      id={`row-${plot.code}`}
      onMouseEnter={() => onHover(plot.code)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "scroll-mt-28 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-1 py-3.5 transition-colors sm:grid-cols-[auto_1fr_auto_auto_auto]",
        taken && "opacity-70",
        hovered && "bg-brass-500/5",
      )}
    >
      <dt className="flex items-center gap-2 text-sm font-medium text-forest-900">
        <button
          type="button"
          onClick={() => onOpenLot(plot.code)}
          className="rounded-sm underline-offset-2 transition-colors hover:text-brass-600 hover:underline"
        >
          {plot.code}
        </button>
        {viewChip}
      </dt>
      <dd className="order-3 col-span-2 text-sm text-forest-500/75 sm:order-none sm:col-span-1">
        {area}
        {plot.note ? (
          <span className="block text-xs text-forest-500/50 sm:inline sm:before:mx-1.5 sm:before:content-['·']">
            {plot.note[locale]}
          </span>
        ) : null}
      </dd>
      <dd className="hidden text-sm text-forest-500/70 sm:block">{t.tenure[plot.tenure]}</dd>
      <dd className="text-sm sm:text-right">{priceNode}</dd>
      <dd className="flex items-center justify-end gap-2 justify-self-end">
        <PlotStatusBadge status={plot.status} locale={locale} />
        {plot.status === "available" ? (
          <button
            type="button"
            onClick={() => onEnquire(plot.code)}
            className="hidden items-center gap-1 rounded-sm border border-brass-500/40 px-2 py-1 text-[11px] font-medium text-brass-600 transition-colors hover:bg-brass-500/10 sm:inline-flex"
          >
            {t.enquireLot(plot.code)}
            <ArrowRight className="h-3 w-3" />
          </button>
        ) : null}
      </dd>
    </div>
  );
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

"use client";

import { ArrowRight, Compass, Maximize2, Mountain, Waves } from "lucide-react";
import type { LandEstate, EstatePlot } from "@/content/land-estates";
import { estateStats, plotPriceVisible } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { PlotStatusBadge } from "./plot-status-badge";
import { useEstateCurrency } from "./estate-currency";

interface Props {
  estate: LandEstate;
  /** Лот под курсором или открытый в драуэре; null — показываем сводку. */
  plot: EstatePlot | null;
  locale: Locale;
  onOpen: (code: string) => void;
  onEnquire: (code: string) => void;
}

/**
 * Панель рядом со схемой: на десктопе занимает место справа от вытянутого плана
 * (раньше там была пустота) и показывает детали лота под курсором — не нужно
 * кликать и открывать драуэр, чтобы сравнить участки. Пока лот не выбран —
 * сводка по подборке и ориентир по сторонам света. На мобильном — под схемой.
 */
export function EstatePlanAside({ estate, plot, locale, onOpen, onEnquire }: Props) {
  const t = getEstatesDict(locale);
  const { fmt } = useEstateCurrency();
  const s = estateStats(estate);

  return (
    <aside className="rounded-sm border border-forest-500/12 bg-cream-50 p-4 lg:sticky lg:top-28 lg:min-h-[15rem]">
      {plot ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="font-serif text-2xl text-forest-900">{plot.code}</span>
            <PlotStatusBadge status={plot.status} locale={locale} />
          </div>

          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label={t.table.area}>
              {plot.areaRai ? `${plot.areaRai} ${locale === "ru" ? "рай" : "rai"}` : null}
              {plot.areaRai && plot.areaSqm ? <span className="text-forest-500/45"> · </span> : null}
              {plot.areaSqm ? `${plot.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²` : null}
            </Row>
            <Row label={t.drawer.view}>
              {plot.seaView ? (
                <span className="inline-flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5 text-brass-500" aria-hidden />
                  {t.view.sea}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Mountain className="h-3.5 w-3.5 text-forest-500/50" aria-hidden />
                  {t.view.mountain}
                </span>
              )}
            </Row>
            <Row label={`${t.table.price} · ${t.tenure[plot.tenure]}`}>
              {plotPriceVisible(plot.status) ? (
                plot.tenure === "Leasehold" && plot.rentPerRaiMonth ? (
                  <span className="num text-forest-900">
                    {fmt(plot.rentPerRaiMonth)}
                    <span className="ml-1 font-sans text-[11px] text-forest-500/55">{t.perRaiMonth}</span>
                  </span>
                ) : plot.priceThb ? (
                  <span className="num text-forest-900">{fmt(plot.priceThb)}</span>
                ) : (
                  <span className="text-forest-500/55">{t.priceOnRequest}</span>
                )
              ) : (
                <span className="text-forest-500/45">—</span>
              )}
            </Row>
          </dl>

          {plot.note ? <p className="mt-3 text-xs leading-relaxed text-forest-500/65">{plot.note[locale]}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpen(plot.code)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-forest-500/20 px-3 py-1.5 text-xs font-medium text-forest-900 transition-colors hover:border-forest-500/40"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden />
              {t.drawer.fullPlot}
            </button>
            {plot.status === "available" ? (
              <button
                type="button"
                onClick={() => onEnquire(plot.code)}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brass-500 px-3 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-brass-600"
              >
                {t.enquireLot(plot.code)}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <p className="font-serif text-xl text-forest-900">
            {s.available > 0 ? t.availableOf(s.available, s.total) : t.soldOut}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-forest-500/70">{t.planUi.hint}</p>
          <p className="mt-4 flex items-start gap-2 border-t border-forest-500/10 pt-3 text-xs leading-relaxed text-forest-500/60">
            <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-500" aria-hidden />
            {t.planUi.orient}
          </p>
        </>
      )}
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-forest-500/55">{label}</dt>
      <dd className="text-right text-forest-900">{children}</dd>
    </div>
  );
}

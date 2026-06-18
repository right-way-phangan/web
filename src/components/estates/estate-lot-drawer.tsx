"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { X, ArrowRight, TrendingUp, Hammer, MapPin, ExternalLink, Scale } from "lucide-react";
import type { LandEstate, EstatePlot } from "@/content/land-estates";
import { plotPriceVisible, buildPotential } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { formatPriceCompact } from "@/lib/utils/price";
import { cn } from "@/lib/utils/cn";
import { EstateLotCarousel } from "./estate-lot-carousel";
import { PlotStatusBadge } from "./plot-status-badge";

interface Props {
  estate: LandEstate;
  plot: EstatePlot | null;
  locale: Locale;
  estateName: string;
  onClose: () => void;
  onEnquire: (code: string) => void;
  onToggleCompare: (code: string) => void;
  inCompare: boolean;
}

/**
 * Боковой драуэр одного лота: карусель фото, параметры, потенциал застройки,
 * ссылка в ROI-калькулятор (с предзаполненной ценой), кнопки «Запросить» и
 * «В сравнение», ссылка на полную карточку каталога. Открывается кликом по лоту
 * на схеме/в таблице. Esc/клик по фону — закрыть; блокирует прокрутку body.
 */
export function EstateLotDrawer({
  estate,
  plot,
  locale,
  estateName,
  onClose,
  onEnquire,
  onToggleCompare,
  inCompare,
}: Props) {
  useEffect(() => {
    if (!plot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [plot, onClose]);

  if (!plot) return null;
  const t = getEstatesDict(locale);
  const priceVisible = plotPriceVisible(plot.status);
  const bp = buildPotential(plot);
  const pricePerSqm =
    priceVisible && plot.priceThb && plot.areaSqm ? Math.round(plot.priceThb / plot.areaSqm) : null;

  const area = plot.areaRai
    ? `${plot.areaRai} ${locale === "ru" ? "рай" : "rai"}`
    : plot.areaSqm
      ? `${plot.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²`
      : "—";

  const roiHref =
    priceVisible && plot.priceThb
      ? (`${localePath(locale, "/calculator")}?price=${plot.priceThb}&tenure=${plot.tenure === "Leasehold" ? "leasehold" : "freehold"}` as Route)
      : null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end print:hidden" role="dialog" aria-modal="true" aria-label={plot.code}>
      <div className="absolute inset-0 bg-forest-900/50" style={{ animation: "lbFade 0.2s ease" }} onClick={onClose} />
      <aside
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-cream-50 shadow-2xl"
        style={{ animation: "drawerIn 0.32s cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* Шапка */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-forest-500/10 bg-cream-50/95 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl text-forest-900">{plot.code}</span>
            <PlotStatusBadge status={plot.status} locale={locale} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-forest-500/70 transition-colors hover:bg-forest-500/10 hover:text-forest-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {plot.photos && plot.photos.length > 0 ? (
            <EstateLotCarousel photos={plot.photos} altPrefix={`${estateName} — ${plot.code}`} sizes="(min-width: 768px) 28rem, 100vw" />
          ) : null}

          {/* Параметры */}
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.drawer.facts}</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Fact label={t.table.area} value={area} />
              <Fact label={t.table.tenure} value={t.tenure[plot.tenure]} />
              <Fact
                label={t.table.price}
                value={
                  priceVisible && plot.priceThb
                    ? formatPriceCompact(plot.priceThb)
                    : priceVisible
                      ? t.priceOnRequest
                      : "—"
                }
                accent={priceVisible && !!plot.priceThb}
              />
              <Fact label={t.drawer.view} value={plot.seaView ? `🌊 ${t.view.sea}` : `⛰ ${t.view.mountain}`} />
              {pricePerSqm ? <Fact label={t.compare.pricePerSqm} value={`฿${pricePerSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}`} /> : null}
            </dl>
          </div>

          {/* Потенциал застройки */}
          {bp ? (
            <div className="rounded-sm border border-forest-500/12 bg-forest-500/[0.03] p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                <Hammer className="h-3.5 w-3.5" /> {t.drawer.buildTitle}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="num text-2xl text-forest-900">~{bp.coverageSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²</div>
                  <div className="mt-0.5 text-[11px] text-forest-500/60">{t.drawer.coverage}</div>
                </div>
                <div>
                  <div className="num text-2xl text-forest-900">~{bp.villas}</div>
                  <div className="mt-0.5 text-[11px] text-forest-500/60">{t.drawer.villas}</div>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-forest-500/50">{t.drawer.buildNote}</p>
            </div>
          ) : null}

          {/* Заметка */}
          {plot.note ? (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.drawer.note}</h3>
              <p className="text-sm leading-relaxed text-forest-500/80">{plot.note[locale]}</p>
            </div>
          ) : null}

          {/* ROI */}
          {roiHref ? (
            <Link
              href={roiHref}
              className="flex items-center justify-between gap-2 rounded-sm border border-brass-500/30 bg-brass-500/5 px-4 py-3 text-sm font-medium text-brass-700 transition-colors hover:bg-brass-500/10"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> {t.drawer.roiCta}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {/* Действия (липкий низ) */}
        <div className="sticky bottom-0 mt-auto space-y-2 border-t border-forest-500/10 bg-cream-50/95 p-5 backdrop-blur">
          {plot.status === "available" ? (
            <button
              type="button"
              onClick={() => onEnquire(plot.code)}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-brass-500 px-4 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-brass-600"
            >
              {t.enquireLot(plot.code)}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onToggleCompare(plot.code)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm border px-3 py-2.5 text-xs font-medium transition-colors",
                inCompare
                  ? "border-forest-900 bg-forest-900 text-cream-50"
                  : "border-forest-500/25 text-forest-500/80 hover:border-forest-500/45",
              )}
            >
              <Scale className="h-3.5 w-3.5" />
              {inCompare ? t.drawer.inCompare : t.drawer.addCompare}
            </button>
            {plot.rwNumber && plot.status === "available" ? (
              <Link
                href={localePath(locale, `/object/${plot.rwNumber}`) as Route}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-500/25 px-3 py-2.5 text-xs font-medium text-forest-500/80 transition-colors hover:border-forest-500/45"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t.drawer.fullPlot}
              </Link>
            ) : (
              <Link
                href={localePath(locale, `/listings?district=${encodeURIComponent(estate.district)}`) as Route}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-500/25 px-3 py-2.5 text-xs font-medium text-forest-500/80 transition-colors hover:border-forest-500/45"
              >
                <MapPin className="h-3.5 w-3.5" />
                {t.seeDistrict}
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-forest-500/50">{label}</dt>
      <dd className={cn("mt-0.5", accent ? "num text-base text-forest-900" : "text-forest-900")}>{value}</dd>
    </div>
  );
}

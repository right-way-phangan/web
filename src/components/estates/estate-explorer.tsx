"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Map as MapIcon, Satellite } from "lucide-react";
import type { LandEstate } from "@/content/land-estates";
import { estatePhotoPlots, estateStats, estatePriceFrom } from "@/content/land-estates";
import { formatPriceCompact } from "@/lib/utils/price";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { cn } from "@/lib/utils/cn";
import { Appear } from "@/components/motion/appear";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { EstateSitePlan } from "./estate-site-plan";
import { EstateSatelliteView } from "./estate-satellite-view";
import { EstatePlotsTable } from "./estate-plots-table";
import { EstateGallery } from "./estate-gallery";
import { EstateInquiry } from "./estate-inquiry";
import { EstateLotDrawer } from "./estate-lot-drawer";
import { EstateCompare } from "./estate-compare";
import { EstateCurrencyProvider, CurrencyToggle } from "./estate-currency";

type Filter = "all" | "available" | "sea" | "mountain";
type Sort = "recommended" | "priceLow" | "priceHigh" | "areaLarge";
type PlanMode = "plan" | "satellite";

interface Props {
  estate: LandEstate;
  locale: Locale;
  /** Лот, открытый в драуэре при заходе (со страницы /estates/<slug>/<lot>). */
  initialLot?: string;
}

/**
 * Клиентский «исследователь» подборки: связывает схему плана (+ режим «Спутник»),
 * таблицу, галерею, драуэр лота, сравнение и форму заявки общим состоянием —
 * наведение (план↔таблица), фильтр/сортировка, выбор лота (драуэр), сравнение до
 * 3 лотов, предзаполнение заявки. Статика (шапка/описание/DD) — в серверном
 * лендинге выше.
 */
export function EstateExplorer({ estate, locale, initialLot }: Props) {
  const t = getEstatesDict(locale);
  const s = estateStats(estate);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [drawerLot, setDrawerLot] = useState<string | null>(initialLot ?? null);
  const [compareCodes, setCompareCodes] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const [planMode, setPlanMode] = useState<PlanMode>("plan");
  const [enquireSeen, setEnquireSeen] = useState(false);

  // Deep-link ?lot=R7 → открыть драуэр этого лота при заходе.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const code = new URLSearchParams(window.location.search).get("lot");
    if (code && estate.plots.some((p) => p.code === code)) setDrawerLot(code);
  }, [estate.plots]);

  // Скрывать мобильную CTA-панель, когда форма заявки уже в кадре.
  useEffect(() => {
    const el = document.getElementById("enquire");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setEnquireSeen(e.isIntersecting), {
      rootMargin: "0px 0px -35% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const priceFrom = estatePriceFrom(estate);
  const photoPlots = estatePhotoPlots(estate);
  const hasCoords = Boolean(estate.lat && estate.lng);
  const hasLocation = hasCoords || Boolean(estate.locationUrl);

  const plots = useMemo(() => {
    let list = estate.plots.filter((p) => {
      if (filter === "available") return p.status === "available";
      if (filter === "sea") return p.seaView === true;
      if (filter === "mountain") return !p.seaView;
      return true;
    });
    const big = Number.MAX_SAFE_INTEGER;
    if (sort === "priceLow") list = [...list].sort((a, b) => (a.priceThb ?? big) - (b.priceThb ?? big));
    else if (sort === "priceHigh") list = [...list].sort((a, b) => (b.priceThb ?? 0) - (a.priceThb ?? 0));
    else if (sort === "areaLarge") list = [...list].sort((a, b) => (b.areaSqm ?? 0) - (a.areaSqm ?? 0));
    return list;
  }, [estate.plots, filter, sort]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const onEnquire = (code: string) => {
    setSelectedLot(code);
    setDrawerLot(null);
    setTimeout(() => scrollTo("enquire"), 60);
  };
  const toggleCompare = (code: string) =>
    setCompareCodes((cur) =>
      cur.includes(code) ? cur.filter((c) => c !== code) : cur.length >= 3 ? cur : [...cur, code],
    );

  const drawerPlot = drawerLot ? (estate.plots.find((p) => p.code === drawerLot) ?? null) : null;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.filter.all },
    { key: "available", label: t.filter.available },
    { key: "sea", label: t.filter.sea },
    { key: "mountain", label: t.filter.mountain },
  ];

  return (
    <EstateCurrencyProvider>
    <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
      <div className="min-w-0 space-y-16">
        {/* План разбивки + режим «Спутник» */}
        {estate.plan ? (
          <section id="plan" className="scroll-mt-32">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-3xl text-forest-900">{t.sections.plan}</h2>
                <p className="mt-2 max-w-prose text-sm text-forest-500/70">{t.planLede}</p>
              </div>
              {hasCoords ? (
                <div className="flex shrink-0 gap-1 rounded-full border border-forest-500/15 bg-cream-50 p-1">
                  <ModeBtn active={planMode === "plan"} onClick={() => setPlanMode("plan")} icon={<MapIcon className="h-3.5 w-3.5" />} label={t.planView.plan} />
                  <ModeBtn active={planMode === "satellite"} onClick={() => setPlanMode("satellite")} icon={<Satellite className="h-3.5 w-3.5" />} label={t.planView.satellite} />
                </div>
              ) : null}
            </div>
            <div className="mt-6">
              {planMode === "satellite" && estate.lat && estate.lng ? (
                <EstateSatelliteView lat={estate.lat} lng={estate.lng} mapsUrl={estate.locationUrl} locale={locale} />
              ) : (
                <EstateSitePlan estate={estate} locale={locale} hovered={hovered} selected={drawerLot} onHover={setHovered} onSelect={setDrawerLot} />
              )}
            </div>
          </section>
        ) : null}

        {/* Участки и доступность */}
        <Appear className="scroll-mt-32">
        <section id="plots" className="scroll-mt-32">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl text-forest-900">{t.sections.plotsTitle}</h2>
              <p className="mt-2 text-sm text-forest-500/70">{t.sections.plotsLede}</p>
            </div>
            {s.taken > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-500/8 px-3 py-1.5 text-xs font-medium text-forest-500/75">
                <span className="h-1.5 w-1.5 rounded-full bg-brass-500" aria-hidden />
                {t.momentum(s.taken, s.total)}
              </span>
            ) : null}
          </div>

          {/* Фильтр + сортировка */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === f.key
                      ? "border-brass-500 bg-brass-500/10 text-brass-700"
                      : "border-forest-500/15 text-forest-500/70 hover:border-forest-500/30",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <CurrencyToggle />
              <label className="flex items-center gap-2 text-xs text-forest-500/60">
                {t.sortLabel}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-sm border border-forest-500/15 bg-cream-50 px-2 py-1.5 text-xs text-forest-900"
                >
                  <option value="recommended">{t.sort.recommended}</option>
                  <option value="priceLow">{t.sort.priceLow}</option>
                  <option value="priceHigh">{t.sort.priceHigh}</option>
                  <option value="areaLarge">{t.sort.areaLarge}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <EstatePlotsTable
              estate={estate}
              plots={plots}
              locale={locale}
              hovered={hovered}
              onHover={setHovered}
              onEnquire={onEnquire}
              onOpenLot={setDrawerLot}
            />
          </div>

          <Link
            href={localePath(locale, `/listings?district=${encodeURIComponent(estate.district)}`) as Route}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brass-500 transition-colors hover:text-brass-600"
          >
            {t.seeDistrict}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
        </Appear>

        {/* Фото с участков */}
        {photoPlots.length > 0 ? (
          <Appear className="scroll-mt-32">
          <section id="gallery" className="scroll-mt-32">
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.gallery}</h2>
            <div className="mt-6">
              <EstateGallery photoPlots={photoPlots} estateName={estate.name[locale]} locale={locale} />
            </div>
          </section>
          </Appear>
        ) : null}

        {/* Расположение */}
        {hasLocation ? (
          <Appear className="scroll-mt-32">
          <section id="location" className="scroll-mt-32">
            <ObjectLocationMap
              lat={estate.lat}
              lng={estate.lng}
              district={estate.district}
              mapsUrl={estate.locationUrl}
            />
          </section>
          </Appear>
        ) : null}
      </div>

      {/* Sticky-заявка */}
      <EstateInquiry slug={estate.slug} name={estate.name[locale]} selectedLot={selectedLot} />

      {/* Драуэр лота */}
      <EstateLotDrawer
        estate={estate}
        plot={drawerPlot}
        locale={locale}
        estateName={estate.name[locale]}
        codes={estate.plots.map((p) => p.code)}
        onNavigate={setDrawerLot}
        onClose={() => setDrawerLot(null)}
        onEnquire={onEnquire}
        onToggleCompare={toggleCompare}
        inCompare={drawerLot ? compareCodes.includes(drawerLot) : false}
      />

      {/* Сравнение лотов */}
      <EstateCompare
        estate={estate}
        codes={compareCodes}
        locale={locale}
        onRemove={(code) => setCompareCodes((cur) => cur.filter((c) => c !== code))}
        onClear={() => setCompareCodes([])}
        hidden={Boolean(drawerLot)}
      />

      {/* Мобильная липкая CTA-панель (на десктопе есть липкая форма справа) */}
      {!drawerLot && compareCodes.length === 0 && !enquireSeen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-forest-500/12 bg-cream-50/95 px-4 py-3 backdrop-blur lg:hidden print:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-forest-500/75">
              {s.available > 0 ? t.availableOf(s.available, s.total) : t.soldOut}
              {priceFrom ? (
                <span className="text-forest-900">
                  {" · "}
                  {locale === "ru" ? "от" : "from"} {formatPriceCompact(priceFrom)}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={() => scrollTo("enquire")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brass-500 px-4 py-2 text-xs font-semibold text-cream-50 transition-colors hover:bg-brass-600"
            >
              {t.enquireTitle}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
    </EstateCurrencyProvider>
  );
}

function ModeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-forest-900 text-cream-50" : "text-forest-500/70 hover:text-forest-900",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import type { LandEstate } from "@/content/land-estates";
import { estatePhotoPlots } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { cn } from "@/lib/utils/cn";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { EstateSitePlan } from "./estate-site-plan";
import { EstatePlotsTable } from "./estate-plots-table";
import { EstateGallery } from "./estate-gallery";
import { EstateInquiry } from "./estate-inquiry";

type Filter = "all" | "available" | "sea" | "mountain";
type Sort = "recommended" | "priceLow" | "priceHigh" | "areaLarge";

interface Props {
  estate: LandEstate;
  locale: Locale;
  /** Код лота для авто-открытия драуэра (передаётся со страницы /estates/[slug]/[lot]). */
  initialLot?: string;
}

/**
 * Клиентский «исследователь» подборки: связывает схему плана, таблицу, галерею и
 * форму заявки общим состоянием — наведение (план↔таблица), фильтр (все/свободные/
 * море/горы), сортировка, выбор лота для предзаполнения заявки. Статика (шапка,
 * описание, DD, преимущества) остаётся в серверном лендинге выше.
 */
export function EstateExplorer({ estate, locale, initialLot }: Props) {
  const t = getEstatesDict(locale);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string | null>(initialLot ?? null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recommended");

  const photoPlots = estatePhotoPlots(estate);
  const hasLocation = Boolean(estate.lat && estate.lng) || Boolean(estate.locationUrl);

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
  const onSelectFromPlan = (code: string) => {
    setHovered(code);
    const plot = estate.plots.find((p) => p.code === code);
    const target = plot?.photos?.length ? `lot-${code}` : `row-${code}`;
    scrollTo(target);
  };
  const onEnquire = (code: string) => {
    setSelectedLot(code);
    scrollTo("enquire");
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.filter.all },
    { key: "available", label: t.filter.available },
    { key: "sea", label: t.filter.sea },
    { key: "mountain", label: t.filter.mountain },
  ];

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
      <div className="min-w-0 space-y-16">
        {/* План разбивки */}
        {estate.plan ? (
          <section id="plan" className="scroll-mt-32">
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.plan}</h2>
            <p className="mt-2 max-w-prose text-sm text-forest-500/70">{t.planLede}</p>
            <div className="mt-6">
              <EstateSitePlan
                estate={estate}
                locale={locale}
                hovered={hovered}
                onHover={setHovered}
                onSelect={onSelectFromPlan}
              />
            </div>
          </section>
        ) : null}

        {/* Участки и доступность */}
        <section id="plots" className="scroll-mt-32">
          <h2 className="font-serif text-3xl text-forest-900">{t.sections.plotsTitle}</h2>
          <p className="mt-2 text-sm text-forest-500/70">{t.sections.plotsLede}</p>

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
            <label className="ml-auto flex items-center gap-2 text-xs text-forest-500/60">
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

          <div className="mt-6">
            <EstatePlotsTable
              estate={estate}
              plots={plots}
              locale={locale}
              hovered={hovered}
              onHover={setHovered}
              onEnquire={onEnquire}
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

        {/* Фото с участков */}
        {photoPlots.length > 0 ? (
          <section id="gallery" className="scroll-mt-32">
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.gallery}</h2>
            <div className="mt-6">
              <EstateGallery photoPlots={photoPlots} estateName={estate.name[locale]} locale={locale} />
            </div>
          </section>
        ) : null}

        {/* Расположение */}
        {hasLocation ? (
          <section id="location" className="scroll-mt-32">
            <ObjectLocationMap
              lat={estate.lat}
              lng={estate.lng}
              district={estate.district}
              mapsUrl={estate.locationUrl}
            />
          </section>
        ) : null}
      </div>

      {/* Sticky-заявка */}
      <EstateInquiry slug={estate.slug} name={estate.name[locale]} selectedLot={selectedLot} />
    </div>
  );
}

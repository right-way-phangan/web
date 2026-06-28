import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ChevronRight, Check, ShieldCheck, MapPin, Layers } from "lucide-react";
import type { LandEstate } from "@/content/land-estates";
import { estateStats, estatePhotoPlots, estatePriceFrom, getPublishedEstates } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { formatPriceCompact } from "@/lib/utils/price";
import { EstateExplorer } from "./estate-explorer";
import { EstateSectionNav, type NavSection } from "./estate-section-nav";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { EstateCard } from "./estate-card";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { EstateLeadGallery } from "./estate-lead-gallery";
import { EstatePrintButton } from "./estate-print-button";
import { DistanceChips } from "@/components/objects/distance-chips";
import { Appear } from "@/components/motion/appear";

interface Props {
  estate: LandEstate;
  locale: Locale;
  /** Лот, открытый в драуэре при заходе (страница /estates/<slug>/<lot>). */
  initialLot?: string;
}

/** Лендинг одной подборки участков (аналог project-landing для земли). */
export function LandEstateLanding({ estate, locale, initialLot }: Props) {
  const t = getEstatesDict(locale);
  const s = estateStats(estate);
  const photoPlots = estatePhotoPlots(estate);
  const hasLeadPhotos = photoPlots.length > 0;
  const priceFrom = estatePriceFrom(estate);
  const fromLabel = locale === "ru" ? "от" : "from";
  // Покупаемые участки для пикчера калькулятора — freehold available с ценой.
  const calcPlots = estate.plots
    .filter((p) => p.status === "available" && p.tenure === "Freehold" && p.priceThb)
    .map((p) => ({
      rwNumber: p.code,
      label: p.areaRai ? `${p.code} · ${p.areaRai} ${locale === "ru" ? "рай" : "rai"}` : p.code,
      priceThb: p.priceThb as number,
    }));

  const homeHref = localePath(locale, "/") as Route;
  const estatesHref = localePath(locale, "/estates") as Route;

  const others = getPublishedEstates()
    .filter((e) => e.slug !== estate.slug)
    .slice(0, 3);

  // Состав липкой навигации — только реально присутствующие секции.
  const navSections: NavSection[] = [
    { id: "overview", label: t.nav.overview },
    ...(estate.plan ? [{ id: "plan", label: t.nav.plan }] : []),
    { id: "plots", label: t.nav.plots },
    ...(estatePhotoPlots(estate).length > 0 ? [{ id: "gallery", label: t.nav.gallery }] : []),
    ...(estate.lat && estate.lng ? [{ id: "location", label: t.nav.location }] : []),
    ...(priceFrom != null ? [{ id: "returns", label: t.nav.returns }] : []),
  ];

  return (
    <article className="container-prose py-8 md:py-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-forest-500/60"
      >
        <Link href={homeHref} className="transition-colors hover:text-brass-500">
          {t.home}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={estatesHref} className="transition-colors hover:text-brass-500">
          {t.breadcrumb}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="truncate text-forest-900">{estate.name[locale]}</span>
      </nav>

      {/* Hero */}
      <header className="relative isolate overflow-hidden rounded-sm bg-panel">
        {estate.cover ? (
          <Image
            src={estate.cover}
            alt={estate.name[locale]}
            fill
            priority
            unoptimized
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-t from-panel/95 via-panel/70 to-panel/45"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[36vh] flex-col justify-end p-7 md:min-h-[42vh] md:p-12">
          <div className="flex flex-wrap items-center gap-2 text-xs text-panel-fg/80">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brass-300" />
              {estate.district}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-brass-300" />
              {s.total} {t.plots.toLowerCase()}
            </span>
            {s.areaRai > 0 ? (
              <span>· {s.areaRai} {locale === "ru" ? "рай всего" : "rai total"}</span>
            ) : null}
            {priceFrom ? (
              <span className="text-brass-200">· {fromLabel} {formatPriceCompact(priceFrom)}</span>
            ) : null}
          </div>
          <SectionEyebrow tone="dark" className="mt-3">
            {t.eyebrow}
          </SectionEyebrow>
          <h1 className="mt-2 max-w-3xl text-balance text-panel-fg">{estate.name[locale]}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-panel-fg/85">
            {estate.tagline[locale]}
          </p>
        </div>
      </header>

      {/* Липкая навигация по странице */}
      <EstateSectionNav
        sections={navSections}
        enquireLabel={t.enquireTitle}
        availabilityLabel={s.available > 0 ? t.availableOf(s.available, s.total) : t.soldOut}
      />

      {/* Overview (статика). На десктопе — 2 колонки: текст слева, «продающие»
          фото + переход к плану справа (чтобы фото шли первыми и не пустовало). */}
      <section id="overview" className="mt-10 scroll-mt-32">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-start lg:gap-12">
          {/* Левая колонка — рассказ */}
          <div className="min-w-0">
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.overview}</h2>
            <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-forest-500/85">
              {estate.description[locale].map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* DD-наследование */}
            <div className="mt-6 flex max-w-prose items-start gap-3 rounded-sm border border-brass-500/20 bg-brass-500/5 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brass-500" />
              <p className="text-sm leading-relaxed text-forest-500/85">{t.ddNote}</p>
            </div>

            {/* Highlights */}
            {estate.highlights && estate.highlights.length > 0 ? (
              <div className="mt-8">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                  {t.sections.highlights}
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {estate.highlights.map((hl, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-forest-500/85">
                      <Check className="h-4 w-4 shrink-0 text-brass-500" />
                      {hl[locale]}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Правая колонка — продающие фото + быстрые переходы */}
          {hasLeadPhotos ? (
            <aside className="mt-10 lg:sticky lg:top-28 lg:mt-0">
              <EstateLeadGallery photoPlots={photoPlots} estateName={estate.name[locale]} locale={locale} />
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {estate.plan ? (
                  <a
                    href="#plan"
                    className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-forest-500/20 px-3 py-2.5 text-xs font-medium text-forest-900 transition-colors hover:border-brass-500 hover:text-brass-700"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    {t.sections.plan}
                  </a>
                ) : null}
                <a
                  href="#gallery"
                  className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-forest-500/20 px-3 py-2.5 text-xs font-medium text-forest-900 transition-colors hover:border-brass-500 hover:text-brass-700"
                >
                  {t.sections.gallery}
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
              {s.available > 0 ? (
                <p className="mt-3 text-center text-xs text-forest-500/60">
                  {t.availableOf(s.available, s.total)}
                  {priceFrom ? ` · ${fromLabel} ${formatPriceCompact(priceFrom)}` : ""}
                </p>
              ) : null}
              <DistanceChips lat={estate.lat} lng={estate.lng} locale={locale} />
              <div className="mt-3">
                <EstatePrintButton label={locale === "ru" ? "Печать / PDF" : "Print / PDF"} slug={estate.slug} />
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {/* Интерактив: план + участки + галерея + карта + заявка */}
      <EstateExplorer estate={estate} locale={locale} initialLot={initialLot} />

      {/* Калькулятор окупаемости — только если есть freehold-участки с ценой */}
      {priceFrom != null ? (
        <section id="returns" className="mt-16 scroll-mt-32 border-t border-forest-500/10 pt-12 md:mt-20">
          <SectionEyebrow>{t.returns.eyebrow}</SectionEyebrow>
          <h2 className="mt-2 font-serif text-3xl text-forest-900">{t.returns.title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-forest-500/85">{t.returns.intro}</p>
          <div className="mt-8">
            <RoiCalculator
              initialPriceThb={priceFrom}
              projectUnits={calcPlots.length > 0 ? calcPlots : undefined}
            />
          </div>
        </section>
      ) : null}

      {/* Other collections */}
      {others.length > 0 ? (
        <section className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20">
          <h2 className="font-serif text-2xl text-forest-900">{t.otherEstates}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((e, i) => (
              <Appear key={e.slug} delay={(i % 3) * 0.08} className="h-full">
                <EstateCard
                  estate={e}
                  href={localePath(locale, `/estates/${e.slug}`)}
                  locale={locale}
                />
              </Appear>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

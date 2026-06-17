import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ChevronRight, Check, ShieldCheck, MapPin, Layers, ArrowRight } from "lucide-react";
import type { LandEstate } from "@/content/land-estates";
import { estateStats, estatePhotoPlots, getPublishedEstates } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { EstatePlotsTable } from "./estate-plots-table";
import { EstateInquiry } from "./estate-inquiry";
import { EstateCard } from "./estate-card";
import { PlotStatusBadge } from "./plot-status-badge";
import { Appear } from "@/components/motion/appear";

interface Props {
  estate: LandEstate;
  locale: Locale;
}

/** Лендинг одной подборки участков (аналог project-landing для земли). */
export function LandEstateLanding({ estate, locale }: Props) {
  const t = getEstatesDict(locale);
  const s = estateStats(estate);
  const photoPlots = estatePhotoPlots(estate);
  const hasLocation = Boolean(estate.lat && estate.lng) || Boolean(estate.locationUrl);

  const homeHref = localePath(locale, "/") as Route;
  const estatesHref = localePath(locale, "/estates") as Route;

  const others = getPublishedEstates()
    .filter((e) => e.slug !== estate.slug)
    .slice(0, 3);

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
      <header className="relative isolate overflow-hidden rounded-sm bg-forest-900">
        {estate.cover ? (
          <Image
            src={estate.cover}
            alt={estate.name[locale]}
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-t from-forest-900/95 via-forest-900/70 to-forest-900/45"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[36vh] flex-col justify-end p-7 md:min-h-[42vh] md:p-12">
          <div className="flex flex-wrap items-center gap-2 text-xs text-cream-100/80">
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
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-brass-300">
            {t.eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-balance text-cream-50">{estate.name[locale]}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-cream-100/85">
            {estate.tagline[locale]}
          </p>
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div className="min-w-0 space-y-16">
          {/* Overview */}
          <section id="overview" className="scroll-mt-32">
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.overview}</h2>
            <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-forest-500/85">
              {estate.description[locale].map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* DD-наследование */}
            <div className="mt-6 flex items-start gap-3 rounded-sm border border-brass-500/20 bg-brass-500/5 p-4">
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
          </section>

          {/* Plots & availability */}
          <section id="plots" className="scroll-mt-32">
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.plotsTitle}</h2>
            <p className="mt-2 text-sm text-forest-500/70">{t.sections.plotsLede}</p>
            <div className="mt-6">
              <EstatePlotsTable estate={estate} locale={locale} />
            </div>

            <Link
              href={localePath(locale, `/listings?district=${encodeURIComponent(estate.district)}`) as Route}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brass-500 transition-colors hover:text-brass-600"
            >
              {t.seeDistrict}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          {/* Gallery — фото с участков, сгруппированы по лоту */}
          {photoPlots.length > 0 ? (
            <section id="gallery" className="scroll-mt-32">
              <h2 className="font-serif text-3xl text-forest-900">{t.sections.gallery}</h2>
              <div className="mt-6 space-y-8">
                {photoPlots.map((plot) => (
                  <div key={plot.code}>
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="text-sm font-medium text-forest-900">{plot.code}</span>
                      <PlotStatusBadge status={plot.status} locale={locale} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {plot.photos!.map((src, i) => (
                        <div
                          key={src}
                          className="relative aspect-[4/3] overflow-hidden rounded-sm bg-forest-900/5"
                        >
                          <Image
                            src={src}
                            alt={`${estate.name[locale]} — ${plot.code} (${i + 1})`}
                            fill
                            unoptimized
                            sizes="(min-width: 640px) 33vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Location */}
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

        {/* Sticky inquiry */}
        <EstateInquiry slug={estate.slug} name={estate.name[locale]} />
      </div>

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

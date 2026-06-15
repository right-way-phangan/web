import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { MapPin, ShieldCheck } from "lucide-react";
import { DISTRICTS } from "@/content/districts";
import { getObjectByRwNumber, getAnyObjectByRwNumber, getPublicObjects, slimObjectForCard, nearbyListings } from "@/lib/data/objects";
import { UnavailableObject } from "@/components/objects/unavailable-object";
import { isProjectUnit, parentProjectRw, projectSlug, getPublicProjects } from "@/lib/data/projects";
import { formatPriceTHB, formatPricePerRai, formatApproxUSD } from "@/lib/utils/price";
import { getUsdPerThb } from "@/lib/data/fx";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { Breadcrumbs } from "@/components/objects/breadcrumbs";
import { BuyingCosts } from "@/components/objects/buying-costs";
import { ObjectFaq } from "@/components/objects/object-faq";
import { MobileCtaBar } from "@/components/objects/mobile-cta-bar";
import { ObjectGallery } from "@/components/objects/object-gallery";
import { SpecTable } from "@/components/objects/spec-table";
import { InvestmentHighlights } from "@/components/objects/investment-highlights";
import { InquiryForm } from "@/components/objects/inquiry-form";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { DistanceChips } from "@/components/objects/distance-chips";
import { RelatedListings } from "@/components/objects/related-listings";
import { RecentlyViewed } from "@/components/objects/recently-viewed";
import { TrackView } from "@/components/objects/track-view";
import { PriceContextBadge } from "@/components/objects/price-context-badge";
import { SaveButton } from "@/components/objects/save-button";
import { ShareButton } from "@/components/objects/share-button";
import { BrochureButton } from "@/components/objects/brochure-button";
import { PrintBrochure } from "@/components/objects/print-brochure";
import { ObjectJsonLd } from "@/components/objects/object-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { getObjectDict, getListingsDict } from "@/lib/i18n/dictionaries";
import { cleanMetaDescription } from "@/lib/utils/meta";

interface Props {
  params: Promise<{ rw: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) {
    // Снятый с продажи объект живёт (noindex); несуществующий номер — честный
    // 404: notFound() здесь, до начала стриминга (иначе loading.tsx фиксирует 200).
    const gone = await getAnyObjectByRwNumber(rw);
    if (!gone) notFound();
    return {
      title: `${gone.titleEn} — ${gone.rwNumber}`,
      robots: { index: false },
    };
  }
  const ogTitle = `${object.titleEn} — ${object.rwNumber}`;
  const description =
    cleanMetaDescription(object.descriptionRaw) ??
    `${object.type} на Ко Пангане — объект Right Way ${object.rwNumber}.`;
  return {
    title: ogTitle,
    description,
    alternates: {
      canonical: `/ru/object/${object.rwNumber}`,
      languages: { en: `/object/${object.rwNumber}`, ru: `/ru/object/${object.rwNumber}`, "x-default": `/object/${object.rwNumber}` },
    },
    // og:title/og:description иначе наследуются generic из layout (см. EN-версию).
    openGraph: {
      title: ogTitle,
      description,
      url: `/ru/object/${object.rwNumber}`,
    },
    twitter: {
      title: ogTitle,
      description,
    },
  };
}

export default async function RussianObjectPage({ params }: Props) {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) {
    const gone = await getAnyObjectByRwNumber(rw);
    if (!gone) notFound();
    const catalog = (await getPublicObjects()).map(slimObjectForCard);
    return <UnavailableObject object={gone} catalog={catalog} locale="ru" />;
  }

  // Карточные поля: полный каталог (галереи, описания, RU-заметки) иначе
  // сериализуется в payload каждой страницы объекта через похожие/калькулятор.
  const catalog = (await getPublicObjects()).map(slimObjectForCard);
  const nearby = nearbyListings(catalog, object);
  const usdPerThb = await getUsdPerThb();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/ru/object/${object.rwNumber}`;
  const t = getObjectDict("ru");
  const typeName = getListingsDict("ru").types[object.type];

  // Юнит проекта (RW-P####-N) ведёт назад к проекту, а не к списку объектов
  // (юниты исключены из списка). Если проект ещё не опубликован — на /projects.
  let trailHref = "/ru/listings";
  let trailLabel = "Объекты";
  if (isProjectUnit(object.rwNumber)) {
    const projects = await getPublicProjects();
    const parent = projects.find((p) => p.rwNumber === parentProjectRw(object.rwNumber));
    if (parent) {
      trailHref = `/ru/projects/${projectSlug(parent, projects)}`;
      trailLabel = parent.titleEn;
    } else {
      trailHref = "/ru/projects";
      trailLabel = "Проекты";
    }
  }

  const mobilePriceLabel = object.priceThb
    ? formatPriceTHB(object.priceThb)
    : object.pricePerRai
      ? formatPricePerRai(object.pricePerRai)
      : object.rentPerRaiMonth
        ? `${formatPriceTHB(object.rentPerRaiMonth)} /рай/мес`
        : undefined;

  return (
    <>
      <ObjectJsonLd object={object} url={pageUrl} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Главная", url: `${siteUrl}/ru` },
          { name: "Объекты", url: `${siteUrl}/ru/listings` },
          { name: object.rwNumber, url: pageUrl },
        ]}
      />

      <article className="container-prose py-8 pb-24 md:py-12 lg:pb-12">
        <Breadcrumbs
          trailHref={trailHref}
          trailLabel={trailLabel}
          current={object.rwNumber}
        />

        <div className="print:hidden">
          <ObjectGallery
            rwNumber={object.rwNumber}
            type={object.type}
            gallery={object.gallery}
            title={object.titleEn}
          />
        </div>
        <PrintBrochure object={object} />

        <header className="mt-8 md:mt-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
                {object.rwNumber} · {typeName}
              </p>
              <Link
                href={"/due-diligence" as Route}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500/80 transition-colors hover:text-brass-500"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-brass-500" />
                {t.verifiedBadge}
              </Link>
            </div>
            <div className="flex shrink-0 items-center gap-2 print:hidden">
              <BrochureButton rw={object.rwNumber} />
              <ShareButton rw={object.rwNumber} title={object.titleEn} />
              <SaveButton rw={object.rwNumber} variant="inline" />
            </div>
          </div>
          <h1 className="mt-3 max-w-3xl text-balance">{object.titleEn}</h1>

          {object.priceThb ? (
            <>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="num text-3xl text-forest-900 md:text-4xl">
                  {formatPriceTHB(object.priceThb)}
                </span>
                <span className="num text-sm text-forest-500/60">
                  {formatApproxUSD(object.priceThb, usdPerThb)}
                </span>
                {object.type === "Land" && object.pricePerRai ? (
                  <span className="text-sm text-forest-500/70">
                    {formatPricePerRai(object.pricePerRai)}
                  </span>
                ) : null}
              </div>
              <PriceContextBadge object={object} catalog={catalog} />
            </>
          ) : object.pricePerRai ? (
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="num text-3xl text-forest-900 md:text-4xl">
                {formatPricePerRai(object.pricePerRai)}
              </span>
            </div>
          ) : object.rentPerRaiMonth ? (
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="num text-3xl text-forest-900 md:text-4xl">
                {formatPriceTHB(object.rentPerRaiMonth)}
              </span>
              <span className="text-sm text-forest-500/70">{t.perRaiMonth}</span>
            </div>
          ) : (
            <p className="mt-4 text-lg italic text-forest-500/70">{t.priceOnRequest}</p>
          )}

          {object.district ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-forest-500/70">
              <MapPin className="h-4 w-4" />
              <span>{object.district}</span>
              <span aria-hidden>·</span>
              <span>{t.locationCountry}</span>
              {(() => {
                const guide = DISTRICTS.find((d) => d.amoName === object.district);
                return guide ? (
                  <>
                    <span aria-hidden>·</span>
                    <Link
                      href={`/ru/districts/${guide.slug}` as Route}
                      className="text-forest-500 underline-offset-4 hover:underline"
                    >
                      {t.districtGuide}
                    </Link>
                  </>
                ) : null;
              })()}
              {object.locationUrl ? (
                <>
                  <span aria-hidden>·</span>
                  <a
                    href={object.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest-500 underline-offset-4 hover:underline"
                  >
                    {t.openInMaps}
                  </a>
                </>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="space-y-16">
            {object.descriptionRaw ? (
              <section>
                <h2 className="font-serif text-3xl text-forest-900">{t.aboutProperty}</h2>
                <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-forest-500/85 whitespace-pre-line">
                  {object.descriptionRaw}
                </div>
              </section>
            ) : null}

            <InvestmentHighlights object={object} />

            <section>
              <h2 className="font-serif text-3xl text-forest-900">{t.specifications}</h2>
              <div className="mt-8">
                <SpecTable object={object} />
              </div>
            </section>

            <BuyingCosts object={object} locale="ru" />

            <ObjectFaq type={object.type} locale="ru" />

            <ObjectLocationMap
              lat={object.lat}
              lng={object.lng}
              district={object.district}
              mapsUrl={object.locationUrl}
              plotPolygon={object.plotPolygon}
              showSunset={object.seaView || object.beachfront}
              nearby={nearby}
              chips={<DistanceChips lat={object.lat} lng={object.lng} locale="ru" />}
            />

            {object.buildingRules ? (
              <section>
                <h2 className="font-serif text-3xl text-forest-900">{t.buildingRules}</h2>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/85 whitespace-pre-line">
                  {object.buildingRules}
                </p>
              </section>
            ) : null}
          </div>

          <InquiryForm rwNumber={object.rwNumber} />
        </div>

        {object.priceThb ? (
          <section className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20 md:pt-16 print:hidden">
            <h2 className="font-serif text-3xl text-forest-900">{t.investmentOutlook}</h2>
            <p className="mt-3 max-w-2xl text-base text-forest-500/70">{t.investmentOutlookLede}</p>
            <div className="mt-8">
              <RoiCalculator
                initialPriceThb={object.priceThb}
                initialTenure={
                  object.tenure?.includes("Leasehold") && !object.tenure?.includes("Freehold")
                    ? "leasehold"
                    : "freehold"
                }
                initialLeaseTermYears={object.leaseTermYears}
                initialOffplan={object.type === "Project" ? true : undefined}
                catalog={catalog}
                excludeRw={object.rwNumber}
              />
            </div>
          </section>
        ) : null}

        <RelatedListings current={object} catalog={catalog} />
        <RecentlyViewed catalog={catalog} excludeRw={object.rwNumber} />
      </article>
      <MobileCtaBar rwNumber={object.rwNumber} priceLabel={mobilePriceLabel} />
      <TrackView rw={object.rwNumber} />
    </>
  );
}

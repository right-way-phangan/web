import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { MapPin } from "lucide-react";
import { DISTRICTS } from "@/content/districts";
import { getObjectByRwNumber, getAnyObjectByRwNumber, getPublicObjects, slimObjectForCard, nearbyListings } from "@/lib/data/objects";
import { UnavailableObject } from "@/components/objects/unavailable-object";
import { isProjectUnit, parentProjectRw, projectSlug, getPublicProjects } from "@/lib/data/projects";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { Breadcrumbs } from "@/components/objects/breadcrumbs";
import { BuyingCosts } from "@/components/objects/buying-costs";
import { ObjectFaq } from "@/components/objects/object-faq";
import { MobileCtaBar } from "@/components/objects/mobile-cta-bar";
import { ObjectGallery } from "@/components/objects/object-gallery";
import { VettedBadge } from "@/components/objects/vetted-badge";
import { SpecTable } from "@/components/objects/spec-table";
import { BuildingRules } from "@/components/objects/building-rules";
import { InvestmentHighlights } from "@/components/objects/investment-highlights";
import { InquiryForm } from "@/components/objects/inquiry-form";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { DistanceChips } from "@/components/objects/distance-chips";
import { RelatedListings } from "@/components/objects/related-listings";
import { RecentlyViewed } from "@/components/objects/recently-viewed";
import { TrackView } from "@/components/objects/track-view";
import { BehaviorTracker } from "@/components/objects/behavior-tracker";
import { PriceContextBadge } from "@/components/objects/price-context-badge";
import { ObjectPrice } from "@/components/objects/object-price";
import { LeaseTermBadge, LeaseholdStructure } from "@/components/objects/leasehold-explainer";
import { SaveButton } from "@/components/objects/save-button";
import { ShareButton } from "@/components/objects/share-button";
import { BrochureButton } from "@/components/objects/brochure-button";
import { PrintBrochure } from "@/components/objects/print-brochure";
import { ObjectDescription } from "@/components/objects/object-description";
import { objectDescriptionText } from "@/lib/generate/object-description";
import { ObjectJsonLd } from "@/components/objects/object-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { Appear } from "@/components/motion/appear";
import { getSiteUrl } from "@/lib/site-url";
import { cleanMetaDescription } from "@/lib/utils/meta";

interface Props {
  params: Promise<{ rw: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) {
    // Off-market listing keeps a live (noindex) page; an RW number that never
    // existed must 404 — thrown here, before streaming starts, so the HTTP
    // status is a real 404 (the route's loading.tsx otherwise locks in a 200).
    const gone = await getAnyObjectByRwNumber(rw);
    if (!gone) notFound();
    return {
      title: `${gone.titleEn} — ${gone.rwNumber}`,
      robots: { index: false },
    };
  }
  const districtSuffix = object.district ? ` in ${object.district}` : "";
  const ogTitle = `${object.titleEn} — ${object.rwNumber}`;
  // Авто-описание первично (legacy amoCRM-заметки в descriptionRaw в архиве —
  // решение 2026-06-17). Generic-строка — только если генератор вернул пусто.
  const description =
    cleanMetaDescription(objectDescriptionText(object, "en")) ??
    `${object.type} on Koh Phangan${districtSuffix} — Right Way listing ${object.rwNumber}.`;
  return {
    title: ogTitle,
    description,
    alternates: {
      canonical: `/object/${object.rwNumber}`,
      languages: {
        en: `/object/${object.rwNumber}`,
        ru: `/ru/object/${object.rwNumber}`,
        "x-default": `/object/${object.rwNumber}`,
      },
    },
    // Без этого og:title/og:description наследуются generic из layout — при
    // шеринге листинга в TG/FB/WhatsApp превью показывало общий заголовок сайта,
    // а не конкретный объект. og:image подхватывается из opengraph-image.tsx сам.
    openGraph: {
      title: ogTitle,
      description,
      url: `/object/${object.rwNumber}`,
    },
    twitter: {
      title: ogTitle,
      description,
    },
  };
}

export default async function ObjectPage({ params }: Props) {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) {
    const gone = await getAnyObjectByRwNumber(rw);
    if (!gone) notFound();
    const catalog = (await getPublicObjects()).map(slimObjectForCard);
    return <UnavailableObject object={gone} catalog={catalog} locale="en" />;
  }

  // A parent developer project (RW-P####) has a far richer landing at
  // /projects/[slug]; its card now shows in the listings grid and shared
  // /object links should resolve there too. Units (RW-P####-N) fall through.
  if (object.type === "Project" && !isProjectUnit(object.rwNumber)) {
    const projects = await getPublicProjects();
    redirect(`/projects/${projectSlug(object, projects)}`);
  }

  // Карточные поля: полный каталог (галереи, описания, RU-заметки) иначе
  // сериализуется в payload каждой страницы объекта через похожие/калькулятор.
  const catalog = (await getPublicObjects()).map(slimObjectForCard);
  const nearby = nearbyListings(catalog, object);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/object/${object.rwNumber}`;

  // Unit cards (RW-P####-N) trail back to their project, not the listings grid
  // (units are excluded from listings). If the parent project isn't published
  // yet, fall back to the projects index rather than a listings dead-end.
  let trailHref = "/listings";
  let trailLabel = "Listings";
  if (isProjectUnit(object.rwNumber)) {
    const projects = await getPublicProjects();
    const parent = projects.find((p) => p.rwNumber === parentProjectRw(object.rwNumber));
    if (parent) {
      trailHref = `/projects/${projectSlug(parent, projects)}`;
      trailLabel = parent.titleEn;
    } else {
      trailHref = "/projects";
      trailLabel = "Projects";
    }
  }

  return (
    <>
      <ObjectJsonLd object={object} url={pageUrl} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", url: `${siteUrl}/` },
          { name: "Listings", url: `${siteUrl}/listings` },
          { name: object.rwNumber, url: pageUrl },
        ]}
      />

      <article className="container-prose py-8 pb-24 md:py-12 lg:pb-12">
        <Breadcrumbs
          trailHref={trailHref}
          trailLabel={trailLabel}
          current={object.rwNumber}
        />

        {/* Gallery (interactive — replaced by a static photo sheet in print) */}
        <div className="print:hidden">
          <ObjectGallery
            rwNumber={object.rwNumber}
            type={object.type}
            gallery={object.gallery}
            title={object.titleEn}
          />
        </div>
        <PrintBrochure object={object} />

        {/* Header */}
        <header className="mt-8 md:mt-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
                {object.rwNumber} · {object.type}
              </p>
              <VettedBadge ddStatus={object.ddStatus} ddDate={object.ddDate} />
              <LeaseTermBadge object={object} locale="en" />
            </div>
            <div className="flex shrink-0 items-center gap-2 print:hidden">
              <BrochureButton rw={object.rwNumber} />
              <ShareButton rw={object.rwNumber} title={object.titleEn} />
              <SaveButton rw={object.rwNumber} variant="inline" />
            </div>
          </div>
          <h1 className="mt-3 text-balance text-[clamp(1.85rem,3.4vw,3rem)] leading-[1.1]">
            {object.titleEn}
          </h1>

          <ObjectPrice
            priceThb={object.priceThb}
            pricePerRai={object.pricePerRai}
            rentPerMonth={object.rentPerMonth}
            rentPerRaiMonth={object.rentPerRaiMonth}
            leaseTermYears={object.leaseTermYears}
            leaseEscPercent={object.leaseEscPercent}
            leaseEscPeriodYears={object.leaseEscPeriodYears}
            isLand={object.type === "Land"}
          />
          {object.priceThb ? <PriceContextBadge object={object} catalog={catalog} /> : null}
          {object.priceThb ? (
            <a
              href="#roi"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brass-600 underline-offset-2 transition-colors hover:text-brass-700 hover:underline"
            >
              See ROI projection →
            </a>
          ) : null}

          {object.district ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-forest-500/70">
              <MapPin className="h-4 w-4" />
              <span>{object.district}</span>
              <span aria-hidden>·</span>
              <span>Koh Phangan, Thailand</span>
              {(() => {
                const guide = DISTRICTS.find((d) => d.amoName === object.district);
                return guide ? (
                  <>
                    <span aria-hidden>·</span>
                    <Link
                      href={`/districts/${guide.slug}` as Route}
                      className="text-forest-500 underline-offset-4 hover:underline"
                    >
                      District guide
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
                    Open in Maps
                  </a>
                </>
              ) : null}
            </div>
          ) : null}
        </header>

        {/* Main 2-column grid */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          {/* Left: content */}
          <div className="space-y-16">
            <Appear>
              <ObjectDescription object={object} locale="en" />
            </Appear>

            <Appear>
              <InvestmentHighlights object={object} />
            </Appear>

            <LeaseholdStructure object={object} locale="en" />

            <Appear>
              <section>
                <h2 className="font-serif text-3xl text-forest-900">
                  Specifications
                </h2>
                <div className="mt-8">
                  <SpecTable object={object} />
                </div>
              </section>
            </Appear>

            <Appear>
              <BuyingCosts object={object} locale="en" />
            </Appear>

            <Appear>
              <ObjectFaq type={object.type} locale="en" object={object} />
            </Appear>

            <ObjectLocationMap
              lat={object.lat}
              lng={object.lng}
              district={object.district}
              mapsUrl={object.locationUrl}
              plotPolygon={object.plotPolygon}
              showSunset={object.seaView || object.beachfront}
              nearby={nearby}
              chips={<DistanceChips lat={object.lat} lng={object.lng} locale="en" />}
            />

            <BuildingRules object={object} locale="en" />
          </div>

          {/* Right: sticky inquiry form on desktop, below content on mobile */}
          <InquiryForm rwNumber={object.rwNumber} />
        </div>

        {object.priceThb ? (
          <section id="roi" className="scroll-mt-24 mt-16 border-t border-forest-500/10 pt-12 md:mt-20 md:pt-16 print:hidden">
            <h2 className="font-serif text-3xl text-forest-900">Investment outlook</h2>
            <p className="mt-3 max-w-2xl text-base text-forest-500/70">
              Project this property&apos;s value over time. Set your own growth
              outlook — every figure is illustrative.
            </p>
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
                // Homes (villa/house/apartment/townhouse/project) lead with a
                // rental model; land stays buy-&-hold.
                initialRent={["Villa", "House", "Apartment", "Townhouse", "Project"].includes(object.type)}
                catalog={catalog}
                excludeRw={object.rwNumber}
              />
            </div>
          </section>
        ) : null}

        <Appear>
          <RelatedListings current={object} catalog={catalog} />
        </Appear>
        <Appear>
          <RecentlyViewed catalog={catalog} excludeRw={object.rwNumber} />
        </Appear>
      </article>
      <MobileCtaBar
        rwNumber={object.rwNumber}
        priceThb={object.priceThb}
        pricePerRai={object.pricePerRai}
        rentPerMonth={object.rentPerMonth}
        rentPerRaiMonth={object.rentPerRaiMonth}
      />
      <TrackView rw={object.rwNumber} />
      <BehaviorTracker rw={object.rwNumber} />
    </>
  );
}

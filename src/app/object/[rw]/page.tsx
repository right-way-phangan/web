import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { MapPin } from "lucide-react";
import { DISTRICTS } from "@/content/districts";
import { getObjectByRwNumber, getPublicObjects } from "@/lib/data/objects";
import { isProjectUnit, parentProjectRw, projectSlug, getPublicProjects } from "@/lib/data/projects";
import { formatPriceTHB, formatPricePerRai } from "@/lib/utils/price";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { Breadcrumbs } from "@/components/objects/breadcrumbs";
import { BuyingCosts } from "@/components/objects/buying-costs";
import { ObjectFaq } from "@/components/objects/object-faq";
import { MobileCtaBar } from "@/components/objects/mobile-cta-bar";
import { ObjectGallery } from "@/components/objects/object-gallery";
import { VettedBadge } from "@/components/objects/vetted-badge";
import { SpecTable } from "@/components/objects/spec-table";
import { InvestmentHighlights } from "@/components/objects/investment-highlights";
import { InquiryForm } from "@/components/objects/inquiry-form";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { RelatedListings } from "@/components/objects/related-listings";
import { RecentlyViewed } from "@/components/objects/recently-viewed";
import { TrackView } from "@/components/objects/track-view";
import { PriceContextBadge } from "@/components/objects/price-context-badge";
import { SaveButton } from "@/components/objects/save-button";
import { ShareButton } from "@/components/objects/share-button";
import { ObjectJsonLd } from "@/components/objects/object-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ rw: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) return { title: `${rw} not found` };
  const districtSuffix = object.district ? ` in ${object.district}` : "";
  return {
    title: `${object.titleEn} — ${object.rwNumber}`,
    description:
      object.descriptionRaw?.slice(0, 160) ??
      `${object.type} on Koh Phangan${districtSuffix} — Right Way listing ${object.rwNumber}.`,
    alternates: {
      canonical: `/object/${object.rwNumber}`,
      languages: {
        en: `/object/${object.rwNumber}`,
        ru: `/ru/object/${object.rwNumber}`,
      },
    },
  };
}

export default async function ObjectPage({ params }: Props) {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) notFound();

  const catalog = await getPublicObjects();
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

  const mobilePriceLabel = object.priceThb
    ? formatPriceTHB(object.priceThb)
    : object.pricePerRai
      ? formatPricePerRai(object.pricePerRai)
      : object.rentPerRaiMonth
        ? `${formatPriceTHB(object.rentPerRaiMonth)} /rai/mo`
        : undefined;

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

        {/* Gallery */}
        <ObjectGallery
          rwNumber={object.rwNumber}
          type={object.type}
          gallery={object.gallery}
          title={object.titleEn}
        />

        {/* Header */}
        <header className="mt-8 md:mt-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
                {object.rwNumber} · {object.type}
              </p>
              <VettedBadge ddStatus={object.ddStatus} ddDate={object.ddDate} />
            </div>
            <div className="flex shrink-0 items-center gap-2">
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
              <span className="text-sm text-forest-500/70">/ rai / month</span>
            </div>
          ) : (
            <p className="mt-4 text-lg italic text-forest-500/70">
              Price on request
            </p>
          )}

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
            {object.descriptionRaw ? (
              <section>
                <h2 className="font-serif text-3xl text-forest-900">
                  About this property
                </h2>
                <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-forest-500/85 whitespace-pre-line">
                  {object.descriptionRaw}
                </div>
              </section>
            ) : null}

            <InvestmentHighlights object={object} />

            <section>
              <h2 className="font-serif text-3xl text-forest-900">
                Specifications
              </h2>
              <div className="mt-8">
                <SpecTable object={object} />
              </div>
            </section>

            <BuyingCosts object={object} locale="en" />

            <ObjectFaq type={object.type} locale="en" />

            <ObjectLocationMap
              lat={object.lat}
              lng={object.lng}
              district={object.district}
              mapsUrl={object.locationUrl}
            />

            {object.buildingRules ? (
              <section>
                <h2 className="font-serif text-3xl text-forest-900">
                  Building rules
                </h2>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/85 whitespace-pre-line">
                  {object.buildingRules}
                </p>
              </section>
            ) : null}
          </div>

          {/* Right: sticky inquiry form on desktop, below content on mobile */}
          <InquiryForm rwNumber={object.rwNumber} />
        </div>

        {object.priceThb ? (
          <section className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20 md:pt-16">
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

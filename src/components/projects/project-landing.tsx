import Link from "next/link";
import type { Route } from "next";
import { ChevronRight, Check } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict, getObjectDict } from "@/lib/i18n/dictionaries";
import {
  getProjectUnits,
  projectAvailability,
  developerHasPage,
  developerSlug,
  projectSlug,
  getPublicProjects,
} from "@/lib/data/projects";
import { getAllObjects } from "@/lib/data/objects";
import { formatPriceTHB } from "@/lib/utils/price";
import { localePath } from "@/lib/i18n/locale-path";
import { ObjectGallery } from "@/components/objects/object-gallery";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { InquiryForm } from "@/components/objects/inquiry-form";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { ProjectHero } from "./project-hero";
import { ProjectNav, type NavItem } from "./project-nav";
import { ProjectActionBar } from "./project-action-bar";
import { BackToTop } from "./back-to-top";
import { ProjectCard } from "./project-card";
import { UnitsTable } from "./units-table";
import { ProjectVideos } from "./project-videos";
import { Floorplans } from "./floorplans";
import { PriceStages } from "./price-stages";
import { ProjectTimeline } from "./project-timeline";
import { ProjectTeam } from "./project-team";

interface Props {
  project: RealEstateObject;
  catalog: RealEstateObject[];
  locale: Locale;
}

/** Amenity labels derived from the object's boolean feature flags. */
function amenityLabels(o: RealEstateObject, t: ReturnType<typeof getObjectDict>): string[] {
  const flags: Array<[boolean | undefined, string]> = [
    [o.pool, "Private pool"],
    [o.privateGarden, "Private garden"],
    [o.parking, "Parking"],
    [o.gated, "Gated"],
    [o.beachfront, "Beachfront"],
    [o.seaView, "Sea view"],
    [o.mountainView, "Mountain view"],
    [o.jungleView, "Jungle view"],
    [o.quiet, "Quiet location"],
  ];
  return flags.filter(([v]) => v).map(([, l]) => t.features[l] ?? l);
}

export async function ProjectLanding({ project, catalog, locale }: Props) {
  const t = getProjectsDict(locale);
  const ot = getObjectDict(locale);
  const allObjects = await getAllObjects();
  const units = getProjectUnits(project, allObjects);
  const availability = projectAvailability(project, units);
  const amenities = amenityLabels(project, ot);
  const devHref =
    project.developer && (await developerHasPage(project.developer))
      ? localePath(locale, `/developers/${developerSlug(project.developer)}`)
      : undefined;

  // Other projects for the cross-link block at the bottom.
  const allProjects = await getPublicProjects();
  const otherProjects = allProjects.filter((p) => p.rwNumber !== project.rwNumber).slice(0, 3);

  const availNote =
    availability.total != null
      ? `${availability.available ?? 0}/${availability.total} ${t.availableLabel.toLowerCase()}`
      : undefined;

  const hasGallery = (project.gallery?.length ?? 0) > 0;
  const hasPlans = (project.floorplanUrls?.length ?? 0) > 0;
  const hasVideo = (project.videoUrls?.length ?? 0) > 0;
  const hasUnits = availability.total != null || units.length > 0;
  const hasStages = (project.priceStages?.length ?? 0) > 0;
  const hasPricing = Boolean(
    project.priceThb || project.paymentTerms || project.leasePrepayment || project.leaseTermYears,
  ) || hasStages;
  const hasReturns = Boolean(project.priceThb);
  const hasTimeline = (project.timeline?.length ?? 0) > 0;
  const hasTeam = (project.team?.length ?? 0) > 0;
  const hasLocation = Boolean(project.lat && project.lng) || Boolean(project.locationUrl);

  // Build section nav from the sections that actually render.
  const nav: NavItem[] = [
    { id: "overview", label: t.nav.overview },
    ...(hasGallery ? [{ id: "gallery", label: t.nav.gallery }] : []),
    ...(hasPlans ? [{ id: "plans", label: t.nav.plans }] : []),
    ...(hasVideo ? [{ id: "video", label: t.nav.video }] : []),
    ...(hasUnits ? [{ id: "units", label: t.nav.units }] : []),
    ...(hasPricing ? [{ id: "pricing", label: t.nav.pricing }] : []),
    ...(hasReturns ? [{ id: "returns", label: t.nav.returns }] : []),
    ...(hasTimeline ? [{ id: "timeline", label: t.nav.timeline }] : []),
    ...(hasTeam ? [{ id: "team", label: t.nav.team }] : []),
    ...(hasLocation ? [{ id: "location", label: t.nav.location }] : []),
  ];

  const projectsHref = localePath(locale, "/projects") as Route;
  const homeHref = localePath(locale, "/") as Route;
  const projectsCrumb = locale === "ru" ? "Проекты" : "Projects";

  return (
    <article className="container-prose py-8 md:py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-forest-500/60"
      >
        <Link href={homeHref} className="transition-colors hover:text-brass-500">
          {t.home}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={projectsHref} className="transition-colors hover:text-brass-500">
          {projectsCrumb}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="truncate text-forest-900">{project.titleEn}</span>
      </nav>

      <ProjectHero
        project={project}
        availability={availability}
        locale={locale}
        developerHref={devHref}
      />

      <div className="mt-10">
        <ProjectNav items={nav} ctaLabel={t.nav.enquire} availabilityNote={availNote} />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div className="min-w-0 space-y-16">
          {/* Overview */}
          <section id="overview" className="scroll-mt-32">
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.overview}</h2>
            {project.descriptionRaw ? (
              <div className="mt-6 max-w-prose space-y-4 whitespace-pre-line text-base leading-relaxed text-forest-500/85">
                {project.descriptionRaw}
              </div>
            ) : null}

            {project.areaNote ? (
              <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-5">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                  {locale === "ru" ? "Площади" : "Areas"}
                </h3>
                <p className="text-sm leading-relaxed text-forest-500/85">{project.areaNote}</p>
              </div>
            ) : null}

            {amenities.length > 0 ? (
              <div className="mt-8">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                  {t.sections.amenities}
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm text-forest-500/85">
                      <Check className="h-4 w-4 shrink-0 text-brass-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {/* Gallery */}
          {hasGallery ? (
            <section id="gallery" className="scroll-mt-32">
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.gallery}</h2>
              <ObjectGallery rwNumber={project.rwNumber} type={project.type} gallery={project.gallery} />
            </section>
          ) : null}

          {/* Floor plans & masterplan */}
          {hasPlans ? (
            <section id="plans" className="scroll-mt-32">
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.plans}</h2>
              <Floorplans urls={project.floorplanUrls!} />
            </section>
          ) : null}

          {/* Video & tour */}
          {hasVideo ? (
            <section id="video" className="scroll-mt-32">
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.video}</h2>
              <ProjectVideos urls={project.videoUrls!} watchLabel={t.watchVideo} />
            </section>
          ) : null}

          {/* Units & availability */}
          {hasUnits ? (
            <section id="units" className="scroll-mt-32">
              <h2 className="font-serif text-3xl text-forest-900">{t.sections.units}</h2>
              <p className="mt-2 text-sm text-forest-500/70">{t.sections.unitsLede}</p>
              <div className="mt-6">
                <UnitsTable units={units} availability={availability} />
              </div>
            </section>
          ) : null}

          {/* Pricing & payment */}
          {hasPricing ? (
            <section id="pricing" className="scroll-mt-32">
              <h2 className="font-serif text-3xl text-forest-900">{t.sections.pricing}</h2>
              {hasStages ? (
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                    {t.sections.priceStages}
                  </h3>
                  <PriceStages stages={project.priceStages!} />
                </div>
              ) : null}
              <dl className="mt-6 divide-y divide-forest-500/10 border-y border-forest-500/10">
                {project.priceThb ? (
                  <Row label={t.from} value={formatPriceTHB(project.priceThb)} />
                ) : null}
                {project.tenure && project.tenure.length > 0 ? (
                  <Row label={t.sections.tenure} value={project.tenure.join(", ")} />
                ) : null}
                {project.leaseTermYears ? (
                  <Row label={t.sections.leaseTerm} value={ot.years(project.leaseTermYears)} />
                ) : null}
                {project.leasePrepayment ? (
                  <Row label={t.sections.leasePrepayment} value={formatPriceTHB(project.leasePrepayment)} />
                ) : null}
                {project.furnishing ? (
                  <Row label={locale === "ru" ? "Меблировка" : "Furnishing"} value={project.furnishing} />
                ) : null}
              </dl>
              {project.paymentTerms ? (
                <div className="mt-6">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                    {t.sections.paymentTerms}
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-forest-500/85">
                    {project.paymentTerms}
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Projected returns */}
          {hasReturns ? (
            <section id="returns" className="scroll-mt-32">
              <h2 className="font-serif text-3xl text-forest-900">{t.sections.returns}</h2>
              <p className="mt-2 max-w-2xl text-sm text-forest-500/70">{t.sections.returnsLede}</p>
              {project.netYieldPct || project.estNetIncomeYear ? (
                <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                  {project.netYieldPct ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.15em] text-forest-500/55">
                        {t.sections.netYield}
                      </dt>
                      <dd className="num mt-1 text-2xl text-forest-900">~{project.netYieldPct}%</dd>
                    </div>
                  ) : null}
                  {project.estNetIncomeYear ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.15em] text-forest-500/55">
                        {t.sections.estIncome}
                      </dt>
                      <dd className="num mt-1 text-2xl text-forest-900">
                        {formatPriceTHB(project.estNetIncomeYear)}
                        <span className="ml-1 text-sm font-sans text-forest-500/55">{t.perYear}</span>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
              <div className="mt-8">
                <RoiCalculator
                  initialPriceThb={project.priceThb}
                  initialTenure={
                    project.tenure?.includes("Leasehold") && !project.tenure?.includes("Freehold")
                      ? "leasehold"
                      : "freehold"
                  }
                  initialLeaseTermYears={project.leaseTermYears}
                  initialOffplan
                  catalog={catalog}
                  excludeRw={project.rwNumber}
                />
              </div>
            </section>
          ) : null}

          {/* Construction timeline */}
          {hasTimeline ? (
            <section id="timeline" className="scroll-mt-32">
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.timeline}</h2>
              <ProjectTimeline items={project.timeline!} />
            </section>
          ) : null}

          {/* Developer & team */}
          {hasTeam ? (
            <section id="team" className="scroll-mt-32">
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.team}</h2>
              <ProjectTeam members={project.team!} />
            </section>
          ) : null}

          {/* Location */}
          {hasLocation ? (
            <section id="location" className="scroll-mt-32">
              <ObjectLocationMap
                lat={project.lat}
                lng={project.lng}
                district={project.district}
                mapsUrl={project.locationUrl}
              />
            </section>
          ) : null}
        </div>

        {/* Sticky inquiry */}
        <div id="enquire" className="scroll-mt-32">
          <InquiryForm rwNumber={project.rwNumber} />
        </div>
      </div>

      {/* Other projects */}
      {otherProjects.length > 0 ? (
        <section className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20">
          <h2 className="font-serif text-2xl text-forest-900">{t.otherProjects}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map((p) => (
              <ProjectCard
                key={p.rwNumber}
                project={p}
                href={localePath(locale, `/projects/${projectSlug(p, allProjects)}`)}
                availability={projectAvailability(p, getProjectUnits(p, allObjects))}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Mobile sticky CTA bar + back-to-top */}
      <ProjectActionBar
        rwNumber={project.rwNumber}
        titleEn={project.titleEn}
        priceThb={project.priceThb}
      />
      <BackToTop />
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between">
      <dt className="text-sm text-forest-500/60">{label}</dt>
      <dd className="text-sm font-medium tabular-nums text-forest-900 sm:text-right">{value}</dd>
    </div>
  );
}

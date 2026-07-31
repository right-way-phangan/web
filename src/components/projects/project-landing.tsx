import Link from "next/link";
import type { Route } from "next";
import {
  ChevronRight,
  Check,
  Waves,
  Trees,
  Car,
  ShieldCheck,
  Eye,
  Mountain,
  Leaf,
  type LucideIcon,
} from "lucide-react";
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
import { buildObjectDescription } from "@/lib/generate/object-description";
import { formatPriceTHB } from "@/lib/utils/price";
import { updateDate, countPhotos } from "@/lib/utils/construction";
import { localePath } from "@/lib/i18n/locale-path";
import { ObjectGallery } from "@/components/objects/object-gallery";
import { ObjectLocationMap } from "@/components/objects/object-location-map";
import { InquiryForm } from "@/components/objects/inquiry-form";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { ProjectHero } from "./project-hero";
import { ProjectNav, type NavItem } from "./project-nav";
import { ProjectActionBar } from "./project-action-bar";
import { BackToTop } from "./back-to-top";
import { SpecStrip } from "./spec-strip";
import { ProjectCard } from "./project-card";
import { UnitsTable } from "./units-table";
import { ProjectVideos } from "./project-videos";
import { Floorplans } from "./floorplans";
import { PriceStages } from "./price-stages";
import { ProjectTimeline } from "./project-timeline";
import { ProjectTeam } from "./project-team";
import { Appear } from "@/components/motion/appear";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

interface Props {
  project: RealEstateObject;
  catalog: RealEstateObject[];
  locale: Locale;
}

const AMENITY_ICON: Record<string, LucideIcon> = {
  "Private pool": Waves,
  "Private garden": Trees,
  Parking: Car,
  Gated: ShieldCheck,
  Beachfront: Waves,
  "Sea view": Eye,
  "Mountain view": Mountain,
  "Jungle view": Trees,
  "Quiet location": Leaf,
};

/** Amenities derived from boolean feature flags → {key, localized label}. */
function amenityList(
  o: RealEstateObject,
  t: ReturnType<typeof getObjectDict>,
): Array<{ key: string; label: string }> {
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
  return flags.filter(([v]) => v).map(([, key]) => ({ key, label: t.features[key] ?? key }));
}

export async function ProjectLanding({ project, catalog, locale }: Props) {
  const t = getProjectsDict(locale);
  const ot = getObjectDict(locale);
  const allObjects = await getAllObjects();
  const units = getProjectUnits(project, allObjects);
  const availability = projectAvailability(project, units);
  // Units a buyer can actually purchase — drive the calculator's multi-unit picker.
  const buyableUnits = units
    .filter((u) => u.status === "Active" && (u.priceThb ?? 0) > 0)
    .map((u) => ({
      rwNumber: u.rwNumber,
      label: u.rwNumber.startsWith(`${project.rwNumber}-`)
        ? u.rwNumber.slice(project.rwNumber.length + 1)
        : u.titleEn,
      priceThb: u.priceThb as number,
    }));
  const amenities = amenityList(project, ot);
  // Кураторская копия в приоритете: локале-зависимый ручной override (EN на /,
  // RU на /ru), иначе единый descriptionRaw. Авто-overview — только если копии нет.
  const overviewCopy =
    (locale === "ru" ? project.descriptionManualRu : project.descriptionManualEn)?.trim() ||
    project.descriptionRaw?.trim() ||
    null;
  const autoOverview = overviewCopy ? null : buildObjectDescription(project, locale);
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
  const constructionUpdates = project.constructionUpdates ?? [];
  const hasConstruction = constructionUpdates.length > 0;
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
    ...(hasConstruction ? [{ id: "construction", label: t.nav.construction }] : []),
    ...(hasTeam ? [{ id: "team", label: t.nav.team }] : []),
    ...(hasLocation ? [{ id: "location", label: t.nav.location }] : []),
  ];

  const projectsHref = localePath(locale, "/projects") as Route;
  const constructionHref = localePath(
    locale,
    `/projects/${projectSlug(project, allProjects)}/construction`,
  ) as Route;
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

      <SpecStrip project={project} locale={locale} />

      {/* The sticky section nav needs a tall parent to travel within, so the
          body grid is nested beside it — wrapped alone it has zero scroll run
          and never sticks. */}
      <div className="mt-10">
        <ProjectNav items={nav} ctaLabel={t.nav.enquire} availabilityNote={availNote} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div className="min-w-0 space-y-24 lg:space-y-32">
          {/* Overview */}
          <Appear>
          <section id="overview" className="scroll-mt-32">
            <SectionEyebrow className="mb-3">{t.nav.overview}</SectionEyebrow>
            <h2 className="font-serif text-3xl text-forest-900">{t.sections.overview}</h2>
            {overviewCopy ? (
              <div className="mt-6 max-w-prose space-y-4 whitespace-pre-line text-base leading-relaxed text-forest-500/85">
                {overviewCopy}
              </div>
            ) : autoOverview ? (
              <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-forest-500/85">
                <p>{autoOverview.lead}</p>
                {autoOverview.body ? <p>{autoOverview.body}</p> : null}
              </div>
            ) : null}

            {project.areaNote ? (
              <div className="mt-6 rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5">
                <div className="rounded-core bg-cream-50 p-5 shadow-bezel">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                    {locale === "ru" ? "Площади" : "Areas"}
                  </h3>
                  <p className="text-sm leading-relaxed text-forest-500/85">{project.areaNote}</p>
                </div>
              </div>
            ) : null}

            {amenities.length > 0 ? (
              <div className="mt-8">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                  {t.sections.amenities}
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {amenities.map((a) => {
                    const Icon = AMENITY_ICON[a.key] ?? Check;
                    return (
                      <li
                        key={a.key}
                        className="flex items-center gap-2 text-sm text-forest-500/85"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-brass-500" />
                        {a.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </section>
          </Appear>

          {/* Gallery */}
          {hasGallery ? (
            <Appear delay={0.06}>
            <section id="gallery" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.gallery}</SectionEyebrow>
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.gallery}</h2>
              <ObjectGallery rwNumber={project.rwNumber} type={project.type} gallery={project.gallery} />
            </section>
            </Appear>
          ) : null}

          {/* Floor plans & masterplan */}
          {hasPlans ? (
            <Appear delay={0.06}>
            <section id="plans" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.plans}</SectionEyebrow>
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.plans}</h2>
              <Floorplans urls={project.floorplanUrls!} />
            </section>
            </Appear>
          ) : null}

          {/* Video & tour */}
          {hasVideo ? (
            <Appear delay={0.06}>
            <section id="video" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.video}</SectionEyebrow>
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.video}</h2>
              <ProjectVideos urls={project.videoUrls!} watchLabel={t.watchVideo} />
            </section>
            </Appear>
          ) : null}

          {/* Units & availability */}
          {hasUnits ? (
            <Appear delay={0.06}>
            <section id="units" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.units}</SectionEyebrow>
              <h2 className="font-serif text-3xl text-forest-900">{t.sections.units}</h2>
              <p className="mt-2 text-sm text-forest-500/70">{t.sections.unitsLede}</p>
              <div className="mt-6">
                <UnitsTable units={units} availability={availability} />
              </div>
            </section>
            </Appear>
          ) : null}

          {/* Pricing & payment */}
          {hasPricing ? (
            <Appear delay={0.06}>
            <section id="pricing" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.pricing}</SectionEyebrow>
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
              {hasReturns ? (
                <a
                  href="#returns"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brass-600 underline-offset-2 transition-colors hover:text-brass-700 hover:underline"
                >
                  {locale === "ru" ? "Посчитать доходность →" : "See ROI projection →"}
                </a>
              ) : null}
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
            </Appear>
          ) : null}

          {/* Projected returns */}
          {hasReturns ? (
            <Appear delay={0.06}>
            <section id="returns" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.returns}</SectionEyebrow>
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
                  initialRent
                  catalog={catalog}
                  excludeRw={project.rwNumber}
                  projectUnits={buyableUnits.length > 0 ? buyableUnits : undefined}
                />
              </div>
            </section>
            </Appear>
          ) : null}

          {/* Construction timeline */}
          {hasTimeline ? (
            <Appear delay={0.06}>
            <section id="timeline" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.timeline}</SectionEyebrow>
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.timeline}</h2>
              <ProjectTimeline items={project.timeline!} />
            </section>
            </Appear>
          ) : null}

          {/* Ход стройки — тизер последнего отчёта, всё остальное на своей странице */}
          {hasConstruction ? (
            <Appear delay={0.06}>
            <section id="construction" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.construction}</SectionEyebrow>
              <h2 className="font-serif text-3xl text-forest-900">{t.sections.construction}</h2>
              <p className="mt-2 text-sm text-forest-500/70">
                {t.construction.latest}: {updateDate(constructionUpdates[0], locale)}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {constructionUpdates[0].photos.slice(0, 4).map((url) => (
                  <Link
                    key={url}
                    href={constructionHref}
                    className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={updateDate(constructionUpdates[0], locale)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                ))}
              </div>
              <Link
                href={constructionHref}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brass-600 underline-offset-2 transition-colors hover:text-brass-700 hover:underline"
              >
                {t.construction.viewAll} ({t.construction.photos(countPhotos(constructionUpdates))}) →
              </Link>
            </section>
            </Appear>
          ) : null}

          {/* Developer & team */}
          {hasTeam ? (
            <Appear delay={0.06}>
            <section id="team" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.team}</SectionEyebrow>
              <h2 className="mb-6 font-serif text-3xl text-forest-900">{t.sections.team}</h2>
              <ProjectTeam members={project.team!} />
            </section>
            </Appear>
          ) : null}

          {/* Location */}
          {hasLocation ? (
            <Appear delay={0.06}>
            <section id="location" className="scroll-mt-32">
              <SectionEyebrow className="mb-3">{t.nav.location}</SectionEyebrow>
              <ObjectLocationMap
                lat={project.lat}
                lng={project.lng}
                district={project.district}
                mapsUrl={project.locationUrl}
              />
            </section>
            </Appear>
          ) : null}
        </div>

        {/* Sticky deal rail: the offer snapshot + inquiry form stay in view as
            the visitor scrolls the sections. self-start keeps the item content-
            height so it can stick within the tall grid row. */}
        <div id="enquire" className="scroll-mt-32 lg:sticky lg:top-24 lg:self-start lg:space-y-4">
          {project.priceThb || availability.total != null ? (
            <RailSummary project={project} availability={availability} t={t} />
          ) : null}
          <InquiryForm rwNumber={project.rwNumber} />
        </div>
        </div>
      </div>

      {/* Other projects */}
      {otherProjects.length > 0 ? (
        <section className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20">
          <h2 className="font-serif text-2xl text-forest-900">{t.otherProjects}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map((p, i) => (
              <Appear key={p.rwNumber} delay={(i % 3) * 0.08} className="h-full">
                <ProjectCard
                  project={p}
                  href={localePath(locale, `/projects/${projectSlug(p, allProjects)}`)}
                  availability={projectAvailability(p, getProjectUnits(p, allObjects))}
                />
              </Appear>
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

/**
 * Compact offer snapshot pinned above the inquiry form in the sticky rail —
 * keeps the "from" price, availability and yield in view once the hero scrolls
 * away. Desktop only (lg+): on mobile the hero + sticky action bar already carry
 * this, so the rail stays a plain form.
 */
function RailSummary({
  project,
  availability,
  t,
}: {
  project: RealEstateObject;
  availability: { total?: number; available?: number };
  t: ReturnType<typeof getProjectsDict>;
}) {
  const { total, available } = availability;
  const soldOut = total != null && (available ?? 0) <= 0;
  return (
    <div className="hidden rounded-sm border border-forest-500/10 bg-cream-50 p-5 shadow-sm lg:block">
      {project.priceThb ? (
        <>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brass-500">
            {t.from}
          </p>
          <p className="num mt-1 text-2xl text-forest-900">{formatPriceTHB(project.priceThb)}</p>
        </>
      ) : null}
      {total != null || project.netYieldPct ? (
        <dl
          className={`space-y-2 text-sm ${
            project.priceThb ? "mt-4 border-t border-forest-500/10 pt-4" : ""
          }`}
        >
          {total != null ? (
            <div className="flex items-center justify-between">
              <dt className="text-forest-500/65">{t.units}</dt>
              <dd className="inline-flex items-center gap-1.5 font-medium text-forest-900">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${soldOut ? "bg-forest-500/30" : "bg-brass-500"}`}
                />
                {soldOut ? t.soldOut : `${available}/${total}`}
              </dd>
            </div>
          ) : null}
          {project.netYieldPct ? (
            <div className="flex items-center justify-between">
              <dt className="text-forest-500/65">{t.sections.netYield}</dt>
              <dd className="font-medium text-forest-900">~{project.netYieldPct}%</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}

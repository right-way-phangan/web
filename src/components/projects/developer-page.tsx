import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getDeveloperBySlug,
  getProjectUnits,
  projectAvailability,
  projectSlug,
  getPublicProjects,
} from "@/lib/data/projects";
import { getAllObjects } from "@/lib/data/objects";
import { getDistrictMarket } from "@/lib/data/rental-market";
import { getProjectEconomics } from "@/content/projects/economics";
import { BUILD_COST_ARTICLE } from "@/lib/data/build-cost";
import { getDeveloperProfile, resolveTimeline } from "@/content/developers";
import { estateThumb } from "@/lib/utils/thumb";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { LeadForm } from "@/components/forms/lead-form";
import { ProjectCard } from "./project-card";
import { DeveloperTimeline } from "./developer-timeline";
import {
  DeveloperPhotosProvider,
  type DeveloperPhotoGroup,
} from "./developer-photos";
import { DeveloperAlbum, type AlbumThumb } from "./developer-album";
import { DeveloperReturns, type ReturnsUnit } from "./developer-returns";
import { DeveloperBuildCost } from "./developer-build-cost";
import { DeveloperMap } from "./developer-map";
import { DeveloperCtaBar } from "./developer-cta-bar";
import { ProjectNav, type NavItem } from "./project-nav";
import { BackToTop } from "./back-to-top";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Appear } from "@/components/motion/appear";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/site-url";

/** Заголовок секции: надзаголовок + h2 + необязательный лид — единая пара на всю страницу. */
function SectionHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
      <h2 className={cn("font-serif text-3xl text-forest-900 md:text-4xl", eyebrow && "mt-3")}>
        {title}
      </h2>
      {lede ? <p className="mt-3 max-w-prose text-forest-500/85">{lede}</p> : null}
    </div>
  );
}

/** Developer landing — one developer's profile, track record and catalog projects in one place. */
export async function DeveloperPage({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const t = getProjectsDict(locale);
  const dev = await getDeveloperBySlug(slug);
  // A curated profile keeps the page alive even if the catalog group is empty
  // (e.g. the developer's objects are unpublished or their `developer` field drifted).
  const profile = getDeveloperProfile(slug);
  if (!dev && !profile) notFound();
  const name = dev?.name ?? profile!.name;
  const projects = dev?.projects ?? [];

  const allProjects = await getPublicProjects();
  const allObjects = await getAllObjects();

  const timelineRws = new Set(
    (profile?.timeline ?? [])
      .map((e) => e.rwNumber)
      .filter(Boolean) as string[],
  );
  // Timeline entries may also point at a plain catalog object (the developer's
  // own house, for sale with us) — those link to the object page instead.
  const timelineObjectRws = new Set(
    (profile?.timeline ?? [])
      .map((e) => e.objectRw)
      .filter(Boolean) as string[],
  );
  const hrefByRw: Record<string, string> = Object.fromEntries([
    ...allProjects
      .filter((p) => timelineRws.has(p.rwNumber))
      .map(
        (p) =>
          [
            p.rwNumber,
            localePath(locale, `/projects/${projectSlug(p, allProjects)}`),
          ] as const,
      ),
    ...allObjects
      .filter((o) => timelineObjectRws.has(o.rwNumber))
      .map(
        (o) =>
          [o.rwNumber, localePath(locale, `/object/${o.rwNumber}`)] as const,
      ),
  ]);
  const timelineItems = profile
    ? resolveTimeline(profile.timeline, hrefByRw)
    : [];

  // KPI counts derived from data (live now, no new data needed).
  const delivered =
    profile?.timeline.filter((e) => e.status === "built").length ?? 0;
  const building =
    profile?.timeline.filter((e) => e.status === "under-construction").length ??
    0;
  const kpis = [
    { n: profile?.timeline.length ?? 0, label: t.developers.kpi.portfolio },
    { n: delivered, label: t.developers.kpi.delivered },
    { n: building, label: t.developers.kpi.building },
  ].filter((k) => k.n > 0);

  const gallery = profile?.gallery ?? [];
  const locations = profile?.locations ?? [];

  // Один плоский список кадров на всю страницу: альбом показывает срез по
  // проекту, но лайтбокс листает весь архив — и открывается он ещё и из
  // карточек ленты истории. Индексная арифметика считается здесь, на сервере.
  const flatPhotos = gallery.flatMap((set) =>
    set.photos.map((src, i) => ({
      src,
      thumb: estateThumb(src),
      alt: `${set.title} (${i + 1})`,
      caption: set.title,
    })),
  );
  const photoGroups: DeveloperPhotoGroup[] = [];
  let acc = 0;
  for (const set of gallery) {
    photoGroups.push({
      title: set.title,
      note: set.note?.[locale],
      start: acc,
      count: set.photos.length,
    });
    acc += set.photos.length;
  }
  const albumThumbs: AlbumThumb[] = flatPhotos.map((p) => ({
    thumb: p.thumb,
    alt: p.alt,
  }));

  // Доходность считаем по проекту застройщика, который реально в продаже.
  const saleProject = projects.find((p) => (p.priceThb ?? 0) > 0);
  const saleUnits = saleProject ? getProjectUnits(saleProject, allObjects) : [];
  const economics = saleProject
    ? getProjectEconomics(saleProject.rwNumber)
    : undefined;
  const returnsUnits: ReturnsUnit[] = saleUnits
    .filter((u) => u.status === "Active" && (u.priceThb ?? 0) > 0)
    .map((u, i) => {
      const label =
        u.bedrooms != null ? `${u.bedrooms}BR` : u.rwNumber.split("-").pop() ?? `#${i + 1}`;
      const claim = economics?.formats.find((f) => f.label === label);
      return {
        id: u.rwNumber,
        label,
        priceThb: u.priceThb!,
        claimedYieldPct: claim?.yieldPct,
        claimedPaybackYears: claim?.paybackYears,
      };
    });
  if (!returnsUnits.length && saleProject?.priceThb) {
    returnsUnits.push({
      id: saleProject.rwNumber,
      label: saleProject.rwNumber,
      priceThb: saleProject.priceThb,
    });
  }
  const dm = saleProject?.district ? getDistrictMarket(saleProject.district) : null;
  // measuredOcc приходит долей (0.46), baseOccPct — уже процентами. Смешать их
  // означает посчитать загрузку в сотую долю процента и получить убыток на
  // ровном месте — приводим к одной шкале здесь.
  const measuredPct = dm?.measuredOcc != null ? Math.round(dm.measuredOcc * 100) : null;
  const returnsMarket = dm
    ? {
        nightlyRateThb: dm.district.adrP75 ?? dm.district.adrMedian,
        occupancyPct: measuredPct ?? dm.baseOccPct,
        districtLabel: dm.district.name,
      }
    : null;
  const showReturns = returnsUnits.length > 0;

  // Площади юнитов — пресеты для калькулятора стройки (что реально строят рядом).
  const presetAreas = Array.from(
    new Set(
      saleUnits
        .map((u) => u.areaSqm)
        .filter((a): a is number => typeof a === "number" && a >= 40 && a <= 600),
    ),
  ).sort((a, b) => a - b);

  // "enquire" is the sticky-nav CTA (ctaLabel), not a tab — keep it out of items
  // to avoid a duplicate Enquire (tab + CTA) both pointing at #enquire.
  const navItems: NavItem[] = [
    profile ? { id: "overview", label: t.developers.nav.overview } : null,
    flatPhotos.length ? { id: "photos", label: t.developers.nav.photos } : null,
    timelineItems.length
      ? { id: "history", label: t.developers.nav.history }
      : null,
    projects.length
      ? { id: "projects", label: t.developers.nav.projects }
      : null,
    showReturns ? { id: "returns", label: t.developers.nav.returns } : null,
    { id: "build", label: t.developers.nav.build },
  ].filter((x): x is NavItem => x != null);

  const base = getSiteUrl();
  const pageUrl = `${base}${localePath(locale, `/developers/${slug}`)}`;
  const devIndexHref = localePath(locale, "/developers");
  const calcHref = localePath(locale, "/calculator");
  const fullCalcHref = saleProject?.priceThb
    ? `${calcHref}?price=${saleProject.priceThb}&mode=rent&tenure=leasehold&lease=30&phase=offplan`
    : calcHref;
  const articleHref = localePath(locale, `/knowledge/${BUILD_COST_ARTICLE}`);

  // Перелинковка — только живые маршруты; district-ссылка идёт фильтром каталога,
  // потому что у района проекта своей страницы может не быть.
  const nextLinks: Array<{ group: string; items: Array<{ href: string; label: string }> }> = [
    {
      group: t.developers.sections.nextCatalog,
      items: [
        { href: localePath(locale, "/projects"), label: t.indexTitle.replace(/\.$/, "") },
        { href: devIndexHref, label: t.developers.indexTitle.replace(/\.$/, "") },
        ...(saleProject?.district
          ? [
              {
                href: `${localePath(locale, "/listings")}?district=${encodeURIComponent(saleProject.district)}`,
                label: saleProject.district,
              },
            ]
          : []),
        { href: localePath(locale, "/leasehold"), label: t.developers.nextLeasehold },
      ],
    },
    {
      group: t.developers.sections.nextLearn,
      items: [
        { href: articleHref, label: t.developers.build.articleCta },
        {
          href: localePath(locale, "/knowledge/buying-off-plan-new-developments"),
          label: t.developers.nextOffplan,
        },
        { href: localePath(locale, "/due-diligence"), label: t.developers.nextVetting },
        { href: localePath(locale, "/process"), label: t.developers.nextProcess },
      ],
    },
    {
      group: t.developers.sections.nextTools,
      items: [
        { href: calcHref, label: t.developers.returns.fullCta },
        { href: localePath(locale, "/tools/zoning"), label: t.developers.nextZoning },
        { href: localePath(locale, "/insights"), label: t.developers.nextInsights },
      ],
    },
  ];

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: profile?.name ?? name,
    url: pageUrl,
    areaServed: "Koh Phangan, Thailand",
  };
  if (profile?.seo?.description)
    org.description = profile.seo.description[locale];
  if (profile?.hero?.photo) org.image = `${base}${profile.hero.photo}`;

  const content = (
    <>
      {/* Hero */}
      <section className="container-prose pt-10 md:pt-14">
        {/* Plain breadcrumb (not the object Breadcrumbs — its middle crumb does
            router.back(), which would not reliably land on the developers index). */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-forest-500/70">
            <li>
              <Link
                href={(locale === "ru" ? "/ru" : "/") as Route}
                className="inline-block -my-1.5 py-1.5 transition-colors hover:text-brass-500"
              >
                {locale === "ru" ? "Главная" : "Home"}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3.5 w-3.5 text-forest-500/40" />
            </li>
            <li>
              <Link
                href={devIndexHref as Route}
                className="inline-block -my-1.5 py-1.5 transition-colors hover:text-brass-500"
              >
                {t.developers.indexEyebrow}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3.5 w-3.5 text-forest-500/40" />
            </li>
            <li aria-current="page" className="font-medium text-forest-900">
              {name}
            </li>
          </ol>
        </nav>
        <h1 className="max-w-3xl text-balance">{name}</h1>
        {profile?.hero?.tagline ? (
          <p className="mt-4 max-w-2xl text-lg text-forest-500/85">
            {profile.hero.tagline[locale]}
          </p>
        ) : null}

        {profile?.hero?.photo ? (
          // Рамка фиксированной пропорции: без неё кадр приезжает на 204px выше
          // объявленной высоты и утаскивает за собой весь первый экран.
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-sm bg-forest-900/[0.04] md:aspect-[21/9]">
            <Image
              src={profile.hero.photo}
              alt={name}
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        {kpis.length ? (
          <dl className="mt-8 grid grid-cols-3 gap-x-6 gap-y-5">
            {kpis.map((k) => (
              <div key={k.label}>
                <dd className="font-serif text-3xl text-forest-900">
                  <AnimatedNumber value={k.n} />
                </dd>
                <dt className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-forest-600">
                  {k.label}
                </dt>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      {/* ProjectNav (position: sticky) must be a DIRECT sibling of the content in
          one tall parent, or its containing block is too short and it unsticks
          immediately (see project-landing.tsx). */}
      <div className="mt-10">
        {navItems.length > 1 ? (
          <ProjectNav items={navItems} ctaLabel={t.developers.nav.enquire} />
        ) : null}

        <div className="container-prose space-y-20 pb-24 pt-14 md:space-y-28 md:pb-28">
          {profile ? (
            <section id="overview" className="scroll-mt-32">
              <Appear>
                <SectionHead
                  eyebrow={t.developers.indexEyebrow}
                  title={t.developers.aboutTitle}
                />
                {profile.bio[locale].split("\n\n").map((para, i) => (
                  <p key={i} className="mt-4 max-w-prose text-forest-500/85">
                    {para}
                  </p>
                ))}
                {profile.facts.length ? (
                  <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                    {profile.facts.map((fact) => (
                      <div key={fact.label.en}>
                        <dt className="text-xs font-medium uppercase tracking-[0.15em] text-forest-500/55">
                          {fact.label[locale]}
                        </dt>
                        <dd className="mt-1 text-sm text-forest-900">
                          {fact.value[locale]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </Appear>
            </section>
          ) : null}

          {/* Фото стоят высоко: это главное доказательство, а не приложение
              к тексту — раньше до них было три экрана прокрутки. */}
          {albumThumbs.length ? (
            <section id="photos" className="scroll-mt-32">
              <Appear>
                <SectionHead
                  eyebrow={t.developers.nav.photos}
                  title={t.developers.sections.photosTitle}
                  lede={t.developers.sections.photosLede}
                />
                <DeveloperAlbum thumbs={albumThumbs} locale={locale} />
              </Appear>
            </section>
          ) : null}

          {timelineItems.length ? (
            <section id="history" className="scroll-mt-32">
              <Appear>
                <SectionHead
                  eyebrow={t.developers.nav.history}
                  title={t.developers.historyTitle}
                />
                <DeveloperTimeline items={timelineItems} locale={locale} />
                {/* A single pin is the object page's job — the map earns its place
                    only when it shows how the developer's sites relate to each other. */}
                {locations.length > 1 ? (
                  <div className="mt-12">
                    <h3 className="font-serif text-2xl text-forest-900">
                      {t.developers.mapTitle}
                    </h3>
                    <p className="mt-2 max-w-prose text-sm text-forest-500/70">
                      {t.developers.mapLede}
                    </p>
                    <DeveloperMap locations={locations} locale={locale} />
                  </div>
                ) : null}
              </Appear>
            </section>
          ) : null}

          {projects.length ? (
            <section id="projects" className="scroll-mt-32">
              <Appear>
                <SectionHead
                  eyebrow={t.developers.nav.projects}
                  title={t.developers.catalogTitle}
                />
                <div
                  className={
                    projects.length === 1
                      ? "max-w-md"
                      : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {projects.map((project) => {
                    const units = getProjectUnits(project, allObjects);
                    const availability = projectAvailability(project, units);
                    const href = localePath(
                      locale,
                      `/projects/${projectSlug(project, allProjects)}`,
                    );
                    return (
                      <ProjectCard
                        key={project.rwNumber}
                        project={project}
                        href={href}
                        availability={availability}
                        showDeveloper={false}
                      />
                    );
                  })}
                </div>
              </Appear>
            </section>
          ) : null}

          {showReturns ? (
            <section id="returns" className="scroll-mt-32">
              <Appear>
                <SectionHead
                  eyebrow={t.developers.nav.returns}
                  title={t.developers.sections.returnsTitle}
                  lede={t.developers.sections.returnsLede}
                />
                <DeveloperReturns
                  units={returnsUnits}
                  market={returnsMarket}
                  fullCalcHref={fullCalcHref}
                  locale={locale}
                />
              </Appear>
            </section>
          ) : null}

          <section id="build" className="scroll-mt-32">
            <Appear>
              <SectionHead
                eyebrow={t.developers.nav.build}
                title={t.developers.sections.buildTitle}
                lede={t.developers.sections.buildLede}
              />
              <DeveloperBuildCost
                presetAreas={presetAreas}
                articleHref={articleHref}
                calcHref={`${calcHref}#build`}
                locale={locale}
              />
              {profile ? (
                <div id="enquire" className="mt-14 max-w-xl scroll-mt-32">
                  <h3 className="font-serif text-2xl text-forest-900">
                    {t.developers.formTitle}
                  </h3>
                  <p className="mt-3 text-sm text-forest-500/70">
                    {t.developers.formLede}
                  </p>
                  <div className="mt-6">
                    <LeadForm
                      source="contact"
                      kind="construction"
                      developer={profile.slug}
                      defaultMessage={t.developers.formDefaultMessage(name)}
                      submitLabel={t.developers.formSubmit}
                      locale={locale}
                    />
                  </div>
                </div>
              ) : null}
            </Appear>
          </section>

          <section id="next" className="scroll-mt-32">
            <Appear>
              <SectionHead title={t.developers.sections.nextTitle} />
              <div className="grid gap-8 sm:grid-cols-3">
                {nextLinks.map((col) => (
                  <div key={col.group}>
                    <div className="text-xs font-medium uppercase tracking-[0.15em] text-forest-500/55">
                      {col.group}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {col.items.map((l) => (
                        <li key={l.href + l.label}>
                          <Link
                            href={l.href as Route}
                            className="text-sm text-forest-600 underline-offset-4 transition-colors hover:text-brass-500 hover:underline"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Appear>
          </section>
        </div>
      </div>
    </>
  );

  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          {
            name: locale === "ru" ? "Главная" : "Home",
            url: locale === "ru" ? `${base}/ru` : `${base}/`,
          },
          { name: t.developers.indexEyebrow, url: `${base}${devIndexHref}` },
          { name, url: pageUrl },
        ]}
      />
      {profile ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(org) }}
        />
      ) : null}

      {flatPhotos.length ? (
        <DeveloperPhotosProvider
          photos={flatPhotos}
          groups={photoGroups}
          title={t.developers.sections.photosTitle}
          labels={{
            prev: locale === "ru" ? "Назад" : "Previous",
            next: locale === "ru" ? "Вперёд" : "Next",
            close: locale === "ru" ? "Закрыть" : "Close",
          }}
        >
          {content}
        </DeveloperPhotosProvider>
      ) : (
        content
      )}

      <BackToTop />
      {profile ? <DeveloperCtaBar label={t.developers.nav.enquire} /> : null}
    </>
  );
}

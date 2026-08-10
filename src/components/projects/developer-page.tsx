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
import { getDeveloperProfile, resolveTimeline } from "@/content/developers";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { LeadForm } from "@/components/forms/lead-form";
import { ProjectCard } from "./project-card";
import { DeveloperTimeline } from "./developer-timeline";
import { DeveloperGallery } from "./developer-gallery";
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
    { n: projects.length, label: t.developers.kpi.projects },
  ].filter((k) => k.n > 0);

  const gallery = profile?.gallery ?? [];
  const locations = profile?.locations ?? [];

  // "enquire" is the sticky-nav CTA (ctaLabel), not a tab — keep it out of items
  // to avoid a duplicate Enquire (tab + CTA) both pointing at #enquire.
  const navItems: NavItem[] = [
    profile ? { id: "overview", label: t.developers.nav.overview } : null,
    timelineItems.length
      ? { id: "history", label: t.developers.nav.history }
      : null,
    projects.length
      ? { id: "projects", label: t.developers.nav.projects }
      : null,
    gallery.length ? { id: "photos", label: t.developers.nav.photos } : null,
  ].filter((x): x is NavItem => x != null);

  const base = getSiteUrl();
  const pageUrl = `${base}${localePath(locale, `/developers/${slug}`)}`;
  const devIndexHref = localePath(locale, "/developers");

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
        <SectionEyebrow>{t.developer}</SectionEyebrow>
        <h1 className="mt-3 max-w-3xl text-balance">{name}</h1>
        {profile?.hero?.tagline ? (
          <p className="mt-4 max-w-2xl text-lg text-forest-500/85">
            {profile.hero.tagline[locale]}
          </p>
        ) : null}

        {profile?.hero?.photo ? (
          <div className="mt-8 overflow-hidden rounded-sm">
            <Image
              src={profile.hero.photo}
              alt={name}
              width={1280}
              height={640}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        ) : null}

        {kpis.length ? (
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
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

        {profile ? (
          <div className="mt-8">
            <a
              href="#enquire"
              className="inline-flex h-11 items-center rounded-sm bg-forest-900 px-5 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-900/90"
            >
              {t.developers.nav.enquire}
            </a>
          </div>
        ) : null}
      </section>

      {/* ProjectNav (position: sticky) must be a DIRECT sibling of the content in
          one tall parent, or its containing block is too short and it unsticks
          immediately (see project-landing.tsx). */}
      <div className="mt-10">
        {navItems.length > 1 ? (
          <ProjectNav items={navItems} ctaLabel={t.developers.nav.enquire} />
        ) : null}

        <section className="container-prose pb-24 md:pb-28">
          {profile ? (
            <div id="overview" className="mt-14 scroll-mt-32">
              <Appear>
                <h2 className="font-serif text-3xl text-forest-900">
                  {t.developers.aboutTitle}
                </h2>
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
            </div>
          ) : null}

          {timelineItems.length ? (
            <div id="history" className="mt-16 scroll-mt-32">
              <Appear>
                <h2 className="font-serif text-3xl text-forest-900">
                  {t.developers.historyTitle}
                </h2>
                <DeveloperTimeline items={timelineItems} locale={locale} />
              </Appear>
            </div>
          ) : null}

          {projects.length ? (
            <div id="projects" className="mt-16 scroll-mt-32">
              <Appear>
                {profile ? (
                  <h2 className="font-serif text-3xl text-forest-900">
                    {t.developers.catalogTitle}
                  </h2>
                ) : null}
                <div
                  className={
                    (profile ? "mt-8" : "mt-10") +
                    " grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
                      />
                    );
                  })}
                </div>
              </Appear>
            </div>
          ) : null}

          {gallery.length ? (
            <div id="photos" className="mt-16 scroll-mt-32">
              <Appear>
                <DeveloperGallery
                  sets={gallery}
                  locale={locale}
                  title={t.developers.galleryTitle}
                />
              </Appear>
            </div>
          ) : null}

          {/* A single pin is the object page's job — the map earns its place
              only when it shows how the developer's sites relate to each other. */}
          {locations.length > 1 ? (
            <Appear className="mt-16">
              <h2 className="font-serif text-3xl text-forest-900">
                {t.developers.mapTitle}
              </h2>
              <p className="mt-2 max-w-prose text-sm text-forest-500/70">
                {t.developers.mapLede}
              </p>
              <DeveloperMap locations={locations} locale={locale} />
            </Appear>
          ) : null}

          {profile ? (
            <div id="enquire" className="mt-16 max-w-xl scroll-mt-32">
              <Appear>
                <h2 className="font-serif text-3xl text-forest-900">
                  {t.developers.formTitle}
                </h2>
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
              </Appear>
            </div>
          ) : null}
        </section>
      </div>

      <BackToTop />
      {profile ? <DeveloperCtaBar label={t.developers.nav.enquire} /> : null}
    </>
  );
}

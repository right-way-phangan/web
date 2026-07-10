import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-form";
import { ProjectCard } from "./project-card";
import { DeveloperTimeline } from "./developer-timeline";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";
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
  const hrefByRw = Object.fromEntries(
    allProjects
      .filter((p) => timelineRws.has(p.rwNumber))
      .map((p) => [
        p.rwNumber,
        localePath(locale, `/projects/${projectSlug(p, allProjects)}`),
      ]),
  );
  const timelineItems = profile
    ? resolveTimeline(profile.timeline, hrefByRw)
    : [];

  const base = getSiteUrl();
  const pageUrl = `${base}${localePath(locale, `/developers/${slug}`)}`;

  return (
    <section className="container-prose py-24 md:py-32">
      <BreadcrumbJsonLd
        crumbs={[
          {
            name: locale === "ru" ? "Главная" : "Home",
            url: locale === "ru" ? `${base}/ru` : `${base}/`,
          },
          {
            name: locale === "ru" ? "Проекты" : "Projects",
            url: `${base}${localePath(locale, "/projects")}`,
          },
          { name, url: pageUrl },
        ]}
      />
      {profile ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: profile.name,
              description: profile.seo?.description?.[locale],
              url: pageUrl,
            }),
          }}
        />
      ) : null}
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={localePath(locale, "/projects") as Route}>
          <ArrowLeft className="h-4 w-4" />
          {t.backToProjects}
        </Link>
      </Button>

      <SectionEyebrow>{t.developer}</SectionEyebrow>
      <h1 className="mt-3 max-w-3xl text-balance">{name}</h1>
      {profile?.hero?.tagline ? (
        <p className="mt-4 max-w-2xl text-lg text-forest-500/85">
          {profile.hero.tagline[locale]}
        </p>
      ) : null}
      {projects.length ? (
        <p className="mt-3 text-sm text-forest-500/55">
          {t.count(projects.length)}
        </p>
      ) : null}

      {profile ? (
        <Reveal className="mt-14">
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
        </Reveal>
      ) : null}

      {timelineItems.length ? (
        <Reveal className="mt-16">
          <h2 className="mb-8 font-serif text-3xl text-forest-900">
            {t.developers.historyTitle}
          </h2>
          <DeveloperTimeline items={timelineItems} locale={locale} />
        </Reveal>
      ) : null}

      {projects.length ? (
        <>
          {profile ? (
            <h2 className="mt-16 font-serif text-3xl text-forest-900">
              {t.developers.catalogTitle}
            </h2>
          ) : null}
          <Reveal
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
          </Reveal>
        </>
      ) : null}

      {profile ? (
        <Reveal className="mt-16 max-w-xl">
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
        </Reveal>
      ) : null}
    </section>
  );
}

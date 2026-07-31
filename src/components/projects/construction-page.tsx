import Link from "next/link";
import type { Route } from "next";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { countPhotos } from "@/lib/utils/construction";
import { InquiryForm } from "@/components/objects/inquiry-form";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { ConstructionLog } from "./construction-log";
import { StageBadge } from "./stage-badge";

/**
 * Отдельная страница хода стройки проекта — /projects/[slug]/construction
 * (и /ru/…). Лендинг показывает только последний отчёт со ссылкой сюда;
 * здесь — все фотоотчёты по датам целиком.
 */
export function ConstructionPage({
  project,
  slug,
  locale,
}: {
  project: RealEstateObject;
  slug: string;
  locale: Locale;
}) {
  const t = getProjectsDict(locale);
  const updates = project.constructionUpdates ?? [];
  const projectHref = localePath(locale, `/projects/${slug}`) as Route;
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
        <Link href={projectHref} className="truncate transition-colors hover:text-brass-500">
          {project.titleEn}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-forest-900">{t.sections.construction}</span>
      </nav>

      <header>
        <SectionEyebrow className="mb-3">{project.rwNumber}</SectionEyebrow>
        <h1 className="text-balance">{t.construction.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-forest-500/70">
          <Link href={projectHref} className="font-medium text-brass-600 hover:underline">
            {project.titleEn}
          </Link>
          {project.district ? <span>· {project.district}</span> : null}
          <StageBadge stage={project.stage} locale={locale} />
        </p>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/85">
          {t.construction.lede}
        </p>
        {project.completion ? (
          <p className="mt-2 text-sm text-forest-500/70">
            {t.completion}: <span className="text-forest-900">{project.completion}</span>
          </p>
        ) : null}
        <p className="mt-1 text-sm text-forest-500/55">
          {t.construction.photos(countPhotos(updates))}
        </p>
      </header>

      <div className="mt-12">
        <ConstructionLog updates={updates} locale={locale} />
      </div>

      <div className="mt-16 grid gap-8 border-t border-forest-500/10 pt-10 lg:grid-cols-[1fr_360px]">
        <div>
          <Link
            href={projectHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-brass-600 transition-colors hover:text-brass-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.construction.backToProject}
          </Link>
        </div>
        <InquiryForm rwNumber={project.rwNumber} />
      </div>
    </article>
  );
}

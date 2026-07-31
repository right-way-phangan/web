import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublicProjects, projectSlug } from "@/lib/data/projects";
import { ConstructionPage } from "@/components/projects/construction-page";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

/** Только проекты с фотоотчётами — у остальных страницы нет (404). */
export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects
    .filter((p) => (p.constructionUpdates?.length ?? 0) > 0)
    .map((p) => ({ slug: projectSlug(p, projects) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) return { title: "Проект не найден" };
  const t = getProjectsDict("ru");
  return {
    title: `${t.construction.title} — ${found.project.titleEn}`,
    description: t.construction.metaDescription(found.project.titleEn),
    alternates: {
      canonical: `/ru/projects/${slug}/construction`,
      languages: {
        en: `/projects/${slug}/construction`,
        ru: `/ru/projects/${slug}/construction`,
        "x-default": `/projects/${slug}/construction`,
      },
    },
  };
}

export default async function RuProjectConstructionPage({ params }: Props) {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found || (found.project.constructionUpdates?.length ?? 0) === 0) notFound();
  const siteUrl = getSiteUrl();
  const projectUrl = `${siteUrl}/ru/projects/${slug}`;
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Главная", url: `${siteUrl}/ru` },
          { name: "Проекты", url: `${siteUrl}/ru/projects` },
          { name: found.project.rwNumber, url: projectUrl },
          { name: "Ход строительства", url: `${projectUrl}/construction` },
        ]}
      />
      <ConstructionPage project={found.project} slug={slug} locale="ru" />
    </>
  );
}

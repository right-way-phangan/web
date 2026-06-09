import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublicProjects, projectSlug } from "@/lib/data/projects";
import { ProjectLanding } from "@/components/projects/project-landing";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.map((p) => ({ slug: projectSlug(p, projects) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) return { title: "Проект не найден" };
  const { project } = found;
  const districtSuffix = project.district ? `, ${project.district}` : "";
  return {
    title: `${project.titleEn} — ${project.rwNumber}`,
    description:
      project.descriptionRaw?.replace(/\s+/g, " ").slice(0, 160) ??
      `${project.titleEn} — проект застройщика на Ко Пангане${districtSuffix}.`,
    alternates: {
      canonical: `/ru/projects/${slug}`,
      languages: { en: `/projects/${slug}`, ru: `/ru/projects/${slug}` },
    },
  };
}

export default async function RuProjectLandingPage({ params }: Props) {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) notFound();
  return <ProjectLanding project={found.project} catalog={found.catalog} locale="ru" />;
}

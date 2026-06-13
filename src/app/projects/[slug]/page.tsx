import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublicProjects, projectSlug } from "@/lib/data/projects";
import { ProjectLanding } from "@/components/projects/project-landing";
import { ObjectJsonLd } from "@/components/objects/object-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { getSiteUrl } from "@/lib/site-url";

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
  if (!found) return { title: "Project not found" };
  const { project } = found;
  const districtSuffix = project.district ? ` in ${project.district}` : "";
  return {
    title: `${project.titleEn} — ${project.rwNumber}`,
    description:
      project.descriptionRaw?.replace(/\s+/g, " ").slice(0, 160) ??
      `${project.titleEn} — developer project on Koh Phangan${districtSuffix}.`,
    alternates: {
      canonical: `/projects/${slug}`,
      languages: { en: `/projects/${slug}`, ru: `/ru/projects/${slug}`, "x-default": `/projects/${slug}` },
    },
  };
}

export default async function ProjectLandingPage({ params }: Props) {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) notFound();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/projects/${slug}`;
  return (
    <>
      <ObjectJsonLd object={found.project} url={pageUrl} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", url: `${siteUrl}/` },
          { name: "Projects", url: `${siteUrl}/projects` },
          { name: found.project.rwNumber, url: pageUrl },
        ]}
      />
      <ProjectLanding project={found.project} catalog={found.catalog} locale="en" />
    </>
  );
}

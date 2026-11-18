import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublicProjects, projectSlug } from "@/lib/data/projects";
import { ProjectLanding } from "@/components/projects/project-landing";
import { TrackView } from "@/components/objects/track-view";
import { ObjectJsonLd } from "@/components/objects/object-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.map((p) => ({ slug: projectSlug(p, projects) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) return { title: "ไม่พบโครงการ" };
  const { project } = found;
  const districtSuffix = project.district ? ` ย่าน${project.district}` : "";
  return {
    title: `${project.titleEn} — ${project.rwNumber}`,
    description:
      (project.descriptionManualEn ?? project.descriptionRaw)?.replace(/\s+/g, " ").slice(0, 160) ??
      `${project.titleEn} — โครงการของผู้พัฒนาบนเกาะพะงัน${districtSuffix}`,
    alternates: {
      canonical: `/th/projects/${slug}`,
      languages: { en: `/projects/${slug}`, ru: `/ru/projects/${slug}`, th: `/th/projects/${slug}`, "x-default": `/projects/${slug}` },
    },
  };
}

export default async function ThaiProjectLandingPage({ params }: Props) {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) notFound();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/th/projects/${slug}`;
  return (
    <>
      <ObjectJsonLd object={found.project} url={pageUrl} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "หน้าแรก", url: `${siteUrl}/th` },
          { name: "โครงการ", url: `${siteUrl}/th/projects` },
          { name: found.project.rwNumber, url: pageUrl },
        ]}
      />
      <TrackView rw={found.project.rwNumber} recents={false} />
      <ProjectLanding project={found.project} catalog={found.catalog} locale="th" />
    </>
  );
}

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
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";

/** Developer landing — all of one developer's projects in one place. */
export async function DeveloperPage({ slug, locale }: { slug: string; locale: Locale }) {
  const t = getProjectsDict(locale);
  const dev = await getDeveloperBySlug(slug);
  if (!dev) notFound();

  const allProjects = await getPublicProjects();
  const allObjects = await getAllObjects();

  return (
    <section className="container-prose py-24 md:py-32">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={localePath(locale, "/projects") as Route}>
          <ArrowLeft className="h-4 w-4" />
          {t.backToProjects}
        </Link>
      </Button>

      <SectionEyebrow>{t.developer}</SectionEyebrow>
      <h1 className="mt-3 max-w-3xl text-balance">{dev.name}</h1>
      <p className="mt-3 text-sm text-forest-500/55">{t.count(dev.projects.length)}</p>

      <Reveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dev.projects.map((project) => {
          const units = getProjectUnits(project, allObjects);
          const availability = projectAvailability(project, units);
          const href = localePath(locale, `/projects/${projectSlug(project, allProjects)}`);
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
    </section>
  );
}

import { getPublicProjects, getProjectUnits, projectAvailability, projectSlug } from "@/lib/data/projects";
import { getAllObjects } from "@/lib/data/objects";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { ProjectCard } from "./project-card";
import { Appear } from "@/components/motion/appear";

/** Shared index grid for /projects and /ru/projects. */
export async function ProjectsIndex({ locale }: { locale: Locale }) {
  const t = getProjectsDict(locale);
  const projects = await getPublicProjects();
  const allObjects = await getAllObjects();

  return (
    <section className="container-prose py-10 md:py-14 aura">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">{t.eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-balance">{t.indexTitle}</h1>
      <p className="mt-3 max-w-2xl text-base text-forest-500/70">{t.indexLede}</p>
      <p className="mt-2 text-sm text-forest-500/55">{t.count(projects.length)}</p>

      {projects.length === 0 ? (
        <p className="mt-12 rounded-sm border border-dashed border-forest-500/20 p-10 text-center text-forest-500/60">
          {t.empty}
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const units = getProjectUnits(project, allObjects);
            const availability = projectAvailability(project, units);
            const href = localePath(locale, `/projects/${projectSlug(project, projects)}`);
            return (
              <Appear key={project.rwNumber} delay={(i % 3) * 0.08} className="h-full">
                <ProjectCard
                  project={project}
                  href={href}
                  availability={availability}
                />
              </Appear>
            );
          })}
        </div>
      )}
    </section>
  );
}

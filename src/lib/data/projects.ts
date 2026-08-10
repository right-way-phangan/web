import "server-only";
import { getPublicObjects, getAllObjects, sanitizePublicObject } from "@/lib/data/objects";
import type { RealEstateObject } from "@/types/object";

/** A unit card belongs to a project: RW-P####-N (project number + "-N"). */
export function isProjectUnit(rwNumber: string): boolean {
  return /^RW-P\d+-\d+/i.test(rwNumber);
}

/** Parent project RW number for a unit ("RW-P0001-3" → "RW-P0001"). */
export function parentProjectRw(rwNumber: string): string {
  return rwNumber.replace(/-\d+$/, "");
}

/**
 * Developer-project (off-plan) data layer. A "project" is an amoCRM catalog
 * element of type "Project" (RW-P series). Its sellable units are — by the
 * numbering convention (CLAUDE.md → project_object_numbering) — elements whose
 * RW number is the project's number plus a `-N` suffix (RW-P0001-3).
 *
 * Hybrid model: until per-unit cards are entered, "remaining" comes from the
 * project's own unitsTotal/unitsAvailable fields. Once unit cards exist,
 * getProjectUnits() picks them up and counts live from their statuses — no
 * rewrite needed downstream.
 *
 * Publication rule is inherited from getPublicObjects(): only Active objects
 * with an RW number surface. A project with no photos / Reserved status stays
 * off the public site until it is flipped Active (same gate as listings).
 */

/** URL-safe slug from a project title: "Atmos Villas (1BR…)" → "atmos-villas". */
export function slugifyProject(titleEn: string): string {
  const base = titleEn.split("(")[0]; // drop the parenthetical descriptor
  return base
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Build the slug for a project, disambiguating collisions against the full set
 * by appending the RW number suffix (so two "…Paradise" projects stay unique
 * and stable). Pass the same catalog used by the index for consistent links.
 */
export function projectSlug(project: RealEstateObject, all: RealEstateObject[]): string {
  const base = slugifyProject(project.titleEn);
  const clashes = all.filter(
    (p) => p.rwNumber !== project.rwNumber && slugifyProject(p.titleEn) === base,
  );
  if (clashes.length === 0) return base;
  return `${base}-${project.rwNumber.replace(/^RW-/i, "").toLowerCase()}`;
}

/** All publicly visible developer projects (Active, type Project), sorted. */
export async function getPublicProjects(): Promise<RealEstateObject[]> {
  const all = await getPublicObjects();
  return all.filter((o) => o.type === "Project");
}

/** Resolve a project by its slug. Returns the project + the catalog it lives in. */
export async function getProjectBySlug(
  slug: string,
): Promise<{ project: RealEstateObject; catalog: RealEstateObject[] } | null> {
  const catalog = await getPublicObjects();
  const projects = catalog.filter((o) => o.type === "Project");
  const project = projects.find((p) => projectSlug(p, projects) === slug);
  return project ? { project, catalog } : null;
}

/**
 * Sellable unit cards belonging to a project (RW-P0001-N), filtered from a
 * provided object list by RW-number prefix. Pure — pass all-status objects
 * (getAllObjects) so sold/reserved units appear too, not just Active ones.
 */
export function getProjectUnits(
  project: RealEstateObject,
  objects: RealEstateObject[],
): RealEstateObject[] {
  const prefix = `${project.rwNumber}-`;
  return objects
    .filter(
      (o) =>
        o.rwNumber.startsWith(prefix) &&
        // Withdrawn / Archive units aren't inventory — keep them out of the
        // unit list and availability totals.
        o.status !== "Withdrawn" &&
        (o.status as string) !== "Archive",
    )
    .sort((a, b) => a.rwNumber.localeCompare(b.rwNumber, undefined, { numeric: true }));
}

/** Async convenience: a project's unit cards across all statuses. */
export async function getProjectUnitsAll(project: RealEstateObject): Promise<RealEstateObject[]> {
  // getAllObjects is unsanitized (admin source) and these unit cards land on
  // the public /projects/[slug] page — strip internal fields here too.
  const all = await getAllObjects();
  return getProjectUnits(project, all).map(sanitizePublicObject);
}

export interface ProjectAvailability {
  total?: number;
  available?: number;
  /** true when counts come from real unit cards, false when from project fields. */
  fromUnits: boolean;
}

/**
 * Remaining-units summary. Prefers real unit cards (counts Active as available);
 * falls back to the project's own unitsTotal/unitsAvailable fields.
 */
export function projectAvailability(
  project: RealEstateObject,
  units: RealEstateObject[],
): ProjectAvailability {
  // Unit cards can describe villa *formats* (Verana has one card per 1/2/3BR
  // layout) rather than every sellable lot. When the project's own count is
  // larger than the number of cards, the developer's figures are the real
  // inventory — counting cards would report "3 of 3" for a 12-villa community.
  const formatsOnly = project.unitsTotal != null && project.unitsTotal > units.length;
  if (units.length > 0 && !formatsOnly) {
    const available = units.filter((u) => u.status === "Active").length;
    return { total: units.length, available, fromUnits: true };
  }
  return {
    total: project.unitsTotal,
    available: project.unitsAvailable,
    fromUnits: false,
  };
}

// ---- Developers (aggregate projects by developer) ----

/** URL-safe slug from a developer name. */
export function developerSlug(name: string): string {
  return slugifyProject(name);
}

export interface DeveloperGroup {
  name: string;
  slug: string;
  projects: RealEstateObject[];
}

/** All developers that have at least one public project, with their projects. */
export async function getDevelopers(): Promise<DeveloperGroup[]> {
  const projects = await getPublicProjects();
  const byName = new Map<string, RealEstateObject[]>();
  for (const p of projects) {
    const name = p.developer?.trim();
    if (!name) continue;
    const list = byName.get(name) ?? [];
    list.push(p);
    byName.set(name, list);
  }
  return [...byName.entries()]
    .map(([name, list]) => ({ name, slug: developerSlug(name), projects: list }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Resolve a developer by slug → its projects. */
export async function getDeveloperBySlug(slug: string): Promise<DeveloperGroup | null> {
  const devs = await getDevelopers();
  return devs.find((d) => d.slug === slug) ?? null;
}

/** Does this developer have a dedicated page (≥1 public project)? */
export async function developerHasPage(name?: string): Promise<boolean> {
  if (!name?.trim()) return false;
  const devs = await getDevelopers();
  return devs.some((d) => d.name === name.trim());
}

import "server-only";
import type { RealEstateObject } from "@/types/object";
import { getDeveloperBySlug, getProjectUnitsAll, getPublicProjects, projectSlug } from "@/lib/data/projects";
import { getViewsByRw, type ObjectViews } from "@/lib/data/views";
import { getEngagementByRw, type ObjectEngagement } from "@/lib/data/events";
import { getLeads, type CrmLead } from "@/lib/data/leads";

/**
 * Партнёрский отчёт застройщика: только агрегаты по его проектам — просмотры,
 * уникальные посетители, клики по контактам, калькулятор, сохранения и число
 * лидов. Никаких имён и телефонов: лиды ведёт Right Way, застройщик видит
 * счётчики и дату последнего обращения.
 */
export interface PartnerRow {
  rwNumber: string;
  title: string;
  slug: string;
  status: string;
  views7: number;
  views30: number;
  uniques30: number;
  clicks30: number;
  calc30: number;
  save30: number;
  leads30: number;
  leadsTotal: number;
  lastLeadAt: string | null;
}

export interface PartnerReport {
  name: string;
  slug: string;
  rows: PartnerRow[];
  totals: Pick<PartnerRow, "views7" | "views30" | "uniques30" | "clicks30" | "calc30" | "save30" | "leads30" | "leadsTotal">;
  generatedAt: string;
}

const DAY_MS = 86_400_000;

export function buildPartnerRows(
  projects: RealEstateObject[],
  unitsByProject: Map<string, string[]>,
  views: Map<string, ObjectViews>,
  engagement: Map<string, ObjectEngagement>,
  leads: CrmLead[],
  slugOf: (p: RealEstateObject) => string,
  now = Date.now(),
): PartnerRow[] {
  const since30 = now - 30 * DAY_MS;
  return projects.map((p) => {
    const rws = new Set([p.rwNumber, ...(unitsByProject.get(p.rwNumber) ?? [])]);
    // просмотры/события юнитов складываем в проект — застройщику важна витрина целиком
    let views7 = 0, views30 = 0, uniques30 = 0, clicks30 = 0, calc30 = 0, save30 = 0;
    for (const rw of rws) {
      const v = views.get(rw);
      if (v) { views7 += v.d7; views30 += v.d30; uniques30 += v.uniques30; }
      const e = engagement.get(rw);
      if (e) { clicks30 += e.clicks; calc30 += e.calc; save30 += e.save; }
    }
    const own = leads.filter((l) => l.rwNumber && rws.has(l.rwNumber));
    const times = own.map((l) => Date.parse(l.createdAt)).filter((t) => Number.isFinite(t));
    const last = times.length ? Math.max(...times) : null;
    return {
      rwNumber: p.rwNumber,
      title: p.titleEn,
      slug: slugOf(p),
      status: p.status,
      views7, views30, uniques30, clicks30, calc30, save30,
      leads30: times.filter((t) => t >= since30).length,
      leadsTotal: own.length,
      lastLeadAt: last ? new Date(last).toISOString().slice(0, 10) : null,
    };
  });
}

export function sumRows(rows: PartnerRow[]): PartnerReport["totals"] {
  const t = { views7: 0, views30: 0, uniques30: 0, clicks30: 0, calc30: 0, save30: 0, leads30: 0, leadsTotal: 0 };
  for (const r of rows) for (const k of Object.keys(t) as (keyof typeof t)[]) t[k] += r[k];
  return t;
}

export async function getPartnerReport(slug: string): Promise<PartnerReport | null> {
  const dev = await getDeveloperBySlug(slug);
  if (!dev) return null;
  const [all, views, engagement, leads, unitLists] = await Promise.all([
    getPublicProjects(),
    getViewsByRw(),
    getEngagementByRw(),
    getLeads(),
    Promise.all(dev.projects.map((p) => getProjectUnitsAll(p))),
  ]);
  const unitsByProject = new Map(dev.projects.map((p, i) => [p.rwNumber, unitLists[i].map((u) => u.rwNumber)]));
  const rows = buildPartnerRows(dev.projects, unitsByProject, views, engagement, leads, (p) => projectSlug(p, all));
  rows.sort((a, b) => b.views30 - a.views30);
  return { name: dev.name, slug: dev.slug, rows, totals: sumRows(rows), generatedAt: new Date().toISOString().slice(0, 10) };
}

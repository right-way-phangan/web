"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { Building2, MapPin, CalendarClock } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { ProjectAvailability } from "@/lib/data/projects";
import { formatPriceCompact } from "@/lib/utils/price";
import { useLocale } from "@/lib/i18n/use-locale";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";
import { AvailabilityBar } from "./availability-bar";
import { StageBadge } from "./stage-badge";

function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

interface Props {
  project: RealEstateObject;
  href: string;
  availability: ProjectAvailability;
}

/** Index-grid card for a developer project — links to its landing page. */
export function ProjectCard({ project, href, availability }: Props) {
  const locale = useLocale();
  const t = getProjectsDict(locale);
  const h = hue(project.rwNumber);
  const { total, available } = availability;

  return (
    <Link
      href={href as Route}
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50 card-elevated transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-forest-500/30 hover:shadow-2xl hover:shadow-panel/15 motion-reduce:hover:translate-y-0"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden bg-forest-500/5"
        style={
          project.coverImage
            ? undefined
            : {
                backgroundImage: `linear-gradient(135deg, hsl(${h} 30% 88%) 0%, hsl(${(h + 40) % 360} 25% 78%) 100%)`,
              }
        }
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.titleEn}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/25">
            <Building2 className="h-16 w-16" strokeWidth={1} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-sm bg-cream-50/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-forest-500 backdrop-blur-sm">
            {project.rwNumber}
          </span>
          <StageBadge stage={project.stage} locale={locale} className="bg-cream-50/90 backdrop-blur-sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-forest-500/60">
          {project.developer ? <span className="font-medium">{project.developer}</span> : null}
          {project.district ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {project.district}
            </span>
          ) : null}
        </div>

        <h3 className="font-serif text-xl leading-snug text-forest-900 line-clamp-2">
          {project.titleEn}
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-3">
          {project.priceThb ? (
            <p className="num text-lg text-forest-900">
              <span className="text-xs font-sans text-forest-500/55">{t.from} </span>
              {formatPriceCompact(project.priceThb)}
            </p>
          ) : null}
          {project.completion ? (
            <span className="inline-flex items-center gap-1 text-xs text-forest-500/55">
              <CalendarClock className="h-3 w-3" />
              {project.completion}
            </span>
          ) : null}
        </div>

        {total ? (
          <div className="mt-auto space-y-1.5 pt-1">
            <AvailabilityBar total={total} available={available} />
            <p
              className={cn(
                "text-xs",
                (available ?? 0) > 0 && (available ?? 0) <= 2
                  ? "font-medium text-brass-600 dark:text-urgent"
                  : "text-forest-500/60",
              )}
            >
              {(available ?? 0) <= 0
                ? t.soldOut
                : (available ?? 0) <= 2
                  ? t.unitsLeft(available ?? 0)
                  : t.available(available ?? 0, total)}
            </p>
          </div>
        ) : (
          <span className="mt-auto pt-1 text-sm text-brass-500 transition-colors group-hover:text-brass-600">
            {t.viewProject} →
          </span>
        )}
      </div>
    </Link>
  );
}

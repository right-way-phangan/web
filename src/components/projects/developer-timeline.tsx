import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { STAGE_STYLE } from "./stage-badge";
import type {
  ResolvedTimelineEntry,
  TimelineStatus,
} from "@/content/developers/types";

// Reuse the catalog stage colors (stage-badge.tsx) so both pills stay in sync;
// labels differ (Delivered/Planned vs Ready/Off-plan), so only styles are shared.
const STATUS_TO_STAGE: Record<TimelineStatus, string> = {
  built: "Ready",
  "under-construction": "Under construction",
  planned: "Off-plan",
};

/** Cross-project track-record timeline for a developer page (delivered + in-progress projects). */
export function DeveloperTimeline({
  items,
  locale,
}: {
  items: ResolvedTimelineEntry[];
  locale: Locale;
}) {
  const t = getProjectsDict(locale);
  return (
    <ol className="relative ml-2 space-y-8 border-l border-forest-500/15 pl-6">
      {items.map((entry) => {
        // A "stub" entry — just a project name, no confirmed status/details yet.
        // Render it dimmed with a "Coming soon" pill so the portfolio still reads
        // as 6 projects without looking unfinished (details arrive from the developer).
        const isSoon = !entry.status && !entry.description;
        return (
          <li
            key={entry.title}
            className={cn("relative", isSoon && "opacity-60")}
          >
            <span
              className={cn(
                "absolute -left-[1.69rem] top-1 h-3 w-3 rounded-full border-2 border-panel-fg",
                isSoon ? "bg-forest-500/25" : "bg-brass-500",
              )}
            />
            {entry.year ? (
              <div className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">
                {entry.year}
              </div>
            ) : null}
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-medium text-forest-900">{entry.title}</span>
              {entry.status ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em]",
                    STAGE_STYLE[STATUS_TO_STAGE[entry.status]],
                  )}
                >
                  {t.developers.status[entry.status]}
                </span>
              ) : isSoon ? (
                <span className="inline-flex items-center rounded-sm bg-forest-900/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-forest-500/60">
                  {t.developers.status.soon}
                </span>
              ) : null}
            </div>
            {entry.note ? (
              <div className="mt-0.5 text-xs text-forest-500/60">
                {entry.note[locale]}
              </div>
            ) : null}
            {entry.description ? (
              <p className="mt-1.5 max-w-prose text-sm text-forest-500/85">
                {entry.description[locale]}
              </p>
            ) : null}
            {entry.photo ? (
              <Image
                src={entry.photo}
                alt={entry.title}
                width={560}
                height={340}
                className="mt-3 h-auto max-w-full rounded-sm object-cover"
              />
            ) : null}
            {entry.href ? (
              <Link
                href={entry.href as Route}
                className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-forest-900 underline-offset-4 hover:underline"
              >
                {t.viewProject}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

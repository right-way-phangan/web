"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { Transition } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { STAGE_STYLE } from "./stage-badge";
import { useDeveloperPhotos } from "./developer-photos";
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

// Positional moves (the ring on the rail, the caret under it) travel on a
// spring; content crossfades on a short ease — a spring on opacity reads mushy.
const SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.8,
};
const FADE: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };
const FADE_OUT: Transition = { duration: 0.1, ease: [0.4, 0, 1, 1] };

/**
 * A "stub" entry — just a project name, no confirmed details yet. Shows a
 * "Coming soon" pill + muted dot so the portfolio reads as N projects without
 * looking unfinished (details arrive from the developer). An entry carrying a
 * note (a real secondary detail) is not a stub.
 */
const isStub = (e: ResolvedTimelineEntry) => !e.status && !e.description && !e.note;

function StatusPill({
  entry,
  locale,
}: {
  entry: ResolvedTimelineEntry;
  locale: Locale;
}) {
  const t = getProjectsDict(locale);
  const cls =
    "inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em]";
  if (entry.status)
    return (
      <span className={cn(cls, STAGE_STYLE[STATUS_TO_STAGE[entry.status]])}>
        {t.developers.status[entry.status]}
      </span>
    );
  if (isStub(entry))
    return (
      <span className={cn(cls, "bg-forest-900/[0.06] text-forest-600")}>
        {t.developers.status.soon}
      </span>
    );
  return null;
}

/**
 * The expanded card for one project — shared by the desktop panel and the
 * mobile accordion. The accordion row already carries year/title/status, so it
 * asks for `heading={false}` instead of repeating them inside the card.
 */
function EntryDetail({
  entry,
  locale,
  heading = true,
}: {
  entry: ResolvedTimelineEntry;
  locale: Locale;
  heading?: boolean;
}) {
  const t = getProjectsDict(locale);
  // Кадры проекта живут в общем альбоме; связь — по названию проекта.
  const photos = useDeveloperPhotos();
  const shots = photos?.countOf(entry.title) ?? 0;
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-7">
      {/* Fixed frame height on md+ keeps every project's card the same size, so
          the desktop panel does not jump as you move along the rail. A project
          whose photos haven't arrived yet keeps the frame as an empty plate. */}
      <div
        className={cn(
          "group/photo relative aspect-[3/2] overflow-hidden rounded-sm md:aspect-auto md:h-64",
          entry.photo
            ? "bg-forest-900/[0.04]"
            : "flex items-center justify-center border border-dashed border-forest-500/20",
        )}
      >
        {entry.photo ? (
          <Image
            src={entry.photo}
            alt={entry.title}
            width={720}
            height={480}
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 480px, 100vw"
          />
        ) : (
          <ImageIcon aria-hidden className="h-7 w-7 text-forest-500/25" />
        )}
        {shots > 0 ? (
          <button
            type="button"
            onClick={() => photos?.openGroup(entry.title)}
            className="absolute inset-0 flex items-end justify-start bg-panel/0 p-3 text-left transition-colors duration-200 hover:bg-panel/35 focus-visible:bg-panel/35 focus-visible:outline-none"
          >
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-panel/80 px-2.5 py-1.5 text-xs font-medium text-panel-fg opacity-0 transition-opacity duration-200 group-hover/photo:opacity-100 group-focus-within/photo:opacity-100">
              <ImageIcon aria-hidden className="h-3.5 w-3.5" />
              {t.developers.viewPhotos(shots)}
            </span>
          </button>
        ) : null}
      </div>
      <div>
        {heading ? (
          <>
            {/* Года нет — молчим: «Даты уточняются» в каждой второй карточке
                читалось как четыре одинаковые заглушки подряд. Один раз про это
                сказано сноской под лентой. */}
            {entry.year ? (
              <div className="text-xs font-medium uppercase tracking-eyebrow text-brass-500">
                {entry.year}
              </div>
            ) : null}
            <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", entry.year && "mt-1.5")}>
              <h3 className="font-serif text-2xl text-forest-900">
                {entry.title}
              </h3>
              <StatusPill entry={entry} locale={locale} />
            </div>
          </>
        ) : null}
        {entry.note ? (
          <div className="mt-1 text-sm text-forest-500/60">
            {entry.note[locale]}
          </div>
        ) : null}
        <p className="mt-3 max-w-prose text-forest-500/85">
          {entry.description
            ? entry.description[locale]
            : t.developers.soonLede}
        </p>
        {entry.href ? (
          <Link
            href={entry.href as Route}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-forest-900 underline-offset-4 hover:underline"
          >
            {entry.objectRw ? t.developers.viewListing : t.viewProject}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Cross-project track record for a developer page.
 *
 * Desktop (lg+): a horizontal rail — one node per project, chronological left
 * to right — with a panel below it that opens the hovered/selected project;
 * the caret under the rail travels to the active node, so the card always
 * reads as belonging to a point on the timeline. Positions are evenly spaced,
 * not scaled by date: only some projects have confirmed years (see
 * `dateTbc`), and a proportional axis would invent the missing ones.
 *
 * Mobile: the same entries as a vertical accordion — tap opens one card.
 * Its panels are never unmounted (height/visibility only), so every project's
 * text stays in the HTML for crawlers even though only one is on screen.
 */
export function DeveloperTimeline({
  items,
  locale,
}: {
  items: ResolvedTimelineEntry[];
  locale: Locale;
}) {
  const t = getProjectsDict(locale);
  const reduce = useReducedMotion();
  const baseId = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  // Лента открывается с начала: то, что продаётся, и так вынесено в отдельные
  // секции ниже, а раскрытый четвёртый ряд на телефоне читался как сбой.
  const initial = 0;
  // -1 = every mobile accordion row closed; the rail always keeps one open.
  const [selected, setSelected] = useState(initial);
  const [hovered, setHovered] = useState<number | null>(null);
  // Hover previews without committing the selection (Emil Kowalski: pointing at
  // something should show it, clicking should keep it).
  const shown = Math.max(0, hovered ?? selected);
  // Which rail tab is *selected* (roving tabindex) — hover only previews.
  const active = Math.max(0, selected);
  const spring: Transition = reduce ? { duration: 0 } : SPRING;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step =
      e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    let next = -1;
    if (step) next = (active + step + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setSelected(next);
    setHovered(null);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <p className="mb-8 mt-3 text-sm text-forest-500/60">
        <span className="hidden lg:inline">{t.developers.timelineHint}</span>
        <span className="lg:hidden">{t.developers.timelineHintTouch}</span>
        {items.some((e) => !e.year) ? (
          <span className="block">{t.developers.dateTbc}</span>
        ) : null}
      </p>

      {/* Desktop rail */}
      <div className="hidden lg:block">
        <div
          role="tablist"
          aria-label={t.developers.historyTitle}
          aria-orientation="horizontal"
          className="relative"
          onKeyDown={onKeyDown}
          onPointerLeave={() => setHovered(null)}
        >
          {/* The line runs through the dot centres: 20px year row + 10px gap + 6px half-dot. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-9 h-px bg-gradient-to-r from-brass-500/50 via-brass-500/25 to-forest-500/10"
          />
          <div
            className="relative grid gap-x-2"
            style={{
              gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            }}
          >
            {items.map((entry, i) => (
              <button
                key={entry.title}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-controls={`${baseId}-panel`}
                aria-selected={active === i}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setSelected(i)}
                onFocus={() => setHovered(null)}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHovered(i);
                }}
                className="group flex flex-col items-center rounded-sm px-2 pb-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-brass-500/60"
              >
                <span className="flex h-5 items-center text-xs font-medium uppercase tracking-eyebrow text-brass-500">
                  {entry.year ?? ""}
                </span>
                <span className="relative mt-2.5 flex h-3 w-3 items-center justify-center">
                  {shown === i ? (
                    <motion.span
                      layoutId={`${baseId}-ring`}
                      transition={spring}
                      className="absolute -inset-[0.45rem] rounded-full border border-brass-500/40 bg-brass-500/10"
                    />
                  ) : null}
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full border-2 border-cream-100 transition-transform duration-200 group-hover:scale-110",
                      isStub(entry) ? "bg-forest-500/25" : "bg-brass-500",
                      shown === i && "scale-110",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "mt-4 text-sm font-medium transition-colors duration-200",
                    shown === i
                      ? "text-forest-900"
                      : "text-forest-500/70 group-hover:text-forest-900",
                  )}
                >
                  {entry.title}
                </span>
                <span className="mt-2">
                  <StatusPill entry={entry} locale={locale} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* The caret rides to the active node, tying the card to its point on the rail. */}
        <div
          aria-hidden
          className="relative z-10 mt-7 grid"
          style={{
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          }}
        >
          {items.map((entry, i) => (
            <div key={entry.title} className="flex justify-center">
              {shown === i ? (
                <motion.div layoutId={`${baseId}-caret`} transition={spring}>
                  {/* Rotation lives on a child: motion writes its own transform on the layout element. */}
                  <div className="h-3 w-3 translate-y-1/2 rotate-45 border-l border-t border-forest-500/15 bg-cream-50" />
                </motion.div>
              ) : null}
            </div>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${active}`}
          // min-h matches the photo frame + padding, so entries without a photo
          // (details still to come from the developer) keep the panel steady.
          className="min-h-[19rem] rounded-sm border border-forest-500/15 bg-cream-50 p-6"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={shown}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={reduce ? { duration: 0 } : FADE}
            >
              <EntryDetail entry={items[shown]} locale={locale} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile / tablet: the same entries as an accordion */}
      <ol className="relative ml-2 space-y-2 border-l border-forest-500/15 pl-6 lg:hidden">
        {items.map((entry, i) => {
          const open = selected === i;
          return (
            <li key={entry.title} className="relative">
              <span
                className={cn(
                  "absolute -left-[1.69rem] top-4 h-3 w-3 rounded-full border-2 border-cream-100 transition-transform duration-200",
                  isStub(entry) ? "bg-forest-500/25" : "bg-brass-500",
                  open && "scale-110",
                )}
              />
              <button
                type="button"
                onClick={() => setSelected(open ? -1 : i)}
                aria-expanded={open}
                aria-controls={`${baseId}-acc-${i}`}
                className="flex min-h-[44px] w-full items-center justify-between gap-3 py-2 text-left"
              >
                <span>
                  {entry.year ? (
                    <span className="block text-xs font-medium uppercase tracking-eyebrow text-brass-500">
                      {entry.year}
                    </span>
                  ) : null}
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="font-medium text-forest-900">
                      {entry.title}
                    </span>
                    <StatusPill entry={entry} locale={locale} />
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-forest-500/50 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
              <motion.div
                id={`${baseId}-acc-${i}`}
                initial={false}
                animate={open ? "open" : "closed"}
                variants={{
                  open: { height: "auto", opacity: 1, visibility: "visible" },
                  closed: {
                    height: 0,
                    opacity: 0,
                    transitionEnd: { visibility: "hidden" },
                  },
                }}
                transition={reduce ? { duration: 0 } : open ? FADE : FADE_OUT}
                // Collapsed already in the SSR markup: without this the closed
                // rows render full height until hydration and then snap shut (CLS).
                style={
                  open ? undefined : { height: 0, visibility: "hidden" }
                }
                className="overflow-hidden"
              >
                <div className="pb-4 pt-1">
                  <EntryDetail entry={entry} locale={locale} heading={false} />
                </div>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

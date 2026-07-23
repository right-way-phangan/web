import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { getPendingArticleCount } from "@/lib/data/articles";
import { getGuideDraftCount } from "@/lib/data/guide";
import { getOpenTaskCount } from "@/lib/data/agent-tasks";
import { getDraftPostCount } from "@/lib/data/social-posts";
import { ADMIN_SECTIONS, helpHrefFor, type AdminSection } from "@/lib/admin-sections";

/**
 * Shared sub-navigation for the /admin area (objects DB · CRM · articles · …).
 * `active` highlights the current section. Async server component — fetches the
 * "articles awaiting review" count itself so the badge shows on every admin
 * page; callers may pass `pendingArticles` to override (avoids a duplicate
 * fetch on pages that already loaded it). Sections come from the single
 * registry in lib/admin-sections.ts (shared with the guide gap-detector).
 */

export type { AdminSection };

export async function AdminNav({
  active,
  pendingArticles,
}: {
  active: AdminSection;
  /** Count for the "Статьи" badge — fetched if omitted. */
  pendingArticles?: number;
}) {
  const pending = pendingArticles ?? (await getPendingArticleCount());
  // Бейдж на «Справочник» — число страниц-черновиков, ждущих вычитки
  // (видно с любой страницы админки, не только с обзора справочника).
  // Бейдж «Агенты» — число открытых задач AI-команды.
  const [drafts, openTasks, draftPosts] = await Promise.all([
    getGuideDraftCount(),
    getOpenTaskCount(),
    getDraftPostCount(),
  ]);
  // Контекстная справка: каждая рабочая страница ведёт на свой раздел учебника
  // (/admin/guide), в новой вкладке — чтобы не терять рабочий контекст.
  const helpHref = helpHrefFor(active);
  const items = ADMIN_SECTIONS.map((s) => ({
    key: s.key,
    href: s.href,
    label: s.label,
    badge:
      s.key === "articles"
        ? pending
        : s.key === "guide"
          ? drafts
          : s.key === "agents"
            ? openTasks
            : s.key === "posts"
              ? draftPosts
              : undefined,
  }));
  const activeLabel = items.find((it) => it.key === active)?.label ?? "Разделы";

  // Один и тот же набор чипов рендерим в двух контейнерах: на мобильном —
  // внутри свёрнутого <details> (одна строка, не съедает первый экран), на
  // десктопе — плоским рядом как раньше. Логика элементов общая (chips/helpLink).
  const chips = items.map((it) => {
    const on = it.key === active;
    return (
      <Link
        key={it.key}
        href={it.href}
        className={
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition " +
          (on
            ? "bg-panel text-panel-fg"
            : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
        }
      >
        {it.label}
        {it.badge ? (
          <span
            className={
              "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold " +
              (on ? "bg-cream-50/20 text-panel-fg" : "bg-brass-500 text-panel-fg")
            }
          >
            {it.badge}
          </span>
        ) : null}
      </Link>
    );
  });

  const helpLink =
    active !== "guide" ? (
      <Link
        href={helpHref as Route}
        target="_blank"
        title="Как работает этот раздел — открыть справочник"
        className="inline-flex items-center gap-1.5 rounded-full border border-brass-500/40 px-3 py-1.5 text-sm font-medium text-brass-600 transition hover:bg-brass-500/10 lg:ml-auto"
      >
        ❓ Как это работает
      </Link>
    ) : null;

  return (
    <nav aria-label="Разделы админки" className="mb-6 border-b border-forest-900/10 pb-4">
      {/* Мобильный: свёрнутый список разделов — раскрывается по тапу, не съедает экран */}
      <details className="group lg:hidden">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 rounded-xl bg-forest-900/5 px-4 py-2.5 text-sm font-medium text-forest-900 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-forest-900/50">Раздел:</span>
            <span className="truncate">{activeLabel}</span>
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-forest-900/50 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips}
          {helpLink}
        </div>
      </details>

      {/* Десктоп: плоский ряд чипов как раньше */}
      <div className="hidden lg:flex lg:flex-wrap lg:gap-2">
        {chips}
        {helpLink}
      </div>
    </nav>
  );
}

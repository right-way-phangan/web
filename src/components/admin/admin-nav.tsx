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
  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-forest-900/10 pb-4">
      {items.map((it) => {
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
      })}
      {active !== "guide" && (
        <Link
          href={helpHref as Route}
          target="_blank"
          title="Как работает этот раздел — открыть справочник"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-brass-500/40 px-3 py-1.5 text-sm font-medium text-brass-600 transition hover:bg-brass-500/10"
        >
          ❓ Как это работает
        </Link>
      )}
    </nav>
  );
}

import Link from "next/link";
import type { Route } from "next";
import { getPendingArticleCount } from "@/lib/data/articles";

/**
 * Shared sub-navigation for the /admin area (objects DB · CRM · articles · …).
 * `active` highlights the current section. Async server component — fetches the
 * "articles awaiting review" count itself so the badge shows on every admin
 * page; callers may pass `pendingArticles` to override (avoids a duplicate
 * fetch on pages that already loaded it).
 */
type AdminSection =
  | "home"
  | "objects"
  | "dd"
  | "outreach"
  | "crm"
  | "articles"
  | "finance"
  | "guide"
  | "new";

export async function AdminNav({
  active,
  pendingArticles,
}: {
  active: AdminSection;
  /** Count for the "Статьи" badge — fetched if omitted. */
  pendingArticles?: number;
}) {
  const pending = pendingArticles ?? (await getPendingArticleCount());
  // Контекстная справка: каждая рабочая страница ведёт на свой раздел учебника
  // (/admin/guide). Открывается в новой вкладке — чтобы не терять рабочий
  // контекст. Для страниц без своей статьи — общий обзор справочника.
  const HELP_SLUG: Partial<Record<AdminSection, string>> = {
    objects: "objects",
    dd: "dd",
    outreach: "outreach",
    crm: "crm",
    articles: "articles",
    finance: "analytics",
    new: "objects",
  };
  const helpHref =
    active in HELP_SLUG ? `/admin/guide/${HELP_SLUG[active]}` : "/admin/guide";
  const items: Array<{ key: AdminSection; href: Route; label: string; badge?: number }> = [
    { key: "home", href: "/admin" as Route, label: "Дашборд" },
    { key: "objects", href: "/admin/objects" as Route, label: "База объектов" },
    { key: "dd", href: "/admin/dd" as Route, label: "DD · Проверки" },
    { key: "outreach", href: "/admin/outreach" as Route, label: "Обзвон" },
    { key: "crm", href: "/admin/crm" as Route, label: "CRM · Лиды" },
    { key: "articles", href: "/admin/articles" as Route, label: "Статьи", badge: pending },
    { key: "finance", href: "/admin/finance" as Route, label: "Финансы" },
    { key: "guide", href: "/admin/guide" as Route, label: "Справочник" },
    { key: "new", href: "/admin/new" as Route, label: "+ Новый объект" },
  ];
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
                ? "bg-forest-900 text-white"
                : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
            }
          >
            {it.label}
            {it.badge ? (
              <span
                className={
                  "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold " +
                  (on ? "bg-white/20 text-white" : "bg-brass-500 text-white")
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

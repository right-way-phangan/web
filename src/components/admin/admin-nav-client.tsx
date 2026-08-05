"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ADMIN_GROUPS, type AdminGroup } from "@/lib/admin-sections";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  group: AdminGroup | null;
  guideSlug: string | null;
  badge: number;
}

/**
 * Клиентская отрисовка навигации админки. Активный раздел — самый длинный
 * префикс pathname среди href (голый /admin — только точным совпадением),
 * поэтому /admin/crm/tasks подсвечивает и группу CRM, и пункт «Задачи».
 * Десктоп: «Дашборд» + триггеры групп с CSS hover/focus-дропдаунами
 * (механика NavDropdown из хедера сайта, включая pt-мостик). Мобильный:
 * прежний <details>, внутри — чипы, сгруппированные заголовками.
 */
export function AdminNavClient({ sections }: { sections: NavItem[] }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
  const active = sections
    .filter((s) => isActive(s.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const helpHref = active?.guideSlug ? `/admin/guide/${active.guideSlug}` : "/admin/guide";
  const groups = ADMIN_GROUPS.map((g) => ({
    ...g,
    items: sections.filter((s) => s.group === g.key),
  })).filter((g) => g.items.length > 0);
  const home = sections.find((s) => s.key === "home");

  const chip = (it: NavItem) => {
    const on = it.key === active?.key;
    return (
      <Link
        key={it.key}
        href={it.href as Route}
        aria-current={on ? "page" : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
          on ? "bg-panel text-panel-fg" : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10",
        )}
      >
        {it.label}
        <Badge count={it.badge} on={on} />
      </Link>
    );
  };

  const helpLink =
    active?.key !== "guide" ? (
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
      {/* Мобильный: свёрнутый список — раскрывается по тапу, не съедает экран */}
      <details className="group lg:hidden">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 rounded-xl bg-forest-900/5 px-4 py-2.5 text-sm font-medium text-forest-900 [&::-webkit-details-marker]:hidden">
          <span className="truncate">{active?.label ?? "Разделы"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-3 space-y-3">
          {home ? <div className="flex flex-wrap gap-1.5">{chip(home)}</div> : null}
          {groups.map((g) => (
            <div key={g.key}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-900/40">
                {g.label}
              </p>
              <div className="flex flex-wrap gap-1.5">{g.items.map(chip)}</div>
            </div>
          ))}
          <div className="pt-1">{helpLink}</div>
        </div>
      </details>

      {/* Десктоп: Дашборд + группы с дропдаунами */}
      <div className="hidden items-center gap-2 lg:flex">
        {home ? chip(home) : null}
        {groups.map((g) => (
          <GroupDropdown key={g.key} label={g.label} items={g.items} activeKey={active?.key} isActive={isActive} />
        ))}
        {helpLink}
      </div>
    </nav>
  );
}

function Badge({ count, on }: { count: number; on?: boolean }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
        on ? "bg-cream-50/20 text-panel-fg" : "bg-brass-500 text-panel-fg",
      )}
    >
      {count}
    </span>
  );
}

function GroupDropdown({
  label,
  items,
  activeKey,
  isActive,
}: {
  label: string;
  items: NavItem[];
  activeKey?: string;
  isActive: (href: string) => boolean;
}) {
  const groupActive = items.some((it) => it.key === activeKey);
  const badgeSum = items.reduce((n, it) => n + it.badge, 0);
  // Как в NavDropdown хедера: панель живёт на group-hover/focus-within,
  // state только делает aria-expanded правдивым для скринридеров.
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
          groupActive
            ? "bg-panel text-panel-fg"
            : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10",
        )}
      >
        {label}
        <Badge count={badgeSum} on={groupActive} />
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" aria-hidden />
      </button>
      {/* pt-мостик держит ховер между триггером и панелью */}
      <div
        className={cn(
          "invisible absolute left-0 top-full z-50 pt-2 opacity-0",
          "transition-[opacity] duration-150",
          "group-hover:visible group-hover:opacity-100",
          "group-focus-within:visible group-focus-within:opacity-100",
        )}
      >
        <ul
          id={panelId}
          className="min-w-52 rounded-md border border-forest-500/10 bg-cream-50 p-2 shadow-lg shadow-panel/10"
        >
          {items.map((it) => {
            const on = isActive(it.href);
            return (
              <li key={it.key}>
                <Link
                  href={it.href as Route}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-3 whitespace-nowrap rounded-sm px-3 py-2 text-sm transition-colors hover:bg-forest-50 hover:text-brass-500",
                    on ? "font-medium text-brass-500" : "text-forest-500",
                  )}
                >
                  {it.label}
                  <Badge count={it.badge} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

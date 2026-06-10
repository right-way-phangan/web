import Link from "next/link";
import type { Route } from "next";

/**
 * Shared sub-navigation for the /admin area (objects DB · CRM · new object).
 * `active` highlights the current section. Server component — no client JS.
 */
type AdminSection = "home" | "objects" | "crm" | "new";

export function AdminNav({ active }: { active: AdminSection }) {
  const items: Array<{ key: AdminSection; href: Route; label: string }> = [
    { key: "home", href: "/admin" as Route, label: "Дашборд" },
    { key: "objects", href: "/admin/objects" as Route, label: "База объектов" },
    { key: "crm", href: "/admin/crm" as Route, label: "CRM · Лиды" },
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
              "rounded-full px-3 py-1.5 text-sm font-medium transition " +
              (on
                ? "bg-forest-900 text-white"
                : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
            }
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

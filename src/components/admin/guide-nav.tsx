import Link from "next/link";
import type { Route } from "next";
import { GUIDE_SECTIONS, type GuidePageMeta } from "@/lib/data/guide";

/**
 * Оглавление справочника (/admin/guide/*): группы по секциям, активная
 * страница подсвечена. На десктопе — липкая колонка слева, на мобильном —
 * сворачиваемый <details> над статьёй (без клиентского JS). Страницы,
 * обновлённые за последние 14 дней, помечаются бейджем 🆕.
 */

const NEW_DAYS = 14;

function isRecent(updated: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated)) return false;
  const age = Date.now() - new Date(`${updated}T00:00:00`).getTime();
  return age >= 0 && age < NEW_DAYS * 86_400_000;
}

function SectionList({ pages, active }: { pages: GuidePageMeta[]; active?: string }) {
  return (
    <nav className="space-y-5">
      <Link
        href={"/admin/guide" as Route}
        className={
          "block text-sm font-semibold " +
          (active ? "text-forest-900/60 hover:text-forest-900" : "text-brass-600")
        }
      >
        📖 Обзор и что нового
      </Link>
      {GUIDE_SECTIONS.map((s) => {
        const inSection = pages.filter((p) => p.section === s.id);
        if (inSection.length === 0) return null;
        return (
          <div key={s.id}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-forest-900/40">
              {s.title}
            </p>
            <ul className="space-y-0.5">
              {inSection.map((p) => {
                const on = p.slug === active;
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/admin/guide/${p.slug}` as Route}
                      className={
                        "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition " +
                        (on
                          ? "bg-panel font-medium text-panel-fg"
                          : "text-forest-900/70 hover:bg-forest-900/5 hover:text-forest-900")
                      }
                    >
                      <span>{p.title}</span>
                      {p.draft ? (
                        <span
                          title="черновик на проверке"
                          className={
                            "shrink-0 rounded px-1 text-[10px] font-semibold " +
                            (on ? "bg-cream-50/20 text-panel-fg" : "bg-brass-500/15 text-brass-600")
                          }
                        >
                          ✎
                        </span>
                      ) : (
                        isRecent(p.updated) && (
                          <span
                            className={
                              "shrink-0 rounded px-1 text-[10px] font-semibold " +
                              (on ? "bg-cream-50/20 text-panel-fg" : "bg-brass-500/15 text-brass-600")
                            }
                          >
                            🆕
                          </span>
                        )
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function GuideNav({ pages, active }: { pages: GuidePageMeta[]; active?: string }) {
  return (
    <>
      {/* Мобильное оглавление — сворачиваемое, чтобы не отодвигать статью */}
      <details className="mb-6 rounded-xl border border-forest-900/10 bg-cream-50 p-4 lg:hidden">
        <summary className="cursor-pointer select-none text-sm font-semibold text-forest-900">
          Оглавление справочника
        </summary>
        <div className="mt-4">
          <SectionList pages={pages} active={active} />
        </div>
      </details>

      {/* Десктоп — липкая колонка */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-4">
          <SectionList pages={pages} active={active} />
        </div>
      </aside>
    </>
  );
}

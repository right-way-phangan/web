import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { GUIDE_SECTIONS, getGuideChangelog, getGuidePages } from "@/lib/data/guide";

export const metadata: Metadata = {
  title: "Справочник",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Дата YYYY-MM-DD → «13 июня» (год показываем только чужой). */
function fmtDate(d: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(`${d}T00:00:00`);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export default function GuideIndexPage() {
  const pages = getGuidePages();
  const log = getGuideChangelog().slice(0, 8);
  const titleBySlug = new Map(pages.map((p) => [p.slug, p.title]));

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="guide" />
      <div className="max-w-5xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · как тут всё работает
        </p>
        <h1 className="mt-2 font-serif text-3xl text-forest-900">Справочник Right Way</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-900/70">
          Внутренний учебник компании: регламенты, «куда нажимать» в админке, как устроены
          аналитика, калькулятор и боты. Пополняется вместе с каждой новой фишкой — свежие
          изменения в ленте ниже.
        </p>

        {/* Разделы */}
        <div className="mt-8 space-y-8">
          {GUIDE_SECTIONS.map((s) => {
            const inSection = pages.filter((p) => p.section === s.id);
            if (inSection.length === 0) return null;
            return (
              <div key={s.id}>
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-forest-900/40">
                  {s.title}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {inSection.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/admin/guide/${p.slug}` as Route}
                      className="group rounded-2xl border border-forest-900/10 bg-white p-4 transition hover:border-brass-500/50 hover:shadow-sm"
                    >
                      <p className="font-semibold text-forest-900 group-hover:text-brass-600">
                        {p.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-snug text-forest-900/60">{p.summary}</p>
                      {p.updated ? (
                        <p className="mt-3 text-xs text-forest-900/40">
                          обновлено {fmtDate(p.updated)}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Что нового */}
        {log.length > 0 && (
          <div className="mt-10 rounded-2xl border border-forest-900/10 bg-white p-5">
            <h2 className="font-serif text-xl text-forest-900">Что нового</h2>
            <ul className="mt-4 space-y-2.5">
              {log.map((e, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 tabular-nums text-forest-900/40">{fmtDate(e.date)}</span>
                  <span className="text-forest-900/80">
                    {e.slug && titleBySlug.has(e.slug) ? (
                      <>
                        <Link
                          href={`/admin/guide/${e.slug}` as Route}
                          className="font-medium text-forest-500 hover:text-brass-500"
                        >
                          {titleBySlug.get(e.slug)}
                        </Link>
                        {" — "}
                      </>
                    ) : null}
                    {e.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

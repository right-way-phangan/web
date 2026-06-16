import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  GUIDE_SECTIONS,
  getGuideChangelog,
  getGuideCoverage,
  getResolvedGuidePages,
} from "@/lib/data/guide";
import { ADMIN_SECTIONS } from "@/lib/admin-sections";

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

export default async function GuideIndexPage() {
  const allPages = await getResolvedGuidePages();
  const pages = allPages.filter((p) => !p.draft);
  const drafts = allPages.filter((p) => p.draft);
  const log = getGuideChangelog().slice(0, 8);
  const titleBySlug = new Map(allPages.map((p) => [p.slug, p.title]));
  const coverage = getGuideCoverage(ADMIN_SECTIONS);
  const coveredCount = coverage.filter((c) => c.covered).length;
  const gaps = coverage.filter((c) => !c.covered);

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

        {/* Черновики на проверке (авто-сгенерированные под новые фишки) */}
        {drafts.length > 0 && (
          <div className="mt-8 rounded-2xl border border-brass-500/40 bg-brass-500/[0.06] p-5">
            <h2 className="font-serif text-xl text-forest-900">
              ✎ На проверке <span className="text-brass-600">({drafts.length})</span>
            </h2>
            <p className="mt-1 text-sm text-forest-900/70">
              Черновики под новые фишки — прочитай, поправь и сними статус черновика.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {drafts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/admin/guide/${p.slug}` as Route}
                  className="group rounded-xl border border-brass-500/30 bg-cream-50 p-4 transition hover:shadow-sm"
                >
                  <p className="font-semibold text-forest-900 group-hover:text-brass-600">
                    {p.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-forest-900/60">{p.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

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
                      className="group rounded-2xl border border-forest-900/10 bg-cream-50 p-4 transition hover:border-brass-500/50 hover:shadow-sm"
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

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* Что нового */}
          {log.length > 0 && (
            <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-5">
              <h2 className="font-serif text-xl text-forest-900">Что нового</h2>
              <ul className="mt-4 space-y-2.5">
                {log.map((e, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 tabular-nums text-forest-900/40">
                      {fmtDate(e.date)}
                    </span>
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

          {/* Покрытие обучением — детектор пробелов */}
          <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-5">
            <h2 className="font-serif text-xl text-forest-900">
              Покрытие обучением{" "}
              <span className="text-sm font-normal text-forest-900/50">
                {coveredCount}/{coverage.length}
              </span>
            </h2>
            <p className="mt-1 text-sm text-forest-900/60">
              Разделы админки и наличие учебной страницы. Появился новый раздел без гайда —
              виден здесь.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {coverage.map((c) => (
                <li key={c.key} className="flex items-center gap-2">
                  <span className={c.covered ? "text-forest-500" : "text-brass-600"}>
                    {c.covered ? "✓" : "⚠"}
                  </span>
                  {c.covered && c.guideSlug ? (
                    <Link
                      href={`/admin/guide/${c.guideSlug}` as Route}
                      className="text-forest-900/80 hover:text-brass-600"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-forest-900/80">
                      {c.label}
                      <Link
                        href={c.href as Route}
                        className="ml-2 text-xs text-brass-600 hover:underline"
                      >
                        нужен гайд →
                      </Link>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {gaps.length === 0 && (
              <p className="mt-3 text-xs text-forest-500">Все рабочие разделы покрыты.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

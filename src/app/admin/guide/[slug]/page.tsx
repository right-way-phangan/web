import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { GuideNav } from "@/components/admin/guide-nav";
import { GuideArticle } from "@/components/admin/guide-article";
import { GuideToc } from "@/components/admin/guide-toc";
import { GuidePublishButton } from "@/components/admin/guide-publish-button";
import {
  GUIDE_SECTIONS,
  extractGuideHeadings,
  getGuidePage,
  getResolvedGuidePages,
  isGuidePagePublished,
  type GuideLiveData,
} from "@/lib/data/guide";
import { ADMIN_SECTIONS } from "@/lib/admin-sections";
import { getPipelines, getLeads, CRM_ENABLED } from "@/lib/data/leads";
import { getAllObjects } from "@/lib/data/objects";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = getGuidePage(slug);
  return {
    title: page ? `Справочник · ${page.title}` : "Справочник",
    robots: { index: false, follow: false },
  };
}

function fmtDate(d: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return new Date(`${d}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function GuidePageView({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getGuidePage(slug);
  if (!page) notFound();

  const [pages, publishedOverride] = await Promise.all([
    getResolvedGuidePages(),
    isGuidePagePublished(slug),
  ]);
  // Черновик «по факту»: фронтматтер draft и НЕ снят кнопкой в админке.
  const isDraft = page.draft && !publishedOverride;
  const idx = pages.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? pages[idx - 1] : null;
  const next = idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : null;
  const sectionTitle = GUIDE_SECTIONS.find((s) => s.id === page.section)?.title ?? "";
  const headings = extractGuideHeadings(page.body);
  // «Смотри также» — другие страницы той же секции (навигация внутри темы).
  const related = pages.filter((p) => p.section === page.section && p.slug !== slug);

  // Живые данные собираем только если страница их использует (маркеры {{…}}),
  // чтобы не дёргать CRM/каталог на страницах без них.
  const live: GuideLiveData = {};
  if (page.body.includes("{{stages}}") && CRM_ENABLED) {
    try {
      const pipes = await getPipelines();
      live.stages = pipes
        .filter((p) => p.stages.length > 0)
        .map((p) => ({
          pipeline: p.name,
          stages: [...p.stages].sort((a, b) => a.sort - b.sort).map((s) => s.name),
        }));
    } catch {
      /* CRM недоступен — маркер покажет fallback */
    }
  }
  if (page.body.includes("{{admin-sections}}")) {
    live.adminSections = ADMIN_SECTIONS.filter((s) => s.needsGuide).map((s) => ({
      label: s.label,
      href: s.href,
    }));
  }
  if (page.body.includes("{{stats}}")) {
    try {
      const [objects, leads] = await Promise.all([
        getAllObjects(),
        CRM_ENABLED ? getLeads() : Promise.resolve([]),
      ]);
      live.stats = { objects: objects.length, leads: leads.length };
    } catch {
      /* источники недоступны — маркер покажет fallback */
    }
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="guide" />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)_13rem]">
        <GuideNav pages={pages} active={slug} />
        <article className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            <Link href={"/admin/guide" as Route} className="hover:text-brass-600">
              Справочник
            </Link>
            {sectionTitle ? ` · ${sectionTitle}` : ""}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-forest-900">{page.title}</h1>
          {page.updated ? (
            <p className="mt-2 text-xs text-forest-900/45">обновлено {fmtDate(page.updated)}</p>
          ) : null}
          {page.draft &&
            (isDraft ? (
              <div className="mt-4 rounded-xl border border-brass-500/40 bg-brass-500/[0.07] px-4 py-3 text-sm text-forest-900/85">
                <strong className="font-semibold text-brass-600">✎ Черновик на проверке.</strong>{" "}
                Эта страница сгенерирована автоматически под новую фишку и ждёт твоего
                подтверждения — прочитай, поправь при необходимости и опубликуй.
                <div className="mt-3">
                  <GuidePublishButton slug={slug} published={false} />
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest-500/20 bg-forest-500/[0.05] px-4 py-3 text-sm text-forest-900/85">
                <span>
                  <strong className="font-semibold text-forest-600">✓ Опубликовано.</strong>{" "}
                  Снято с черновика из админки.
                </span>
                <GuidePublishButton slug={slug} published={true} />
              </div>
            ))}
          <div className="mt-6">
            <GuideArticle md={page.body} slug={slug} live={live} />
          </div>

          {/* Смотри также — соседние страницы той же секции */}
          {related.length > 0 && (
            <div className="mt-10 border-t border-forest-900/10 pt-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-forest-900/40">
                Смотри также · {sectionTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/admin/guide/${p.slug}` as Route}
                    className="inline-block rounded-full bg-forest-900/5 px-3 py-1 text-sm text-forest-900/75 transition hover:bg-forest-900/10 hover:text-forest-900"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Перелистывание по оглавлению */}
          <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-forest-900/10 pt-5 text-sm">
            {prev ? (
              <Link
                href={`/admin/guide/${prev.slug}` as Route}
                className="text-forest-900/60 hover:text-brass-600"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/admin/guide/${next.slug}` as Route}
                className="text-right text-forest-900/60 hover:text-brass-600"
              >
                {next.title} →
              </Link>
            ) : null}
          </div>
        </article>
        <GuideToc headings={headings} />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { GuideNav } from "@/components/admin/guide-nav";
import { GuideArticle } from "@/components/admin/guide-article";
import { GUIDE_SECTIONS, getGuidePage, getGuidePages } from "@/lib/data/guide";

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

  const pages = getGuidePages();
  const idx = pages.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? pages[idx - 1] : null;
  const next = idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : null;
  const sectionTitle = GUIDE_SECTIONS.find((s) => s.id === page.section)?.title ?? "";

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="guide" />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
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
          <div className="mt-6">
            <GuideArticle md={page.body} />
          </div>

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
      </div>
    </section>
  );
}

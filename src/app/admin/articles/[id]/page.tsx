import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { ArticleBody } from "@/components/sections/article-body";
import { ArticleReview } from "@/components/admin/article-review";
import {
  editorialNotes,
  getAdminArticle,
  getPairedArticle,
  getPendingArticleCount,
  mdToBlocks,
} from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Статья — согласование",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL = {
  pending: "На согласовании",
  published: "Опубликовано",
  rejected: "На доработке",
} as const;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AdminArticlePage({ params }: Props) {
  const { id } = await params;
  const [article, pending] = await Promise.all([
    getAdminArticle(Number(id)),
    getPendingArticleCount(),
  ]);
  if (!article) notFound();
  const paired = await getPairedArticle(article.slug, article.lang);
  const otherLang = article.lang === "ru" ? "en" : "ru";

  const blogBase = article.lang === "ru" ? "/ru/blog" : "/blog";
  const publicHref = `${blogBase}/${article.slug}`;
  const blocks = mdToBlocks(article.bodyMd);
  const notes = editorialNotes(article.bodyMd);

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="articles" pendingArticles={pending} />

      <div className="mb-5">
        <Link
          href={"/admin/articles" as Route}
          className="inline-flex items-center gap-1.5 text-sm text-forest-900/60 transition hover:text-forest-900"
        >
          <ArrowLeft className="h-4 w-4" />К списку статей
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Preview — exactly how it renders on the public blog */}
        <article className="rounded-2xl border border-forest-900/10 bg-cream-50 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-600">
            <span>{article.topic}</span>
            <span aria-hidden className="text-forest-900/20">·</span>
            <span className="text-forest-900/40">{article.readMins ?? 1} мин · {article.lang}</span>
          </div>
          <h1 className="mt-3 font-serif text-3xl text-forest-900">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-forest-900/70">{article.excerpt}</p>
          <div className="mt-8 border-t border-forest-900/10 pt-8">
            <ArticleBody blocks={blocks} />
          </div>
          {article.takeaways && article.takeaways.length > 0 ? (
            <div className="mt-8 rounded-xl border border-forest-900/10 bg-cream-200/40 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-600">Главное</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-forest-900/75 marker:text-forest-900/30">
                {article.takeaways.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>

        {/* Review rail */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {notes.length > 0 ? (
            <div className="rounded-2xl border border-urgent/30 bg-urgent/5 p-5 text-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-urgent">
                Пометка автора
              </p>
              <ul className="mt-3 space-y-2 text-forest-900/80">
                {notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-forest-900/50">
                На сайт не попадает — снять после того, как условие выполнено.
              </p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-5 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-forest-900/50">Статус</dt>
                <dd className="font-medium text-forest-900">{STATUS_LABEL[article.status]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-forest-900/50">Язык / блог</dt>
                <dd className="font-medium text-forest-900">{blogBase}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-forest-900/50">URL (slug)</dt>
                <dd className="truncate font-mono text-xs text-forest-900/70">{article.slug}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-forest-900/50">Версия {otherLang.toUpperCase()}</dt>
                <dd className="font-medium">
                  {paired ? (
                    <Link
                      href={`/admin/articles/${paired.id}` as Route}
                      className="text-forest-900 underline decoration-forest-900/30 hover:text-brass-600"
                    >
                      {STATUS_LABEL[paired.status]}
                    </Link>
                  ) : (
                    <span className="text-red-700/80">нет — нужна вторая языковая версия</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-forest-900/50">Создано</dt>
                <dd className="text-forest-900/70">{fmtDate(article.createdAt)}</dd>
              </div>
              {article.publishedAt ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-forest-900/50">Опубликовано</dt>
                  <dd className="text-forest-900/70">{fmtDate(article.publishedAt)}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {article.status === "rejected" && article.reviewerNote ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-50/60 p-4 text-sm">
              <p className="font-medium text-red-700/90">На доработку:</p>
              <p className="mt-1 text-red-900/70">{article.reviewerNote}</p>
            </div>
          ) : null}

          <ArticleReview id={article.id} status={article.status} publicHref={publicHref} />
        </aside>
      </div>
    </section>
  );
}

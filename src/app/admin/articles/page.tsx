import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { getAdminArticles, type DbArticle } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Статьи",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_META: Record<DbArticle["status"], { label: string; cls: string }> = {
  pending: { label: "На согласовании", cls: "bg-brass-500/15 text-brass-600" },
  published: { label: "Опубликовано", cls: "bg-forest-900/10 text-forest-900/70" },
  rejected: { label: "На доработке", cls: "bg-red-500/10 text-red-700/80" },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

const ORDER: DbArticle["status"][] = ["pending", "rejected", "published"];

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();

  // every article ships as an EN+RU pair (same slug) — flag cards missing theirs
  const langsBySlug = new Map<string, Set<string>>();
  for (const a of articles) {
    if (!langsBySlug.has(a.slug)) langsBySlug.set(a.slug, new Set());
    langsBySlug.get(a.slug)!.add(a.lang);
  }
  const missingPair = (a: DbArticle): string | null => {
    const other = a.lang === "ru" ? "en" : "ru";
    return langsBySlug.get(a.slug)?.has(other) ? null : other;
  };

  const groups = ORDER.map((status) => ({
    status,
    items: articles.filter((a) => a.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="px-4 py-8 md:px-8">

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">Статьи</h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
          Очередь согласования для блога. Черновики приходят со статусом «На согласовании» —
          открой, проверь и опубликуй или верни на доработку. Опубликованные сразу видны на{" "}
          <Link href={"/blog" as Route} className="underline hover:text-brass-600">
            /blog
          </Link>
          .
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest-900/15 bg-cream-50 p-8 text-center">
          <p className="text-sm text-forest-900/60">
            Пока статей нет. Когда я подготовлю черновик, он появится здесь на согласование.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.status}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-forest-900/45">
                {STATUS_META[g.status].label}
                <span className="text-forest-900/30">· {g.items.length}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {g.items.map((a) => (
                  <Link
                    key={a.id}
                    href={`/admin/articles/${a.id}` as Route}
                    className="flex flex-col rounded-2xl border border-forest-900/10 bg-cream-50 p-4 transition hover:border-brass-500/40 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-brass-600">
                        {a.topic}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="rounded-full bg-forest-900/5 px-2 py-0.5 text-[11px] font-medium uppercase text-forest-900/50">
                          {a.lang}
                        </span>
                        {missingPair(a) ? (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium uppercase text-red-700/80">
                            нет {missingPair(a)}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-lg leading-snug text-forest-900">{a.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-forest-900/60">{a.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] font-medium " + STATUS_META[a.status].cls
                        }
                      >
                        {STATUS_META[a.status].label}
                      </span>
                      <span className="text-[11px] text-forest-900/40">
                        {fmtDate(a.publishedAt || a.createdAt)} · {a.readMins ?? 1} мин
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

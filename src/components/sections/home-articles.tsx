import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { SectionEyebrow } from "./section-eyebrow";
import { Appear } from "@/components/motion/appear";
import { getAllBlogPosts } from "@/lib/data/articles";
import type { Locale } from "@/lib/i18n/dictionaries";

const COPY = {
  en: {
    eyebrow: "Guides & journal",
    title: "Do the homework with us.",
    lede: "Due diligence, leasehold mechanics, what villas actually earn — answered in the open.",
    all: "All articles",
    read: "Read",
  },
  ru: {
    eyebrow: "Гиды и журнал",
    title: "Разбираемся вместе.",
    lede: "Due diligence, механика лизхолда, сколько реально зарабатывают виллы — отвечаем открыто.",
    all: "Все статьи",
    read: "Читать",
  },
} as const;

/**
 * Три свежие статьи журнала на главной: конвейер пишет EN+RU ежедневно, но с
 * главной контента не было видно — а это и доверие, и SEO/AEO. Без статей
 * нужной локали секция не рендерится.
 */
export async function HomeArticles({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const base = locale === "ru" ? "/ru" : "";
  let posts: Awaited<ReturnType<typeof getAllBlogPosts>> = [];
  try {
    posts = (await getAllBlogPosts(locale)).slice(0, 3);
  } catch {
    /* источник статей недоступен — секцию просто не показываем */
  }
  if (!posts.length) return null;

  return (
    <section className="container-prose relative isolate py-14 md:py-20">
      <div
        className="pointer-events-none absolute -inset-x-16 inset-y-0 -z-10 bg-[radial-gradient(70%_90%_at_12%_0%,rgba(217,138,30,0.06),transparent_62%)]"
        aria-hidden
      />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
          <h2 className="mt-5 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 max-w-xl text-base text-forest-500/75">{t.lede}</p>
        </div>
        <Link
          href={`${base}/blog` as Route}
          className="group inline-flex items-center gap-1.5 rounded-sm border border-forest-500/25 px-4 py-2.5 text-sm font-medium text-forest-500 transition-colors hover:border-brass-500/60 hover:text-brass-700"
        >
          {t.all}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="card-rail mt-10 md:grid-cols-3">
        {posts.map((p, i) => (
          <Appear key={p.slug} delay={(i % 3) * 0.05} className="h-full">
            <Link
              href={`${base}/blog/${p.slug}` as Route}
              className="group block h-full rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5 transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft"
            >
              <div className="flex h-full flex-col rounded-core bg-cream-50 p-6 shadow-bezel">
                <div className="flex items-center gap-2 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-700">
                  <span>{p.topic}</span>
                  <span aria-hidden className="text-forest-500/30">
                    ·
                  </span>
                  <span className="text-forest-500/50">{p.readMins} min</span>
                </div>
                <h3 className="mt-3 font-serif text-xl text-forest-900">{p.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-forest-500/85">
                  {p.excerpt}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                  {t.read}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </Appear>
        ))}
      </div>
    </section>
  );
}

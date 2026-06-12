import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BLOG_POSTS_RU } from "@/content/blog.ru";
import { getBlogPost, getAllBlogPosts } from "@/lib/data/articles";
import { Button } from "@/components/ui/button";
import { ArticleBody } from "@/components/sections/article-body";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export function generateStaticParams() {
  return BLOG_POSTS_RU.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getBlogPost(slug, "ru");
  if (!p) return { title: "Пост не найден" };
  return {
    title: p.title,
    description: p.excerpt,
    alternates: {
      canonical: `/ru/blog/${p.slug}`,
      languages: { en: `/blog/${p.slug}`, ru: `/ru/blog/${p.slug}` },
    },
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function RussianBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const p = await getBlogPost(slug, "ru");
  if (!p) notFound();

  const siteUrl = getSiteUrl();
  const others = (await getAllBlogPosts("ru")).filter((x) => x.slug !== p.slug).slice(0, 2);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.published,
    dateModified: p.published,
    inLanguage: "ru",
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteUrl}/ru/blog/${p.slug}`,
  };

  return (
    <article>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Главная", url: `${siteUrl}/ru` },
          { name: "Журнал", url: `${siteUrl}/ru/blog` },
          { name: p.title, url: `${siteUrl}/ru/blog/${p.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="container-prose pt-8">
        <Button asChild variant="ghost" size="sm">
          <Link href={"/ru/blog" as Route}>
            <ArrowLeft className="h-4 w-4" />
            Все посты
          </Link>
        </Button>
      </div>

      <header className="container-prose pt-10 md:pt-14">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          <span>{p.topic}</span>
          <span aria-hidden className="text-forest-500/30">·</span>
          <span className="text-forest-500/50">{p.readMins} мин чтения</span>
        </div>
        <h1 className="mt-4 max-w-3xl text-balance">{p.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-forest-500/75 md:text-xl">
          {p.excerpt}
        </p>
        <p className="mt-4 text-sm text-forest-500/50">{fmtDate(p.published)}</p>
      </header>

      <section className="container-prose py-12 md:py-16">
        <ArticleBody blocks={p.body} />
      </section>

      {p.takeaways && p.takeaways.length > 0 ? (
        <section className="container-prose pb-12 md:pb-16">
          <div className="max-w-prose rounded-sm border border-forest-500/10 bg-cream-200/40 p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              Главное
            </p>
            <ul className="mt-4 space-y-2.5">
              {p.takeaways.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-base text-forest-500/85 md:text-lg"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-forest-500/50" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="container-prose pb-12">
        <div className="max-w-prose border-t border-forest-500/10 pt-4">
          <p className="text-xs leading-relaxed text-forest-500/55">
            Общая информация, не юридическая или инвестиционная консультация. Каждый участок и сделка
            зависят от конкретики — независимая юридическая проверка входит в каждую сделку, которую мы
            ведём.
          </p>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="border-t border-forest-500/10 bg-cream-200/30">
          <div className="container-prose py-16 md:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
              Ещё из журнала
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/ru/blog/${o.slug}` as Route}
                  className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-colors hover:border-forest-500/30"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                    {o.topic}
                  </p>
                  <h3 className="mt-2 font-serif text-lg text-forest-900">{o.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                    Читать
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}

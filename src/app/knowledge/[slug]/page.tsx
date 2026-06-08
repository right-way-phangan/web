import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  KB_ARTICLES,
  getKbArticleBySlug,
} from "@/content/knowledge-base";
import { Button } from "@/components/ui/button";
import { ArticleBody } from "@/components/sections/article-body";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return KB_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getKbArticleBySlug(slug);
  if (!a) return { title: "Article not found" };
  return {
    title: a.title,
    description: a.short,
    alternates: {
      canonical: `/knowledge/${a.slug}`,
      languages: { en: `/knowledge/${a.slug}`, ru: `/ru/knowledge/${a.slug}` },
    },
  };
}

export default async function KnowledgeArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getKbArticleBySlug(slug);
  if (!a) notFound();

  const siteUrl = getSiteUrl();
  const others = KB_ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.short,
    datePublished: a.updated,
    dateModified: a.updated,
    inLanguage: "en",
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteUrl}/knowledge/${a.slug}`,
  };

  return (
    <article>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", url: `${siteUrl}/` },
          { name: "Knowledge", url: `${siteUrl}/knowledge` },
          { name: a.title, url: `${siteUrl}/knowledge/${a.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="container-prose pt-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/knowledge">
            <ArrowLeft className="h-4 w-4" />
            All guides
          </Link>
        </Button>
      </div>

      <header className="container-prose pt-10 md:pt-14">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          {a.topic}
        </p>
        <h1 className="mt-4 max-w-3xl text-balance">{a.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-forest-500/75 md:text-xl">
          {a.short}
        </p>
        <p className="mt-4 text-sm text-forest-500/50">
          Updated{" "}
          {new Date(a.updated).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <section className="container-prose py-12 md:py-16">
        <ArticleBody blocks={a.body} />
      </section>

      {a.takeaways.length > 0 ? (
        <section className="container-prose pb-12 md:pb-16">
          <div className="max-w-prose rounded-sm border border-forest-500/10 bg-cream-200/40 p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              Key points
            </p>
            <ul className="mt-4 space-y-2.5">
              {a.takeaways.map((item) => (
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
        <div className="max-w-prose space-y-4">
          {a.sources.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-forest-500/50">
                Sources
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-forest-500/70">
                {a.sources.map((s) => (
                  <li key={s.title}>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:underline hover:text-brass-500"
                      >
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="border-t border-forest-500/10 pt-4 text-xs leading-relaxed text-forest-500/55">
            General information, not legal advice. Thai property law is
            fact-specific — verify any structure with a licensed Thai lawyer
            before you commit. Independent legal due diligence is part of every
            transaction we handle.
          </p>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="border-t border-forest-500/10 bg-cream-200/30">
          <div className="container-prose py-16 md:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
              More guides
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/knowledge/${o.slug}` as Route}
                  className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-colors hover:border-forest-500/30"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                    {o.topic}
                  </p>
                  <h3 className="mt-2 font-serif text-lg text-forest-900">
                    {o.title}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                    Read
                    <ArrowRight className="h-3 w-3" />
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
import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { KB_ARTICLES, getKbArticleBySlug } from "@/content/knowledge-base";
import { getKbArticleThBySlug } from "@/content/knowledge-base.th";
import { Button } from "@/components/ui/button";
import { ArticleBody } from "@/components/sections/article-body";
import { ArticleByline } from "@/components/sections/article-byline";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import {
  DEFAULT_AUTHOR,
  authorOrgSchema,
  legalReviewerFor,
  reviewerPersonSchema,
} from "@/content/authors";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";
import { seoTitle } from "@/lib/seo/seo-title";

interface Props {
  params: Promise<{ slug: string }>;
}

// Тайский перевод, если есть; иначе EN-оригинал — все EN-slug существуют в /th.
function getArticle(slug: string) {
  return getKbArticleThBySlug(slug) ?? getKbArticleBySlug(slug);
}

export function generateStaticParams() {
  return KB_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "ไม่พบบทความ" };
  return {
    title: seoTitle(a.title),
    description: a.short,
    alternates: {
      canonical: `/th/knowledge/${a.slug}`,
      languages: { en: `/knowledge/${a.slug}`, ru: `/ru/knowledge/${a.slug}`, th: `/th/knowledge/${a.slug}`, "x-default": `/knowledge/${a.slug}` },
    },
  };
}

export default async function ThaiKnowledgeArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const siteUrl = getSiteUrl();
  const reviewer = legalReviewerFor(a.faqCategory);
  const others = KB_ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3).map((x) => getKbArticleThBySlug(x.slug) ?? x);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    // Обязательное поле для rich result Article — та же OG-картинка страницы.
    image: `${siteUrl}/th/knowledge/${a.slug}/opengraph-image`,
    description: a.short,
    datePublished: a.updated,
    dateModified: a.updated,
    inLanguage: "th",
    author: authorOrgSchema(siteUrl),
    ...(reviewer ? { reviewedBy: reviewerPersonSchema(reviewer, siteUrl, "th") } : {}),
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteUrl}/th/knowledge/${a.slug}`,
  };

  return (
    <article>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "หน้าแรก", url: `${siteUrl}/th` },
          { name: "คลังความรู้", url: `${siteUrl}/th/knowledge` },
          { name: a.title, url: `${siteUrl}/th/knowledge/${a.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(articleSchema) }}
      />

      <div className="container-prose pt-8">
        <Button asChild variant="ghost" size="sm">
          <Link href={"/th/knowledge" as Route}>
            <ArrowLeft className="h-4 w-4" />
            คู่มือทั้งหมด
          </Link>
        </Button>
      </div>

      <header className="container-prose pt-10 md:pt-14">
        <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">{a.topic}</p>
        <h1 className="mt-4 max-w-3xl text-balance">{a.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-forest-500/75 md:text-xl">
          {a.short}
        </p>
        <ArticleByline author={DEFAULT_AUTHOR} dateISO={a.updated} locale="th" dateKind="updated" reviewer={reviewer} />
      </header>

      <section className="container-prose py-12 md:py-16">
        <ArticleBody blocks={a.body} />
      </section>

      {a.takeaways.length > 0 ? (
        <section className="container-prose pb-12 md:pb-16">
          <div className="max-w-prose rounded-sm border border-forest-500/10 bg-cream-200/40 p-6 md:p-8">
            <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
              ประเด็นสำคัญ
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
              <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-forest-500/50">
                แหล่งอ้างอิง
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
            ข้อมูลทั่วไป ไม่ใช่คำแนะนำทางกฎหมาย กฎหมายอสังหาริมทรัพย์ของไทยขึ้นอยู่กับข้อเท็จจริงเฉพาะ
            — โปรดตรวจสอบโครงสร้างใด ๆ กับทนายความไทยที่มีใบอนุญาตก่อนตัดสินใจ การตรวจสอบสถานะ
            (Due Diligence) อย่างอิสระเป็นส่วนหนึ่งของทุกธุรกรรมที่เราดูแล
          </p>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="border-t border-forest-500/10 bg-cream-200/30">
          <div className="container-prose py-16 md:py-20">
            <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
              คู่มืออื่น ๆ
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/th/knowledge/${o.slug}` as Route}
                  className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-colors hover:border-forest-500/30"
                >
                  <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
                    {o.topic}
                  </p>
                  <h3 className="mt-2 font-serif text-lg text-forest-900">{o.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                    อ่าน
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-forest-500/10 bg-cream-50">
        <div className="container-prose py-16 md:py-20">
          <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
            จากการอ่าน สู่การลงมือ
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest-500/75">
            ทรัพย์ทุกรายการของเราผ่านการตรวจสอบแบบเดียวกันก่อนเผยแพร่ — เอกสารสิทธิ์
            ผังเมือง ทางเข้าออก และตัวเลขจริง ดูทรัพย์ที่มีขายอยู่ตอนนี้
            หรือดูว่าที่ดินหรือวิลล่าของคุณมีมูลค่าเท่าไร
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="md">
              <Link href={"/th/listings" as Route}>ดูรายการทรัพย์</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href={"/th/sell" as Route}>ฝากขายกับเรา</Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}

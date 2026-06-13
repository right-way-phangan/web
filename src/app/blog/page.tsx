import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { getAllBlogPosts } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Practical, plain-language writing on buying and building on Koh Phangan — land due diligence, rental returns, and how the market actually works.",
  alternates: { canonical: "/blog", languages: { en: "/blog", ru: "/ru/blog", "x-default": "/blog" } },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getAllBlogPosts("en");

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Notes on buying and building on Phangan."
        lede="The questions buyers actually ask us, answered in the open — how land due diligence works, what villas earn, and how to read a market that rewards doing the homework."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-all hover:border-forest-500/30 hover:shadow-lg md:p-8"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                <span>{p.topic}</span>
                <span aria-hidden className="text-forest-500/30">·</span>
                <span className="text-forest-500/50">{p.readMins} min</span>
              </div>
              <h2 className="mt-3 font-serif text-xl text-forest-900 md:text-2xl">
                {p.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forest-500/85 md:text-base">
                {p.excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-xs text-forest-500/50">{fmtDate(p.published)}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                  Read
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

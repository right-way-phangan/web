import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { KB_ARTICLES } from "@/content/knowledge-base";

export const metadata: Metadata = {
  alternates: { canonical: "/knowledge", languages: { en: "/knowledge", ru: "/ru/knowledge" } },
  title: "Knowledge",
  description:
    "Plain-language guides to buying property on Koh Phangan — foreign ownership, leasehold structures, building zones, and the rules that actually affect a purchase.",
};

export default function KnowledgePage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge"
        title="What you actually need to know before buying on Phangan."
        lede="Short, plain-language explainers on the legal and practical questions that decide a purchase — ownership structures, building zones, and the rules behind them. We keep these current; due diligence on every deal is part of how we work, not an add-on."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {KB_ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={`/knowledge/${a.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-all hover:border-forest-500/30 hover:shadow-lg md:p-8"
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                {a.topic}
              </p>
              <h2 className="mt-3 font-serif text-xl text-forest-900 md:text-2xl">
                {a.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forest-500/85 md:text-base">
                {a.short}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                Read
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              Have a question we haven&rsquo;t covered?
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              The <Link href="/faq" className="text-forest-500 underline-offset-4 hover:underline hover:text-brass-500">FAQ</Link> answers
              the most common ones. For anything specific to a plot or a deal, a
              short call is faster than reading — and that&rsquo;s the kind of
              question we answer for free as part of working with you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-sm bg-forest-500 px-6 py-3 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
              >
                Ask us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
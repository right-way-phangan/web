import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";
import { KnowledgeBrowser } from "@/components/knowledge/knowledge-browser";
import { KB_ARTICLES } from "@/content/knowledge-base";

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const metadata: Metadata = {
  alternates: { canonical: "/knowledge", languages: { en: "/knowledge", ru: "/ru/knowledge", "x-default": "/knowledge" } },
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

      <section className="container-prose py-14 md:py-20">
        <KnowledgeBrowser
          basePath="/knowledge"
          articles={KB_ARTICLES.map((a) => ({
            slug: a.slug,
            topic: a.topic,
            title: a.title,
            short: a.short,
            updated: a.updated,
          }))}
          labels={{
            all: "All",
            read: "Read",
            searchPlaceholder: "Search guides…",
            empty: "No guides match your search yet.",
            clear: "Clear search",
            updatedPrefix: "Updated",
            months: MONTHS_EN,
          }}
        />
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-14 md:py-20">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>Still curious</SectionEyebrow>
            <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
              Have a question we haven&rsquo;t covered?
            </h2>
            <p className="mt-4 text-lg text-forest-600">
              The <Link href="/faq" className="text-forest-500 underline-offset-4 hover:underline hover:text-brass-500">FAQ</Link> answers
              the most common ones. For anything specific to a plot or a deal, a
              short call is faster than reading — and that&rsquo;s the kind of
              question we answer for free as part of working with you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-sm bg-panel px-6 py-3 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400"
              >
                Ask us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
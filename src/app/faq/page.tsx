import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { FaqExplorer } from "@/components/faq/faq-explorer";
import { Button } from "@/components/ui/button";
import { ALL_FAQ_ITEMS } from "@/content/faq-derived";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions foreign buyers actually ask about Koh Phangan property: Chanote vs NS3, freehold vs leasehold, company structures, taxes, utilities, due diligence.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Buying property on Phangan, demystified."
        lede={`${ALL_FAQ_ITEMS.length} answers to the questions foreign buyers actually ask, grouped into six categories. Search by keyword, filter by category, or just scroll.`}
        image="/images/scenes/faq.jpg"
        imageAlt="Palm-fringed beach at dusk on Koh Phangan"
      />

      <section className="container-prose py-12 md:py-16">
        <FaqExplorer />
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              Still have a question?
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              These cover the most common ground, but every buyer has an edge
              case. Send us yours — we&rsquo;ll answer it directly,
              and if it&rsquo;s a generally useful question, we&rsquo;ll add
              it to this page.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="md">
                <Link href="/contact">Ask us anything</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/process">See our process</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

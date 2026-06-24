import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import { ShieldCheck, LineChart, Megaphone, FileCheck } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";
import { Appear } from "@/components/motion/appear";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-form";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Sell your land or villa on Koh Phangan",
  description:
    "List your Koh Phangan land, villa or house with an agency that vets every property it represents. Honest, data-backed valuation, real exposure across the right channels, and the due diligence and paperwork handled end to end.",
  alternates: {
    canonical: "/sell",
    languages: { en: "/sell", ru: "/ru/sell", "x-default": "/sell" },
  },
};

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Your property, taken seriously",
    text: "We don't run a 600-listing feed. Every property we represent is personally vetted, so buyers arrive already trusting what they see — and yours stands among quality, not noise.",
  },
  {
    icon: LineChart,
    title: "Priced on real numbers",
    text: "We value your land or villa against actual comparable sales and current market data on Phangan — not a hopeful guess. A realistic asking price sells; a fantasy one sits.",
  },
  {
    icon: Megaphone,
    title: "Real exposure, the right channels",
    text: "Your listing reaches buyers where they actually look — our website, Telegram, Facebook Marketplace and the property portals — in English, presented to international standards.",
  },
  {
    icon: FileCheck,
    title: "Paperwork handled, end to end",
    text: "Title checks, boundary reconciliation, the sale agreement and representation at the Land Office — we run the due diligence and the process so your sale doesn't stall on a missing document.",
  },
] as const;

const STEPS = [
  {
    title: "Free valuation",
    text: "Tell us about your property. We give you an honest, data-backed estimate of what it's worth on today's market — no obligation.",
  },
  {
    title: "Listing vetting & presentation",
    text: "If we take it on, we verify the title and the details, then present it properly — photography, accurate specs, and the exact location on the map.",
  },
  {
    title: "Published where buyers look",
    text: "Your property goes live across our channels with full, honest information — the kind serious buyers act on, not the kind they have to second-guess.",
  },
  {
    title: "We close the deal",
    text: "We field enquiries, run the transaction due diligence and paperwork, and represent your interests through to transfer at the Land Office.",
  },
] as const;

export default function SellPage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to sell your property with Right Way on Koh Phangan",
    description:
      "The steps to list and sell land, a villa or a house with Right Way Phangan Group — from a free valuation through to transfer at the Land Office.",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
    })),
    publisher: {
      "@type": "Organization",
      name: "Right Way Phangan Group",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageHero
        eyebrow="For owners"
        title="Sell your land or villa, the right way."
        lede="List with an agency that vets every property it represents — so serious buyers take yours seriously. One island, done properly: honest pricing, real exposure, and the paperwork handled from first enquiry to transfer."
      />

      <section className="container-prose py-16 md:py-24">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
            {REASONS.map((r, i) => (
              <Appear key={r.title} delay={(i % 2) * 0.08} className="h-full">
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-forest-900">{r.title}</h2>
                    <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                      {r.text}
                    </p>
                  </div>
                </div>
              </Appear>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-cream-200/30">
        <div className="container-prose py-16 md:py-24">
          <Reveal>
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
              From valuation to transfer.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-14">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex gap-5">
                  <p className="num shrink-0 text-2xl text-brass-700">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="font-serif text-2xl text-forest-900">{s.title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                      {s.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-prose py-16 md:py-24">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-x-16">
          <div>
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              What&rsquo;s your property worth?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-forest-500/75">
              Start with a free, no-obligation valuation. Get an instant
              data-backed estimate in a couple of minutes, or send us the details
              and we&rsquo;ll come back with a considered figure and a clear read
              on how to sell it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild variant="primary" size="md">
                <Link href="/tools/estimate">Get a free valuation</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/due-diligence">What we verify</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5">
            <div className="rounded-core bg-cream-50 p-6 shadow-bezel md:p-8">
              <h3 className="font-serif text-2xl text-forest-900">
                Request a valuation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-500/70">
                Tell us where the property is and what you have. We reply within the
                working day.
              </p>
              <div className="mt-6">
                <LeadForm
                  source="contact"
                  kind="valuation"
                  layout="card"
                  submitLabel="Request a valuation"
                  defaultMessage="I'd like a valuation for my property. Location / type / size: "
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

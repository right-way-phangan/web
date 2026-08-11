import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { ContentSection } from "@/components/sections/content-section";
import { ServiceCards } from "@/components/sections/service-cards";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  alternates: { canonical: "/services", languages: { en: "/services", ru: "/ru/services", "x-default": "/services" } },
  title: "Services",
  description:
    "Three services: land acquisition, villa and house sales, standalone transaction support. Each one documented and accountable.",
};

const SERVICES = [
  {
    title: "Land acquisition advisory",
    text: "For clients buying land to build, develop, or hold. We work across freehold (Chanote) and leasehold structures, with deep familiarity in the document chain — Chanote, Nor Sor 3 Gor, Nor Sor 3, Sor Kor 1, and the exceptions. Each plot undergoes a four-stage check: title verification at the Land Office, boundary survey reconciliation, access and easement review, and zoning compliance. You receive a written report before signing anything.",
    meta: "Typical engagement: 4–12 weeks",
  },
  {
    title: "Villa and house transactions",
    text: "For clients buying a finished home or villa, whether for personal use or long-term hold. Each villa transaction includes structural review, utility verification, ownership history, and a clear comparison against current market rates in the same district.",
    meta: "Typical engagement: 2–6 weeks",
  },
  {
    title: "Standalone transaction support",
    text: "For clients who already found their property — directly, through another agent, or via a private contact — but want professional support through the closing process. We work as your representative at the Land Office and through legal proceedings.",
    meta: "Fixed-fee engagement",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Three services, one standard."
        lede="We don't do rental management, construction, short-term lets or staging — just three services, each with the same documentation and care."
        image="/images/scenes/turquoise-aerial.jpg"
        imageAlt="Turquoise water and boats off Koh Phangan"
      />

      <ServiceCards services={[...SERVICES]} />

      <ContentSection eyebrow="Boundaries" title="Where we stop" spacing="default">
        <p>
          We do not manage rental properties. We do not arrange short-term
          stays. We do not build, renovate, or design. We do not buy off-plan
          condominiums.
        </p>
        <p>
          We refer trusted partners for each of these — but our own operation
          stays focused on what we know best: helping you buy a piece of land
          or a home, properly.
        </p>
      </ContentSection>

      <section className="bg-cream-200/30">
        <div className="container-prose py-14 md:py-20">
          <Reveal>
            <SectionEyebrow>Transparent pricing</SectionEyebrow>
            <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
              Honest about cost.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-forest-500/80 md:text-lg">
              As a buyer, you pay us nothing — only the statutory Land Office fees
              on registration. Our work is settled within the deal: no buyer-side
              commission, no surprises at the table.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-forest-500/80">
              Every engagement includes the full due diligence, the sale
              agreement, and representation through to transfer — the same
              documentation and care whether the deal is large or small.
            </p>
            <p className="mt-8 max-w-2xl text-sm text-forest-500/70">
              No hidden add-ons, no kickbacks — the number you see is the number
              you pay. For a standalone engagement, the fee is agreed upfront in
              writing before any work begins.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-prose py-14 md:py-20">
        <Reveal className="max-w-2xl">
          <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
            Ready to start?
          </h2>
          <p className="mt-4 text-lg text-forest-500/70">
            Tell us what you&rsquo;re looking for. A 30-minute discovery call
            costs you nothing and saves both of us weeks down the road.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="md">
              <Link href="/contact">Start a brief</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/process">See our process</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

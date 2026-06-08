import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { ContentSection } from "@/components/sections/content-section";
import { ServiceCards } from "@/components/sections/service-cards";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  alternates: { canonical: "/services", languages: { en: "/services", ru: "/ru/services" } },
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
    meta: "Fixed fee from 60,000 THB",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Three services. Each done properly."
        lede="We deliberately do not offer rental management, construction, short-term lets or property staging. Our entire operation is built around three services, each one carrying the same level of documentation and care."
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
        <div className="container-prose py-16 md:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
            Commission
          </p>
          <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
            Honest about the fee.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-forest-500/80 md:text-lg">
            The commission is paid by the seller and built into the price, in
            line with island norms. As a buyer, you pay us nothing — only the
            statutory Land Office fees on registration.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
            <FeeRow
              label="Commission"
              detail="Due diligence, sale agreement, and transaction representation included."
              value="5% of the deal"
              payer="Paid by the seller"
            />
            <FeeRow
              label="Minimum fee"
              detail="On smaller deals, the higher of 5% or this floor applies — due diligence costs the same regardless of price."
              value="150,000 THB"
              payer="Paid by the seller"
            />
            <FeeRow
              label="Complex structure"
              detail="Thai company setup, multi-property or non-trivial leasehold deals."
              value="+0.5–1%"
              payer="Paid by the seller"
            />
          </div>

          <p className="mt-10 max-w-2xl text-sm text-forest-500/70">
            Nothing charged to the buyer, no hidden add-ons, no kickbacks. On a
            leasehold villa the commission is based on the full transaction value
            — the land lease prepayment plus the building.
          </p>
        </div>
      </section>

      <section className="container-prose py-20 md:py-28">
        <div className="max-w-2xl">
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
        </div>
      </section>
    </>
  );
}

function FeeRow({
  label,
  detail,
  value,
  payer,
}: {
  label: string;
  detail: string;
  value: string;
  payer: string;
}) {
  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">
        {label}
      </p>
      <p className="num mt-3 text-2xl text-forest-900">{value}</p>
      <p className="mt-3 text-sm text-forest-500/75">{detail}</p>
      <p className="mt-4 text-xs text-forest-500/55">{payer}</p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How a Right Way transaction unfolds: seven stages, each with a defined deliverable and a clear walk-away point.",
};

const STEPS = [
  {
    number: 1,
    title: "Discovery call",
    duration: "30 minutes",
    text: "We learn what you want to do with the property: live, hold, build, divide. Without this context, every property is just numbers. With it, we know which 10 of our 60 listings actually fit.",
  },
  {
    number: 2,
    title: "Shortlist",
    duration: "Within 5 business days",
    text: "We send a written shortlist of three to seven properties with full data: location, document type, tenure, area in Thai units and m², and our honest read on each one — including drawbacks.",
  },
  {
    number: 3,
    title: "On-site tour",
    duration: "One full day",
    text: "We arrange and accompany visits to the shortlisted properties — typically three to five properties in a single day. We bring district context, owner history, and our notes from previous due diligence.",
  },
  {
    number: 4,
    title: "Offer and negotiation",
    text: "Once you choose a property, we structure the offer and negotiate on your behalf. This includes payment schedule, contingencies (financing, due diligence completion), and any seller-side commitments (existing structures, utilities, fencing).",
  },
  {
    number: 5,
    title: "Due diligence",
    duration: "1–3 weeks",
    text: "A documented, written process: title verification at the Land Office, boundary reconciliation against survey records, encumbrance and mortgage check, zoning compliance, access rights, and water and electricity availability. Deliverable: a single PDF report you review before signing the Sale and Purchase Agreement.",
  },
  {
    number: 6,
    title: "Sale and Purchase Agreement",
    text: "A bilingual agreement (English–Thai) drafted by our partner law firm. We review every clause with you and explain Thai-specific provisions in plain language. Deposit is held in escrow until closing.",
  },
  {
    number: 7,
    title: "Closing at the Land Office",
    text: "We represent you at the Land Office for title transfer, tax payment, and registration. You receive originals of all documents, our final transaction report, and contacts for ongoing matters — utilities, local authorities, tax.",
  },
] as const;

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Process"
        title="From discovery to title in seven stages."
        lede="Every transaction follows the same sequence. Each stage has a defined deliverable and a clear point at which you can walk away with no obligation."
      />

      <ProcessTimeline steps={[...STEPS]} />

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              Ready when you are.
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              A discovery call is the cheapest hour we&rsquo;ll spend
              together — and the most useful. Bring your questions, even the
              ones that feel obvious.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="md">
                <Link href="/contact">Book a call</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/listings">Browse listings first</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

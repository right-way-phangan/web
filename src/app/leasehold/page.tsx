import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  ShieldCheck,
  FileSignature,
  CalendarClock,
  Landmark,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { LeaseholdScheme } from "@/components/sections/leasehold-scheme";
import { LeaseholdListings } from "@/components/sections/leasehold-listings";
import { Reveal } from "@/components/sections/reveal";
import { Appear } from "@/components/motion/appear";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";
import { whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Leasehold villas on Koh Phangan — own the house, lease the land",
  description:
    "The safe way for foreigners to hold a villa on Koh Phangan: own the building outright, lease the land on a registered long lease — no nominees, no Thai shell company. Registered lease, lawyer-held deposit, two-level due diligence.",
  alternates: {
    canonical: "/leasehold",
    languages: { en: "/leasehold", ru: "/ru/leasehold", "x-default": "/leasehold" },
  },
};

const PILLARS = [
  {
    icon: Building2,
    title: "The villa is yours; the land is leased",
    text: "In Thailand the building and the land are separate titles. You hold the villa as a structure in your own name — building permit, and a registered superficies where it fits — while the land underneath sits on a long lease you control. Two clean titles, not one tangled one.",
  },
  {
    icon: ShieldCheck,
    title: "No nominee, no shell company",
    text: "The freehold-through-a-Thai-company route — a foreigner controlling a minority while Thai nominees hold the rest — is exactly what authorities are investigating on the island right now. A registered lease needs none of it.",
  },
  {
    icon: FileSignature,
    title: "Registered at the Land Office",
    text: "Thirty years is the maximum single term a Thai land lease can be registered for. We register it against the deed — your name on the title record — not a verbal promise sitting in a drawer.",
  },
  {
    icon: CalendarClock,
    title: "Renewal written in (30+30)",
    text: "Leases are structured with contractual renewals — typically framed as 30+30 — and, on the right deal, a registered option to renew or to buy the land later. The horizon stretches well past the first term.",
  },
  {
    icon: Landmark,
    title: "Your money is protected until registration",
    text: "Your deposit is held by the partner law firm in a dedicated client account — never paid to the seller up front — and released only once the lease and the building are registered in your name. You pay when it's actually yours on paper.",
  },
  {
    icon: ClipboardCheck,
    title: "Two-level due diligence",
    text: "Listing-stage vetting before a property is published, then full transaction due diligence with a lawyer before you sign. The lease, the building permit and the land title are all read at the source.",
  },
] as const;

const FAQ = [
  {
    q: "Can a foreigner legally own property in Thailand?",
    a: "Foreigners can't own land outright, but they can own a building, and they can hold land on a registered long lease. Leasehold is the route most international buyers use for a villa: you own the house as a structure and lease the land it stands on. A condo unit is the other foreign-ownership route, but Phangan has almost no qualifying condos.",
  },
  {
    q: "What happens when the lease ends?",
    a: "A Thai land lease is registrable for up to 30 years at a time. Contracts are written with renewal options — usually framed as 30+30 — and, on the right deal, a registered option to renew or to buy. What's enforceable depends on the wording and the landowner, which is why the lease is part of our transaction due diligence and your lawyer's review before you sign.",
  },
  {
    q: "Do I actually own the villa, or just rent it?",
    a: "You own the villa. The building and the land are separate titles in Thailand — a foreigner can hold the building in their own name, with the building permit and, where used, a registered superficies, while the land underneath is leased. You can sell the building and assign the remaining lease to the next buyer.",
  },
  {
    q: "Why leasehold instead of a Thai company holding freehold?",
    a: "The company route — a Thai Co., Ltd. where the foreign buyer controls a minority and Thai nominees hold the rest — is the structure currently under scrutiny on the island. It carries nominee risk and ongoing company costs. A registered lease is simpler, cheaper to maintain, and doesn't rely on nominees.",
  },
  {
    q: "Does leasehold make sense as an investment?",
    a: "It can. Our calculator models it the honest way: the resale value of a lease falls as the term runs down, any land rent is indexed year on year, and the projection is discounted by the remaining years of the lease. Run your own numbers — term, rent, growth — and see the cash flow before you commit.",
  },
] as const;

export default function LeaseholdPage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
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
        eyebrow="Leasehold"
        title="Own the villa. Lease the land. Skip the nominee."
        lede="Leasehold is how international buyers hold a home on Phangan without a Thai shell company — the building in your name, the land on a registered long lease, the deposit held safely by a lawyer until registration. Here is exactly how it works."
        aside={
          <LeaseholdScheme
            rows={[
              { icon: "home", title: "The villa — yours", text: "Building title registered in your name." },
              { icon: "land", title: "The land — leased", text: "30-year registered lease, renewals written into the contract." },
              { icon: "law", title: "The money — protected", text: "Deposit sits with the lawyer until registration day." },
            ]}
          />
        }
      />

      <section className="container-prose py-14 md:py-20">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
            {PILLARS.map((p, i) => (
              <Appear key={p.title} delay={(i % 2) * 0.08} className="h-full">
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-700">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl text-forest-900">{p.title}</h2>
                    <p className="mt-2 text-base leading-relaxed text-forest-500/75">{p.text}</p>
                  </div>
                </div>
              </Appear>
            ))}
          </div>
        </Reveal>

        {/* Run the numbers — the calculator is leasehold-aware (term decay, indexed
            land rent, lease-expiry discount). Deep-link straight into that mode. */}
        <div className="mt-16 rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5 md:mt-20">
          <div className="rounded-core bg-cream-50 p-8 shadow-bezel md:p-10">
            <h2 className="font-serif text-3xl text-forest-900">See the cash flow before you commit.</h2>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
              Our ROI calculator models leasehold the honest way: resale value falls as the
              term runs down, the land rent is indexed year on year, and the projection is
              discounted by the years left on the lease. Set the term, the rent and the growth
              you expect, and watch the numbers move.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild variant="primary" size="md">
                <Link href={"/calculator?tenure=leasehold" as Route}>Run the numbers</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/projects" as Route}>Leasehold developer projects</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Live leasehold inventory — real cards, crawlable, one click to buy. */}
        <LeaseholdListings locale="en" />

        {/* FAQ — visible Q&A mirrors the FAQPage JSON-LD above (AEO). */}
        <div className="mt-16 md:mt-20">
          <h2 className="font-serif text-3xl text-forest-900">Leasehold, answered.</h2>
          <dl className="mt-8 grid gap-8 md:grid-cols-2 md:gap-x-14">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-serif text-xl text-forest-900">{f.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-forest-500/75">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* What this is — and what it isn't (mirrors the due-diligence trust block). */}
        <div className="mt-16 rounded-sm border border-forest-500/10 bg-cream-50 p-8 md:mt-20 md:p-10">
          <h2 className="font-serif text-3xl text-forest-900">Leasehold done properly.</h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
            A registered lease, the building in your name, the deposit held safely until registration, and the
            same two-level checks behind every listing —{" "}
            <Link href="/due-diligence" className="underline decoration-brass-500/40 underline-offset-4 hover:decoration-brass-500">
              what we verify
            </Link>{" "}
            at listing stage, then full transaction due diligence with a lawyer.
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-forest-500/60">
            This page explains how leasehold works on Koh Phangan — it is not legal advice. Lease
            terms, renewal rights and enforceability vary by deal and by landowner. We&rsquo;ll be
            the first to insist you hire your own lawyer, and independent legal review before any
            registration is part of every deal we handle.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="md">
              <Link href={"/projects" as Route}>Leasehold developer projects</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <a href={whatsappLink("Hi! I'd like to understand leasehold on Phangan.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Talk to us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

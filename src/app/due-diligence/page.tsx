import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import {
  FileCheck,
  Landmark,
  Map,
  Route as RouteIcon,
  Ruler,
  ScrollText,
  UserCheck,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "What we verify — due diligence on every listing",
  description:
    "The checks behind every Right Way listing on Koh Phangan: title deed at the Land Office, encumbrances, zoning, legal road access, GPS-surveyed boundaries, utilities, seller authority and building permits.",
  alternates: {
    canonical: "/due-diligence",
    languages: { en: "/due-diligence", ru: "/ru/due-diligence", "x-default": "/due-diligence" },
  },
};

const CHECKS = [
  {
    icon: ScrollText,
    title: "Title deed, verified at the Land Office",
    text: "We read the actual deed — Chanote or NS3K — at the Land Office, not a photo of it. Deed class, registered size and the chain of ownership have to match what the seller claims before a listing goes live.",
  },
  {
    icon: FileCheck,
    title: "Encumbrances and liens",
    text: "Mortgages, leases already registered on the land, servitudes, usufructs. Anything registered against the title shows up here — and anything we find goes into the listing notes, not under the rug.",
  },
  {
    icon: Map,
    title: "Zoning and building rules",
    text: "What the plot's zone actually allows: maximum height, footprint ratio, setbacks, environmental restrictions. A beautiful hillside plot you can't build on is not an investment.",
  },
  {
    icon: RouteIcon,
    title: "Legal road access",
    text: "Physical access is not legal access. We check whether the road to the plot is public, deeded, or crosses someone else's land — and whether the right of way is registered.",
  },
  {
    icon: Ruler,
    title: "Boundaries, GPS-surveyed",
    text: "Fences lie; coordinates don't. We walk the plot with the deed's survey points and flag any gap between what's fenced, what's farmed and what's actually owned.",
  },
  {
    icon: Zap,
    title: "Utilities on the ground",
    text: "Government electricity or a neighbour's extension cord? Real water source — municipal, well, or seasonal? Internet options? We verify on site, not from the listing the seller wrote.",
  },
  {
    icon: UserCheck,
    title: "Seller identity and authority",
    text: "The person selling has to be the person on the deed — or hold a verifiable power of attorney. Company-held land gets a company check: status, directors, authority to sell.",
  },
  {
    icon: Landmark,
    title: "Permits on built property",
    text: "For villas and houses: building permit, house registration book, and whether what stands matches what was permitted. Unpermitted structures are a discount conversation, not a surprise.",
  },
] as const;

export default function DueDiligencePage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How Right Way verifies a property listing on Koh Phangan",
    description:
      "The due-diligence checklist applied to every Right Way listing before it is published.",
    step: CHECKS.map((c, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: c.title,
      text: c.text,
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
        eyebrow="Due diligence"
        title="What we verify before a listing goes live."
        lede="Every property on this site carries the same badge — and the badge means the same eight checks, done in person, every time. Here is exactly what stands behind it."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
          {CHECKS.map((c, i) => (
            <div key={c.title} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-brass-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-forest-900">{c.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-sm border border-forest-500/10 bg-cream-50 p-8 md:mt-20 md:p-10">
          <h2 className="font-serif text-3xl text-forest-900">
            What this is — and what it isn&rsquo;t.
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
            Our verification is the screen that keeps bad listings off this site. It does
            not replace your own lawyer — and we&rsquo;ll be the first to insist you hire
            one. Independent legal review before transfer is part of every deal we
            handle, and we&rsquo;ll introduce you to lawyers we trust if you don&rsquo;t
            have your own.
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-forest-500/60">
            The <strong className="font-medium text-forest-500/80">Vetted by Right Way</strong>{" "}
            badge means a property passed these listing-stage checks on the date shown — a
            good-faith screen using the documents and public records available to us at
            that time. It is not a legal guarantee of title, boundaries or buildability,
            and conditions can change after the date of the check. The binding
            verification is the transaction-stage due diligence and the independent legal
            review before any transfer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="md">
              <Link href="/listings">Browse verified listings</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/process">How a deal works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

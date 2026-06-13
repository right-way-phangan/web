import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { EstimateTool } from "@/components/tools/estimate-tool";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "What's my Koh Phangan property worth? — instant estimate",
  description:
    "Get an instant, data-backed market estimate for land or a villa on Koh Phangan, based on Right Way's own deal data. Free, no obligation — then a precise valuation from our team.",
  alternates: {
    canonical: "/tools/estimate",
    languages: { en: "/tools/estimate", ru: "/ru/tools/estimate" },
  },
  openGraph: {
    title: "What's my Koh Phangan property worth?",
    description:
      "Instant, data-backed market estimate for land or villas on Koh Phangan — free, from Right Way's own deal data.",
    url: "/tools/estimate",
  },
};

// Engine reads the live catalog; keep the page fresh but cacheable.
export const revalidate = 300;

export default function EstimatePage() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Right Way — Koh Phangan property value estimator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/tools/estimate`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    description:
      "Instant indicative market estimate for land and villas on Koh Phangan, based on Right Way's own catalogue, sold comparables and rental analytics.",
    publisher: { "@type": "Organization", name: "Right Way Phangan Group", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Free property estimate"
        title="What's your Koh Phangan property worth?"
        lede="An instant market estimate from our own deal data — sold plots, live listings and rental yields across the island. Free, no obligation. Then our team confirms the figure for your exact title and location."
      />
      <section className="container-prose mt-10 md:mt-14">
        <EstimateTool lang="en" />
      </section>
    </>
  );
}

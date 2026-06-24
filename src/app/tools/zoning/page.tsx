import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { ZoneChecker } from "@/components/tools/zone-checker";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "What can I build here? — Koh Phangan zoning checker",
  description:
    "Paste a Koh Phangan location and see its indicative building rules — the city-plan (ผังเมือง) zone, permitted use and what to verify before you build. Free; exact figures are confirmed in our due diligence.",
  alternates: {
    canonical: "/tools/zoning",
    languages: { en: "/tools/zoning", ru: "/ru/tools/zoning", "x-default": "/tools/zoning" },
  },
  openGraph: {
    title: "What can I build on this Koh Phangan plot?",
    description:
      "Paste a location → see the city-plan zone, permitted use and build cautions for any point on Koh Phangan. Free, indicative.",
    url: "/tools/zoning",
  },
};

export const revalidate = 300;

export default function ZoningPage() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Right Way — Koh Phangan zoning & building-rules checker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/tools/zoning`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    description:
      "Indicative building rules for any point on Koh Phangan, read from the Thai city-plan (ผังเมือง) land-use zone: permitted use, typical build form and cautions to verify in due diligence.",
    publisher: { "@type": "Organization", name: "Right Way Phangan Group", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <PageHero
        eyebrow="Free zoning check"
        title="What can you build on this plot?"
        lede="Paste a Koh Phangan location — or click the plot on the map — and we read the Thai city-plan (ผังเมือง) zone at that point: permitted use, typical build form and what to verify first. Indicative; the exact height, footprint and setbacks for your title are confirmed in our due diligence."
      />
      <section className="container-prose mt-10 md:mt-14">
        <ZoneChecker locale="en" />
      </section>
    </>
  );
}

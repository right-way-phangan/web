import { siteConfig } from "@/lib/site-config";

/**
 * Sitewide WebSite markup with a SearchAction. Tells Google the site is
 * searchable and where its search lives (/listings?q=) — this is what can earn
 * a sitelinks search box under the brand result in Google. The publisher @id
 * links back to the RealEstateAgent entity (OrganizationJsonLd) so both nodes
 * resolve to one knowledge-graph entity.
 */
export function WebsiteJsonLd({ siteUrl }: { siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    url: siteUrl,
    name: siteConfig.name,
    inLanguage: ["en", "ru"],
    publisher: { "@id": `${siteUrl}#org` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/listings?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

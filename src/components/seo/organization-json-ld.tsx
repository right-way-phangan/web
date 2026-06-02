import { siteConfig } from "@/lib/site-config";

/**
 * Sitewide Organization markup. Rendered once from RootLayout — Google uses
 * it to associate the site with the company, surface logo + contacts in the
 * knowledge panel, and link out to social profiles.
 */
export function OrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}#org`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    areaServed: { "@type": "Place", name: "Koh Phangan, Thailand" },
    sameAs: [
      `https://t.me/${siteConfig.contact.telegram.channel}`,
      `https://wa.me/${siteConfig.contact.whatsapp}`,
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: `+${siteConfig.contact.whatsapp}`,
        email: siteConfig.contact.email,
        availableLanguage: ["English", "Russian"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

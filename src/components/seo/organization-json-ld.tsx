import { siteConfig } from "@/lib/site-config";

/**
 * Sitewide Organization markup. Rendered once from RootLayout — Google uses
 * it to associate the site with the company, surface logo + contacts in the
 * knowledge panel, and link out to social profiles.
 */
export function OrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
  const { telegram, whatsapp, email } = siteConfig.contact;

  // Telegram channel / WhatsApp are env-gated and some are intentionally off at
  // this stage. Only advertise live profiles — a broken `https://t.me/` in
  // sameAs pollutes the entity graph instead of strengthening it.
  const sameAs = [
    telegram.channel && `https://t.me/${telegram.channel}`,
    whatsapp && `https://wa.me/${whatsapp}`,
  ].filter((u): u is string => Boolean(u));

  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}#org`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    areaServed: { "@type": "Place", name: "Koh Phangan, Thailand" },
    ...(sameAs.length ? { sameAs } : {}),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        ...(whatsapp ? { telephone: `+${whatsapp}` } : {}),
        email,
        availableLanguage: ["English", "Russian"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
       
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

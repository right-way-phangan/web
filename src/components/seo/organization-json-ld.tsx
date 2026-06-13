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
    // Square logo (≥112px) → eligible for the knowledge-panel logo slot; image
    // is the generated OG card. Both absolute so Google can fetch them directly.
    logo: `${siteUrl}/icon-512.png`,
    image: `${siteUrl}/opengraph-image`,
    areaServed: { "@type": "Place", name: "Koh Phangan, Thailand" },
    // No street address yet (pre-incorporation), but locality + island geo are
    // a real local-SEO signal for "real estate agent Koh Phangan" queries.
    address: {
      "@type": "PostalAddress",
      addressLocality: "Koh Phangan",
      addressRegion: "Surat Thani",
      addressCountry: "TH",
    },
    geo: { "@type": "GeoCoordinates", latitude: 9.7345, longitude: 100.015 },
    knowsLanguage: ["en", "ru"],
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

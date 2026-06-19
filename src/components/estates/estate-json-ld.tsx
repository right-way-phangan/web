import { jsonLdHtml } from "@/lib/seo/json-ld";
import type { LandEstate } from "@/content/land-estates";
import { plotPriceVisible } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Structured data для подборки участков: CollectionPage с ItemList лотов. У
 * каждого лота — Offer со статусом наличия (ItemAvailability), чтобы поисковики
 * и ИИ-ответы понимали, какие участки ещё свободны.
 */
const AVAILABILITY: Record<string, string> = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/PreOrder",
  sold: "https://schema.org/SoldOut",
  rented: "https://schema.org/SoldOut",
};

export function EstateJsonLd({
  estate,
  url,
  locale,
}: {
  estate: LandEstate;
  url: string;
  locale: Locale;
}) {
  const origin = (() => {
    try {
      return new URL(url).origin;
    } catch {
      return "";
    }
  })();
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: estate.name[locale],
    description: estate.tagline[locale],
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: estate.plots.length,
      itemListElement: estate.plots.map((plot, i) => {
        const price =
          plotPriceVisible(plot.status) && plot.tenure === "Freehold" ? plot.priceThb : undefined;
        const photo = plot.photos?.[0];
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Offer",
            name: plot.code,
            url: `${url}?lot=${plot.code}`,
            availability: AVAILABILITY[plot.status],
            ...(price
              ? { price, priceCurrency: "THB" }
              : {}),
            itemOffered: {
              "@type": "Place",
              name: `${estate.name[locale]} — ${plot.code}`,
              ...(photo && origin ? { image: `${origin}${photo}` } : {}),
              ...(plot.areaSqm
                ? { floorSize: { "@type": "QuantitativeValue", value: plot.areaSqm, unitCode: "MTK" } }
                : {}),
              address: { "@type": "PostalAddress", addressLocality: estate.district, addressCountry: "TH" },
              ...(estate.lat && estate.lng
                ? { geo: { "@type": "GeoCoordinates", latitude: estate.lat, longitude: estate.lng } }
                : {}),
            },
          },
        };
      }),
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }} />
  );
}

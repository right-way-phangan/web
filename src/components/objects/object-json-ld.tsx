import type { RealEstateObject } from "@/types/object";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { siteConfig } from "@/lib/site-config";
import { cleanMetaDescription } from "@/lib/utils/meta";
import { objectDescriptionText } from "@/lib/generate/object-description";

interface Props {
  object: RealEstateObject;
  url: string;
}

/**
 * Schema.org Product + Place structured data for the object detail page.
 * Google Rich Results recognizes Product schema for real-estate listings
 * better than the (legacy) RealEstateListing type.
 */
export function ObjectJsonLd({ object, url }: Props) {
  // Product image: cover first, then a few gallery shots (deduped). Google
  // wants an image[] on Product for rich results.
  const images = [object.coverImage, ...(object.gallery ?? [])]
    .filter((u): u is string => !!u)
    .filter((u, i, arr) => arr.indexOf(u) === i)
    .slice(0, 4);

  // Headline asking price → Offer, so the listing can show price in results.
  // Land priced per-rai only and rentals get no Offer rather than a fabricated
  // number. All public objects are Active (getPublicObjects), hence InStock.
  const offers = object.priceThb
    ? {
        "@type": "Offer",
        price: object.priceThb,
        priceCurrency: "THB",
        availability: "https://schema.org/InStock",
        url,
      }
    : undefined;

  // Geo for the property — useful for a real-estate site's map/local surfaces.
  // Coordinates are already public (map pins on /listings).
  const geo =
    object.lat != null && object.lng != null
      ? { "@type": "GeoCoordinates", latitude: object.lat, longitude: object.lng }
      : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    name: object.titleEn,
    sku: object.rwNumber,
    category: object.type,
    description:
      cleanMetaDescription(objectDescriptionText(object, "en"), 500) ??
      object.titleEn,
    ...(images.length ? { image: images } : {}),
    ...(offers ? { offers } : {}),
    brand: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    ...(geo ? { geo } : {}),
    additionalProperty: [
      object.district && {
        "@type": "PropertyValue",
        name: "District",
        value: object.district,
      },
      object.areaRai && {
        "@type": "PropertyValue",
        name: "Area",
        value: `${object.areaRai} rai`,
      },
      object.documentType && {
        "@type": "PropertyValue",
        name: "Document type",
        value: object.documentType,
      },
      object.tenure?.length && {
        "@type": "PropertyValue",
        name: "Tenure",
        value: object.tenure.join(", "),
      },
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
       
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
    />
  );
}

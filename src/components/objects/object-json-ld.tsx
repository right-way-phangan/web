import type { RealEstateObject } from "@/types/object";
import { siteConfig } from "@/lib/site-config";

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
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    name: object.titleEn,
    sku: object.rwNumber,
    category: object.type,
    description: object.descriptionRaw?.slice(0, 500) ?? object.titleEn,
    brand: {
      "@type": "Organization",
      name: siteConfig.name,
    },
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
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

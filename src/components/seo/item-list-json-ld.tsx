import type { RealEstateObject } from "@/types/object";
import { getSiteUrl } from "@/lib/site-url";

/**
 * ItemList structured data for listing collections (/listings, district
 * pages): tells search/AI crawlers the page is an ordered inventory list and
 * which detail URLs it contains — the cards themselves are client-rendered.
 */
export function ItemListJsonLd({
  name,
  objects,
  limit = 24,
}: {
  name: string;
  objects: RealEstateObject[];
  limit?: number;
}) {
  const siteUrl = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: objects.length,
    itemListElement: objects.slice(0, limit).map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${o.titleEn} — ${o.rwNumber}`,
      url: `${siteUrl}/object/${o.rwNumber}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

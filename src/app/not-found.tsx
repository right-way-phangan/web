import { getPublicObjects } from "@/lib/data/objects";
import { NotFoundContent } from "@/components/layout/not-found-content";
import type { RealEstateObject } from "@/types/object";

/**
 * Smart 404: a dead link still lands on live inventory. Server component
 * fetches a few photo-first listings; locale-aware copy lives in the client
 * chrome (it reads the URL). Catalog failure degrades to the plain 404.
 *
 * Next embeds the root not-found into every page's initial RSC payload, so
 * the objects are cut down to exactly what ObjectCard renders — passing full
 * objects (galleries, descriptions, RU-sourced notes) would bloat every page.
 */
function slimForCard(o: RealEstateObject): RealEstateObject {
  return {
    id: o.id,
    rwNumber: o.rwNumber,
    titleEn: o.titleEn,
    type: o.type,
    status: o.status,
    district: o.district,
    documentType: o.documentType,
    priceThb: o.priceThb,
    pricePerRai: o.pricePerRai,
    rentPerRaiMonth: o.rentPerRaiMonth,
    areaRai: o.areaRai,
    areaSqm: o.areaSqm,
    bedrooms: o.bedrooms,
    coverImage: o.coverImage,
    dateAdded: o.dateAdded,
    seaView: o.seaView,
    beachfront: o.beachfront,
    mountainView: o.mountainView,
    jungleView: o.jungleView,
    flatLand: o.flatLand,
    quiet: o.quiet,
    electricity: o.electricity,
  };
}

export default async function NotFound() {
  const fresh = await getPublicObjects()
    .then((objects) => objects.filter((o) => o.coverImage).slice(0, 3).map(slimForCard))
    .catch(() => []);

  return <NotFoundContent fresh={fresh} />;
}

import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { NotFoundContent } from "@/components/layout/not-found-content";

/**
 * Smart 404: a dead link still lands on live inventory. Server component
 * fetches a few photo-first listings; locale-aware copy lives in the client
 * chrome (it reads the URL). Catalog failure degrades to the plain 404.
 *
 * Next embeds the root not-found into every page's initial RSC payload, so
 * the objects are cut down to exactly what ObjectCard renders — passing full
 * objects (galleries, descriptions, RU-sourced notes) would bloat every page.
 */
export default async function NotFound() {
  const fresh = await getPublicObjects()
    .then((objects) => objects.filter((o) => o.coverImage).slice(0, 3).map(slimObjectForCard))
    .catch(() => []);

  return <NotFoundContent fresh={fresh} />;
}

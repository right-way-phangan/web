import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { NotFoundFresh } from "@/components/layout/not-found-fresh";

/**
 * "Fresh on the island" strip for the 404s (root and /ru). Server component
 * rendered under Suspense by the not-found pages: if the catalogue is down the
 * strip simply doesn't appear and the 404 stays intact.
 */
export async function FreshListings() {
  try {
    const objects = await getPublicObjects();
    const fresh = objects
      .filter((o) => o.coverImage)
      .slice(0, 3)
      .map(slimObjectForCard);
    if (fresh.length === 0) return null;
    return <NotFoundFresh fresh={fresh} />;
  } catch {
    // Каталог недоступен — 404 остаётся полноценной, просто без подборки.
    return null;
  }
}

import { getPublicObjects } from "@/lib/data/objects";
import { NotFoundContent } from "@/components/layout/not-found-content";

/**
 * Smart 404: a dead link still lands on live inventory. Server component
 * fetches a few photo-first listings; locale-aware copy lives in the client
 * chrome (it reads the URL). Catalog failure degrades to the plain 404.
 */
export default async function NotFound() {
  const fresh = await getPublicObjects()
    .then((objects) => objects.filter((o) => o.coverImage).slice(0, 3))
    .catch(() => []);

  return <NotFoundContent fresh={fresh} />;
}

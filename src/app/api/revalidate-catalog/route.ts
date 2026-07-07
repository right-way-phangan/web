import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// On-demand cache-bust for the catalog. Catalog data is fetched with a 300s TTL
// (CATALOG_REVALIDATE_SECONDS in lib/data/objects.ts); for the low-traffic
// /objects/all fetch the fetch Data Cache entry can wedge stale far beyond that
// — a deleted object kept serving its "unavailable" page long after removal, and
// neither a fresh prod deploy nor `vercel cache purge` clears the fetch Data
// Cache. revalidatePath invalidates the entries via the route's implicit tag,
// which works even for entries cached by a prior deployment. Call after any
// catalog mutation (add / delete object) to force object pages + listings to
// re-fetch on the next request.
//
// Gated by OBJECTS_API_TOKEN (the existing site↔backend secret), same
// secure-by-default shape as health-summary: no token → 404, wrong token → 401.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = process.env.OBJECTS_API_TOKEN;
  if (!token) {
    return new NextResponse("not found", { status: 404 });
  }
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${token}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  revalidatePath("/object/[rw]", "page");
  revalidatePath("/ru/object/[rw]", "page");
  revalidatePath("/listings");

  return NextResponse.json({ revalidated: true });
}

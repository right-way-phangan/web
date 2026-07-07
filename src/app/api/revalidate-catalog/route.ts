import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

// On-demand cache-bust for the catalog. Catalog data is cached for 300s
// (CATALOG_REVALIDATE_SECONDS in lib/data/objects.ts) under the "catalog" tag;
// without this, an object added or DELETED in the CRM only (dis)appears from the
// site after the TTL — and in practice a low-traffic entry could wedge stale far
// longer (a deleted object kept serving its "unavailable" page long after
// removal). revalidateTag("catalog") busts the catalog keyspace instantly;
// revalidatePath refreshes the rendered object/listings routes. Call after any
// catalog mutation (add / delete object).
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

  revalidateTag("catalog");
  revalidatePath("/object/[rw]", "page");
  revalidatePath("/ru/object/[rw]", "page");
  revalidatePath("/listings");

  return NextResponse.json({ revalidated: true });
}

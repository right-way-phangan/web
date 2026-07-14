import { R2_PUBLIC_BASE } from "@/lib/storage/r2-public";

/**
 * Same-origin video proxy. Photos ride the cached /media/r2/* rewrite fine
 * (full 200s), but videos stream via Range requests and Vercel's edge cached
 * a 206 partial under the bare URL key — then re-served that byte slice for
 * every Range, so a player asking for the ftyp/moov header got a cached tail
 * and died with MEDIA_ERR_SRC_NOT_SUPPORTED. Neither Vary: Range nor a
 * no-store response header fixed it: the rewrite's caching keys off r2.dev's
 * upstream `immutable` header, before our headers() runs. A dynamic route
 * handler with no-store is never edge-cached, so each Range hits R2 fresh and
 * correct. Video traffic is tiny (a couple of project pages), so serving it
 * through a function instead of the CDN is cheap. Long term: R2 custom domain.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const upstream = R2_PUBLIC_BASE + path.map(encodeURIComponent).join("/");
  const range = req.headers.get("range");
  const r = await fetch(upstream, range ? { headers: { Range: range } } : {});

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const v = r.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("cache-control", "no-store");

  return new Response(r.body, { status: r.status, headers });
}

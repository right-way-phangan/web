/**
 * Caching proxy for the third-party tile layers the maps use — Longdo (DOL
 * cadastral parcels + DPT city-plan zoning) and OpenTopoMap (terrain base).
 * Three jobs:
 *  1. Resilience — Vercel's CDN keeps serving cached tiles (s-maxage 30 d +
 *     SWR 1 y) through upstream hiccups, and the bounded Phangan tile set
 *     stays warm. (Longdo's ms.longdo.com is also an undocumented endpoint.)
 *  2. Single switch-off point — if an upstream closes, only this route changes.
 *  3. Politeness — OpenTopoMap's usage policy asks consumers to cache tiles and
 *     send a real User-Agent; the proxy does both for the whole site.
 *
 * Not an open proxy: layer/zoom whitelisted per layer, x/y clamped to the
 * Thailand bounding box at the requested zoom.
 */

type LayerCfg = {
  url: (z: number, x: number, y: number) => string;
  minZ: number;
  maxZ: number;
  headers?: Record<string, string>;
};

const LONGDO = (mode: string) => (z: number, x: number, y: number) =>
  `https://ms.longdo.com/mmmap/img.php?mode=${mode}&proj=epsg3857&zoom=${z}&x=${x}&y=${y}`;

const LAYERS: Record<string, LayerCfg> = {
  parcels: { url: LONGDO("dol_hd"), minZ: 17, maxZ: 19 },
  zoning: { url: LONGDO("cityplan_thailand"), minZ: 14, maxZ: 16 },
  // OpenTopoMap — terrain base. Native to z17; rotate a/b/c by tile to spread
  // load. OTM rejects requests without a real User-Agent, so we send one.
  topo: {
    url: (z, x, y) =>
      `https://${["a", "b", "c"][(x + y) % 3]}.tile.opentopomap.org/${z}/${x}/${y}.png`,
    minZ: 5,
    maxZ: 17,
    headers: {
      "User-Agent": "RightWayPhangan/1.0 (+https://rightwaygroup.co)",
      Referer: "https://rightwaygroup.co",
    },
  },
};

// Thailand bbox — same envelope the zone-lookup uses.
const LAT_MIN = 5, LAT_MAX = 21, LNG_MIN = 97, LNG_MAX = 106;

function tileX(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * 2 ** z);
}
function tileY(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ layer: string; z: string; x: string; y: string }> },
) {
  const { layer, z: zs, x: xs, y: ys } = await params;
  const cfg = LAYERS[layer];
  const z = Number(zs), x = Number(xs), y = Number(ys);
  if (!cfg || !Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) {
    return new Response("bad tile", { status: 400 });
  }
  if (z < cfg.minZ || z > cfg.maxZ) return new Response("zoom out of range", { status: 404 });
  // y grows southward, so max latitude gives the smallest y.
  if (x < tileX(LNG_MIN, z) || x > tileX(LNG_MAX, z) || y < tileY(LAT_MAX, z) || y > tileY(LAT_MIN, z)) {
    return new Response("outside Thailand", { status: 404 });
  }

  try {
    const res = await fetch(cfg.url(z, x, y), {
      headers: cfg.headers,
      next: { revalidate: 2592000 }, // 30 d in the Next data cache
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("image/png")) {
      return new Response("upstream error", { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    return new Response(await res.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        // CDN: 30 d fresh, serve stale up to a year while revalidating.
        "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=31536000",
      },
    });
  } catch {
    return new Response("upstream unreachable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

import sharp from "sharp";
import { type NextRequest } from "next/server";

/**
 * Static map PNG for the print brochure (the interactive Leaflet map is
 * print-hidden). Stitches a few CARTO "voyager" base tiles around the plot and
 * drops a brass pin at centre — server-composed with sharp, no API key, same
 * labelled basemap as the live map. Cached hard on the Vercel CDN (the image is
 * deterministic per lat/lng/zoom/size). Degrades to whatever tiles loaded; a
 * failed tile just leaves the cream background showing, never a crash.
 *
 * Guarded to the Phangan bbox — the only place we serve. Tile fetches use
 * computed x/y (no user-supplied URLs), so there's no SSRF surface.
 */
export const runtime = "nodejs";

const TILE = 256;
const TILE_BASE = "https://a.basemaps.cartocdn.com/rastertiles/voyager";
const LAT_MIN = 9.0,
  LAT_MAX = 10.5,
  LNG_MIN = 99.4,
  LNG_MAX = 100.7;

function lonToX(lon: number, z: number): number {
  return ((lon + 180) / 360) * 2 ** z;
}
function latToY(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
}
function num(v: string | null, def: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

// Amber marker (sand-ringed disc), anchored at its centre.
const PIN = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="8.5" fill="#985A0C" stroke="#FCF8F1" stroke-width="3"/></svg>`,
);

export async function GET(req: NextRequest): Promise<Response> {
  const sp = req.nextUrl.searchParams;
  const lat = num(sp.get("lat"), NaN);
  const lng = num(sp.get("lng"), NaN);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < LAT_MIN ||
    lat > LAT_MAX ||
    lng < LNG_MIN ||
    lng > LNG_MAX
  ) {
    return new Response("bad coords", { status: 400 });
  }
  const z = clamp(Math.round(num(sp.get("z"), 15)), 11, 16);
  const W = clamp(Math.round(num(sp.get("w"), 640)), 200, 1024);
  const H = clamp(Math.round(num(sp.get("h"), 320)), 150, 1024);

  // Global pixel centre of the plot, and the image's top-left global pixel.
  const cx = lonToX(lng, z) * TILE;
  const cy = latToY(lat, z) * TILE;
  const left0 = cx - W / 2;
  const top0 = cy - H / 2;
  const nTiles = 2 ** z;

  const xMin = Math.floor(left0 / TILE);
  const xMax = Math.floor((left0 + W) / TILE);
  const yMin = Math.floor(top0 / TILE);
  const yMax = Math.floor((top0 + H) / TILE);

  const composites: sharp.OverlayOptions[] = [];
  await Promise.all(
    range(xMin, xMax).flatMap((tx) =>
      range(yMin, yMax).map(async (ty) => {
        if (ty < 0 || ty >= nTiles) return;
        const wx = ((tx % nTiles) + nTiles) % nTiles; // wrap X at the antimeridian
        try {
          const res = await fetch(`${TILE_BASE}/${z}/${wx}/${ty}.png`, {
            cache: "force-cache",
            headers: { "User-Agent": "RightWayPhangan/1.0 (+https://rightwaygroup.co)" },
          });
          if (!res.ok) return;
          const buf = Buffer.from(await res.arrayBuffer());
          composites.push({
            input: buf,
            left: Math.round(tx * TILE - left0),
            top: Math.round(ty * TILE - top0),
          });
        } catch {
          /* skip a failed tile — background shows through */
        }
      }),
    ),
  );

  // Pin on top, centred on the plot.
  composites.push({ input: PIN, left: Math.round(W / 2 - 13), top: Math.round(H / 2 - 13) });

  try {
    const png = await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 232, g: 228, b: 218, alpha: 1 } },
    })
      .composite(composites)
      .png()
      .toBuffer();
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=31536000",
      },
    });
  } catch {
    return new Response("render failed", { status: 502 });
  }
}

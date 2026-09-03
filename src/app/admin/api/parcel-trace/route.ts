/**
 * Auto-trace a plot contour from the DOL cadastral layer for the admin map
 * pickers. POST { lat, lng } → { ok: true, polygon, areaSqm } or
 * { ok: false, reason }. Under /admin so the existing middleware gate protects
 * it. Node runtime: decodes PNG tiles with pngjs (see lib/geo/parcel-trace).
 */
import { PNG } from "pngjs";
import { traceParcel, type DecodedTile } from "@/lib/geo/parcel-trace";
import { isStaff } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

// Same Longdo upstream the /tiles proxy uses for the dol_hd parcel layer.
const DOL_URL = (z: number, x: number, y: number) =>
  `https://ms.longdo.com/mmmap/img.php?mode=dol_hd&proj=epsg3857&zoom=${z}&x=${x}&y=${y}`;

// Thailand envelope — reject coordinates the cadastral layer can't cover.
const LAT_MIN = 5, LAT_MAX = 21, LNG_MIN = 97, LNG_MAX = 106;

async function fetchTile(z: number, x: number, y: number): Promise<DecodedTile | null> {
  try {
    const res = await fetch(DOL_URL(z, x, y), {
      headers: { Referer: "https://map.longdo.com/" },
      next: { revalidate: 2592000 }, // 30 d — same warmth as the tile proxy
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("image/png")) return null;
    const png = PNG.sync.read(Buffer.from(await res.arrayBuffer()));
    return { data: png.data, width: png.width, height: png.height };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // Fans out to cadastre tile fetches — staff only, independent of middleware.
  if (!(await isStaff())) return Response.json({ ok: false, reason: "forbidden" }, { status: 403 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }
  const { lat, lng } = (body ?? {}) as { lat?: number; lng?: number };
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }
  if (lat < LAT_MIN || lat > LAT_MAX || lng < LNG_MIN || lng > LNG_MAX) {
    return Response.json({ ok: false, reason: "out-of-range" }, { status: 422 });
  }

  const result = await traceParcel(lat, lng, fetchTile);
  return Response.json(result);
}

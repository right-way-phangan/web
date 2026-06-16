/**
 * Auto-trace a land plot from the DOL cadastral raster.
 *
 * The admin map already lets you trace a plot by hand over Longdo's `dol_hd`
 * layer (red parcel-boundary lines on a transparent background). This does the
 * same job automatically: drop a pin inside a plot, "flood-fill" the area
 * bounded by those red lines, trace the filled region's outline, simplify it to
 * a handful of vertices, and project the pixels back to lat/lng.
 *
 * Accuracy is exactly the cadastral layer's — the same source a human traces by
 * eye — but the vertices land *on* the line instead of near it. It only works
 * where the plot has a closed boundary on the tile; gaps, plots larger than the
 * fetched mosaic, or a pin dropped on a line fall back to manual tracing
 * (the result carries a `reason` the caller surfaces to the user).
 *
 * Server-only: decodes PNG tiles (pngjs) and is CPU-heavy. The actual tile
 * fetch is injected so the algorithm stays pure and testable.
 */
import { polygonAreaSqm } from "@/lib/utils/geo";

/** Longdo dol_hd renders each z/x/y extent at 512px (@2x). */
const TILE_PX = 512;
/** Parcel lines exist z17–19; z19 is the sharpest, so we trace there. */
const TRACE_ZOOM = 19;
/** Any pixel less transparent than this counts as a boundary line. The low
 *  threshold also catches anti-aliased line edges, which closes hairline gaps. */
const ALPHA_BORDER = 32;
/** Grow the tile mosaic up to 7×7 if the region leaks to the edge before
 *  giving up — covers larger plots without always fetching 49 tiles. */
const MAX_RING = 3;
/** Douglas–Peucker tolerance, in metres on the ground (≈0.9 m ≈ 6px @ z19). */
const SIMPLIFY_M = 0.9;
/** Reject a "plot" smaller than this — a pin in a tiny gap between lines. */
const MIN_AREA_SQM = 30;
/** How far to nudge a seed that landed on a line before giving up (px ≈1.5 m). */
const MAX_NUDGE_PX = 10;

export interface DecodedTile {
  data: Uint8Array | Buffer; // RGBA, row-major
  width: number;
  height: number;
}

/** Fetch+decode one dol_hd tile; return null on any upstream failure. */
export type TileFetcher = (
  z: number,
  x: number,
  y: number,
) => Promise<DecodedTile | null>;

export type ParcelTraceResult =
  | { ok: true; polygon: Array<[number, number]>; areaSqm: number }
  | { ok: false; reason: "open" | "too-small" | "on-line" | "no-tiles" };

/** Fractional tile coordinates (Web Mercator, 256-scheme tile count = 2^z). */
function lngLatToWorld(lng: number, lat: number, z: number): { fx: number; fy: number } {
  const n = 2 ** z;
  const fx = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const fy = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { fx, fy };
}

/** Inverse: a mosaic pixel back to [lat, lng] given the top-left tile. */
function pxToLngLat(px: number, py: number, tlX: number, tlY: number): [number, number] {
  const n = 2 ** TRACE_ZOOM;
  const fx = tlX + px / TILE_PX;
  const fy = tlY + py / TILE_PX;
  const lng = (fx / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * fy) / n))) * 180) / Math.PI;
  return [lat, lng];
}

/** Metres per mosaic pixel at this latitude (512px tiles → half the 256 value). */
function metersPerPixel(lat: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** TRACE_ZOOM / 2;
}

/**
 * Build the border mask for a (2R+1)² tile mosaic. Returns a flat Uint8Array
 * (1 = boundary line, 0 = open) plus its dimensions. Missing tiles are treated
 * as fully open (transparent) — that just makes the region leak and expand.
 */
function buildBorderMask(
  tiles: Map<string, DecodedTile | null>,
  cx: number,
  cy: number,
  ring: number,
): { mask: Uint8Array; size: number } {
  const span = 2 * ring + 1;
  const size = span * TILE_PX;
  const mask = new Uint8Array(size * size);
  for (let ty = -ring; ty <= ring; ty++) {
    for (let tx = -ring; tx <= ring; tx++) {
      const tile = tiles.get(`${cx + tx},${cy + ty}`);
      if (!tile) continue;
      const ox = (tx + ring) * TILE_PX;
      const oy = (ty + ring) * TILE_PX;
      const tw = tile.width;
      for (let y = 0; y < TILE_PX; y++) {
        for (let x = 0; x < TILE_PX; x++) {
          if (tile.data[(y * tw + x) * 4 + 3] > ALPHA_BORDER) {
            mask[(oy + y) * size + (ox + x)] = 1;
          }
        }
      }
    }
  }
  return { mask, size };
}

/** Nearest open pixel to (sx,sy) within MAX_NUDGE_PX, or null (pin on a line). */
function nudgeSeed(mask: Uint8Array, size: number, sx: number, sy: number): [number, number] | null {
  if (sx < 0 || sy < 0 || sx >= size || sy >= size) return null;
  if (!mask[sy * size + sx]) return [sx, sy];
  for (let r = 1; r <= MAX_NUDGE_PX; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; // ring only
        const x = sx + dx;
        const y = sy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        if (!mask[y * size + x]) return [x, y];
      }
    }
  }
  return null;
}

/**
 * 4-connected flood fill from the seed over open pixels. Returns the filled
 * region mask, its pixel count, and whether it reached the mosaic edge (which
 * means the boundary isn't closed within the fetched tiles → caller expands).
 */
function floodFill(
  border: Uint8Array,
  size: number,
  sx: number,
  sy: number,
): { region: Uint8Array; count: number; leaked: boolean } {
  const region = new Uint8Array(size * size);
  const stack: number[] = [sy * size + sx];
  region[sy * size + sx] = 1;
  let count = 0;
  let leaked = false;
  while (stack.length) {
    const p = stack.pop()!;
    count++;
    const x = p % size;
    const y = (p - x) / size;
    if (x === 0 || y === 0 || x === size - 1 || y === size - 1) leaked = true;
    const neighbors = [x > 0 ? p - 1 : -1, x < size - 1 ? p + 1 : -1, y > 0 ? p - size : -1, y < size - 1 ? p + size : -1];
    for (const q of neighbors) {
      if (q >= 0 && !border[q] && !region[q]) {
        region[q] = 1;
        stack.push(q);
      }
    }
  }
  return { region, count, leaked };
}

/** Moore-neighbour boundary trace of a filled region → closed pixel ring. */
function traceOutline(region: Uint8Array, size: number): Array<[number, number]> {
  const inRegion = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && region[y * size + x] === 1;
  // Start at the top-most, left-most region pixel.
  let sx = -1;
  let sy = -1;
  for (let i = 0; i < region.length && sx < 0; i++) {
    if (region[i]) {
      sx = i % size;
      sy = (i - sx) / size;
    }
  }
  const dirs: Array<[number, number]> = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const ring: Array<[number, number]> = [];
  let cx = sx;
  let cy = sy;
  let back = 6; // arrived from "up"
  let guard = 0;
  const guardMax = region.length;
  do {
    ring.push([cx, cy]);
    let moved = false;
    for (let k = 0; k < 8; k++) {
      const dir = (back + 1 + k) % 8;
      const nx = cx + dirs[dir][0];
      const ny = cy + dirs[dir][1];
      if (inRegion(nx, ny)) {
        cx = nx;
        cy = ny;
        back = (dir + 4) % 8;
        moved = true;
        break;
      }
    }
    if (!moved) break; // isolated pixel
    guard++;
  } while ((cx !== sx || cy !== sy) && guard < guardMax);
  return ring;
}

/** Douglas–Peucker simplification of a pixel ring. */
function simplify(points: Array<[number, number]>, epsilon: number): Array<[number, number]> {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  let dmax = 0;
  let idx = 0;
  const den = Math.hypot(by - ay, bx - ax) || 1;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const d = Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / den;
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax > epsilon) {
    const left = simplify(points.slice(0, idx + 1), epsilon);
    const right = simplify(points.slice(idx), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

/**
 * Trace the plot containing (lat, lng). Fetches dol_hd tiles via `fetchTile`,
 * expanding the mosaic until the region is enclosed, then returns a simplified
 * [lat, lng] ring + area, or a `reason` for falling back to manual tracing.
 */
export async function traceParcel(
  lat: number,
  lng: number,
  fetchTile: TileFetcher,
): Promise<ParcelTraceResult> {
  const { fx, fy } = lngLatToWorld(lng, lat, TRACE_ZOOM);
  const cx = Math.floor(fx);
  const cy = Math.floor(fy);
  const cache = new Map<string, DecodedTile | null>();

  for (let ring = 1; ring <= MAX_RING; ring++) {
    // Fetch every tile in the (2R+1)² mosaic (cached across rings).
    for (let ty = -ring; ty <= ring; ty++) {
      for (let tx = -ring; tx <= ring; tx++) {
        const key = `${cx + tx},${cy + ty}`;
        if (!cache.has(key)) cache.set(key, await fetchTile(TRACE_ZOOM, cx + tx, cy + ty));
      }
    }
    // The centre tile (where the pin is) must exist, else we have nothing.
    if (ring === 1 && !cache.get(`${cx},${cy}`)) return { ok: false, reason: "no-tiles" };

    const { mask, size } = buildBorderMask(cache, cx, cy, ring);
    const seedX = Math.round((fx - (cx - ring)) * TILE_PX);
    const seedY = Math.round((fy - (cy - ring)) * TILE_PX);
    const seed = nudgeSeed(mask, size, seedX, seedY);
    if (!seed) return { ok: false, reason: "on-line" };

    const { region, leaked } = floodFill(mask, size, seed[0], seed[1]);
    if (leaked) continue; // boundary open within this mosaic → grow

    const outline = traceOutline(region, size);
    const epsPx = SIMPLIFY_M / metersPerPixel(lat);
    let simplePx = simplify(outline, epsPx);
    if (simplePx.length > 1) {
      const [fxp, fyp] = simplePx[0];
      const [lxp, lyp] = simplePx[simplePx.length - 1];
      if (fxp === lxp && fyp === lyp) simplePx = simplePx.slice(0, -1); // drop closing dup
    }
    if (simplePx.length < 3) return { ok: false, reason: "too-small" };

    const polygon = simplePx.map(([x, y]) => pxToLngLat(x, y, cx - ring, cy - ring));
    const areaSqm = polygonAreaSqm(polygon);
    if (areaSqm < MIN_AREA_SQM) return { ok: false, reason: "too-small" };

    return { ok: true, polygon, areaSqm };
  }

  return { ok: false, reason: "open" };
}

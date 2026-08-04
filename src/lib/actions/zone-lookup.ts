"use server";

/**
 * City-plan zoning lookup by coordinates — the same trick map.longdo.com uses:
 * fetch the DPT zoning tile (mode=cityplan_thailand) that covers the point and
 * classify the pixel colour around it. Works server-side because ms.longdo.com
 * serves tiles openly (datacenter IPs included), unlike landsmaps.dol.go.th /
 * DPT services which sit behind Incapsula / geo-blocks.
 *
 * Indicative only — the admin confirms against landsmaps before publishing.
 */

import { PNG } from "pngjs";
import type { Zone } from "@/lib/amocrm/dictionaries";
import type { PlanZone } from "@/lib/data/building-norms";

export interface ZoneLookupResult {
  ok: boolean;
  /** Suggested value for the form's Zone select (subset of ZONES). */
  zone?: Zone;
  /** Colour class as classified — finer than Zone (the three greens differ). */
  planZone?: PlanZone;
  /** Human label for the admin (RU), e.g. «Заповедная сельхоз (штриховка)». */
  label?: string;
  /** Dominant sampled colour, for the UI chip. */
  colorHex?: string;
  /** True when the city plan simply has no data at this point (benign, not a failure). */
  noCoverage?: boolean;
  error?: string;
}

const TILE_ZOOM = 16; // finest native cityplan zoom
const SAMPLE_RADIUS = 6; // pixels around the target point (≈ 14 m at z16)

type ColorClass =
  | "green"
  | "greenBright"
  | "greenLight"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "water"
  | "olive"
  | "brown"
  | "gray"
  | "white";

/**
 * The DPT tile palette, sampled from the real Ko Phangan tiles (225 tiles at
 * z15, August 2026) rather than guessed. The three greens are what the size
 * limits hang off, and they are NOT ordered by lightness the way the Thai
 * names suggest — the "light green" recreation zone is drawn as vivid lime:
 *
 *   #37A700  rural & agricultural (สีเขียว, clause 10)      — 300 m² houses
 *   #54FE00  open space / recreation (สีเขียวอ่อน, cl. 11)  — 150 m², 30% of plot
 *   #4CE600  forest conservation (cl. 12) — drawn with white diagonal hatching
 *
 * Classification is nearest-colour with a tolerance, so anti-aliased edges and
 * JPEG-ish noise land on the right class instead of falling through to null.
 */
const PALETTE: Array<{ rgb: [number, number, number]; cls: ColorClass }> = [
  { rgb: [55, 167, 0], cls: "green" }, // #37A700 rural & agricultural
  { rgb: [84, 254, 0], cls: "greenLight" }, // #54FE00 open space / recreation
  { rgb: [76, 230, 0], cls: "greenBright" }, // #4CE600 forest conservation (hatched)
  { rgb: [166, 243, 128], cls: "greenBright" }, // #A6F380 hatch edge blend
  { rgb: [211, 249, 192], cls: "greenBright" }, // #D3F9C0 hatch edge blend
  { rgb: [254, 254, 0], cls: "yellow" }, // #FEFE00 low-density residential
  { rgb: [254, 126, 0], cls: "orange" }, // #FE7E00 medium-density residential
  { rgb: [254, 0, 0], cls: "red" }, // #FE0000 commercial
  { rgb: [160, 32, 160], cls: "purple" }, // industrial — not present on Phangan, unverified
  { rgb: [0, 126, 254], cls: "blue" }, // #007EFE government / utilities
  { rgb: [150, 218, 241], cls: "water" }, // #96DAF1 water / environmental open space
  { rgb: [84, 114, 0], cls: "olive" }, // #547200 education
  { rgb: [229, 151, 0], cls: "brown" }, // #E59700 cultural conservation
  { rgb: [172, 172, 172], cls: "gray" }, // #ACACAC other / uncategorised
];

const MAX_COLOR_DIST = 70; // Euclidean in RGB — tight enough to keep zones apart

function classifyPixel(r: number, g: number, b: number, a: number): ColorClass | null {
  if (a < 200) return null; // transparent → no plan data
  if (r >= 240 && g >= 240 && b >= 240) return "white"; // hatch background
  let best: ColorClass | null = null;
  let bestDist = Infinity;
  for (const { rgb, cls } of PALETTE) {
    const d = Math.hypot(r - rgb[0], g - rgb[1], b - rgb[2]);
    if (d < bestDist) {
      bestDist = d;
      best = cls;
    }
  }
  return bestDist <= MAX_COLOR_DIST ? best : null;
}

// Suggested Zone enum value + RU label per dominant class. Labels name the
// actual city-plan category (clause of the Ko Phangan plan) — the old
// "заповедная сельхоз" wording described a zone that does not exist here.
const CLASS_MAP: Record<Exclude<ColorClass, "white">, { zone: Zone; label: string }> = {
  green: { zone: "Green", label: "Сельская и сельхоз (зелёная)" },
  greenBright: { zone: "Green", label: "Лесная консервация (зелёная штриховка)" },
  greenLight: { zone: "Green", label: "Открытые пространства / рекреация (светло-зелёная)" },
  yellow: { zone: "Yellow", label: "Жилая малой плотности (жёлтая)" },
  orange: { zone: "Orange", label: "Жилая средней плотности (оранжевая)" },
  red: { zone: "Red", label: "Коммерческая (красная)" },
  purple: { zone: "Purple", label: "Промышленная (фиолетовая)" },
  blue: { zone: "Unknown", label: "Гос. учреждения и инфраструктура (синяя)" },
  water: { zone: "Unknown", label: "Акватория / водоохранная (голубая)" },
  olive: { zone: "Unknown", label: "Образование (оливковая)" },
  brown: { zone: "Unknown", label: "Культурная консервация (коричневая)" },
  gray: { zone: "Unknown", label: "Прочее / без категории (серая)" },
};

const CLASS_HEX: Record<Exclude<ColorClass, "white">, string> = {
  green: "#37A700",
  greenBright: "#4CE600",
  greenLight: "#54FE00",
  yellow: "#FEFE00",
  orange: "#FE7E00",
  red: "#FE0000",
  purple: "#A020A0",
  blue: "#007EFE",
  water: "#96DAF1",
  olive: "#547200",
  brown: "#E59700",
  gray: "#ACACAC",
};

export async function lookupZoneByLocation(lat: number, lng: number): Promise<ZoneLookupResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "Некорректные координаты" };
  }
  // Thailand bounding box — the layer only covers Thailand.
  if (lat < 5 || lat > 21 || lng < 97 || lng > 106) {
    return { ok: false, error: "Координаты вне Таиланда" };
  }

  // Slippy-map tile + in-tile pixel for the point.
  const n = 2 ** TILE_ZOOM;
  const xf = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yf = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  const tileX = Math.floor(xf);
  const tileY = Math.floor(yf);

  const url = `https://ms.longdo.com/mmmap/img.php?mode=cityplan_thailand&proj=epsg3857&zoom=${TILE_ZOOM}&x=${tileX}&y=${tileY}`;
  let png: PNG;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("image/png")) {
      return { ok: false, error: `Сервис зон недоступен (${res.status})` };
    }
    png = PNG.sync.read(Buffer.from(await res.arrayBuffer()));
  } catch {
    return { ok: false, error: "Сервис зон недоступен" };
  }

  const px = Math.min(png.width - 1, Math.max(0, Math.round((xf - tileX) * png.width)));
  const py = Math.min(png.height - 1, Math.max(0, Math.round((yf - tileY) * png.height)));

  // Count colour classes in a small window — robust against the conservation
  // hatch (green/white stripes) and anti-aliased zone borders.
  const counts = new Map<ColorClass, number>();
  let sampled = 0;
  for (let dy = -SAMPLE_RADIUS; dy <= SAMPLE_RADIUS; dy++) {
    for (let dx = -SAMPLE_RADIUS; dx <= SAMPLE_RADIUS; dx++) {
      const x = px + dx;
      const y = py + dy;
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      const i = (y * png.width + x) * 4;
      const cls = classifyPixel(png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]);
      sampled++;
      if (cls) counts.set(cls, (counts.get(cls) ?? 0) + 1);
    }
  }

  const colored = [...counts.entries()].filter(([c]) => c !== "white");
  const coloredTotal = colored.reduce((s, [, v]) => s + v, 0);
  if (sampled === 0 || coloredTotal < sampled * 0.1) {
    return { ok: false, noCoverage: true, error: "Нет данных ผังเมือง для этой точки" };
  }

  // Bright green + white stripes around the point ⇒ conservation hatch even if
  // white pixels outnumber any single colour.
  const white = counts.get("white") ?? 0;
  const bright = counts.get("greenBright") ?? 0;
  let dominant: Exclude<ColorClass, "white">;
  if (bright > sampled * 0.15 && white > sampled * 0.15) {
    dominant = "greenBright";
  } else {
    dominant = colored.sort((a, b) => b[1] - a[1])[0][0] as Exclude<ColorClass, "white">;
  }

  const { zone, label } = CLASS_MAP[dominant];
  return { ok: true, zone, planZone: dominant, label, colorHex: CLASS_HEX[dominant] };
}

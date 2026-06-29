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

export interface ZoneLookupResult {
  ok: boolean;
  /** Suggested value for the form's Zone select (subset of ZONES). */
  zone?: Zone;
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
  | "gray"
  | "white";

function classifyPixel(r: number, g: number, b: number, a: number): ColorClass | null {
  if (a < 200) return null; // transparent → no plan data
  if (r >= 240 && g >= 240 && b >= 240) return "white"; // hatch background
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 28) return "gray";
  if (r > 200 && g > 200 && b < 130) return "yellow";
  if (r > 200 && g > 120 && g < 200 && b < 110) return "orange";
  if (r > 170 && g < 130 && b < 130) return "red";
  if (r > 110 && b > 110 && g < Math.min(r, b) - 30) return "purple";
  if (b > 140 && b >= g && r < 120) return "blue";
  // Greens: pale (recreation) vs bright (conservation hatch) vs dark (rural).
  // greenLight must be genuinely green-dominant — pale pastel categories
  // (e.g. Bangkok's tan "cultural conservation") fall through to null.
  if (g > 200 && r > 130 && g > r + 40 && b < g - 60) return "greenLight";
  if (g > 190 && r < 130 && b < 100) return "greenBright";
  if (g > 110 && r < 130 && b < 100) return "green";
  return null;
}

// Suggested Zone enum value + RU label per dominant class.
const CLASS_MAP: Record<Exclude<ColorClass, "white">, { zone: Zone; label: string }> = {
  green: { zone: "Green", label: "Сельхоз / деревенская (зелёная)" },
  greenBright: { zone: "Green", label: "Заповедная сельхоз (зелёная штриховка)" },
  greenLight: { zone: "Green", label: "Рекреация / открытые пространства (салатовая)" },
  yellow: { zone: "Yellow", label: "Жилая малой плотности (жёлтая)" },
  orange: { zone: "Orange", label: "Жилая средней плотности (оранжевая)" },
  red: { zone: "Red", label: "Коммерческая (красная)" },
  purple: { zone: "Purple", label: "Промышленная (фиолетовая)" },
  blue: { zone: "Unknown", label: "Гос. учреждения (синяя)" },
  gray: { zone: "Unknown", label: "Прочее / без категории (серая)" },
};

const CLASS_HEX: Record<Exclude<ColorClass, "white">, string> = {
  green: "#37A700",
  greenBright: "#4BE500",
  greenLight: "#AFF38E",
  yellow: "#FEFE00",
  orange: "#FFA033",
  red: "#E03C31",
  purple: "#9B59B6",
  blue: "#2E6FBF",
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
  return { ok: true, zone, label, colorHex: CLASS_HEX[dominant] };
}

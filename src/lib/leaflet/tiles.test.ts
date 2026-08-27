import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { TILE_URL, TILE_ATTRIBUTION } from "./tiles";

/**
 * 2026-08-27: CARTO закрыл бесплатные подложки и стал отдавать — с кодом 200 —
 * плитку с надписью «API KEY REQUIRED». Все карты сайта молча превратились в
 * эту надпись. Базовый слой переведён на Esri, и переезд обнажил две грабли,
 * на которых легко подорваться при следующей смене провайдера.
 *
 * Первая: у Esri порядок осей {z}/{y}/{x}, а не {z}/{x}/{y} как у CARTO.
 * Перепутать — значит получить карту соседнего полушария, причём тайлы будут
 * приходить с кодом 200, без единой ошибки в консоли.
 *
 * Вторая: печатная брошюра клеит свою карту отдельным кодом в
 * app/staticmap/route.ts. Он должен ходить к тому же слою и по той же схеме,
 * иначе карта в PDF однажды разойдётся с картой на сайте.
 */

const STATICMAP = readFileSync(
  join(process.cwd(), "src", "app", "staticmap", "route.ts"),
  "utf8",
);

describe("basemap tiles", () => {
  it("keeps Esri axis order — y before x", () => {
    expect(TILE_URL).toContain("/{z}/{y}/{x}");
    expect(TILE_URL).not.toContain("/{z}/{x}/{y}");
  });

  it("asks for no placeholders the provider cannot serve", () => {
    // Ни субдоменов для ротации, ни retina: `@2x` у Esri возвращает ту же
    // плитку 256px, так что {r} только мусорил бы в URL.
    expect(TILE_URL).not.toContain("{s}");
    expect(TILE_URL).not.toContain("{r}");
  });

  it("credits the provider actually serving the tiles", () => {
    expect(TILE_ATTRIBUTION).toContain("Esri");
    expect(TILE_ATTRIBUTION).not.toContain("CARTO");
  });

  it("keeps the print brochure on the same layer and axis order", () => {
    const layer = TILE_URL.match(/services\/([^/]+)\/MapServer/)?.[1];
    expect(layer).toBeTruthy();
    expect(STATICMAP).toContain(`services/${layer}/MapServer`);
    expect(STATICMAP).toContain("${z}/${ty}/${wx}");
  });
});

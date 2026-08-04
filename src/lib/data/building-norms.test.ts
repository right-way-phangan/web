import { describe, expect, it } from "vitest";
import { combineBuildingNorms } from "./building-norms";

/** Value of the line with this label, or undefined when the line is absent. */
function line(
  norms: ReturnType<typeof combineBuildingNorms>,
  label: string,
): string | undefined {
  return norms?.lines.find((l) => l.label === label)?.value;
}

/**
 * The reference case is deed 13681 (Ban Tai side, 9.72206/99.98950), where we
 * have a lawyer's DD report to check against: light-green zone (clause 11),
 * 1,237.2 m² plot, 940 m from the sea, surveyed at 32–48 m a.s.l. and 27%
 * average slope. Its conclusion: 150 m² per house, 12 m tall, housing on at
 * most 30% of the plot, no slope restrictions.
 */
describe("combineBuildingNorms — against the DD report for deed 13681", () => {
  const plot = { seaDistanceM: 940, planZone: "greenLight" as const, plotSqm: 1237 };

  it("matches the report when fed the surveyed figures", () => {
    const n = combineBuildingNorms({ ...plot, elevationM: 48, slopePct: 27 }, "ru");
    expect(line(n, "Макс. площадь дома")).toBe("150 м² (все этажи, на здание)");
    expect(line(n, "Макс. высота")).toBe("12 м");
    expect(line(n, "Макс. застройка участка")).toBe("30% · до 371 м²");
    expect(line(n, "Разрешённое использование")).toBe("частная вилла / дом");
  });

  it("keeps the same limits when the DEM overstates the slope", () => {
    // Our DEM reads 51% here against the survey's 27% — an estimate must warn,
    // never cut the house down to a single 6 m storey on its own.
    const n = combineBuildingNorms(
      { ...plot, elevationM: 65, slopePct: 51, slopeEstimated: true },
      "ru",
    );
    expect(line(n, "Макс. высота")).toBe("12 м");
    expect(line(n, "Макс. площадь дома")).toBe("150 м² (все этажи, на здание)");
    expect(n?.notes.some((x) => x.includes("~51%"))).toBe(true);
  });

  it("applies the slope tier once a survey confirms it", () => {
    const n = combineBuildingNorms({ ...plot, elevationM: 48, slopePct: 40 }, "ru");
    expect(line(n, "Макс. высота")).toBe("6 м · 1 этаж");
    expect(line(n, "Макс. пятно застройки")).toBe("90 м²");
    expect(line(n, "Макс. застройка участка")).toBe("30% · до 371 м²");
  });
});

describe("combineBuildingNorms — city-plan tiers", () => {
  it("caps a rural (green) inland plot at 300 m²", () => {
    const n = combineBuildingNorms({ seaDistanceM: 945, elevationM: 65, planZone: "green" }, "ru");
    expect(line(n, "Макс. площадь дома")).toBe("300 м² (все этажи, на здание)");
    expect(line(n, "Макс. застройка участка")).toBe("70%");
  });

  it("applies the stricter shoreline tier inside 50 m", () => {
    // Yellow's shoreline tier is 300 m², but the 2025 env rule cuts it to 75.
    const n = combineBuildingNorms({ seaDistanceM: 30, planZone: "yellow" }, "en");
    expect(line(n, "Max house size")).toBe("75 m² (all floors, per building)");
    expect(line(n, "Max height")).toBe("6 m · 1 storey");
  });

  it("keeps the zone tiers apart (residential yellow inland is 1000 m²)", () => {
    const n = combineBuildingNorms({ seaDistanceM: 800, planZone: "yellow" }, "en");
    expect(line(n, "Max house size")).toBe("1,000 m² (all floors, per building)");
  });

  it("limits housing to 30% of the plot in the forest-conservation zone", () => {
    const n = combineBuildingNorms({ seaDistanceM: 800, planZone: "greenBright" }, "ru");
    expect(line(n, "Макс. застройка участка")).toBe("30%");
    expect(line(n, "Макс. площадь дома")).toBe("300 м² (все этажи, на здание)");
  });
});

describe("combineBuildingNorms — footprint and gates", () => {
  it("drops the footprint cap to 70 m² on a plot under 400 m²", () => {
    const n = combineBuildingNorms(
      { seaDistanceM: 800, slopePct: 40, planZone: "green", plotSqm: 300 },
      "en",
    );
    expect(line(n, "Max footprint")).toBe("70 m²");
    expect(line(n, "Max plot coverage")).toBe("50% · up to 150 m²");
  });

  it("still refuses to build within 10 m of the shore", () => {
    const n = combineBuildingNorms({ seaDistanceM: 5, planZone: "yellow" }, "en");
    expect(n?.buildable).toBe(false);
  });

  it("does not forbid building on a steep slope — it limits it", () => {
    const n = combineBuildingNorms({ seaDistanceM: 800, slopePct: 60, planZone: "green" }, "en");
    expect(n?.buildable).toBe(true);
    expect(n?.notes.some((x) => x.includes("50 cm"))).toBe(true);
  });

  it("returns null when nothing at all is known", () => {
    expect(combineBuildingNorms({}, "en")).toBeNull();
  });
});

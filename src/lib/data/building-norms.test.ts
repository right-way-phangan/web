import { describe, expect, it } from "vitest";
import { combineBuildingNorms } from "./building-norms";

/** Value of the line with this label, or undefined when the line is absent. */
function line(
  norms: ReturnType<typeof combineBuildingNorms>,
  label: string,
): string | undefined {
  return norms?.lines.find((l) => l.label === label)?.value;
}

describe("combineBuildingNorms — city-plan house size", () => {
  it("caps a rural (green) inland plot at 300 m² of combined floor area", () => {
    // The case that started this: 945 m from the sea, 65 m a.s.l., 27° slope —
    // no environmental tier bites, so the city plan is the only size limit.
    const n = combineBuildingNorms(
      { seaDistanceM: 945, elevationM: 65, slopeDeg: 27, planZone: "green" },
      "ru",
    );
    expect(n?.buildable).toBe(true);
    expect(line(n, "Макс. площадь дома")).toBe("300 м² (все этажи)");
    expect(line(n, "Макс. высота")).toBe("12 м");
  });

  it("applies the stricter shoreline tier inside 50 m", () => {
    // Green zone shoreline tier is 150 m², but the 2025 env rule cuts it to 75.
    const n = combineBuildingNorms({ seaDistanceM: 30, planZone: "green" }, "en");
    expect(line(n, "Max house size")).toBe("75 m² (all floors)");
    expect(line(n, "Max height")).toBe("6 m · 1 storey");
  });

  it("keeps the zone tiers apart (residential yellow is 1000 m²)", () => {
    const n = combineBuildingNorms({ seaDistanceM: 800, planZone: "yellow" }, "en");
    expect(line(n, "Max house size")).toBe("1,000 m² (all floors)");
  });

  it("limits housing to 30% of the plot in a protection zone", () => {
    const n = combineBuildingNorms({ seaDistanceM: 800, planZone: "greenBright" }, "ru");
    expect(line(n, "Макс. застройка участка")).toBe("30%");
    expect(line(n, "Макс. площадь дома")).toBe("300 м² (все этажи)");
  });

  it("turns the coverage % into m² once the plot area is known", () => {
    const n = combineBuildingNorms(
      { seaDistanceM: 800, planZone: "green", plotSqm: 1600 },
      "en",
    );
    expect(line(n, "Max plot coverage")).toBe("70% · up to 1,120 m²");
  });

  it("takes the strictest of the slope footprint and the coverage share", () => {
    const n = combineBuildingNorms(
      { seaDistanceM: 800, slopeDeg: 40, planZone: "green", plotSqm: 400 },
      "en",
    );
    // Slope caps the footprint at 80 m²; 25% of 400 m² is 100 m² → 80 wins.
    expect(line(n, "Max footprint")).toBe("80 m²");
    expect(n?.notes).toContain(
      "The plot is smaller than the minimum for this zone — building is doubtful.",
    );
  });

  it("still refuses to build within 10 m of the shore", () => {
    const n = combineBuildingNorms({ seaDistanceM: 5, planZone: "yellow" }, "en");
    expect(n?.buildable).toBe(false);
  });

  it("returns null when nothing at all is known", () => {
    expect(combineBuildingNorms({}, "en")).toBeNull();
  });
});

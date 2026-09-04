import { describe, expect, it } from "vitest";
import {
  confidenceOf,
  effectiveAnnualRangeThb,
  formatAnnualRange,
  measuredOccupancy,
  snapshotSeason,
  type RentalMarket,
} from "./rental-market";

type D = RentalMarket["districts"][number];
const meta = { occupancy: { conservative: 0.4, base: 0.55, high: 0.7 } } as RentalMarket["meta"];
const fmt = (v: number) => `฿${Math.round(v / 1000)}k`;

describe("годовой доход как диапазон (аудит аналитики 2026-09-04)", () => {
  it("низ — измеренная загрузка при достаточной выборке, верх — базовый сценарий", () => {
    const d = { adrMedian: 4000, occupancyMeasured: 0.23, nOccupancy: 40 } as D;
    const r = effectiveAnnualRangeThb(d, meta);
    expect(r.lowPct).toBe(23);
    expect(r.highPct).toBe(55);
    expect(r.low).toBe(Math.round(4000 * 365 * 0.23));
    expect(r.high).toBe(Math.round(4000 * 365 * 0.55));
    expect(formatAnnualRange(d, meta, fmt)).toBe("฿336k–฿803k");
  });

  it("малая выборка календарей → низ по консервативному сценарию, не по 5 объявлениям", () => {
    const d = { adrMedian: 5000, occupancyMeasured: 0.5, nOccupancy: 6 } as D;
    expect(measuredOccupancy(d, meta)).toBeNull();
    expect(effectiveAnnualRangeThb(d, meta).lowPct).toBe(40);
  });

  it("измеренная выше базы не переворачивает диапазон", () => {
    const d = { adrMedian: 5000, occupancyMeasured: 0.7, nOccupancy: 40 } as D;
    const r = effectiveAnnualRangeThb(d, meta);
    expect(r.lowPct).toBe(55);
    expect(r.highPct).toBe(55);
    expect(formatAnnualRange(d, meta, fmt)).toBe("฿1004k");
  });
});

describe("confidenceOf — 30 объявлений для «high»", () => {
  it.each([
    [11, "low"],
    [12, "medium"],
    [29, "medium"],
    [30, "high"],
  ])("n=%i → %s", (n, want) => {
    expect(confidenceOf(n)).toBe(want);
  });
});

describe("snapshotSeason", () => {
  it("июнь–август = низкий сезон", () => {
    expect(snapshotSeason(["2026-06-07", "2026-07-15", "2026-08-31"])).toEqual({
      season: "low",
      from: "2026-06-07",
      to: "2026-08-31",
    });
  });
  it("с декабрьским снимком — смешанный, пустой список — null", () => {
    expect(snapshotSeason(["2026-08-31", "2026-12-14"])?.season).toBe("mixed");
    expect(snapshotSeason([])).toBeNull();
    expect(snapshotSeason(undefined)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { computeRoi, DEFAULT_INPUTS, effectiveHorizonYears, leasePayForYear, type RoiInputs } from "./roi";
import { escalatedLeaseTotalThb } from "@/lib/objects/lease-format";
import { CLOSING_COSTS_PCT, roiPreview } from "./preview";
import { objectCalcSeed } from "@/lib/data/rental-estimate";
import type { RentalMarket } from "@/lib/data/rental-market";

const lease = (extra: Partial<RoiInputs> = {}): RoiInputs => ({
  ...DEFAULT_INPUTS,
  purchasePriceThb: 9_000_000,
  tenure: "leasehold",
  leaseTermYears: 30,
  mode: "hold",
  ...extra,
});

describe("leasehold — аудит 2026-09-04", () => {
  it("ступенчатая индексация ренты совпадает с карточкой объекта (escalatedLeaseTotalThb)", () => {
    const inp = lease({ leaseMonthly: true, leaseMonthlyThb: 30_000, leaseIndexationPct: 10, leaseIndexPeriodYears: 5, years: 30 });
    let total = 0;
    for (let y = 1; y <= 30; y++) total += leasePayForYear(inp, y);
    expect(Math.round(total)).toBe(escalatedLeaseTotalThb(30_000, 30, 10, 5));
    expect(computeRoi(inp).leasePaymentsTotal).toBeCloseTo(total, 0);
  });

  it("период 1 (или не задан) = прежняя ежегодная индексация", () => {
    const yearly = lease({ leaseMonthly: true, leaseMonthlyThb: 20_000, leaseIndexationPct: 3 });
    expect(leasePayForYear(yearly, 4)).toBeCloseTo(20_000 * 12 * 1.03 ** 3, 6);
    expect(leasePayForYear({ ...yearly, leaseIndexPeriodYears: 1 }, 4)).toBeCloseTo(20_000 * 12 * 1.03 ** 3, 6);
  });

  it("горизонт не выходит за срок аренды; renewable и freehold не режутся", () => {
    expect(effectiveHorizonYears(lease({ years: 35 }))).toBe(30);
    expect(effectiveHorizonYears(lease({ years: 10 }))).toBe(10);
    expect(effectiveHorizonYears(lease({ years: 35, leaseRenewable: true }))).toBe(35);
    expect(effectiveHorizonYears({ ...DEFAULT_INPUTS, years: 35 })).toBe(35);
    // 35 лет по 30-летнему договору = ровно 30 лет: стоимость на выходе 0, серия из 30 точек
    const r = computeRoi(lease({ years: 35 }));
    expect(r.projectedValue).toBe(0);
    expect(r.series.length).toBe(31);
  });

  it("издержки входа: leasehold 2.1% против 5% у freehold", () => {
    expect(CLOSING_COSTS_PCT.leasehold).toBeLessThan(CLOSING_COSTS_PCT.freehold);
  });

  it("превью для leasehold честно показывает эффективный рост ниже номинала", () => {
    const fh = roiPreview({ priceThb: 9_000_000, tenure: ["Freehold"], type: "Villa" })!;
    const lh = roiPreview({ priceThb: 9_000_000, tenure: ["Leasehold"], leaseTermYears: 30, type: "Villa" })!;
    expect(fh.leasehold).toBe(false);
    expect(fh.effectiveGrowthPct).toBeCloseTo(fh.growthPct, 0);
    expect(lh.leasehold).toBe(true);
    expect(lh.effectiveGrowthPct).toBeLessThan(lh.growthPct - 3);
    expect(lh.projectedValueThb).toBeLessThan(fh.projectedValueThb);
  });
});

describe("objectCalcSeed — ставка и загрузка из района, осторожная загрузка", () => {
  const market = {
    meta: { occupancy: { conservative: 0.4, base: 0.55, high: 0.7 }, adrMedianAll: 3000 },
    districts: [
      { name: "Haad Yao", adrMedian: 4000, adrP25: 2500, adrP75: 6000, n: 60, occupancyMeasured: 0.31, nOccupancy: 40 },
      { name: "Then Sadet", adrMedian: 5000, adrP25: 2000, adrP75: 6800, n: 15, occupancyMeasured: 0.5, nOccupancy: 6 },
    ],
    districtBedrooms: [{ district: "Haad Yao", bedrooms: 2, adrMedian: 5200, adrP25: 4000, adrP75: 7000, n: 22 }],
    byType: [],
  } as unknown as RentalMarket;

  it("берёт медиану по спальням района и измеренную загрузку при достаточной выборке", () => {
    const s = objectCalcSeed(market, "Haad Yao", 2, "Villa")!;
    expect(s.nightlyRateThb).toBe(5200);
    expect(s.occupancyPct).toBe(31);
    expect(s.n).toBe(22);
  });

  it("малая выборка занятости → консервативный сценарий, не измеренные 50%", () => {
    const s = objectCalcSeed(market, "Then Sadet", null, "Villa")!;
    expect(s.nightlyRateThb).toBe(5000);
    expect(s.occupancyPct).toBe(40);
  });

  it("нет района — нет посева (калькулятор остаётся на дефолтах, рейтинг скрыт)", () => {
    expect(objectCalcSeed(market, undefined, 2)).toBeNull();
    expect(objectCalcSeed(market, "Nowhere", 2)).toBeNull();
  });
});

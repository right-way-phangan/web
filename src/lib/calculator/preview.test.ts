import { describe, expect, it } from "vitest";
import { roiPreview } from "./preview";
import { computeRoi, DEFAULT_INPUTS } from "./roi";
import { getAppreciation, type RentalMarket } from "@/lib/data/rental-market";

describe("roiPreview — превью свёрнутого калькулятора", () => {
  it("без цены нечего проецировать", () => {
    expect(roiPreview({ priceThb: undefined })).toBeNull();
    expect(roiPreview({ priceThb: 0 })).toBeNull();
  });

  it("freehold: та же цифра, что у полного калькулятора с его стартовыми допущениями", () => {
    const appr = getAppreciation({ meta: {} } as RentalMarket);
    const full = computeRoi({
      ...DEFAULT_INPUTS,
      purchasePriceThb: 12_000_000,
      annualGrowthPct: appr.high,
      mode: "hold",
      tenure: "freehold",
      offplan: false,
    });
    const p = roiPreview({ priceThb: 12_000_000, tenure: ["Freehold"], type: "Land" });
    expect(p).not.toBeNull();
    expect(p!.years).toBe(DEFAULT_INPUTS.years);
    expect(p!.projectedValueThb).toBe(Math.round(full.projectedValue));
    expect(p!.growthPct).toBe(appr.high);
    expect(p!.projectedValueThb).toBeGreaterThan(12_000_000);
  });

  it("leasehold-опция без freehold считается как leasehold и берёт срок объекта", () => {
    const lease = roiPreview({ priceThb: 9_000_000, tenure: ["Leasehold"], leaseTermYears: 30, type: "Villa" });
    const free = roiPreview({ priceThb: 9_000_000, tenure: ["Freehold"], type: "Villa" });
    expect(lease).not.toBeNull();
    expect(free).not.toBeNull();
    expect(lease!.projectedValueThb).not.toBe(free!.projectedValueThb);
  });

  it("смешанный freehold-или-leasehold — по freehold-ветке", () => {
    const mixed = roiPreview({ priceThb: 9_000_000, tenure: ["Freehold", "Leasehold"], type: "Villa" });
    const free = roiPreview({ priceThb: 9_000_000, tenure: ["Freehold"], type: "Villa" });
    expect(mixed!.projectedValueThb).toBe(free!.projectedValueThb);
  });
});

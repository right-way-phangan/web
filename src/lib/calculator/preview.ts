import { computeRoi, DEFAULT_INPUTS, type RoiInputs } from "./roi";
import { getAppreciation, type RentalMarket } from "@/lib/data/rental-market";

/** Entry costs: freehold transfer + DD ≈ 5%; leasehold registration 1.1% + legal ≈ 2.1%. */
export const CLOSING_COSTS_PCT = { freehold: 5, leasehold: 2.1 } as const;

export interface RoiPreview {
  years: number;
  /** Gross projected value at exit, THB — same figure the full calculator opens with. */
  projectedValueThb: number;
  /** Growth assumption the projection uses, % per year. */
  growthPct: number;
  /** True when the value is decayed by the remaining lease term. */
  leasehold: boolean;
  /**
   * What the buyer actually sees per year — for leasehold this is well below
   * growthPct because the sellable value shrinks with the remaining term.
   */
  effectiveGrowthPct: number;
}

export function isLeaseholdOnly(tenure?: string[] | null): boolean {
  return !!tenure?.includes("Leasehold") && !tenure?.includes("Freehold");
}

/**
 * One-line summary for the collapsed calculator on object/project pages.
 * Computed with the SAME defaults the full RoiCalculator starts from (buy &
 * hold, DEFAULT_INPUTS, optimistic appreciation band, the object's price,
 * tenure and entry costs) so expanding the module never contradicts the
 * preview. No price → nothing to project.
 */
export function roiPreview(o: {
  priceThb?: number | null;
  tenure?: string[] | null;
  leaseTermYears?: number | null;
  type?: string;
}): RoiPreview | null {
  if (!o.priceThb || o.priceThb <= 0) return null;
  const appr = getAppreciation({ meta: {} } as RentalMarket);
  const leasehold = isLeaseholdOnly(o.tenure);
  const input: RoiInputs = {
    ...DEFAULT_INPUTS,
    purchasePriceThb: o.priceThb,
    annualGrowthPct: appr.high,
    mode: "hold",
    tenure: leasehold ? "leasehold" : "freehold",
    leaseTermYears: o.leaseTermYears ?? DEFAULT_INPUTS.leaseTermYears,
    closingCostsPct: leasehold ? CLOSING_COSTS_PCT.leasehold : CLOSING_COSTS_PCT.freehold,
    offplan: o.type === "Project",
  };
  const r = computeRoi(input);
  if (!Number.isFinite(r.projectedValue)) return null;
  const years = input.years;
  const effectiveGrowthPct =
    r.projectedValue > 0 ? (Math.pow(r.projectedValue / o.priceThb, 1 / years) - 1) * 100 : -100;
  return {
    years,
    projectedValueThb: Math.round(r.projectedValue),
    growthPct: appr.high,
    leasehold,
    effectiveGrowthPct: Math.round(effectiveGrowthPct * 10) / 10,
  };
}

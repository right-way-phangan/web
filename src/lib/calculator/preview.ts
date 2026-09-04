import { computeRoi, DEFAULT_INPUTS, type RoiInputs } from "./roi";
import { getAppreciation, type RentalMarket } from "@/lib/data/rental-market";

export interface RoiPreview {
  years: number;
  /** Gross projected value at exit, THB — same figure the full calculator opens with. */
  projectedValueThb: number;
  /** Growth assumption the projection uses, % per year. */
  growthPct: number;
}

/**
 * One-line summary for the collapsed calculator on object/project pages.
 * Computed with the SAME defaults the full RoiCalculator starts from (buy &
 * hold, DEFAULT_INPUTS, optimistic appreciation band, the object's price and
 * tenure) so expanding the module never contradicts the preview. No price →
 * nothing to project.
 */
export function roiPreview(o: {
  priceThb?: number | null;
  tenure?: string[] | null;
  leaseTermYears?: number | null;
  type?: string;
}): RoiPreview | null {
  if (!o.priceThb || o.priceThb <= 0) return null;
  const appr = getAppreciation({ meta: {} } as RentalMarket);
  const leasehold = !!o.tenure?.includes("Leasehold") && !o.tenure?.includes("Freehold");
  const input: RoiInputs = {
    ...DEFAULT_INPUTS,
    purchasePriceThb: o.priceThb,
    annualGrowthPct: appr.high,
    mode: "hold",
    tenure: leasehold ? "leasehold" : "freehold",
    leaseTermYears: o.leaseTermYears ?? DEFAULT_INPUTS.leaseTermYears,
    offplan: o.type === "Project",
  };
  const r = computeRoi(input);
  if (!Number.isFinite(r.projectedValue)) return null;
  return { years: input.years, projectedValueThb: Math.round(r.projectedValue), growthPct: appr.high };
}

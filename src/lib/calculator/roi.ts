/**
 * Buy & Hold ROI engine for the website calculator.
 *
 * Pure functions, all maths in THB. Mirrors the model in bot/miniapp/roi.html
 * (appreciation-driven Buy & Hold; CAGR = (exit / initial)^(1/years) − 1) so the
 * site and the Telegram Mini App never disagree on numbers.
 *
 * Every rate here is a USER INPUT, not a Right Way assertion — outputs are
 * illustrative projections, never guarantees (see disclaimer in the UI).
 */

export interface RoiInputs {
  purchasePriceThb: number;
  annualGrowthPct: number; // expected annual price growth — user sets this
  years: number;
  closingCostsPct: number; // entry: due-diligence + transfer, % of price
  saleCostsPct: number; // exit: transfer + commission, % of sale value
  annualHoldingThb: number; // yearly holding costs (tax, upkeep)
  bankRatePct: number; // deposit comparison rate
}

export interface RoiYearPoint {
  year: number;
  propertyValue: number; // gross market value at end of year
  bankValue: number; // the same money left in a deposit
  profit: number; // cumulative net profit vs initial investment
}

export interface RoiResult {
  initialInvestment: number;
  projectedValue: number;
  saleCosts: number;
  holdingCostsTotal: number;
  netProceeds: number;
  netProfit: number;
  roiPct: number;
  cagrPct: number;
  bankFinal: number;
  bankProfit: number;
  vsBankThb: number;
  series: RoiYearPoint[];
}

export const SCENARIOS = [
  { key: "conservative", labelEn: "Conservative", growthPct: 3 },
  { key: "base", labelEn: "Base", growthPct: 6 },
  { key: "optimistic", labelEn: "Optimistic", growthPct: 9 },
] as const;

export const DEFAULT_INPUTS: RoiInputs = {
  purchasePriceThb: 10_000_000,
  annualGrowthPct: 6,
  years: 10,
  closingCostsPct: 2,
  saleCostsPct: 5,
  annualHoldingThb: 0,
  bankRatePct: 2,
};

export function computeRoi(input: RoiInputs): RoiResult {
  const price = Math.max(0, input.purchasePriceThb || 0);
  const g = (input.annualGrowthPct || 0) / 100;
  const years = Math.max(1, Math.round(input.years || 1));
  const bank = (input.bankRatePct || 0) / 100;

  const initialInvestment = price * (1 + (input.closingCostsPct || 0) / 100);
  const projectedValue = price * Math.pow(1 + g, years);
  const saleCosts = projectedValue * ((input.saleCostsPct || 0) / 100);
  const holdingCostsTotal = (input.annualHoldingThb || 0) * years;
  const netProceeds = projectedValue - saleCosts - holdingCostsTotal;
  const netProfit = netProceeds - initialInvestment;
  const roiPct = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
  const cagrPct =
    initialInvestment > 0 && netProceeds > 0
      ? (Math.pow(netProceeds / initialInvestment, 1 / years) - 1) * 100
      : 0;

  const bankFinal = initialInvestment * Math.pow(1 + bank, years);
  const bankProfit = bankFinal - initialInvestment;
  const vsBankThb = netProceeds - bankFinal;

  const series: RoiYearPoint[] = [];
  for (let y = 0; y <= years; y++) {
    const propertyValue = price * Math.pow(1 + g, y);
    const bankValue = initialInvestment * Math.pow(1 + bank, y);
    const yearSaleCosts = propertyValue * ((input.saleCostsPct || 0) / 100);
    const profit =
      propertyValue - yearSaleCosts - (input.annualHoldingThb || 0) * y - initialInvestment;
    series.push({ year: y, propertyValue, bankValue, profit });
  }

  return {
    initialInvestment,
    projectedValue,
    saleCosts,
    holdingCostsTotal,
    netProceeds,
    netProfit,
    roiPct,
    cagrPct,
    bankFinal,
    bankProfit,
    vsBankThb,
    series,
  };
}

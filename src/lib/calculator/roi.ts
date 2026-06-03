/**
 * Buy & Hold / Buy & Rent ROI engine for the website calculator.
 *
 * Pure functions, all maths in THB. Kept feature-identical with
 * bot/miniapp/roi.html (same rent model, IRR via Newton–Raphson + bisection
 * fallback, CAGR = (exit equity / initial)^(1/years) − 1) so the website and the
 * Telegram Mini App never disagree on numbers.
 *
 * Every rate is a USER INPUT, not a Right Way assertion — outputs are
 * illustrative projections, never guarantees (see disclaimer in the UI).
 */

export type CalcMode = "hold" | "rent";

export interface RoiInputs {
  purchasePriceThb: number;
  annualGrowthPct: number; // expected annual price growth — user sets this
  years: number;
  closingCostsPct: number; // entry: DD + transfer, % of price
  saleCostsPct: number; // exit: transfer + commission, % of sale value
  annualHoldingPct: number; // yearly holding costs, % of price
  bankRatePct: number; // deposit comparison rate
  mode: CalcMode;
  // Rent mode
  nightlyRateThb: number;
  occupancyPct: number;
  mgmtFeePct: number; // % of gross rent
  opexPct: number; // % of price / year
  rentGrowthPct: number; // annual nightly-rate growth
}

export interface RoiYearPoint {
  year: number;
  propertyValue: number; // gross market value at end of year
  bankValue: number; // the same money left in a deposit
  rentNet: number; // net rent that year (rent mode)
  profit: number; // cumulative net profit vs initial investment
}

export interface RoiResult {
  initialInvestment: number;
  projectedValue: number; // gross sale value at exit
  saleCosts: number;
  holdingCostsTotal: number;
  rentNetTotal: number;
  netProceeds: number; // sale value − sale costs
  totalReturn: number; // net proceeds + net rent − holding
  netProfit: number; // total return − initial investment
  roiPct: number;
  cagrPct: number;
  irrPct: number;
  grossYieldPct: number; // rent mode
  avgCashYieldPct: number; // rent mode
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
  purchasePriceThb: 15_000_000,
  annualGrowthPct: 6,
  years: 10,
  closingCostsPct: 5,
  saleCostsPct: 6,
  annualHoldingPct: 0.5,
  bankRatePct: 2,
  mode: "hold",
  nightlyRateThb: 8000,
  occupancyPct: 55,
  mgmtFeePct: 25,
  opexPct: 3,
  rentGrowthPct: 3,
};

function computeIRR(cashflows: number[]): number {
  // Newton–Raphson with safe bounds.
  let r = 0.1;
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let i = 0; i < cashflows.length; i++) {
      const f = Math.pow(1 + r, i);
      npv += cashflows[i] / f;
      dnpv -= (i * cashflows[i]) / (f * (1 + r));
    }
    if (Math.abs(npv) < 1e-3) return r * 100;
    if (Math.abs(dnpv) < 1e-12) break;
    r -= npv / dnpv;
    if (r < -0.99) r = -0.99;
    if (r > 100) r = 100;
  }
  // Bisection fallback.
  let lo = -0.99;
  let hi = 5;
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2;
    let npv = 0;
    for (let i = 0; i < cashflows.length; i++) npv += cashflows[i] / Math.pow(1 + mid, i);
    if (Math.abs(npv) < 1) return mid * 100;
    if (npv > 0) lo = mid;
    else hi = mid;
  }
  return NaN;
}

export function computeRoi(input: RoiInputs): RoiResult {
  const price = Math.max(0, input.purchasePriceThb || 0);
  const g = (input.annualGrowthPct || 0) / 100;
  const years = Math.max(1, Math.round(input.years || 1));
  const bank = (input.bankRatePct || 0) / 100;
  const isRent = input.mode === "rent";

  const initialInvestment = price * (1 + (input.closingCostsPct || 0) / 100);

  const series: RoiYearPoint[] = [
    { year: 0, propertyValue: price, bankValue: initialInvestment, rentNet: 0, profit: -0 },
  ];

  let currentValue = price;
  let currentRate = input.nightlyRateThb || 0;
  let rentNetTotal = 0;
  let holdingCostsTotal = 0;
  const cashflows = [-initialInvestment];

  for (let y = 1; y <= years; y++) {
    currentValue *= 1 + g;
    if (y > 1) currentRate *= 1 + (input.rentGrowthPct || 0) / 100;
    const holding = price * ((input.annualHoldingPct || 0) / 100);
    holdingCostsTotal += holding;

    let rentNet = 0;
    if (isRent) {
      const rentGross = currentRate * ((input.occupancyPct || 0) / 100) * 365;
      const mgmt = rentGross * ((input.mgmtFeePct || 0) / 100);
      const opex = price * ((input.opexPct || 0) / 100);
      rentNet = rentGross - mgmt - opex;
      rentNetTotal += rentNet;
    }

    let cash = rentNet - holding;
    const saleAtY = currentValue - currentValue * ((input.saleCostsPct || 0) / 100);
    if (y === years) cash += saleAtY;
    cashflows.push(cash);

    const cumProfit = saleAtY + rentNetTotal - holdingCostsTotal - initialInvestment;
    series.push({
      year: y,
      propertyValue: currentValue,
      bankValue: initialInvestment * Math.pow(1 + bank, y),
      rentNet,
      profit: cumProfit,
    });
  }

  const projectedValue = currentValue;
  const saleCosts = projectedValue * ((input.saleCostsPct || 0) / 100);
  const netProceeds = projectedValue - saleCosts;
  const totalReturn = netProceeds + rentNetTotal - holdingCostsTotal;
  const netProfit = totalReturn - initialInvestment;
  const roiPct = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
  const cagrPct =
    initialInvestment > 0 && netProfit + initialInvestment > 0
      ? (Math.pow((netProfit + initialInvestment) / initialInvestment, 1 / years) - 1) * 100
      : 0;
  const irrPct = computeIRR(cashflows);

  const year1Gross = isRent ? (input.nightlyRateThb || 0) * ((input.occupancyPct || 0) / 100) * 365 : 0;
  const grossYieldPct = isRent && initialInvestment > 0 ? (year1Gross / initialInvestment) * 100 : 0;
  const avgCashYieldPct =
    isRent && initialInvestment > 0
      ? ((rentNetTotal - holdingCostsTotal) / years / initialInvestment) * 100
      : 0;

  const bankFinal = initialInvestment * Math.pow(1 + bank, years);
  const bankProfit = bankFinal - initialInvestment;
  const vsBankThb = totalReturn - bankFinal;

  return {
    initialInvestment,
    projectedValue,
    saleCosts,
    holdingCostsTotal,
    rentNetTotal,
    netProceeds,
    totalReturn,
    netProfit,
    roiPct,
    cagrPct,
    irrPct,
    grossYieldPct,
    avgCashYieldPct,
    bankFinal,
    bankProfit,
    vsBankThb,
    series,
  };
}

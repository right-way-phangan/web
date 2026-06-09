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
export type Tenure = "freehold" | "leasehold";

export interface RoiInputs {
  purchasePriceThb: number;
  annualGrowthPct: number; // expected annual price growth — user sets this
  years: number;
  closingCostsPct: number; // entry: DD + transfer, % of price
  saleCostsPct: number; // exit: transfer + commission, % of sale value
  annualHoldingPct: number; // yearly holding costs, % of price
  bankRatePct: number; // deposit comparison rate
  inflationPct: number; // for "in today's money" real-return readout
  mode: CalcMode;
  // Tenure — Thailand-specific. Leasehold value decays as the lease runs down.
  tenure: Tenure;
  leaseTermYears: number; // total lease length (leasehold only), e.g. 30
  leaseRenewable: boolean; // renewable lease (e.g. 30+30+30) — no decay
  // Rent mode
  nightlyRateThb: number;
  occupancyPct: number;
  mgmtFeePct: number; // % of gross rent
  opexPct: number; // % of price / year
  rentGrowthPct: number; // annual nightly-rate growth
  rentTaxPct: number; // income tax on net rent, %
  furnishingThb: number; // one-off FF&E / setup cost (rent mode)
  // Seasonality (rent mode) — Phangan high vs low season. When off, occupancyPct
  // is used flat. When on, gross rent splits across two seasons.
  seasonality: boolean;
  highSeasonMonths: number;
  highSeasonOccupancyPct: number;
  lowSeasonOccupancyPct: number;
  highSeasonRateUpliftPct: number; // nightly-rate premium in high season
  // Off-plan mode — new builds (RW-P projects). Capital paid in installments
  // during construction; value steps up to handover, then holds to exit.
  offplan: boolean;
  constructionMonths: number;
  downPaymentPct: number; // paid at contract (t=0)
  handoverPaymentPct: number; // balance paid at completion
  handoverUpliftPct: number; // value gain from contract price to handover
  rentAfterHandover: boolean; // off-plan: let the unit from handover to exit
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
  realCagrPct: number; // CAGR net of inflation
  realProjectedValue: number; // projected value in today's money
  irrPct: number;
  grossYieldPct: number; // rent mode
  avgCashYieldPct: number; // rent mode
  capRatePct: number; // rent mode — year-1 NOI / price
  cashOnCashPct: number; // rent mode — year-1 net cash / cash invested
  leaseFactorAtExit: number; // 1 for freehold; remaining-term fraction for leasehold
  handoverValue: number; // off-plan — market value at completion (0 otherwise)
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

// Pre-filled with typical Koh Phangan figures (illustrative, all editable).
export const DEFAULT_INPUTS: RoiInputs = {
  // Neutral starting point — does not anchor the public price segment.
  purchasePriceThb: 9_000_000,
  annualGrowthPct: 6,
  years: 10,
  closingCostsPct: 5, // Thailand transfer fee + DD + legal, blended
  saleCostsPct: 6, // agent commission + transfer share at exit
  annualHoldingPct: 0.5,
  bankRatePct: 2,
  inflationPct: 3, // Thailand long-run CPI, illustrative
  mode: "hold",
  tenure: "freehold",
  leaseTermYears: 30, // standard Thai lease term
  leaseRenewable: false,
  nightlyRateThb: 8000, // mid villa, Phangan
  occupancyPct: 50, // seasonal island — blended annual
  mgmtFeePct: 25, // full STR management
  opexPct: 3,
  rentGrowthPct: 3,
  rentTaxPct: 0,
  furnishingThb: 0,
  seasonality: false,
  highSeasonMonths: 5, // Dec–Apr
  highSeasonOccupancyPct: 75,
  lowSeasonOccupancyPct: 30,
  highSeasonRateUpliftPct: 30,
  offplan: false,
  constructionMonths: 24,
  downPaymentPct: 30,
  handoverPaymentPct: 40,
  handoverUpliftPct: 15,
  rentAfterHandover: false,
};

export type SolveMetric = "roi" | "cap" | "coc" | "irr";

/**
 * Reverse calculator: the maximum purchase price at which a target return is
 * still met, holding every other input fixed. Only meaningful when a metric
 * depends on price — i.e. rent mode, where rent is a fixed THB amount while
 * price varies (cap rate, cash-on-cash, and the rental part of total ROI all
 * fall as price rises). For appreciation-only (hold/off-plan), ROI% is
 * price-independent and this returns null (the caller explains why).
 *
 * The chosen metric is monotonically decreasing in price, so we bisect.
 */
export function solveMaxPrice(input: RoiInputs, metric: SolveMetric, targetPct: number): number | null {
  const read = (price: number): number => {
    const r = computeRoi({ ...input, purchasePriceThb: price });
    return metric === "cap" ? r.capRatePct : metric === "coc" ? r.cashOnCashPct : metric === "irr" ? r.irrPct : r.roiPct;
  };
  let lo = 100_000;
  let hi = 2_000_000_000;
  const mLo = read(lo); // highest return (cheapest)
  const mHi = read(hi); // lowest return (most expensive)
  if (!isFinite(mLo) || !isFinite(mHi)) return null;
  // Target must fall within the achievable band, and the band must be non-flat.
  if (mLo - mHi < 1e-6) return null; // price-independent (degenerate)
  if (targetPct > mLo || targetPct < mHi) return null; // unreachable in range
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const m = read(mid);
    if (m > targetPct) lo = mid;
    else hi = mid;
    if (Math.abs(m - targetPct) < 1e-3) return mid;
  }
  return (lo + hi) / 2;
}

/**
 * Break-even: the input level at which the property just matches a bank deposit
 * (vsBank = 0). In rent mode we solve for occupancy; otherwise for annual growth.
 * vsBank is monotonically increasing in both, so we bisect. Returns null when the
 * property already beats the bank at the floor, or can't reach it at the ceiling.
 */
export function solveBreakEven(input: RoiInputs): { metric: "occupancy" | "growth"; value: number } | null {
  const isRent = input.mode === "rent" && !input.offplan;
  const f = isRent
    ? (v: number) => computeRoi({ ...input, seasonality: false, occupancyPct: v }).vsBankThb
    : (v: number) => computeRoi({ ...input, annualGrowthPct: v }).vsBankThb;
  let lo = isRent ? 0 : -20;
  let hi = isRent ? 100 : 40;
  const flo = f(lo);
  const fhi = f(hi);
  if (!isFinite(flo) || !isFinite(fhi)) return null;
  if (flo > 0 || fhi < 0) return null; // already beats at floor, or unreachable at ceiling
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (fm > 0) hi = mid;
    else lo = mid;
    if (Math.abs(fm) < 1) return { metric: isRent ? "occupancy" : "growth", value: mid };
  }
  return { metric: isRent ? "occupancy" : "growth", value: (lo + hi) / 2 };
}

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

/**
 * Leasehold value factor — a leasehold's resale value decays as the term runs
 * down (a 30-yr lease with 10 years left is worth a fraction of a fresh one).
 * Linear remaining-term fraction: transparent and conservative. Freehold = 1.
 */
function leaseFactor(input: RoiInputs, year: number): number {
  if (input.tenure !== "leasehold") return 1;
  // Renewable lease (e.g. 30+30+30) — treated as effectively perpetual, no decay.
  if (input.leaseRenewable) return 1;
  const term = Math.max(1, input.leaseTermYears || 1);
  const remaining = term - year;
  return Math.max(0, remaining) / term;
}

export function computeRoi(input: RoiInputs): RoiResult {
  if (input.offplan) return computeOffplan(input);

  const price = Math.max(0, input.purchasePriceThb || 0);
  const g = (input.annualGrowthPct || 0) / 100;
  const years = Math.max(1, Math.round(input.years || 1));
  const bank = (input.bankRatePct || 0) / 100;
  const isRent = input.mode === "rent";

  // One-off furnishing/setup (FF&E) only applies when the plan is to rent.
  const furnishing = isRent ? Math.max(0, input.furnishingThb || 0) : 0;
  const initialInvestment = price * (1 + (input.closingCostsPct || 0) / 100) + furnishing;

  const series: RoiYearPoint[] = [
    { year: 0, propertyValue: price, bankValue: initialInvestment, rentNet: 0, profit: -0 },
  ];

  // Annual gross rent at a given base nightly rate — flat or split by season.
  const seasonGross = (rate: number): number => {
    if (!input.seasonality) return rate * ((input.occupancyPct || 0) / 100) * 365;
    const highDays = Math.min(365, Math.max(0, (input.highSeasonMonths || 0) / 12) * 365);
    const lowDays = 365 - highDays;
    const highRate = rate * (1 + (input.highSeasonRateUpliftPct || 0) / 100);
    return (
      highDays * ((input.highSeasonOccupancyPct || 0) / 100) * highRate +
      lowDays * ((input.lowSeasonOccupancyPct || 0) / 100) * rate
    );
  };

  let grossValue = price; // underlying value before any lease decay
  let currentRate = input.nightlyRateThb || 0;
  let rentNetTotal = 0;
  let holdingCostsTotal = 0;
  let firstYearNoi = 0;
  const cashflows = [-initialInvestment];

  for (let y = 1; y <= years; y++) {
    grossValue *= 1 + g;
    // Sellable value = underlying growth × remaining-lease fraction (leasehold).
    const sellableValue = grossValue * leaseFactor(input, y);
    if (y > 1) currentRate *= 1 + (input.rentGrowthPct || 0) / 100;
    const holding = price * ((input.annualHoldingPct || 0) / 100);
    holdingCostsTotal += holding;

    let rentNet = 0;
    if (isRent) {
      const rentGross = seasonGross(currentRate);
      const mgmt = rentGross * ((input.mgmtFeePct || 0) / 100);
      const opex = price * ((input.opexPct || 0) / 100);
      const preTax = rentGross - mgmt - opex;
      // Income tax on the net rental profit (no tax credit on a loss).
      const tax = preTax > 0 ? preTax * ((input.rentTaxPct || 0) / 100) : 0;
      rentNet = preTax - tax;
      rentNetTotal += rentNet;
    }
    if (y === 1) firstYearNoi = rentNet - holding;

    let cash = rentNet - holding;
    const saleAtY = sellableValue - sellableValue * ((input.saleCostsPct || 0) / 100);
    if (y === years) cash += saleAtY;
    cashflows.push(cash);

    const cumProfit = saleAtY + rentNetTotal - holdingCostsTotal - initialInvestment;
    series.push({
      year: y,
      propertyValue: sellableValue,
      bankValue: initialInvestment * Math.pow(1 + bank, y),
      rentNet,
      profit: cumProfit,
    });
  }

  const leaseFactorAtExit = leaseFactor(input, years);
  const projectedValue = grossValue * leaseFactorAtExit;
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

  // Real (inflation-adjusted) headline figures — "in today's money".
  const infl = (input.inflationPct || 0) / 100;
  const realProjectedValue = projectedValue / Math.pow(1 + infl, years);
  const realCagrPct = ((1 + cagrPct / 100) / (1 + infl) - 1) * 100;

  const year1Gross = isRent ? seasonGross(input.nightlyRateThb || 0) : 0;
  const grossYieldPct = isRent && initialInvestment > 0 ? (year1Gross / initialInvestment) * 100 : 0;
  const avgCashYieldPct =
    isRent && initialInvestment > 0
      ? ((rentNetTotal - holdingCostsTotal) / years / initialInvestment) * 100
      : 0;
  // Cap rate = year-1 net operating income / purchase price (financing-agnostic).
  const capRatePct = isRent && price > 0 ? (firstYearNoi / price) * 100 : 0;
  // Cash-on-cash = year-1 net cash / total cash invested (all-cash buyer).
  const cashOnCashPct = isRent && initialInvestment > 0 ? (firstYearNoi / initialInvestment) * 100 : 0;

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
    realCagrPct,
    realProjectedValue,
    irrPct,
    grossYieldPct,
    avgCashYieldPct,
    capRatePct,
    cashOnCashPct,
    leaseFactorAtExit,
    handoverValue: 0,
    bankFinal,
    bankProfit,
    vsBankThb,
    series,
  };
}

/**
 * Off-plan: buy a new build on a developer payment plan. Capital is deployed in
 * installments through construction (down payment now, instalments, balance at
 * handover), the asset steps up to its handover value, then appreciates to exit.
 * IRR is the headline metric — staggered capital lifts it well above a lump-sum
 * buy. Computed on a monthly cashflow series and annualised.
 */
function computeOffplan(input: RoiInputs): RoiResult {
  const price = Math.max(0, input.purchasePriceThb || 0);
  const g = (input.annualGrowthPct || 0) / 100;
  const bank = (input.bankRatePct || 0) / 100;
  const months = Math.max(1, Math.round(input.constructionMonths || 1));
  const handoverYear = months / 12;
  const years = Math.max(handoverYear, Math.round(input.years || 1));
  const down = Math.max(0, (input.downPaymentPct || 0) / 100);
  const hand = Math.max(0, (input.handoverPaymentPct || 0) / 100);
  const middle = Math.max(0, 1 - down - hand); // instalments during construction
  const uplift = (input.handoverUpliftPct || 0) / 100;
  const closing = (input.closingCostsPct || 0) / 100;

  const exitMonth = Math.max(months, Math.round(years * 12));
  const cf = new Array(exitMonth + 1).fill(0);

  // Payment schedule (outflows)
  cf[0] -= price * down;
  const perInstall = months > 0 ? (price * middle) / months : 0;
  for (let m = 1; m <= months; m++) cf[m] -= perInstall;
  cf[months] -= price * hand + price * closing; // balance + transfer fees at handover

  // Optional buy-to-let: the unit earns net rent from handover to exit.
  const isLet = !!input.rentAfterHandover;
  const furnishing = isLet ? Math.max(0, input.furnishingThb || 0) : 0;
  if (furnishing) cf[months] -= furnishing; // FF&E paid at handover
  const totalInvested = price * (down + middle + hand) + price * closing + furnishing;

  const seasonGross = (rate: number): number => {
    if (!input.seasonality) return rate * ((input.occupancyPct || 0) / 100) * 365;
    const highDays = Math.min(365, Math.max(0, (input.highSeasonMonths || 0) / 12) * 365);
    const lowDays = 365 - highDays;
    const highRate = rate * (1 + (input.highSeasonRateUpliftPct || 0) / 100);
    return (
      highDays * ((input.highSeasonOccupancyPct || 0) / 100) * highRate +
      lowDays * ((input.lowSeasonOccupancyPct || 0) / 100) * rate
    );
  };

  // Net rent earned during each calendar year (prorated for the partial year the
  // lease starts in). Credited at year-end into the monthly cashflow series.
  // years can be fractional (a short horizon clamped up to handover), so size by ceil.
  const rentByYear = new Array(Math.ceil(years) + 1).fill(0);
  let firstYearNoi = 0;
  if (isLet) {
    let rate = input.nightlyRateThb || 0;
    let started = false;
    for (let y = 1; y <= years; y++) {
      const occ = Math.max(0, y - Math.max(y - 1, handoverYear)); // operating fraction of year y
      if (occ <= 0) continue;
      if (started) rate *= 1 + (input.rentGrowthPct || 0) / 100;
      started = true;
      const gross = seasonGross(rate) * occ;
      const mgmt = gross * ((input.mgmtFeePct || 0) / 100);
      const opex = price * ((input.opexPct || 0) / 100) * occ;
      const preTax = gross - mgmt - opex;
      const tax = preTax > 0 ? preTax * ((input.rentTaxPct || 0) / 100) : 0;
      rentByYear[y] = preTax - tax;
      if (!firstYearNoi) firstYearNoi = rentByYear[y] / occ; // annualised first-year NOI
      const m = Math.min(exitMonth, Math.round(y * 12));
      cf[m] += rentByYear[y];
    }
  }
  const rentNetTotal = rentByYear.reduce((a, b) => a + b, 0);

  const handoverValue = price * (1 + uplift);
  const lfExit = leaseFactor(input, years);
  const remainingYears = Math.max(0, years - handoverYear);
  const grossExit = handoverValue * Math.pow(1 + g, remainingYears);
  const sellableExit = grossExit * lfExit;
  const saleCosts = sellableExit * ((input.saleCostsPct || 0) / 100);
  const netProceeds = sellableExit - saleCosts;
  cf[exitMonth] += netProceeds;

  const totalReturn = netProceeds + rentNetTotal;
  const netProfit = totalReturn - totalInvested;
  const roiPct = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
  const cagrPct =
    totalInvested > 0 && totalReturn > 0 ? (Math.pow(totalReturn / totalInvested, 1 / years) - 1) * 100 : 0;
  const infl = (input.inflationPct || 0) / 100;
  const realProjectedValue = sellableExit / Math.pow(1 + infl, years);
  const realCagrPct = ((1 + cagrPct / 100) / (1 + infl) - 1) * 100;

  const monthlyIrr = computeIRR(cf) / 100;
  const irrPct = isFinite(monthlyIrr) ? (Math.pow(1 + monthlyIrr, 12) - 1) * 100 : NaN;

  // Rent yields (buy-to-let off-plan only).
  const capRatePct = isLet && price > 0 ? (firstYearNoi / price) * 100 : 0;
  const cashOnCashPct = isLet && totalInvested > 0 ? (firstYearNoi / totalInvested) * 100 : 0;
  const grossYieldPct =
    isLet && totalInvested > 0 ? (seasonGross(input.nightlyRateThb || 0) / totalInvested) * 100 : 0;

  // Bank benchmark: the same instalments parked at the deposit rate until exit.
  const bankM = Math.pow(1 + bank, 1 / 12) - 1;
  let bankFinal = 0;
  for (let m = 0; m <= exitMonth; m++) if (cf[m] < 0) bankFinal += -cf[m] * Math.pow(1 + bankM, exitMonth - m);
  const bankProfit = bankFinal - totalInvested;
  const vsBankThb = totalReturn - bankFinal;

  // Annual series — value ramps to handover, then appreciates; bank line = the
  // instalments paid so far, grown at the deposit rate.
  const series: RoiYearPoint[] = [];
  let cumRent = 0;
  for (let y = 0; y <= years; y++) {
    const grossVal =
      y <= handoverYear
        ? price + (handoverValue - price) * (handoverYear > 0 ? y / handoverYear : 1)
        : handoverValue * Math.pow(1 + g, y - handoverYear);
    const sellable = grossVal * leaseFactor(input, y);
    cumRent += rentByYear[y] || 0;
    const mY = Math.round(y * 12);
    let invested = 0;
    let banked = 0;
    for (let m = 0; m <= Math.min(mY, exitMonth); m++) {
      if (cf[m] < 0) {
        invested += -cf[m];
        banked += -cf[m] * Math.pow(1 + bankM, mY - m);
      }
    }
    series.push({
      year: y,
      propertyValue: sellable,
      bankValue: banked,
      rentNet: rentByYear[y] || 0,
      profit: sellable - (y === years ? saleCosts : 0) - invested + cumRent,
    });
  }

  return {
    initialInvestment: totalInvested,
    projectedValue: sellableExit,
    saleCosts,
    holdingCostsTotal: 0,
    rentNetTotal,
    netProceeds,
    totalReturn,
    netProfit,
    roiPct,
    cagrPct,
    realCagrPct,
    realProjectedValue,
    irrPct,
    grossYieldPct,
    avgCashYieldPct: 0,
    capRatePct,
    cashOnCashPct,
    leaseFactorAtExit: lfExit,
    handoverValue,
    bankFinal,
    bankProfit,
    vsBankThb,
    series,
  };
}

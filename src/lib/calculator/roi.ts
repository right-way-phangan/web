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
  purchasePriceThb: number; // for a multi-unit buy this is the COMBINED price of all units
  // How many units the figures cover (default 1). Price-linear costs already
  // scale via the combined price; this scales the parts that are per-unit and
  // NOT price-proportional — rental income and one-off furnishing.
  unitCount: number;
  annualGrowthPct: number; // expected annual price growth — user sets this
  years: number;
  closingCostsPct: number; // entry: DD + transfer, % of price
  saleCostsPct: number; // exit: transfer + commission, % of sale value
  capitalGainsTaxPct: number; // tax on the gain (sale value − purchase price) at exit
  annualHoldingPct: number; // yearly holding costs, % of price
  bankRatePct: number; // deposit comparison rate
  altReturnPct: number; // alternative investment benchmark (e.g. stock index)
  inflationPct: number; // for "in today's money" real-return readout
  fxDriftPct: number; // annual drift of THB vs the buyer's currency (+ = THB strengthens)
  mode: CalcMode;
  // Tenure — Thailand-specific. Leasehold value decays as the lease runs down.
  tenure: Tenure;
  leaseTermYears: number; // total lease length (leasehold only), e.g. 30
  leaseRenewable: boolean; // renewable lease (e.g. 30+30+30) — no decay
  // Leasehold payment structure. Prepaid (default): the purchase price covers
  // the whole lease up front. Monthly: the price covers the building only and
  // the land rent is paid through the hold, indexed annually — the post-pivot
  // "land lease + villa" product.
  leaseMonthly: boolean;
  leaseMonthlyThb: number; // land rent, THB/month at year-1 level
  leaseIndexationPct: number; // annual escalation of the land rent
  // Rent mode
  longTermRent: boolean; // monthly long-term let instead of nightly STR
  monthlyRentThb: number; // long-term: rent per month
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
  capitalGainsTax: number; // tax on the gain at exit (0 when no CGT input)
  holdingCostsTotal: number;
  leasePaymentsTotal: number; // periodic land rent paid over the hold (leasehold monthly)
  rentNetTotal: number;
  netProceeds: number; // sale value − sale costs
  totalReturn: number; // net proceeds + net rent − holding
  netProfit: number; // total return − initial investment
  roiPct: number;
  cagrPct: number;
  realCagrPct: number; // CAGR net of inflation
  realProjectedValue: number; // projected value in today's money
  roiFxPct: number; // total ROI in the buyer's currency, given fxDriftPct
  cagrFxPct: number; // CAGR in the buyer's currency, given fxDriftPct
  paybackYears: number | null; // year cumulative profit first turns non-negative
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
  altFinal: number; // alternative-investment benchmark ending value
  vsAltThb: number; // total return − altFinal
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
  unitCount: 1,
  annualGrowthPct: 6,
  years: 10,
  closingCostsPct: 5, // Thailand transfer fee + DD + legal, blended
  saleCostsPct: 6, // agent commission + transfer share at exit
  capitalGainsTaxPct: 0, // off by default — Thai PIT on gains varies; user opts in
  annualHoldingPct: 0.5,
  bankRatePct: 2,
  altReturnPct: 7, // long-run global equity index, illustrative
  inflationPct: 3, // Thailand long-run CPI, illustrative
  fxDriftPct: 0, // no FX view by default
  mode: "hold",
  tenure: "freehold",
  leaseTermYears: 30, // standard Thai lease term
  leaseRenewable: false,
  leaseMonthly: false,
  leaseMonthlyThb: 20_000, // illustrative villa-plot land rent
  leaseIndexationPct: 3, // ≈ the common "10% every 3 years" step, annualised
  longTermRent: false,
  monthlyRentThb: 60_000, // mid villa long-term, Phangan
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

export interface MonteCarloBand {
  lo: number;
  base: number;
  hi: number;
}

export interface McBandPoint {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface MonteCarloResult {
  p05: number; // value-at-risk style downside
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  probBeatBank: number; // fraction of runs where the property beats the deposit
  probBeatAlt: number; // …beats the alternative-investment benchmark
  probLoss: number; // fraction of runs with a negative total ROI
  samples: number;
  hist: number[]; // bucket counts for a small distribution viz
  histMin: number;
  histMax: number;
  band: McBandPoint[]; // owner-return P10/P50/P90 per year (fan chart)
}

/** Inverse-CDF sample from a triangular distribution on [lo, hi] with mode. */
function triSample(lo: number, mode: number, hi: number): number {
  if (hi <= lo) return lo;
  const u = Math.random();
  const c = (mode - lo) / (hi - lo);
  return u < c
    ? lo + Math.sqrt(u * (hi - lo) * (mode - lo))
    : hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode));
}

/**
 * Monte Carlo over the headline uncertainties — appreciation, and (in rent mode)
 * occupancy and nightly rate — sampled from triangular distributions defined by
 * the data-anchored conservative/base/high bands. Returns the ROI distribution
 * (P10/P50/P90), the odds of beating each benchmark, and a histogram. Turns a
 * single point estimate into a probabilistic outlook (cf. institutional models).
 */
export function monteCarlo(
  input: RoiInputs,
  bands: { growth: MonteCarloBand; occupancy?: MonteCarloBand; nightly?: MonteCarloBand },
  n = 1500,
): MonteCarloResult {
  const isRent = (input.mode === "rent" && !input.offplan) || (input.offplan && input.rentAfterHandover);
  const rois: number[] = [];
  let beatBank = 0;
  let beatAlt = 0;
  let loss = 0;
  // Owner-return samples per year index, for the fan chart (cone of uncertainty).
  const byYear: number[][] = [];
  for (let i = 0; i < n; i++) {
    const patch: Partial<RoiInputs> = {
      annualGrowthPct: triSample(bands.growth.lo, bands.growth.base, bands.growth.hi),
    };
    if (isRent && bands.occupancy) {
      patch.seasonality = false;
      patch.occupancyPct = triSample(bands.occupancy.lo, bands.occupancy.base, bands.occupancy.hi);
    }
    if (isRent && bands.nightly) {
      // The rate band varies whichever rate drives the gross — nightly for STR,
      // monthly for a long-term let (the caller builds it from the right base).
      const sampled = triSample(bands.nightly.lo, bands.nightly.base, bands.nightly.hi);
      if (input.longTermRent) patch.monthlyRentThb = sampled;
      else patch.nightlyRateThb = sampled;
    }
    const r = computeRoi({ ...input, ...patch });
    if (!isFinite(r.roiPct)) continue;
    rois.push(r.roiPct);
    if (r.vsBankThb > 0) beatBank++;
    if (r.vsAltThb > 0) beatAlt++;
    if (r.roiPct < 0) loss++;
    for (let y = 0; y < r.series.length; y++) {
      (byYear[y] ??= []).push(r.series[y].profit + r.initialInvestment);
    }
  }
  rois.sort((a, b) => a - b);
  const m = rois.length || 1;
  const pct = (p: number) => rois[Math.min(m - 1, Math.max(0, Math.floor(p * m)))] ?? 0;
  const mean = rois.reduce((a, b) => a + b, 0) / m;
  const lo = rois[0] ?? 0;
  const hi = rois[m - 1] ?? 0;
  const buckets = 24;
  const hist = new Array(buckets).fill(0);
  const span = hi - lo || 1;
  for (const v of rois) {
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor(((v - lo) / span) * buckets)));
    hist[idx]++;
  }
  const band: McBandPoint[] = byYear.map((arr, year) => {
    const s = arr.slice().sort((a, b) => a - b);
    const k = s.length || 1;
    const q = (p: number) => s[Math.min(k - 1, Math.max(0, Math.floor(p * k)))] ?? 0;
    return { year, p10: q(0.1), p50: q(0.5), p90: q(0.9) };
  });
  return {
    p05: pct(0.05),
    p10: pct(0.1),
    p50: pct(0.5),
    p90: pct(0.9),
    mean,
    probBeatBank: beatBank / m,
    probBeatAlt: beatAlt / m,
    probLoss: loss / m,
    samples: m,
    hist,
    histMin: lo,
    histMax: hi,
    band,
  };
}

function computeIRR(cashflows: number[]): number {
  // Без вложения и без возврата уравнение не имеет корня: раньше первая же
  // проверка npv≈0 возвращала стартовую догадку 0.1 → «IRR 10%» на пустом
  // сценарии (например, при нулевой цене).
  if (!cashflows.some((c) => c < 0) || !cashflows.some((c) => c > 0)) return NaN;
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

/**
 * Payback period — the year cumulative profit (return-if-sold-that-year minus
 * the cash invested) first turns non-negative, linearly interpolated between the
 * bracketing years. Null when the deal never recovers within the horizon.
 */
function paybackFrom(series: RoiYearPoint[]): number | null {
  for (let i = 1; i < series.length; i++) {
    const cur = series[i];
    if (cur.profit >= 0) {
      const prev = series[i - 1];
      if (prev.profit >= 0) return cur.year;
      const frac = (0 - prev.profit) / (cur.profit - prev.profit);
      return prev.year + frac * (cur.year - prev.year);
    }
  }
  return null;
}

/**
 * Return in the buyer's currency. THB cashflows are converted at a spot rate that
 * drifts geometrically at fxDriftPct/yr (+ = THB strengthens vs the buyer's
 * currency). We isolate the pure timing effect of FX as a ratio of the drifted
 * money-multiple to the un-drifted one (`adj`), then apply it to the headline THB
 * multiple — so at zero drift the result equals the THB figure exactly, and any
 * difference is the FX effect alone. `times` are in years (fractional for monthly).
 */
function fxAdjusted(
  cashflows: number[],
  times: number[],
  headlineMultiple: number, // totalReturn / capital invested (THB)
  driftPct: number,
  years: number,
): { roiFxPct: number; cagrFxPct: number } {
  const d = (driftPct || 0) / 100;
  let inv0 = 0;
  let invD = 0;
  let ret0 = 0;
  let retD = 0;
  for (let i = 0; i < cashflows.length; i++) {
    const f = Math.pow(1 + d, times[i]);
    if (cashflows[i] < 0) {
      inv0 += -cashflows[i];
      invD += -cashflows[i] * f;
    } else {
      ret0 += cashflows[i];
      retD += cashflows[i] * f;
    }
  }
  const m0 = inv0 > 0 ? ret0 / inv0 : 0;
  const mD = invD > 0 ? retD / invD : 0;
  const adj = m0 > 0 ? mD / m0 : 1;
  const multiple = headlineMultiple * adj;
  const roiFxPct = (multiple - 1) * 100;
  // NaN, а не 0 — по той же причине, что и в основном cagrPct: блок «в вашей
  // валюте» печатал «−114.3% · +0%/yr», то есть полную потерю капитала как
  // нулевой рост. fmtPct печатает NaN как «—».
  const cagrFxPct = multiple > 0 && years > 0 ? (Math.pow(multiple, 1 / years) - 1) * 100 : NaN;
  return { roiFxPct, cagrFxPct };
}

export function computeRoi(input: RoiInputs): RoiResult {
  if (input.offplan) return computeOffplan(input);

  const price = Math.max(0, input.purchasePriceThb || 0);
  const g = (input.annualGrowthPct || 0) / 100;
  const years = Math.max(1, Math.round(input.years || 1));
  const bank = (input.bankRatePct || 0) / 100;
  const isRent = input.mode === "rent";

  // How many units the figures cover. Price (and every cost derived from it as a
  // %) is already the combined total, so only the per-unit, non-price parts —
  // rental income and one-off furnishing — get multiplied by the count here.
  const units = Math.max(1, Math.round(input.unitCount || 1));

  // One-off furnishing/setup (FF&E) only applies when the plan is to rent.
  const furnishing = (isRent ? Math.max(0, input.furnishingThb || 0) : 0) * units;
  const initialInvestment = price * (1 + (input.closingCostsPct || 0) / 100) + furnishing;

  const series: RoiYearPoint[] = [
    { year: 0, propertyValue: price, bankValue: initialInvestment, rentNet: 0, profit: -0 },
  ];

  // Annual gross rent at a given base rate — monthly for a long-term let;
  // nightly (flat or split by season) for STR. Occupancy applies to both.
  // Multiplied by unit count so combined rent scales with the number bought.
  const annualGross = (rate: number): number => {
    let perUnit: number;
    if (input.longTermRent) perUnit = rate * 12 * ((input.occupancyPct || 0) / 100);
    else if (!input.seasonality) perUnit = rate * ((input.occupancyPct || 0) / 100) * 365;
    else {
      const highDays = Math.min(365, Math.max(0, (input.highSeasonMonths || 0) / 12) * 365);
      const lowDays = 365 - highDays;
      const highRate = rate * (1 + (input.highSeasonRateUpliftPct || 0) / 100);
      perUnit =
        highDays * ((input.highSeasonOccupancyPct || 0) / 100) * highRate +
        lowDays * ((input.lowSeasonOccupancyPct || 0) / 100) * rate;
    }
    return perUnit * units;
  };

  // Periodic land rent (leasehold, monthly structure) — an indexed annuity paid
  // through the hold; the purchase price then covers the building only.
  const periodicLease = input.tenure === "leasehold" && input.leaseMonthly;
  const leasePayAt = (y: number): number =>
    periodicLease
      ? Math.max(0, input.leaseMonthlyThb || 0) * 12 * Math.pow(1 + (input.leaseIndexationPct || 0) / 100, y - 1)
      : 0;

  let grossValue = price; // underlying value before any lease decay
  const baseRate = input.longTermRent ? input.monthlyRentThb || 0 : input.nightlyRateThb || 0;
  let currentRate = baseRate;
  let rentNetTotal = 0;
  let holdingCostsTotal = 0;
  let leasePaymentsTotal = 0;
  let firstYearNoi = 0;
  const cashflows = [-initialInvestment];

  for (let y = 1; y <= years; y++) {
    grossValue *= 1 + g;
    // Sellable value = underlying growth × remaining-lease fraction (leasehold).
    const sellableValue = grossValue * leaseFactor(input, y);
    if (y > 1) currentRate *= 1 + (input.rentGrowthPct || 0) / 100;
    const holding = price * ((input.annualHoldingPct || 0) / 100);
    holdingCostsTotal += holding;
    const leasePay = leasePayAt(y);
    leasePaymentsTotal += leasePay;

    let rentNet = 0;
    if (isRent) {
      const rentGross = annualGross(currentRate);
      const mgmt = rentGross * ((input.mgmtFeePct || 0) / 100);
      const opex = price * ((input.opexPct || 0) / 100);
      const preTax = rentGross - mgmt - opex;
      // Income tax on the net rental profit (no tax credit on a loss).
      const tax = preTax > 0 ? preTax * ((input.rentTaxPct || 0) / 100) : 0;
      rentNet = preTax - tax;
      rentNetTotal += rentNet;
    }
    // Ground rent is an operating cost, so it belongs in NOI alongside holding.
    if (y === 1) firstYearNoi = rentNet - holding - leasePay;

    let cash = rentNet - holding - leasePay;
    const saleAtY = sellableValue - sellableValue * ((input.saleCostsPct || 0) / 100);
    if (y === years) cash += saleAtY;
    cashflows.push(cash);

    const cumProfit = saleAtY + rentNetTotal - holdingCostsTotal - leasePaymentsTotal - initialInvestment;
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
  // Capital-gains tax on the realised gain at exit (no credit on a loss).
  const capitalGainsTax = Math.max(0, projectedValue - price) * ((input.capitalGainsTaxPct || 0) / 100);
  const netProceeds = projectedValue - saleCosts;
  const totalReturn = netProceeds + rentNetTotal - holdingCostsTotal - leasePaymentsTotal - capitalGainsTax;
  // Fold the exit tax into the final cashflow + series so IRR, payback and the
  // chart's last point all agree with the headline figure.
  if (capitalGainsTax > 0) {
    cashflows[cashflows.length - 1] -= capitalGainsTax;
    series[series.length - 1].profit -= capitalGainsTax;
  }
  const netProfit = totalReturn - initialInvestment;
  const roiPct = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
  // NaN, а не 0: при неположительной итоговой стоимости среднегодовой рост не
  // определён, и «+0.0%/год» рядом с «ROI −114%» читается как «ничего не потерял».
  // fmtPct печатает NaN как «—».
  const cagrPct =
    initialInvestment > 0 && netProfit + initialInvestment > 0
      ? (Math.pow((netProfit + initialInvestment) / initialInvestment, 1 / years) - 1) * 100
      : NaN;
  const irrPct = computeIRR(cashflows);
  const paybackYears = paybackFrom(series);
  const { roiFxPct, cagrFxPct } = fxAdjusted(
    cashflows,
    cashflows.map((_, i) => i),
    initialInvestment > 0 ? totalReturn / initialInvestment : 0,
    input.fxDriftPct,
    years,
  );

  // Real (inflation-adjusted) headline figures — "in today's money".
  const infl = (input.inflationPct || 0) / 100;
  const realProjectedValue = projectedValue / Math.pow(1 + infl, years);
  // 1 + infl ≤ 0 (инфляция −100% и ниже) — деление на ноль давало Infinity в UI.
  const realCagrPct = 1 + infl > 0 ? ((1 + cagrPct / 100) / (1 + infl) - 1) * 100 : NaN;

  const year1Gross = isRent ? annualGross(baseRate) : 0;
  const grossYieldPct = isRent && initialInvestment > 0 ? (year1Gross / initialInvestment) * 100 : 0;
  const avgCashYieldPct =
    isRent && initialInvestment > 0
      ? ((rentNetTotal - holdingCostsTotal - leasePaymentsTotal) / years / initialInvestment) * 100
      : 0;
  // Cap rate = year-1 net operating income / purchase price (financing-agnostic).
  const capRatePct = isRent && price > 0 ? (firstYearNoi / price) * 100 : 0;
  // Cash-on-cash = year-1 net cash / total cash invested (all-cash buyer).
  const cashOnCashPct = isRent && initialInvestment > 0 ? (firstYearNoi / initialInvestment) * 100 : 0;

  const bankFinal = initialInvestment * Math.pow(1 + bank, years);
  const bankProfit = bankFinal - initialInvestment;
  const vsBankThb = totalReturn - bankFinal;

  // Alternative-investment benchmark (e.g. a global equity index): the same
  // up-front cash compounded at altReturnPct over the hold.
  const altFinal = initialInvestment * Math.pow(1 + (input.altReturnPct || 0) / 100, years);
  const vsAltThb = totalReturn - altFinal;

  return {
    initialInvestment,
    projectedValue,
    saleCosts,
    capitalGainsTax,
    holdingCostsTotal,
    leasePaymentsTotal,
    rentNetTotal,
    netProceeds,
    totalReturn,
    netProfit,
    roiPct,
    cagrPct,
    realCagrPct,
    realProjectedValue,
    roiFxPct,
    cagrFxPct,
    paybackYears,
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
    altFinal,
    vsAltThb,
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
  // Outflows tracked separately — inside cf they can be netted against inflows
  // landing in the same month (rent, sale proceeds), which would hide them from
  // the bank/alt benchmarks and the series' invested-capital line.
  const out = new Array(exitMonth + 1).fill(0);
  const payOut = (m: number, amount: number) => {
    cf[m] -= amount;
    out[m] += amount;
  };

  // Payment schedule (outflows)
  payOut(0, price * down);
  const perInstall = months > 0 ? (price * middle) / months : 0;
  for (let m = 1; m <= months; m++) payOut(m, perInstall);
  payOut(months, price * hand + price * closing); // balance + transfer fees at handover

  // Optional buy-to-let: the unit earns net rent from handover to exit.
  // Units covered — price-linear costs already scale via the combined price;
  // rental income and furnishing are per-unit, so multiply those by the count.
  const units = Math.max(1, Math.round(input.unitCount || 1));

  const isLet = !!input.rentAfterHandover;
  const furnishing = (isLet ? Math.max(0, input.furnishingThb || 0) : 0) * units;
  if (furnishing) payOut(months, furnishing); // FF&E paid at handover
  const totalInvested = price * (down + middle + hand) + price * closing + furnishing;

  const annualGross = (rate: number): number => {
    let perUnit: number;
    if (input.longTermRent) perUnit = rate * 12 * ((input.occupancyPct || 0) / 100);
    else if (!input.seasonality) perUnit = rate * ((input.occupancyPct || 0) / 100) * 365;
    else {
      const highDays = Math.min(365, Math.max(0, (input.highSeasonMonths || 0) / 12) * 365);
      const lowDays = 365 - highDays;
      const highRate = rate * (1 + (input.highSeasonRateUpliftPct || 0) / 100);
      perUnit =
        highDays * ((input.highSeasonOccupancyPct || 0) / 100) * highRate +
        lowDays * ((input.lowSeasonOccupancyPct || 0) / 100) * rate;
    }
    return perUnit * units;
  };

  // Periodic land rent (leasehold, monthly structure) — runs from contract
  // signing (the lease term starts then, not at handover), indexed annually,
  // charged at each year-end into the monthly series. Prorated final year.
  const periodicLease = input.tenure === "leasehold" && input.leaseMonthly;
  const leaseByYear = new Array(Math.ceil(years) + 1).fill(0);
  let leasePaymentsTotal = 0;
  if (periodicLease) {
    for (let y = 1; y <= Math.ceil(years); y++) {
      const frac = Math.min(1, years - (y - 1));
      if (frac <= 0) break;
      const pay =
        Math.max(0, input.leaseMonthlyThb || 0) * 12 * Math.pow(1 + (input.leaseIndexationPct || 0) / 100, y - 1) * frac;
      leaseByYear[y] = pay;
      leasePaymentsTotal += pay;
      payOut(Math.min(exitMonth, Math.round(y * 12)), pay);
    }
  }

  // Net rent earned during each calendar year (prorated for the partial year the
  // lease starts in). Credited at year-end into the monthly cashflow series.
  // years can be fractional (a short horizon clamped up to handover), so size by ceil.
  const rentByYear = new Array(Math.ceil(years) + 1).fill(0);
  let firstYearNoi = 0;
  if (isLet) {
    let rate = input.longTermRent ? input.monthlyRentThb || 0 : input.nightlyRateThb || 0;
    let started = false;
    for (let y = 1; y <= years; y++) {
      const occ = Math.max(0, y - Math.max(y - 1, handoverYear)); // operating fraction of year y
      if (occ <= 0) continue;
      if (started) rate *= 1 + (input.rentGrowthPct || 0) / 100;
      started = true;
      const gross = annualGross(rate) * occ;
      const mgmt = gross * ((input.mgmtFeePct || 0) / 100);
      const opex = price * ((input.opexPct || 0) / 100) * occ;
      const preTax = gross - mgmt - opex;
      const tax = preTax > 0 ? preTax * ((input.rentTaxPct || 0) / 100) : 0;
      rentByYear[y] = preTax - tax;
      // Annualised first-year NOI, net of that year's ground rent (also annualised).
      if (!firstYearNoi) firstYearNoi = rentByYear[y] / occ - leaseByYear[y] / Math.min(1, years - (y - 1));
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
  // Capital-gains tax on the gain over the contract price (no credit on a loss).
  const capitalGainsTax = Math.max(0, sellableExit - price) * ((input.capitalGainsTaxPct || 0) / 100);
  const netProceeds = sellableExit - saleCosts;
  cf[exitMonth] += netProceeds - capitalGainsTax;

  const totalReturn = netProceeds + rentNetTotal - leasePaymentsTotal - capitalGainsTax;
  const netProfit = totalReturn - totalInvested;
  const roiPct = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
  // NaN по той же причине, что и в основном сценарии: рост не определён.
  const cagrPct =
    totalInvested > 0 && totalReturn > 0 ? (Math.pow(totalReturn / totalInvested, 1 / years) - 1) * 100 : NaN;
  const infl = (input.inflationPct || 0) / 100;
  const realProjectedValue = sellableExit / Math.pow(1 + infl, years);
  // 1 + infl ≤ 0 (инфляция −100% и ниже) — деление на ноль давало Infinity в UI.
  const realCagrPct = 1 + infl > 0 ? ((1 + cagrPct / 100) / (1 + infl) - 1) * 100 : NaN;

  const monthlyIrr = computeIRR(cf) / 100;
  const irrPct = isFinite(monthlyIrr) ? (Math.pow(1 + monthlyIrr, 12) - 1) * 100 : NaN;

  // Rent yields (buy-to-let off-plan only).
  const capRatePct = isLet && price > 0 ? (firstYearNoi / price) * 100 : 0;
  const cashOnCashPct = isLet && totalInvested > 0 ? (firstYearNoi / totalInvested) * 100 : 0;
  const grossYieldPct =
    isLet && totalInvested > 0
      ? (annualGross(input.longTermRent ? input.monthlyRentThb || 0 : input.nightlyRateThb || 0) / totalInvested) * 100
      : 0;

  // Bank benchmark: the same instalments parked at the deposit rate until exit.
  const bankM = Math.pow(1 + bank, 1 / 12) - 1;
  let bankFinal = 0;
  for (let m = 0; m <= exitMonth; m++) if (out[m] > 0) bankFinal += out[m] * Math.pow(1 + bankM, exitMonth - m);
  const bankProfit = bankFinal - totalInvested;
  const vsBankThb = totalReturn - bankFinal;

  // Alternative-investment benchmark: same instalments compounded at altReturnPct.
  const altM = Math.pow(1 + (input.altReturnPct || 0) / 100, 1 / 12) - 1;
  let altFinal = 0;
  for (let m = 0; m <= exitMonth; m++) if (out[m] > 0) altFinal += out[m] * Math.pow(1 + altM, exitMonth - m);
  const vsAltThb = totalReturn - altFinal;

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
      if (out[m] > 0) {
        invested += out[m];
        banked += out[m] * Math.pow(1 + bankM, mY - m);
      }
    }
    series.push({
      year: y,
      propertyValue: sellable,
      bankValue: banked,
      rentNet: rentByYear[y] || 0,
      profit: sellable - (y === years ? saleCosts + capitalGainsTax : 0) - invested + cumRent,
    });
  }

  const paybackYears = paybackFrom(series);
  const { roiFxPct, cagrFxPct } = fxAdjusted(
    cf,
    cf.map((_, m) => m / 12),
    totalInvested > 0 ? totalReturn / totalInvested : 0,
    input.fxDriftPct,
    years,
  );

  return {
    initialInvestment: totalInvested,
    projectedValue: sellableExit,
    saleCosts,
    capitalGainsTax,
    holdingCostsTotal: 0,
    leasePaymentsTotal,
    rentNetTotal,
    netProceeds,
    totalReturn,
    netProfit,
    roiPct,
    cagrPct,
    realCagrPct,
    realProjectedValue,
    roiFxPct,
    cagrFxPct,
    paybackYears,
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
    altFinal,
    vsAltThb,
    series,
  };
}

/**
 * EN/RU strings for the investment calculator. The site is English-only by
 * decision, but the calculator is the conversion tool and many testers are
 * Russian-speaking (and were reading it through browser auto-translate, which
 * garbled terms like "DD + transfer"). A scoped RU toggle gives them clean
 * copy. The full site RU version remains a separate task.
 *
 * Interpolated strings are functions; everything else is a plain string. The
 * data-sourced `appreciation.source` stays in English (it names an index).
 */
export type CalcLocale = "en" | "ru";

export interface CalcDict {
  // Tabs
  completed: string;
  offplan: string;
  buyHold: string;
  buyRent: string;
  freehold: string;
  leasehold: string;
  // Assumptions header
  assumptionsTitle: string;
  assumptionsHint: string;
  // Core fields
  contractPrice: string;
  purchasePrice: string;
  growthLabel: string;
  scenarioConservative: string;
  scenarioBase: string;
  scenarioOptimistic: string;
  growthFineTune: string;
  growthSource: (source: string, asOf: string) => string;
  holdingPeriod: string;
  unitYr: string;
  unitMo: string;
  // Leasehold
  leaseTerm: string;
  leaseDecayNote: string;
  leasePayPrepaid: string;
  leasePayMonthly: string;
  leaseMonthlyRate: string;
  leaseIndexation: string;
  leaseMonthlyNote: string;
  // Off-plan
  constructionPlan: string;
  constructionPeriod: string;
  downPaymentNow: string;
  balanceHandover: string;
  valueUplift: string;
  offplanNote: (installmentPct: string) => string;
  // Rent
  rentalAssumptions: string;
  highLowSeason: string;
  rentShortTerm: string;
  rentLongTerm: string;
  monthlyRent: string;
  ltOccupancyHint: string;
  nightlyRate: string;
  highSeasonLength: string;
  highSeasonOccupancy: string;
  highSeasonUplift: string;
  lowSeasonOccupancy: string;
  occupancy: string;
  mgmtFee: string;
  opex: string;
  rentGrowth: string;
  // Advanced costs
  advancedCosts: string;
  costsToggleHint: (currency: string) => string;
  entryCosts: string;
  exitCosts: string;
  annualHolding: string;
  bankRate: string;
  pctOfPrice: (pct: string) => string;
  // Results
  projectedValueIn: (years: number) => string;
  totalRoi: string;
  cagrYear: string;
  netProfit: string;
  valueAtHandover: string;
  irrYear: string;
  totalInvested: string;
  capRate: string;
  cashOnCash: string;
  grossYield: string;
  downloadPdf: string;
  resetDefaults: string;
  copyLink: string;
  linkCopied: string;
  // Cross-input warnings
  leaseExpiryWarn: (years: number, term: number) => string;
  offplanOverpayWarn: (totalPct: number) => string;
  // Bank compare
  vsBank: string;
  bankDeposit: (rate: number) => string;
  thisProperty: string;
  moreThanBank: (years: number) => string;
  lessThanBank: string;
  // Capital growth
  capitalGrowth: string;
  returnVsBankTitle: string;
  now: string;
  yearN: (n: number) => string;
  legendProperty: string;
  legendReturn: string;
  legendBank: string;
  chartTipYear: (n: number) => string;
  // Year table
  showYearByYear: string;
  thYear: string;
  thValue: string;
  thNetRent: string;
  thCumProfit: string;
  // Solver
  findMaxPrice: string;
  targetMetric: string;
  targetPct: string;
  maxPurchasePrice: string;
  payUpTo: (target: number, metric: string) => string;
  applyThisPrice: string;
  solveRoi: string;
  solveCap: string;
  solveCoc: string;
  solveIrr: string;
  unreachableRent: string;
  unreachableHold: string;
  // Similar objects
  propsForBudget: string;
  aroundMatches: (priceStr: string, n: number) => string;
  findForBudget: string;
  // Disclaimer
  disclaimerMain: string;
  disclaimerLease: string;
  disclaimerCurrency: string;
  // New inputs (wave 2)
  leaseRenewableLabel: string;
  furnishingLabel: string;
  furnishingHint: string;
  rentTaxLabel: string;
  rentAfterHandoverLabel: string;
  inflationLabel: string;
  inTodaysMoney: string;
  realCagrNote: (infl: number, value: string) => string;
  // Metric definitions (info tooltips)
  defRoi: string;
  defCagr: string;
  defIrr: string;
  defCapRate: string;
  defCashOnCash: string;
  defGrossYield: string;
  // Break-even
  breakEvenTitle: string;
  breakEvenOccupancy: (v: string) => string;
  breakEvenGrowth: (v: string) => string;
  breakEvenAlways: string;
  breakEvenNever: string;
  // Sensitivity
  sensitivityTitle: string;
  sensHint: string;
  sensDriverGrowth: string;
  sensDriverOccupancy: string;
  // Scenario pin
  pinScenario: string;
  pinnedLabel: string;
  currentLabel: string;
  clearPin: string;
  // Rental income toggle (replaces the Hold/Rent tabs)
  addRentalIncome: string;
  // Target-ROI property finder
  roiTargetTitle: string;
  roiTargetLabel: string;
  roiTargetMatches: (n: number) => string;
  roiTargetNone: string;
  roiTargetNeedsRent: string;
  // Index / alternative-investment benchmark
  altReturnLabel: string;
  indexRow: (rate: number) => string;
  moreThanIndex: string;
  lessThanIndex: string;
  // Monte Carlo
  mcTitle: string;
  mcHint: (n: number, rent: boolean) => string;
  mcLow: string;
  mcMid: string;
  mcHigh: string;
  mcBeatBank: (p: number) => string;
  mcBeatIndex: (p: number) => string;
  // Deal score
  dealTitle: string;
  dealStrong: string;
  dealFair: string;
  dealWeak: string;
  // Market preset range / confidence
  mpRange: (lo: string, hi: string) => string;
  confHigh: string;
  confMed: string;
  confLow: string;
  // Mobile bar
  inYr: (years: number) => string;
  resultsBtn: string;
  // Market preset
  fillFromMarket: string;
  seeFullReport: string;
  mpDistrict: string;
  mpType: string;
  mpBedrooms: string;
  mpChoose: string;
  mpAny: string;
  mpStudio: string;
  mpOccupancy: string;
  mpMeasured: string;
  mpApply: string;
  mpFrom: (basis: string, n: number) => string;
  mpPickDistrict: string;
  mpPerNight: string;
  // FX scenario (A1)
  fxDriftLabel: string;
  fxDriftHint: string;
  fxReturnTitle: string;
  fxReturnLine: (roi: string, cagr: string) => string;
  fxNeutralNote: string;
  // Capital-gains tax (A2)
  cgtLabel: string;
  // Payback + downside (A3)
  paybackKpi: string;
  paybackVal: (v: string) => string;
  paybackNever: string;
  defPayback: string;
  mcProbLoss: (p: number) => string;
  mcVar: (v: string) => string;
  // Two-way sensitivity (A4)
  matrixTitle: string;
  matrixHint: (driver: string) => string;
  matrixGrowthAxis: string;
  // Fan chart (V1)
  fanTitle: string;
  fanHint: string;
  fanBand: string;
  fanMid: string;
  // Tornado (V2)
  tornadoTitle: string;
  tornadoHint: string;
  driverGrowth: string;
  driverOccupancy: string;
  driverNightly: string;
  driverMonthlyRent: string;
  driverMgmt: string;
  driverExit: string;
  driverHorizon: string;
  // Waterfall (V3)
  waterfallTitle: string;
  waterfallHint: string;
  wfInvested: string;
  wfSale: string;
  wfRent: string;
  wfHolding: string;
  wfLease: string;
  wfCgt: string;
  wfProfit: string;
  // Reality check (L1)
  realityTitle: string;
  realityRateHigh: (pct: number) => string;
  realityOccHigh: (pct: number) => string;
  // Scenario compare (L3)
  addScenario: string;
  compareTitle: string;
  compareEmpty: string;
  removeScenario: string;
  clearAll: string;
  // Profiles (U1)
  profilesLabel: string;
  profileConservative: string;
  profileYield: string;
  profileFlipper: string;
  // Result tabs (U2)
  tabSummary: string;
  tabReturns: string;
  tabRisk: string;
  tabCompare: string;
  // Verdict (U3)
  verdictBeats: (amount: string) => string;
  verdictTrails: (amount: string) => string;
  verdictProfitFrom: (v: string) => string;
  verdictNoProfit: string;
  // Simple / Full view toggle
  viewSimple: string;
  viewFull: string;
  viewMorePrompt: string;
  viewSwitchFull: string;
  // Multi-unit picker (projects)
  unitsTitle: string;
  unitsHint: string;
  unitsSelected: (count: number) => string;
  unitsClear: string;
  unitsCombinedNote: (count: number) => string;
  // Language toggle a11y
  langLabel: string;
}

const EN: CalcDict = {
  completed: "Completed",
  offplan: "Off-plan (new build)",
  buyHold: "Buy & Hold",
  buyRent: "Buy & Rent",
  freehold: "Freehold",
  leasehold: "Leasehold",
  assumptionsTitle: "Your assumptions",
  assumptionsHint: "Pre-filled with typical Koh Phangan figures — adjust to your case.",
  contractPrice: "Contract price",
  purchasePrice: "Purchase price",
  growthLabel: "Expected annual price growth",
  scenarioConservative: "Conservative",
  scenarioBase: "Market base",
  scenarioOptimistic: "Optimistic",
  growthFineTune: "Fine-tune (%)",
  growthSource: (source, asOf) =>
    `Presets from ${source} (${asOf}). An indicative band — adjust to your own outlook; not a forecast.`,
  holdingPeriod: "Holding period (years)",
  unitYr: "yr",
  unitMo: "mo",
  leaseTerm: "Total lease term (years)",
  leaseDecayNote:
    "A leasehold's resale value falls as the term runs down — we discount the projection by the remaining years of the lease.",
  leasePayPrepaid: "Lease prepaid",
  leasePayMonthly: "Monthly land rent",
  leaseMonthlyRate: "Land rent (per month)",
  leaseIndexation: "Land rent indexation (%/yr)",
  leaseMonthlyNote:
    "The price above covers the building only; the land is rented monthly with annual indexation. Land rent is counted as an operating cost through the hold.",
  constructionPlan: "Construction & payment plan",
  constructionPeriod: "Construction period (months)",
  downPaymentNow: "Down payment now (%)",
  balanceHandover: "Balance at handover (%)",
  valueUplift: "Value uplift to handover (%)",
  offplanNote: (installmentPct) =>
    `${installmentPct}% paid in instalments during construction. Price growth above applies after handover. “Years” is the total horizon from contract.`,
  rentalAssumptions: "Rental assumptions",
  highLowSeason: "High/low season",
  rentShortTerm: "Nightly (Airbnb)",
  rentLongTerm: "Long-term (monthly)",
  monthlyRent: "Monthly rent",
  ltOccupancyHint: "Share of the year the unit is actually let — vacancy between tenants.",
  nightlyRate: "Nightly rate",
  highSeasonLength: "High season length (months)",
  highSeasonOccupancy: "High season occupancy (%)",
  highSeasonUplift: "High season rate uplift (%)",
  lowSeasonOccupancy: "Low season occupancy (%)",
  occupancy: "Occupancy (%)",
  mgmtFee: "Management fee (% of rent)",
  opex: "Operating expenses (% of price/yr)",
  rentGrowth: "Annual rate growth (%)",
  advancedCosts: "Advanced costs",
  costsToggleHint: (currency) =>
    `Toggle % / ${currency} on any cost to enter an exact amount instead of a percentage.`,
  entryCosts: "Entry costs — due diligence + transfer",
  exitCosts: "Exit costs — transfer + commission",
  annualHolding: "Annual holding costs",
  bankRate: "Bank deposit rate (%)",
  pctOfPrice: (pct) => `= ${pct}% of price`,
  projectedValueIn: (years) => `Projected value in ${years} years`,
  totalRoi: "Total ROI",
  cagrYear: "CAGR / year",
  netProfit: "Net profit",
  valueAtHandover: "Value at handover",
  irrYear: "IRR / year",
  totalInvested: "Total invested",
  capRate: "Cap rate",
  cashOnCash: "Cash-on-cash",
  grossYield: "Gross yield",
  downloadPdf: "Download PDF report",
  resetDefaults: "Reset",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  leaseExpiryWarn: (years, term) =>
    `Your holding period (${years} yr) reaches or exceeds the lease term (${term} yr) — the lease runs out, so the projected resale value falls to near zero. Shorten the horizon or extend the lease.`,
  offplanOverpayWarn: (totalPct) =>
    `Down payment + balance at handover = ${totalPct}% — that's over 100% of the price. Lower one of them so the plan adds up.`,
  vsBank: "vs a bank deposit",
  bankDeposit: (rate) => `Bank deposit (${rate}%)`,
  thisProperty: "This property",
  moreThanBank: (years) => `more than the bank over ${years} years`,
  lessThanBank: "less than the bank — try a higher growth rate or longer horizon",
  capitalGrowth: "Capital growth",
  returnVsBankTitle: "Your return vs a bank deposit",
  now: "Now",
  yearN: (n) => `Year ${n}`,
  legendProperty: "Property value",
  legendReturn: "Your return (sale + rent − costs)",
  legendBank: "Bank deposit",
  chartTipYear: (n) => `Year ${n}`,
  showYearByYear: "Show year-by-year",
  thYear: "Year",
  thValue: "Value",
  thNetRent: "Net rent",
  thCumProfit: "Cumulative profit",
  findMaxPrice: "Find max price for a target return",
  targetMetric: "Target metric",
  targetPct: "Target (%)",
  maxPurchasePrice: "Max purchase price",
  payUpTo: (target, metric) => `Pay up to this and you still hit ${target}% ${metric}.`,
  applyThisPrice: "Apply this price",
  solveRoi: "Total ROI",
  solveCap: "Cap rate",
  solveCoc: "Cash-on-cash",
  solveIrr: "IRR / year",
  unreachableRent: "That target isn't reachable in a sensible price range — try a lower target.",
  unreachableHold:
    "Appreciation-only return doesn't depend on price (every figure scales with it). Switch to Buy & Rent — where rent is a fixed amount — to solve for a max price.",
  propsForBudget: "Properties for this budget",
  aroundMatches: (priceStr, n) => `Around ${priceStr} — ${n} match${n === 1 ? "" : "es"}`,
  findForBudget: "Find properties for this budget",
  disclaimerMain:
    "Illustrative projection based on the assumptions you enter — not a forecast or guarantee of future returns. ",
  disclaimerLease:
    "Leasehold value is discounted by the remaining lease term (a simplified linear model). ",
  disclaimerCurrency:
    "Currency conversion is for display only; figures are computed in THB. Speak with Right Way for a property-specific assessment.",
  leaseRenewableLabel: "Renewable lease (e.g. 30+30+30)",
  furnishingLabel: "Furnishing / setup, one-off",
  furnishingHint: "FF&E to make the villa rentable — counted as cash invested.",
  rentTaxLabel: "Tax on rental income (%)",
  rentAfterHandoverLabel: "Rent it out after handover",
  inflationLabel: "Inflation (%/yr)",
  inTodaysMoney: "in today's money",
  realCagrNote: (infl, value) => `Real CAGR, net of ${infl}% inflation: ${value}/yr`,
  defRoi: "Total profit over the whole period as a % of the cash you put in.",
  defCagr: "The smoothed average annual growth rate of your money.",
  defIrr: "Annualised return that accounts for when each payment is made.",
  defCapRate: "Year-1 net rental income as a % of the purchase price.",
  defCashOnCash: "Year-1 net cash as a % of the cash you actually invested.",
  defGrossYield: "Year-1 gross rent as a % of total invested, before costs.",
  breakEvenTitle: "Break-even vs the bank",
  breakEvenOccupancy: (v) => `At about ${v}% occupancy this matches the bank deposit — above it, the property wins.`,
  breakEvenGrowth: (v) => `At about ${v}%/yr growth this matches the bank deposit — above it, the property wins.`,
  breakEvenAlways: "This beats the bank across the whole sensible range of assumptions.",
  breakEvenNever: "This can't catch the bank within a sensible range — revisit the assumptions.",
  sensitivityTitle: "Sensitivity",
  sensHint: "Total ROI if the main driver lands lower or higher than your base case.",
  sensDriverGrowth: "Annual growth",
  sensDriverOccupancy: "Occupancy",
  pinScenario: "Pin to compare",
  pinnedLabel: "Pinned",
  currentLabel: "Current",
  clearPin: "Clear",
  addRentalIncome: "Include rental income",
  roiTargetTitle: "Find properties by target ROI",
  roiTargetLabel: "Desired total ROI (%)",
  roiTargetMatches: (n) => `${n} listing${n === 1 ? "" : "s"} hit this return under your assumptions`,
  roiTargetNone: "No listings reach this ROI under the current assumptions — lower the target or adjust the inputs.",
  roiTargetNeedsRent: "Appreciation-only ROI doesn't depend on price, so it's the same for every listing. Turn on rental income above to rank properties by ROI.",
  altReturnLabel: "Index / alt. return (%/yr)",
  indexRow: (rate) => `Index fund (${rate}%)`,
  moreThanIndex: "more than an index fund",
  lessThanIndex: "less than an index fund",
  mcTitle: "Probable outcomes (Monte Carlo)",
  mcHint: (n, rent) =>
    `${n.toLocaleString("en-US")} runs varying growth${rent ? ", occupancy and nightly rate" : ""} within the data band — a range of outcomes, not a single guess.`,
  mcLow: "Pessimistic (P10)",
  mcMid: "Median (P50)",
  mcHigh: "Optimistic (P90)",
  mcBeatBank: (p) => `${p}% chance of beating the bank`,
  mcBeatIndex: (p) => `${p}% chance of beating the index`,
  dealTitle: "Deal score",
  dealStrong: "Strong",
  dealFair: "Fair",
  dealWeak: "Weak",
  mpRange: (lo, hi) => `range ${lo}–${hi}`,
  confHigh: "high confidence",
  confMed: "medium confidence",
  confLow: "low confidence",
  inYr: (years) => `In ${years} yr`,
  resultsBtn: "Results",
  fillFromMarket: "Fill from market data",
  seeFullReport: "See full report",
  mpDistrict: "District",
  mpType: "Type",
  mpBedrooms: "Bedrooms",
  mpChoose: "Choose…",
  mpAny: "Any",
  mpStudio: "Studio",
  mpOccupancy: "Occupancy:",
  mpMeasured: "Measured",
  mpApply: "Apply",
  mpFrom: (basis, n) => `from ${basis} (${n} listings)`,
  mpPickDistrict: "Pick a district to pull a starting nightly rate and occupancy. You can edit them after.",
  mpPerNight: "/night",
  fxDriftLabel: "THB vs your currency (%/yr)",
  fxDriftHint:
    "Your view on the baht over the hold: + if you expect THB to strengthen against your home currency, − if to weaken. Drives the “return in your currency” line.",
  fxReturnTitle: "Return in your currency",
  fxReturnLine: (roi, cagr) => `Total ROI ${roi} · CAGR ${cagr}/yr — after the THB move you assumed.`,
  fxNeutralNote: "Set a THB view in Advanced costs to see how currency moves change the return in your currency.",
  cgtLabel: "Tax on gain at sale (%)",
  paybackKpi: "Turns a profit",
  paybackVal: (v) => `Year ${v}`,
  paybackNever: "Not within horizon",
  defPayback: "The year a resale would first clear your costs and show a profit.",
  mcProbLoss: (p) => `${p}% chance of a nominal loss`,
  mcVar: (v) => `Worst-case (P5): ${v}`,
  matrixTitle: "Two-way sensitivity",
  matrixHint: (driver) => `Total ROI as growth and ${driver} both move off your base case.`,
  matrixGrowthAxis: "Growth ↓ / driver →",
  fanTitle: "Range over time",
  fanHint: "The P10–P90 band of your total return across the Monte Carlo runs, widening as uncertainty compounds.",
  fanBand: "P10–P90 range",
  fanMid: "Median",
  tornadoTitle: "What moves the return most",
  tornadoHint: "ROI swing when each driver alone goes from its low to its high — the longest bar is the biggest lever.",
  driverGrowth: "Price growth",
  driverOccupancy: "Occupancy",
  driverNightly: "Nightly rate",
  driverMonthlyRent: "Monthly rent",
  driverMgmt: "Mgmt fee",
  driverExit: "Exit costs",
  driverHorizon: "Holding period",
  waterfallTitle: "Where the money goes",
  waterfallHint: "From cash invested to net profit over the whole hold.",
  wfInvested: "Invested",
  wfSale: "Net sale",
  wfRent: "Net rent",
  wfHolding: "Holding",
  wfLease: "Land rent",
  wfCgt: "Sale tax",
  wfProfit: "Net profit",
  realityTitle: "Reality check",
  realityRateHigh: (pct) => `Your nightly rate sits above ~${pct}% of comparable island listings — optimistic; verify against real comps.`,
  realityOccHigh: (pct) => `Occupancy is above the optimistic market band (${pct}%) — make sure it's achievable year-round.`,
  addScenario: "Add to compare",
  compareTitle: "Scenario comparison",
  compareEmpty: "Add scenarios with the button above to compare them side by side.",
  removeScenario: "Remove",
  clearAll: "Clear all",
  profilesLabel: "Quick start",
  profileConservative: "Conservative",
  profileYield: "Yield-focused",
  profileFlipper: "Off-plan flipper",
  tabSummary: "Summary",
  tabReturns: "Returns",
  tabRisk: "Risk",
  tabCompare: "Compare",
  verdictBeats: (amount) => `beats a bank deposit by ${amount}`,
  verdictTrails: (amount) => `trails a bank deposit by ${amount}`,
  verdictProfitFrom: (v) => `profitable on resale from year ${v}`,
  verdictNoProfit: "doesn't clear costs within the horizon",
  viewSimple: "Simple",
  viewFull: "Full",
  viewMorePrompt: "Need more detail?",
  viewSwitchFull: "Full calculation",
  unitsTitle: "How many properties",
  unitsHint: "Tick the properties you'd buy — totals add up across them.",
  unitsSelected: (count) => `${count} ${count === 1 ? "property" : "properties"} selected`,
  unitsClear: "Clear",
  unitsCombinedNote: (count) =>
    `Combined figures for ${count} properties. Returns (ROI, CAGR) are per-property and don't change with quantity.`,
  langLabel: "Language",
};

const RU: CalcDict = {
  completed: "Готово",
  offplan: "Новостройка (off-plan)",
  buyHold: "Купить и держать",
  buyRent: "Купить и сдавать",
  freehold: "Фрихолд",
  leasehold: "Лизхолд",
  assumptionsTitle: "Ваши параметры",
  assumptionsHint: "Заполнено типичными для Пангана значениями — поправьте под свой случай.",
  contractPrice: "Цена по договору",
  purchasePrice: "Цена покупки",
  growthLabel: "Ожидаемый годовой рост цены",
  scenarioConservative: "Консервативный",
  scenarioBase: "Рынок (база)",
  scenarioOptimistic: "Оптимистичный",
  growthFineTune: "Точно (%)",
  growthSource: (source, asOf) =>
    `Пресеты из ${source} (${asOf}). Ориентировочный диапазон — поправьте под свой взгляд; это не прогноз.`,
  holdingPeriod: "Срок владения (лет)",
  unitYr: "г.",
  unitMo: "мес",
  leaseTerm: "Срок аренды, всего (лет)",
  leaseDecayNote:
    "Стоимость перепродажи лизхолда падает по мере истечения срока — мы дисконтируем прогноз на остаток срока аренды.",
  leasePayPrepaid: "Лизхолд выкуплен",
  leasePayMonthly: "Помесячная плата за землю",
  leaseMonthlyRate: "Плата за землю (в месяц)",
  leaseIndexation: "Индексация платы (%/год)",
  leaseMonthlyNote:
    "Цена выше — только за строение; земля арендуется помесячно с ежегодной индексацией. Плата за землю учитывается как операционный расход на всём горизонте.",
  constructionPlan: "Стройка и план оплаты",
  constructionPeriod: "Срок строительства (мес)",
  downPaymentNow: "Первый взнос сейчас (%)",
  balanceHandover: "Остаток при сдаче (%)",
  valueUplift: "Прирост стоимости к сдаче (%)",
  offplanNote: (installmentPct) =>
    `${installmentPct}% выплачивается частями во время строительства. Рост цены выше применяется после сдачи. «Лет» — общий горизонт от договора.`,
  rentalAssumptions: "Параметры аренды",
  highLowSeason: "Высокий/низкий сезон",
  rentShortTerm: "Посуточно (Airbnb)",
  rentLongTerm: "Долгосрочно (помесячно)",
  monthlyRent: "Ставка в месяц",
  ltOccupancyHint: "Доля года, когда объект реально сдан — простой между арендаторами.",
  nightlyRate: "Ставка за ночь",
  highSeasonLength: "Длина высокого сезона (мес)",
  highSeasonOccupancy: "Загрузка в высокий сезон (%)",
  highSeasonUplift: "Наценка в высокий сезон (%)",
  lowSeasonOccupancy: "Загрузка в низкий сезон (%)",
  occupancy: "Загрузка (%)",
  mgmtFee: "Комиссия управления (% от аренды)",
  opex: "Операционные расходы (% от цены/год)",
  rentGrowth: "Годовой рост ставки (%)",
  advancedCosts: "Дополнительные затраты",
  costsToggleHint: (currency) =>
    `Переключите % / ${currency} у любой затраты, чтобы ввести точную сумму вместо процента.`,
  entryCosts: "Затраты на вход — проверка + перевод права",
  exitCosts: "Затраты на выход — перевод права + комиссия",
  annualHolding: "Ежегодные затраты на содержание",
  bankRate: "Ставка по банковскому депозиту (%)",
  pctOfPrice: (pct) => `= ${pct}% от цены`,
  projectedValueIn: (years) => `Прогноз стоимости через ${years} лет`,
  totalRoi: "Полный ROI",
  cagrYear: "CAGR / год",
  netProfit: "Чистая прибыль",
  valueAtHandover: "Стоимость при сдаче",
  irrYear: "IRR / год",
  totalInvested: "Всего вложено",
  capRate: "Cap rate",
  cashOnCash: "Cash-on-cash",
  grossYield: "Валовая доходность",
  downloadPdf: "Скачать PDF-отчёт",
  resetDefaults: "Сбросить",
  copyLink: "Скопировать ссылку",
  linkCopied: "Ссылка скопирована",
  leaseExpiryWarn: (years, term) =>
    `Срок владения (${years} г.) достигает или превышает срок аренды (${term} г.) — аренда заканчивается, поэтому прогнозная стоимость перепродажи падает почти до нуля. Сократите горизонт или продлите аренду.`,
  offplanOverpayWarn: (totalPct) =>
    `Первый взнос + остаток при сдаче = ${totalPct}% — это больше 100% цены. Уменьшите одно из значений, чтобы план сходился.`,
  vsBank: "против банковского депозита",
  bankDeposit: (rate) => `Банковский депозит (${rate}%)`,
  thisProperty: "Эта недвижимость",
  moreThanBank: (years) => `больше банка за ${years} лет`,
  lessThanBank: "меньше банка — попробуйте выше рост или длиннее горизонт",
  capitalGrowth: "Рост капитала",
  returnVsBankTitle: "Ваш результат против депозита",
  now: "Сейчас",
  yearN: (n) => `Год ${n}`,
  legendProperty: "Стоимость объекта",
  legendReturn: "Ваш результат (продажа + аренда − затраты)",
  legendBank: "Депозит",
  chartTipYear: (n) => `Год ${n}`,
  showYearByYear: "Показать по годам",
  thYear: "Год",
  thValue: "Стоимость",
  thNetRent: "Чистая аренда",
  thCumProfit: "Накопл. прибыль",
  findMaxPrice: "Найти макс. цену под целевую доходность",
  targetMetric: "Целевая метрика",
  targetPct: "Цель (%)",
  maxPurchasePrice: "Макс. цена покупки",
  payUpTo: (target, metric) => `Платите до этой суммы — и всё ещё получите ${target}% ${metric}.`,
  applyThisPrice: "Применить эту цену",
  solveRoi: "Полный ROI",
  solveCap: "Cap rate",
  solveCoc: "Cash-on-cash",
  solveIrr: "IRR / год",
  unreachableRent: "Эта цель недостижима в разумном диапазоне цен — попробуйте ниже.",
  unreachableHold:
    "Доходность только от роста цены не зависит от цены (всё масштабируется). Переключитесь на «Купить и сдавать» — где аренда фиксирована — чтобы найти макс. цену.",
  propsForBudget: "Объекты под этот бюджет",
  aroundMatches: (priceStr, n) => `Около ${priceStr} — ${n} ${n === 1 ? "объект" : "объектов"}`,
  findForBudget: "Найти объекты под этот бюджет",
  disclaimerMain:
    "Иллюстративный расчёт на основе введённых вами параметров — не прогноз и не гарантия будущей доходности. ",
  disclaimerLease:
    "Стоимость лизхолда дисконтируется на остаток срока аренды (упрощённая линейная модель). ",
  disclaimerCurrency:
    "Конвертация валют — только для отображения; расчёты ведутся в THB. Обратитесь в Right Way за оценкой под конкретный объект.",
  leaseRenewableLabel: "Аренда с продлением (напр. 30+30+30)",
  furnishingLabel: "Меблировка / запуск, разово",
  furnishingHint: "Обстановка, чтобы виллу можно было сдавать — учитывается как вложенный капитал.",
  rentTaxLabel: "Налог на арендный доход (%)",
  rentAfterHandoverLabel: "Сдавать после сдачи объекта",
  inflationLabel: "Инфляция (%/год)",
  inTodaysMoney: "в сегодняшних деньгах",
  realCagrNote: (infl, value) => `Реальный CAGR, за вычетом инфляции ${infl}%: ${value}/год`,
  defRoi: "Совокупная прибыль за весь период в % от вложенных денег.",
  defCagr: "Сглаженный средний годовой темп роста ваших денег.",
  defIrr: "Годовая доходность с учётом того, когда сделан каждый платёж.",
  defCapRate: "Чистый арендный доход за 1-й год в % от цены покупки.",
  defCashOnCash: "Чистый денежный поток за 1-й год в % от реально вложенных денег.",
  defGrossYield: "Валовая аренда за 1-й год в % от всего вложенного, до затрат.",
  breakEvenTitle: "Точка безубыточности против банка",
  breakEvenOccupancy: (v) => `Примерно при ${v}% загрузки результат сравнивается с депозитом — выше неё выигрывает недвижимость.`,
  breakEvenGrowth: (v) => `Примерно при росте ${v}%/год результат сравнивается с депозитом — выше него выигрывает недвижимость.`,
  breakEvenAlways: "Обгоняет банк во всём разумном диапазоне допущений.",
  breakEvenNever: "Не догоняет банк в разумном диапазоне — пересмотрите допущения.",
  sensitivityTitle: "Чувствительность",
  sensHint: "Полный ROI, если ключевой параметр окажется ниже или выше базового.",
  sensDriverGrowth: "Годовой рост",
  sensDriverOccupancy: "Загрузка",
  pinScenario: "Закрепить для сравнения",
  pinnedLabel: "Закреплён",
  currentLabel: "Текущий",
  clearPin: "Сбросить",
  addRentalIncome: "Учитывать доход от аренды",
  roiTargetTitle: "Подобрать объекты под желаемый ROI",
  roiTargetLabel: "Желаемый полный ROI (%)",
  roiTargetMatches: (n) => `${n} ${n === 1 ? "объект даёт" : "объект(ов) дают"} такую доходность при ваших допущениях`,
  roiTargetNone: "Ни один объект не достигает этого ROI при текущих допущениях — снизьте цель или измените параметры.",
  roiTargetNeedsRent: "ROI только от роста цены не зависит от стоимости — он одинаков для всех объектов. Включите доход от аренды выше, чтобы ранжировать объекты по ROI.",
  altReturnLabel: "Индекс / альт. доходность (%/год)",
  indexRow: (rate) => `Индексный фонд (${rate}%)`,
  moreThanIndex: "больше индексного фонда",
  lessThanIndex: "меньше индексного фонда",
  mcTitle: "Вероятные исходы (Monte Carlo)",
  mcHint: (n, rent) =>
    `${n.toLocaleString("ru-RU")} прогонов с вариацией роста${rent ? ", загрузки и ставки за ночь" : ""} внутри диапазона данных — спектр исходов, а не одна догадка.`,
  mcLow: "Пессимистичный (P10)",
  mcMid: "Медиана (P50)",
  mcHigh: "Оптимистичный (P90)",
  mcBeatBank: (p) => `${p}% шанс обогнать банк`,
  mcBeatIndex: (p) => `${p}% шанс обогнать индекс`,
  dealTitle: "Оценка сделки",
  dealStrong: "Сильная",
  dealFair: "Средняя",
  dealWeak: "Слабая",
  mpRange: (lo, hi) => `диапазон ${lo}–${hi}`,
  confHigh: "высокая достоверность",
  confMed: "средняя достоверность",
  confLow: "низкая достоверность",
  inYr: (years) => `Через ${years} лет`,
  resultsBtn: "Результат",
  fillFromMarket: "Заполнить из данных рынка",
  seeFullReport: "Полный отчёт",
  mpDistrict: "Район",
  mpType: "Тип",
  mpBedrooms: "Спальни",
  mpChoose: "Выбрать…",
  mpAny: "Любой",
  mpStudio: "Студия",
  mpOccupancy: "Загрузка:",
  mpMeasured: "Замер",
  mpApply: "Применить",
  mpFrom: (basis, n) => `из «${basis}» (${n} объявл.)`,
  mpPickDistrict: "Выберите район, чтобы подтянуть стартовую ставку за ночь и загрузку. Потом можно поправить.",
  mpPerNight: "/ночь",
  fxDriftLabel: "THB к вашей валюте (%/год)",
  fxDriftHint:
    "Ваш взгляд на бат за срок владения: + если ожидаете укрепления THB к вашей валюте, − если ослабления. Управляет строкой «доходность в вашей валюте».",
  fxReturnTitle: "Доходность в вашей валюте",
  fxReturnLine: (roi, cagr) => `Полный ROI ${roi} · CAGR ${cagr}/год — с учётом заданного вами движения THB.`,
  fxNeutralNote: "Задайте взгляд на THB в «Дополнительных затратах», чтобы увидеть доходность в вашей валюте с учётом курса.",
  cgtLabel: "Налог на прирост при продаже (%)",
  paybackKpi: "Выход в плюс",
  paybackVal: (v) => `${v}-й год`,
  paybackNever: "Не в пределах срока",
  defPayback: "Год, когда перепродажа впервые покрывает затраты и выходит в прибыль.",
  mcProbLoss: (p) => `${p}% шанс номинального убытка`,
  mcVar: (v) => `Худший случай (P5): ${v}`,
  matrixTitle: "Двумерная чувствительность",
  matrixHint: (driver) => `Полный ROI при одновременном отклонении роста и «${driver}» от базового случая.`,
  matrixGrowthAxis: "Рост ↓ / параметр →",
  fanTitle: "Диапазон во времени",
  fanHint: "Полоса P10–P90 вашего результата по прогонам Monte Carlo, расширяющаяся по мере накопления неопределённости.",
  fanBand: "Диапазон P10–P90",
  fanMid: "Медиана",
  tornadoTitle: "Что сильнее всего влияет на результат",
  tornadoHint: "Размах ROI, когда каждый параметр в одиночку идёт от минимума к максимуму — самая длинная полоса — главный рычаг.",
  driverGrowth: "Рост цены",
  driverOccupancy: "Загрузка",
  driverNightly: "Ставка за ночь",
  driverMonthlyRent: "Ставка в месяц",
  driverMgmt: "Комиссия упр.",
  driverExit: "Затраты выхода",
  driverHorizon: "Срок владения",
  waterfallTitle: "Куда уходят деньги",
  waterfallHint: "От вложенного капитала до чистой прибыли за весь срок.",
  wfInvested: "Вложено",
  wfSale: "Чистая продажа",
  wfRent: "Чистая аренда",
  wfHolding: "Содержание",
  wfLease: "Аренда земли",
  wfCgt: "Налог с продажи",
  wfProfit: "Чистая прибыль",
  realityTitle: "Проверка реалистичности",
  realityRateHigh: (pct) => `Ваша ставка за ночь выше ~${pct}% сопоставимых объявлений по острову — оптимистично; сверьтесь с реальными аналогами.`,
  realityOccHigh: (pct) => `Загрузка выше оптимистичного рыночного диапазона (${pct}%) — убедитесь, что она достижима круглый год.`,
  addScenario: "Добавить к сравнению",
  compareTitle: "Сравнение сценариев",
  compareEmpty: "Добавьте сценарии кнопкой выше, чтобы сравнить их рядом.",
  removeScenario: "Убрать",
  clearAll: "Очистить всё",
  profilesLabel: "Быстрый старт",
  profileConservative: "Консервативный",
  profileYield: "Под доходность",
  profileFlipper: "Флиппер off-plan",
  tabSummary: "Сводка",
  tabReturns: "Доходность",
  tabRisk: "Риск",
  tabCompare: "Сравнение",
  verdictBeats: (amount) => `обгоняет депозит на ${amount}`,
  verdictTrails: (amount) => `отстаёт от депозита на ${amount}`,
  verdictProfitFrom: (v) => `прибыльна при перепродаже с ${v}-го года`,
  verdictNoProfit: "не покрывает затраты в пределах срока",
  viewSimple: "Простой",
  viewFull: "Полный",
  viewMorePrompt: "Нужно больше параметров?",
  viewSwitchFull: "Полный расчёт",
  unitsTitle: "Сколько объектов",
  unitsHint: "Отметьте объекты, которые берёте — суммы складываются по ним.",
  unitsSelected: (count) => `Выбрано объектов: ${count}`,
  unitsClear: "Сбросить",
  unitsCombinedNote: (count) =>
    `Совокупные суммы для ${count} объектов. Доходность (ROI, CAGR) — на один объект и не зависит от количества.`,
  langLabel: "Язык",
};

export function calcDict(locale: CalcLocale): CalcDict {
  return locale === "ru" ? RU : EN;
}

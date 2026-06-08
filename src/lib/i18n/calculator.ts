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
  downloadPdf: string;
  // Bank compare
  vsBank: string;
  bankDeposit: (rate: number) => string;
  thisProperty: string;
  moreThanBank: (years: number) => string;
  lessThanBank: string;
  // Capital growth
  capitalGrowth: string;
  now: string;
  yearN: (n: number) => string;
  legendProperty: string;
  legendBank: string;
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
  constructionPlan: "Construction & payment plan",
  constructionPeriod: "Construction period (months)",
  downPaymentNow: "Down payment now (%)",
  balanceHandover: "Balance at handover (%)",
  valueUplift: "Value uplift to handover (%)",
  offplanNote: (installmentPct) =>
    `${installmentPct}% paid in instalments during construction. Price growth above applies after handover. “Years” is the total horizon from contract.`,
  rentalAssumptions: "Rental assumptions",
  highLowSeason: "High/low season",
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
  downloadPdf: "Download PDF report",
  vsBank: "vs a bank deposit",
  bankDeposit: (rate) => `Bank deposit (${rate}%)`,
  thisProperty: "This property",
  moreThanBank: (years) => `more than the bank over ${years} years`,
  lessThanBank: "less than the bank — try a higher growth rate or longer horizon",
  capitalGrowth: "Capital growth",
  now: "Now",
  yearN: (n) => `Year ${n}`,
  legendProperty: "Property",
  legendBank: "Bank deposit",
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
  constructionPlan: "Стройка и план оплаты",
  constructionPeriod: "Срок строительства (мес)",
  downPaymentNow: "Первый взнос сейчас (%)",
  balanceHandover: "Остаток при сдаче (%)",
  valueUplift: "Прирост стоимости к сдаче (%)",
  offplanNote: (installmentPct) =>
    `${installmentPct}% выплачивается частями во время строительства. Рост цены выше применяется после сдачи. «Лет» — общий горизонт от договора.`,
  rentalAssumptions: "Параметры аренды",
  highLowSeason: "Высокий/низкий сезон",
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
  downloadPdf: "Скачать PDF-отчёт",
  vsBank: "против банковского депозита",
  bankDeposit: (rate) => `Банковский депозит (${rate}%)`,
  thisProperty: "Эта недвижимость",
  moreThanBank: (years) => `больше банка за ${years} лет`,
  lessThanBank: "меньше банка — попробуйте выше рост или длиннее горизонт",
  capitalGrowth: "Рост капитала",
  now: "Сейчас",
  yearN: (n) => `Год ${n}`,
  legendProperty: "Недвижимость",
  legendBank: "Депозит",
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
  langLabel: "Язык",
};

export function calcDict(locale: CalcLocale): CalcDict {
  return locale === "ru" ? RU : EN;
}

/**
 * Rental economics a developer publishes for its own project, kept verbatim so
 * a buyer can see what is promised — and where our own note differs.
 *
 * Verana (RW-P0018): figures from ARQA's price page of Aug 2026, arithmetic
 * re-checked line by line (see the project passport in the hub repo). Nightly
 * rate and occupancy are not disclosed by the developer, only annual revenue,
 * so this table cannot be re-derived — the ROI calculator below it runs on our
 * own market data instead, which is the point of showing both.
 */

export interface EconomicsFormat {
  id: string;
  label: string;
  entryThb: number;
  grossRevenue: number;
  opex: number;
  operatingProfit: number;
  managementFee: number;
  netOwnerIncome: number;
  netMonthly: number;
  yieldPct: number;
  paybackYears: number;
}

export interface ProjectEconomics {
  rwNumber: string;
  /** Where the numbers came from, shown as a source line. */
  source: { en: string; ru: string };
  formats: EconomicsFormat[];
  /** Our own caveats — the things the developer's table leaves out. */
  caveats: Array<{ en: string; ru: string }>;
}

const VERANA: ProjectEconomics = {
  rwNumber: "RW-P0018",
  source: {
    en: "Figures published by ARQA Development, August 2026. Management fee is 25% of operating profit; letting costs assume 18% platform commission and 5% of revenue set aside for repairs.",
    ru: "Цифры опубликованы застройщиком ARQA Development в августе 2026. Комиссия управляющей компании — 25% от операционной прибыли; в расходах заложены 18% комиссии площадок и 5% выручки на ремонт.",
  },
  formats: [
    {
      id: "1BR",
      label: "1BR",
      entryThb: 6_550_000,
      grossRevenue: 2_113_000,
      opex: 745_502,
      operatingProfit: 1_367_498,
      managementFee: 341_874,
      netOwnerIncome: 1_025_624,
      netMonthly: 85_469,
      yieldPct: 15.7,
      paybackYears: 6.4,
    },
    {
      id: "2BR",
      label: "2BR",
      entryThb: 10_200_000,
      grossRevenue: 2_852_550,
      opex: 987_599,
      operatingProfit: 1_864_951,
      managementFee: 466_238,
      netOwnerIncome: 1_398_713,
      netMonthly: 116_559,
      yieldPct: 13.7,
      paybackYears: 7.3,
    },
    {
      id: "3BR",
      label: "3BR",
      entryThb: 11_600_000,
      grossRevenue: 3_169_500,
      opex: 1_132_497,
      operatingProfit: 2_037_003,
      managementFee: 509_251,
      netOwnerIncome: 1_527_752,
      netMonthly: 127_313,
      yieldPct: 13.2,
      paybackYears: 7.6,
    },
  ],
  caveats: [
    {
      en: "Payback is measured against the entry sum, which covers only the first five years of land lease. The next lease payment falls due in year six — 330,000 THB for a one-bedroom villa — so the real payback is longer than the table shows.",
      ru: "Окупаемость считается от суммы входа, в которую аренда земли включена только за первые пять лет. Следующий платёж приходит на шестой год — 330 000 ฿ для виллы с одной спальней, — поэтому реальная окупаемость длиннее табличной.",
    },
    {
      en: "The nightly rate and occupancy behind the revenue line are not disclosed, and rates for the two- and three-bedroom villas are assumed at +35% and +50% over the one-bedroom.",
      ru: "Ставка за ночь и загрузка, из которых сложена выручка, не раскрыты; ставки для вилл с двумя и тремя спальнями приняты как +35% и +50% к односпальной.",
    },
    {
      en: "Annual land and building tax, and utilities during the owner's own stays, sit outside the calculation. So does replacing furniture and appliances over a 30-year lease.",
      ru: "Ежегодный налог на землю и строение и коммунальные услуги в периоды личного проживания в расчёт не входят — как и замена мебели и техники за 30 лет аренды.",
    },
    {
      en: "A rental forecast is not a guarantee. Season, rates and occupancy on Phangan move year to year.",
      ru: "Прогноз аренды — не гарантия дохода. Сезон, ставки и загрузка на Пангане меняются год к году.",
    },
  ],
};

export const ECONOMICS_LABELS = {
  en: {
    heading: "The developer's own numbers",
    lede: "What ARQA projects a villa earns in a year, per format. Our note on what the table leaves out follows below.",
    entry: "Entry sum",
    grossRevenue: "Gross revenue",
    opex: "Operating costs",
    operatingProfit: "Operating profit",
    managementFee: "Management fee",
    netOwnerIncome: "Net to owner",
    netMonthly: "Per month",
    yieldPct: "Return on entry",
    payback: "Payback",
    years: (n: number) => `${n} years`,
    sourceLabel: "Source",
    caveatsLabel: "What the table leaves out",
  },
  ru: {
    heading: "Экономика по расчёту застройщика",
    lede: "Сколько, по расчёту ARQA, вилла приносит за год — по каждому формату. Ниже — что этот расчёт не учитывает.",
    entry: "Сумма входа",
    grossRevenue: "Валовая выручка",
    opex: "Операционные расходы",
    operatingProfit: "Операционная прибыль",
    managementFee: "Комиссия УК",
    netOwnerIncome: "Чистый доход владельца",
    netMonthly: "В месяц",
    yieldPct: "Доходность на вложенное",
    payback: "Окупаемость",
    // Payback is always fractional here (6,4 · 7,3 · 7,6) — "года" fits all of them.
    years: (n: number) => `${n.toLocaleString("ru-RU")} года`,
    sourceLabel: "Источник",
    caveatsLabel: "Чего расчёт не учитывает",
  },
} as const;

const BY_PROJECT: Record<string, ProjectEconomics> = { [VERANA.rwNumber]: VERANA };

export function getProjectEconomics(rwNumber: string): ProjectEconomics | undefined {
  return BY_PROJECT[rwNumber];
}

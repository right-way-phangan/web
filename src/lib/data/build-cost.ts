/**
 * Ставки строительства виллы на Пангане для прикидочного калькулятора сметы.
 *
 * Источник — наша же статья «Building a villa on Koh Phangan»
 * (src/content/knowledge-base.ts, slug `building-a-villa-koh-phangan`, раздел
 * «Construction cost: what to budget»). Числа опубликованы там и здесь не
 * пересчитываются — расхождение между статьёй и калькулятором читалось бы как
 * ошибка в обоих. Островная надбавка 8–15% над материком в бэнды уже заложена
 * (они даны для Пангана), поэтому второй раз её не накручиваем.
 *
 * 🔴 Построчные сметы застройщиков (в них видна их маржа) сюда не попадают
 * никогда — только публичные рыночные вилки.
 */

export type BuildBandKey = "basic" | "mid" | "premium";

export interface BuildBand {
  key: BuildBandKey;
  /** THB за м² построенной площади. */
  low: number;
  high: number;
  /** Верх бэнда открытый («60 000+») — печатаем «и выше». */
  openEnded?: boolean;
}

export const BUILD_BANDS: BuildBand[] = [
  { key: "basic", low: 18_000, high: 25_000 },
  { key: "mid", low: 25_000, high: 40_000 },
  { key: "premium", low: 40_000, high: 60_000, openEnded: true },
];

/** Бассейн считается лумпом: публикуемой ставки за м² чаши нет. */
export const POOL_LUMP = { low: 400_000, high: 800_000 };

/** Архитектор, конструктор, технадзор — доля от стоимости стройки. */
export const FEES_PCT = { low: 0.08, high: 0.15 };

/** Срок самой стройки, месяцев (без проектирования и разрешения). */
export const BUILD_MONTHS = { low: 6, high: 18 };

/** Разрешение Por. Ror. 1 от подачи до выдачи, месяцев. */
export const PERMIT_MONTHS = { low: 4, high: 6 };

export const BUILD_COST_ARTICLE = "building-a-villa-koh-phangan";

export interface BuildEstimate {
  low: number;
  high: number;
  openEnded: boolean;
}

/** Вилка бюджета стройки: площадь × бэнд + бассейн лумпом, сверху гонорары. */
export function estimateBuildCost(input: {
  areaSqm: number;
  band: BuildBand;
  pool: boolean;
  fees: boolean;
}): BuildEstimate {
  const area = Math.max(0, input.areaSqm);
  let low = area * input.band.low + (input.pool ? POOL_LUMP.low : 0);
  let high = area * input.band.high + (input.pool ? POOL_LUMP.high : 0);
  if (input.fees) {
    low *= 1 + FEES_PCT.low;
    high *= 1 + FEES_PCT.high;
  }
  return { low, high, openEnded: !!input.band.openEnded };
}

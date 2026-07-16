import type { ObjectType, TenureType, RealEstateObject } from "@/types/object";

/**
 * RW Match — типы разговорного ИИ-подбора недвижимости.
 *
 * `BuyerProfile` — то, что интервьюер (LLM или скриптованный фолбэк) постепенно
 * собирает из диалога с покупателем. По сути это надмножество `ListingsFilter`
 * (жёсткие критерии) плюс приоритеты/цель/срок — движок в `lib/match/engine.ts`
 * маппит его на фильтр каталога и скорит объекты под профиль.
 */

/** Зачем покупает — определяет, что тянуть в обоснование фита (напр. доходность). */
export type MatchGoal = "live" | "invest" | "rent-out" | "vacation" | "mixed";

/** Срок принятия решения — словарь совпадает с `_LEAD_HINT` бота (Кайрос). */
export type MatchTimeframe = "now" | "1-3m" | "3-6m" | "browsing";

/**
 * Фича-приоритет («must-have»). Первые три — единственные, что умеет жёстко
 * фильтровать `makeFilterPredicate`; остальные учитываются мягко в скоринге.
 */
export type MatchFeature =
  | "seaView"
  | "beachfront"
  | "mountainView"
  | "jungleView"
  | "flatLand"
  | "quiet"
  | "electricity"
  | "pool"
  | "parking"
  | "gated";

export interface BuyerProfile {
  goal?: MatchGoal;
  /** buy (покупка/лизхолд) | rent (краткосрочная аренда). По умолчанию buy. */
  mode?: "buy" | "rent";
  /** Бюджет в МИЛЛИОНАХ THB (как в parse-query и URL-параметрах /listings). */
  budgetMinMThb?: number;
  budgetMaxMThb?: number;
  tenure?: TenureType[];
  /** Прошла ли образовательная вставка про leasehold-пивот (49/51, фрихолд-риск). */
  leaseholdDiscussed?: boolean;
  /** Районы — значения `amoName` из `content/districts.ts`. */
  districts?: string[];
  type?: ObjectType[];
  bedroomsMin?: number;
  mustHaves?: MatchFeature[];
  timeframe?: MatchTimeframe;
  /** Накопленный свободный текст пожеланий — семантическое сырьё для ранжировщика. */
  notes?: string;
  lang?: "en" | "ru";
}

/** Код совпавшего критерия — стабильный ключ, локализуется на UI/в форматтере. */
export type MatchReasonCode =
  | "budget"
  | "type"
  | "district"
  | "tenure"
  | "bedrooms"
  | "yield"
  | `feature:${MatchFeature}`;

/** Оценка одного объекта под профиль (детерминированная ветка). */
export interface MatchScore {
  fitPct: number;
  met: MatchReasonCode[];
}

/** Итоговая карточка выдачи: объект + % фита + одна причина-фраза. */
export interface MatchResult {
  rw: string;
  fitPct: number;
  reason: string;
  card: RealEstateObject;
}

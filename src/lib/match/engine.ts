import type { RealEstateObject } from "@/types/object";
import type {
  BuyerProfile,
  MatchFeature,
  MatchReasonCode,
  MatchResult,
  MatchScore,
} from "@/types/match";
import {
  type ListingsFilter,
  makeFilterPredicate,
  acquisitionValueThb,
  monthlyRentOf,
  matchesTypeFilter,
} from "@/lib/filters/listings";

/**
 * RW Match — движок подбора (чистые функции, без сети и LLM).
 *
 * Три задачи: (1) `profileToFilter` кладёт профиль на существующий тип
 * `ListingsFilter`, чтобы переиспользовать `makeFilterPredicate`; (2)
 * `shortlistCandidates` жёстко фильтрует каталог и мягко релаксует критерии,
 * пока кандидатов не наберётся достаточно (защита от пустой выдачи — главная
 * жалоба на матчеры вроде Jack); (3) `scoreObject`/`deterministicRank` дают %
 * фита и причины. LLM-ранжировщик (`lib/match/llm.ts`) работает поверх шортлиста;
 * детерминированная ветка — фолбэк без ключа и валидатор ответа модели.
 */

/** Фичи, которые умеет жёстко фильтровать `makeFilterPredicate`. */
const HARD_FEATURES: MatchFeature[] = ["beachfront", "seaView", "mountainView"];

/** Все фичи → поле объекта (для мягкого скоринга). */
const FEATURE_FIELD: Record<MatchFeature, keyof RealEstateObject> = {
  seaView: "seaView",
  beachfront: "beachfront",
  mountainView: "mountainView",
  jungleView: "jungleView",
  flatLand: "flatLand",
  quiet: "quiet",
  electricity: "electricity",
  pool: "pool",
  parking: "parking",
  gated: "gated",
};

/** Профиль → `ListingsFilter`. Бюджет (млн THB) → диапазон цены (THB) в режиме buy. */
export function profileToFilter(p: BuyerProfile): ListingsFilter {
  const feat = new Set(p.mustHaves ?? []);
  const mode = p.mode ?? "buy";
  const toThb = (m?: number) => (m && m > 0 ? Math.round(m * 1_000_000) : undefined);
  return {
    mode,
    type: p.type ?? [],
    district: p.districts ?? [],
    tenure: p.tenure ?? [],
    bedroomsMin: p.bedroomsMin,
    priceMinThb: mode === "buy" ? toThb(p.budgetMinMThb) : undefined,
    priceMaxThb: mode === "buy" ? toThb(p.budgetMaxMThb) : undefined,
    rentMinThb: undefined,
    rentMaxThb: undefined,
    beachfront: feat.has("beachfront"),
    seaView: feat.has("seaView"),
    mountainView: feat.has("mountainView"),
    sort: "featured",
  };
}

const MIN_CANDIDATES = 6;
const CAP = 30;

/**
 * Жёсткий фильтр + прогрессивная релаксация. Порядок ослабления (только для
 * реально заданных критериев): район → бюджет (±25%) → view-фичи → спальни → тип.
 * Возвращает кандидатов, УЖЕ отсортированных по детерминированному скору (лучшие
 * первыми), обрезанных до `cap`, плюс список применённых релаксаций для честного
 * показа («чуть выше бюджета»).
 */
export function shortlistCandidates(
  objects: RealEstateObject[],
  p: BuyerProfile,
  opts?: { min?: number; cap?: number },
): { candidates: RealEstateObject[]; relaxations: MatchReasonCode[] | string[] } {
  const min = opts?.min ?? MIN_CANDIDATES;
  const cap = opts?.cap ?? CAP;

  let filter = profileToFilter(p);
  let cands = objects.filter(makeFilterPredicate(filter));
  const relaxed: string[] = [];

  const steps: Array<{ key: string; when: boolean; apply: (f: ListingsFilter) => ListingsFilter }> = [
    {
      key: "district",
      when: (p.districts?.length ?? 0) > 0,
      apply: (f) => ({ ...f, district: [] }),
    },
    {
      key: "budget",
      when: !!p.budgetMaxMThb || !!p.budgetMinMThb,
      apply: (f) => ({
        ...f,
        priceMaxThb: f.priceMaxThb ? Math.round(f.priceMaxThb * 1.25) : undefined,
        priceMinThb: f.priceMinThb ? Math.round(f.priceMinThb * 0.75) : undefined,
      }),
    },
    {
      key: "features",
      when: filter.beachfront || filter.seaView || filter.mountainView,
      apply: (f) => ({ ...f, beachfront: false, seaView: false, mountainView: false }),
    },
    {
      key: "bedrooms",
      when: p.bedroomsMin != null,
      apply: (f) => ({ ...f, bedroomsMin: undefined }),
    },
    { key: "type", when: (p.type?.length ?? 0) > 0, apply: (f) => ({ ...f, type: [] }) },
  ];

  for (const s of steps) {
    if (cands.length >= min) break;
    if (!s.when) continue;
    filter = s.apply(filter);
    cands = objects.filter(makeFilterPredicate(filter));
    relaxed.push(s.key);
  }

  const ranked = [...cands].sort((a, b) => scoreObject(p, b).fitPct - scoreObject(p, a).fitPct);
  return { candidates: ranked.slice(0, cap), relaxations: relaxed };
}

/**
 * Взвешенный скоринг объекта под профиль (паттерн score+reasons из
 * `crm/matching.ts`, инвертированный: профиль → объект). Каждый ЗАДАННЫЙ в
 * профиле критерий добавляет вес в знаменатель, а выполненный — и в числитель,
 * поэтому объект, попавший во все критерии, даёт 100%. Пустой профиль → нейтраль.
 */
export function scoreObject(p: BuyerProfile, o: RealEstateObject): MatchScore {
  let raw = 0;
  let max = 0;
  const met: MatchReasonCode[] = [];
  const add = (weight: number, ok: boolean, code: MatchReasonCode) => {
    max += weight;
    if (ok) {
      raw += weight;
      met.push(code);
    }
  };

  // Бюджет (важнейший критерий). Стоимость приобретения = цена продажи или
  // тело лизхолда (acquisitionValueThb), для аренды — месячная ставка.
  const budgetMax = p.budgetMaxMThb ? p.budgetMaxMThb * 1_000_000 : undefined;
  const budgetMin = p.budgetMinMThb ? p.budgetMinMThb * 1_000_000 : undefined;
  if (budgetMax || budgetMin) {
    const val = (p.mode ?? "buy") === "rent" ? monthlyRentOf(o) : acquisitionValueThb(o);
    const inRange =
      val != null && (!budgetMax || val <= budgetMax) && (!budgetMin || val >= budgetMin);
    add(3, Boolean(inRange), "budget");
  }

  if ((p.type?.length ?? 0) > 0) add(2, matchesTypeFilter(o, p.type!), "type");

  if ((p.districts?.length ?? 0) > 0) {
    add(2, Boolean(o.district && p.districts!.includes(o.district)), "district");
  }

  if ((p.tenure?.length ?? 0) > 0) {
    const owned = new Set(o.tenure ?? []);
    add(1.5, p.tenure!.some((t) => owned.has(t)), "tenure");
  }

  if (p.bedroomsMin != null) {
    add(1.5, (o.bedrooms ?? 0) >= p.bedroomsMin, "bedrooms");
  }

  for (const feat of p.mustHaves ?? []) {
    add(1, Boolean(o[FEATURE_FIELD[feat]]), `feature:${feat}`);
  }

  // Инвестору важна доходность: наличие net yield добавляет вес.
  if (p.goal === "invest" || p.goal === "rent-out") {
    add(1, (o.netYieldPct ?? 0) > 0, "yield");
  }

  const fitPct = max > 0 ? Math.round((raw / max) * 100) : 60;
  return { fitPct, met };
}

const REASON_TEXT: Record<"en" | "ru", Record<string, string>> = {
  en: {
    budget: "within budget",
    type: "matches your type",
    district: "in your area",
    tenure: "tenure fits",
    bedrooms: "enough bedrooms",
    yield: "income-producing",
    "feature:seaView": "sea view",
    "feature:beachfront": "beachfront",
    "feature:mountainView": "mountain view",
    "feature:jungleView": "jungle view",
    "feature:flatLand": "flat land",
    "feature:quiet": "quiet",
    "feature:electricity": "electricity on site",
    "feature:pool": "pool",
    "feature:parking": "parking",
    "feature:gated": "gated",
  },
  ru: {
    budget: "в бюджете",
    type: "нужный тип",
    district: "ваш район",
    tenure: "форма владения подходит",
    bedrooms: "достаточно спален",
    yield: "приносит доход",
    "feature:seaView": "вид на море",
    "feature:beachfront": "у моря",
    "feature:mountainView": "вид на горы",
    "feature:jungleView": "вид на джунгли",
    "feature:flatLand": "ровный участок",
    "feature:quiet": "тихо",
    "feature:electricity": "есть электричество",
    "feature:pool": "бассейн",
    "feature:parking": "парковка",
    "feature:gated": "охраняемый",
  },
};

/** Совпавшие критерии → одна человекочитаемая фраза на языке клиента. */
export function formatReasons(met: MatchReasonCode[], locale: "en" | "ru"): string {
  const dict = REASON_TEXT[locale];
  const bits = met.map((c) => dict[c]).filter(Boolean).slice(0, 3);
  if (bits.length === 0) return locale === "ru" ? "близко к вашим критериям" : "close to your criteria";
  return bits.join(locale === "ru" ? " · " : " · ");
}

/**
 * Детерминированное ранжирование шортлиста в `MatchResult[]` — фолбэк без
 * API-ключа и валидатор ответа LLM. Сортирует по % фита.
 */
export function deterministicRank(
  p: BuyerProfile,
  candidates: RealEstateObject[],
  locale: "en" | "ru" = "en",
  limit = 10,
): MatchResult[] {
  return candidates
    .map((o) => {
      const { fitPct, met } = scoreObject(p, o);
      return { rw: o.rwNumber, fitPct, reason: formatReasons(met, locale), card: o };
    })
    .sort((a, b) => b.fitPct - a.fitPct)
    .slice(0, limit);
}

/**
 * Компактная сериализация кандидата в одну строку для ранжирующего LLM-вызова —
 * только реальные поля, чтобы модель не выдумывала атрибуты. ~50–70 токенов.
 */
export function serializeCandidate(o: RealEstateObject): string {
  const bits: string[] = [o.rwNumber, o.type];
  if (o.district) bits.push(o.district);
  const val = acquisitionValueThb(o);
  if (val) bits.push(`฿${(val / 1_000_000).toFixed(1)}M`);
  else if (monthlyRentOf(o)) bits.push(`฿${Math.round(monthlyRentOf(o)! / 1_000)}K/mo`);
  if (o.areaRai) bits.push(`${o.areaRai} rai`);
  else if (o.areaSqm) bits.push(`${o.areaSqm} sqm`);
  if (o.bedrooms) bits.push(`${o.bedrooms}bd`);
  if (o.tenure?.length) bits.push(o.tenure.join("/"));
  const feats = (Object.keys(FEATURE_FIELD) as MatchFeature[]).filter((f) => o[FEATURE_FIELD[f]]);
  if (feats.length) bits.push(feats.join(","));
  if (o.netYieldPct) bits.push(`yield ${o.netYieldPct}%`);
  return bits.join(" | ");
}

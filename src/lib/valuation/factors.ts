/**
 * «RW Оценка» — каталог коэффициентов движка с дефолтами.
 *
 * Дефолты живут здесь (код = документация методики); БД backend'а
 * (valuation_factors) хранит только переопределения, сделанные в
 * /admin/valuation. buildFactorMap(overrides) сливает одно с другим.
 *
 * Семантика значений:
 *  - группы document/feature/road/terrain/size/zone/condition — множители
 *    к базовой цене (1 = нейтрально, 0.85 = −15%, 1.3 = +30%);
 *  - income/cost/market — параметры доходного и затратного методов
 *    (ставки в долях: 0.07 = 7%);
 *  - weight.* — веса методов при сведении итоговой оценки.
 *
 * Источники дефолтов: собственный каталог + аналитика аренды
 * (featurePremiums Airbnb-снапшота, демпфированы ×~0.5 — премия к цене ниже
 * премии к ADR) + полевые ориентиры Пангана. Все значения — стартовые
 * экспертные, калибруются по мере накопления сделок (журнал valuations).
 */

export interface FactorDef {
  key: string;
  group:
    | "document"
    | "feature"
    | "location"
    | "road"
    | "terrain"
    | "size"
    | "zone"
    | "condition"
    | "income"
    | "cost"
    | "market"
    | "weight";
  label: string;
  value: number;
  note?: string;
}

export const FACTOR_DEFS: FactorDef[] = [
  // Документ на землю (база — Chanote = 1)
  { key: "doc.chanote", group: "document", label: "Chanote (NS4)", value: 1, note: "База: полный титул" },
  { key: "doc.ns3g", group: "document", label: "Nor Sor 3 Gor", value: 0.85, note: "Подтверждённое право, межевание грубее" },
  { key: "doc.ns3", group: "document", label: "Nor Sor 3", value: 0.75, note: "Без точного межевания" },
  { key: "doc.weak", group: "document", label: "Слабые документы (SPK/PBT5/SK1/нет)", value: 0.4, note: "Ограниченный оборот; покупатель берёт риск" },

  // Видовые и инженерные фичи (применяются, когда есть)
  { key: "feature.sea_view", group: "feature", label: "Вид на море", value: 1.3 },
  { key: "feature.beachfront", group: "feature", label: "Первая линия", value: 2.0, note: "Редкий товар; фактически отдельный рынок" },
  { key: "feature.mountain_view", group: "feature", label: "Вид на горы", value: 1.05 },
  { key: "feature.electricity", group: "feature", label: "Электричество на участке", value: 1.1 },
  { key: "feature.pool", group: "feature", label: "Бассейн (вилла)", value: 1.12, note: "Премия к цене виллы; премия к ADR — отдельный фактор" },

  // Близость к пляжу — поправка по расстоянию до берега (только когда есть
  // координаты; отдельно от вида на море). Контрольные точки множителя; брейк-
  // пойнты расстояний (0.25/1/3/6 км) — в коде движка (beachFactor). Скромная.
  { key: "beach.walk", group: "location", label: "Пешком до пляжа (≤0.25 км)", value: 1.1, note: "Шаговая доступность; отдельно от seaView и первой линии" },
  { key: "beach.near", group: "location", label: "Близко к пляжу (~1 км)", value: 1, note: "Якорь-нейтраль" },
  { key: "beach.mid", group: "location", label: "Средне от пляжа (~3 км)", value: 0.95 },
  { key: "beach.far", group: "location", label: "Далеко от пляжа (≥6 км)", value: 0.88, note: "Вглубь острова — дешевле за рай" },
  // Удобство/доступность — расстояние до Тонгсалы (город/паром/услуги), отдельно
  // от пляжа. Скромная; ось «центрально ↔ удалённо». Только при координатах.
  { key: "town.central", group: "location", label: "Центрально (≤2 км до Тонгсалы)", value: 1.04 },
  { key: "town.near", group: "location", label: "Близко к городу (~6 км)", value: 1, note: "Якорь-нейтраль" },
  { key: "town.mid", group: "location", label: "Средне от города (~12 км)", value: 0.96 },
  { key: "town.far", group: "location", label: "Удалённо (≥20 км)", value: 0.93 },

  // Дорога до участка
  { key: "road.paved", group: "road", label: "Дорога: асфальт/бетон", value: 1 },
  { key: "road.private", group: "road", label: "Дорога: частная", value: 0.97 },
  { key: "road.dirt", group: "road", label: "Дорога: грунтовка", value: 0.9 },
  { key: "road.none", group: "road", label: "Дороги нет", value: 0.7 },

  // Рельеф
  { key: "terrain.flat", group: "terrain", label: "Рельеф: ровный", value: 1 },
  { key: "terrain.gentle", group: "terrain", label: "Рельеф: пологий склон", value: 0.95 },
  { key: "terrain.steep", group: "terrain", label: "Рельеф: крутой склон", value: 0.8, note: "Дороже фундамент/подпорные стены" },
  { key: "terrain.mixed", group: "terrain", label: "Рельеф: смешанный", value: 0.95 },

  // Размер участка — поправка к цене ЗА РАЙ (мелкие лоты дороже за рай)
  { key: "size.small", group: "size", label: "Участок < 0.5 рая", value: 1.12 },
  { key: "size.mid", group: "size", label: "Участок 0.5–2 рая", value: 1 },
  { key: "size.large", group: "size", label: "Участок 2–5 раёв", value: 0.93 },
  { key: "size.xlarge", group: "size", label: "Участок > 5 раёв", value: 0.85, note: "Меньше покупателей на крупный чек" },

  // Зона ผังเมือง (цвет генплана с карты объекта)
  { key: "zone.green", group: "zone", label: "Зона: зелёная (rural)", value: 0.9, note: "Ограничения плотности/высоты" },
  { key: "zone.yellow", group: "zone", label: "Зона: жёлтая (low-density)", value: 1 },
  { key: "zone.orange", group: "zone", label: "Зона: оранжевая", value: 1.05 },
  { key: "zone.red", group: "zone", label: "Зона: красная (commercial)", value: 1.1 },
  { key: "zone.purple", group: "zone", label: "Зона: фиолетовая (industrial)", value: 0.85 },

  // Состояние строения (вилла/дом)
  { key: "condition.new", group: "condition", label: "Состояние: новое", value: 1.08 },
  { key: "condition.like_new", group: "condition", label: "Состояние: как новое", value: 1.05 },
  { key: "condition.good", group: "condition", label: "Состояние: хорошее", value: 1 },
  { key: "condition.minor", group: "condition", label: "Нужен мелкий ремонт", value: 0.92 },
  { key: "condition.major", group: "condition", label: "Нужна реновация", value: 0.78 },
  { key: "condition.offplan", group: "condition", label: "Off-plan / стройка", value: 0.95, note: "Дисконт за риск достройки" },

  // Доходный метод (вилла/кондо): ADR из аналитики аренды × параметры ниже
  { key: "income.occupancy", group: "income", label: "Загрузка (базовый сценарий)", value: 0.55, note: "Зеркалит base-сценарий аналитики аренды" },
  { key: "income.opex_pct", group: "income", label: "OpEx, доля от выручки", value: 0.35, note: "Менеджмент, клининг, комуслуги, износ" },
  { key: "income.cap_rate", group: "income", label: "Ставка капитализации", value: 0.07, note: "NOI / стоимость; Панган ~6–8%" },
  { key: "income.adr_pool_premium", group: "income", label: "ADR-премия за бассейн", value: 1.25, note: "Демпфировано с измеренных +42%" },
  { key: "income.adr_seaview_premium", group: "income", label: "ADR-премия за вид на море", value: 1.2, note: "Демпфировано с измеренных +59%" },
  { key: "income.longterm_factor", group: "income", label: "Долгосрочная аренда, доля от посуточной выручки", value: 0.65, note: "Помесячный контракт даёт меньше валовой выручки, чем посуточно, но без простоев/затрат на смену гостей" },

  // Затратный метод (вилла/дом)
  { key: "cost.build_sqm", group: "cost", label: "Стройка, THB за м²", value: 28000, note: "Качественная вилла под ключ" },
  { key: "cost.age_dep_per_year", group: "cost", label: "Износ, % в год", value: 0.02, note: "Пол износа — 60% от новой" },
  { key: "cost.entrepreneur_margin", group: "cost", label: "Маржа девелопера", value: 1.15, note: "Готовая вилла дороже суммы затрат" },

  // Рыночные параметры
  { key: "market.ask_discount", group: "market", label: "Asking → сделка", value: 0.92, note: "Компсы — запрашиваемые цены; сделки ниже" },
  { key: "market.leasehold_yield", group: "market", label: "Leasehold-доходность земли, % в год", value: 0.05, note: "Аренда за год / freehold-стоимость" },
  { key: "market.npv_discount_rate", group: "market", label: "Ставка дисконтирования NPV", value: 0.08 },
  { key: "market.comp_sold_weight", group: "market", label: "Вес компса: продан", value: 1.5, note: "Реальная сделка весомее asking-объявления" },
  { key: "market.comp_stale_weight", group: "market", label: "Вес компса: завис на рынке", value: 0.5, note: "Долго не продаётся по своей цене → слабый сигнал" },
  { key: "market.stale_months", group: "market", label: "Порог «завис», мес", value: 9, note: "Дольше — asking-компс считается заскоревшим" },
  { key: "market.similarity_strength", group: "market", label: "Сила взвешивания по схожести", value: 0.6, note: "0..1; 0 = выкл (как раньше). Близкие по гео/размеру компсы весомее. A/B бэктестом" },
  { key: "market.sim_geo_halfweight_km", group: "market", label: "Гео-полувес, км", value: 3, note: "На этом расстоянии до субъекта вес компса халвится" },
  { key: "market.sim_size_tolerance", group: "market", label: "Допуск размера (кратность)", value: 2, note: "Во сколько раз отличие площади халвит вес компса" },
  { key: "market.uncertainty_base", group: "market", label: "Полоса: базовый пол, ±доля", value: 0.08, note: "Минимальная полу-ширина вилки (±8%)" },
  { key: "market.uncertainty_few_comps", group: "market", label: "Полоса: штраф за мало компсов", value: 0.2, note: "Добавка ±доли = коэф/√n; меньше компсов → шире" },
  { key: "market.uncertainty_island", group: "market", label: "Полоса: штраф island-fallback", value: 0.05, note: "Шире, когда база — весь остров, а не район" },
  { key: "market.uncertainty_rough", group: "market", label: "Полоса: штраф грубого сравнения", value: 0.08, note: "Шире для виллы «целиком» без площади/спален" },
  { key: "market.uncertainty_disagreement", group: "market", label: "Полоса: штраф расхождения методов", value: 0.5, note: "× относительный разброс оценок методов" },
  { key: "market.uncertainty_cap", group: "market", label: "Полоса: потолок, ±доля", value: 0.6, note: "Полу-ширина не больше ±60%" },

  // Веса методов при сведении (перенормируются по доступным)
  { key: "weight.comparative", group: "weight", label: "Вес: сравнительный", value: 0.45 },
  { key: "weight.income", group: "weight", label: "Вес: доходный", value: 0.35 },
  { key: "weight.cost", group: "weight", label: "Вес: затратный", value: 0.2 },
];

export type FactorMap = Record<string, number>;

export const FACTOR_GROUP_LABELS: Record<FactorDef["group"], string> = {
  document: "Документ на землю",
  feature: "Фичи",
  location: "Близость к пляжу",
  road: "Дорога",
  terrain: "Рельеф",
  size: "Размер участка (к цене за рай)",
  zone: "Зона генплана",
  condition: "Состояние строения",
  income: "Доходный метод",
  cost: "Затратный метод",
  market: "Рынок",
  weight: "Веса методов",
};

/** Дефолты + переопределения из БД (неизвестные ключи БД игнорируются). */
export function buildFactorMap(overrides: Array<{ key: string; value: number }> = []): FactorMap {
  const map: FactorMap = {};
  for (const d of FACTOR_DEFS) map[d.key] = d.value;
  for (const o of overrides) {
    if (o.key in map && Number.isFinite(o.value)) map[o.key] = o.value;
  }
  return map;
}

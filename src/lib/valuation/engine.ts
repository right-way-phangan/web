/**
 * «RW Оценка» — детерминированный движок оценки недвижимости Пангана.
 *
 * Чистая функция estimate(subject, data): никаких fetch — компсы (каталог
 * objects + внешние valuation_comps), аналитика аренды и карта факторов
 * передаются снаружи (server action web/src/lib/actions/valuation.ts).
 *
 * Три метода:
 *  1. Сравнительный — гедонистическая нормализация: цена каждого компса
 *     делится на его собственные поправки (документ/вид/дорога/рельеф/размер/
 *     зона) → «цена эталона» района; медиана × поправки субъекта.
 *  2. Доходный — ADR×загрузка из Airbnb-аналитики → NOI / cap rate.
 *  3. Затратный — земля (по сравнительному) + стройка за м² с износом.
 *
 * Свод — взвешенное среднее доступных методов (weight.* из факторов).
 * Компсы — asking-цены, поэтому отдаём две точки: listValue (рекомендация
 * цены размещения) и fairValue (ожидаемая сделка = list × ask_discount).
 * Leasehold-земля оценивается через freehold-базу: справедливая ставка
 * аренды = freehold × leasehold_yield, плюс NPV контракта с индексацией.
 */
import type { RentalMarket } from "@/lib/data/rental-market";
import type { FactorMap } from "./factors";

// ---- Вход ----

export type SubjectType = "Land" | "Villa" | "House" | "Apartment";

export interface ValuationSubject {
  type: SubjectType;
  tenure?: "Freehold" | "Leasehold";
  district?: string;
  zone?: string;
  areaRai?: number;
  builtSqm?: number;
  bedrooms?: number;
  documentType?: string;
  roadType?: string;
  terrain?: string;
  condition?: string;
  buildYear?: number;
  seaView?: boolean;
  beachfront?: boolean;
  mountainView?: boolean;
  electricity?: boolean;
  pool?: boolean;
  askingPrice?: number;
  // leasehold-контракт (земля)
  leaseTermYears?: number;
  rentPerRaiMonth?: number;
  leaseEscPercent?: number;
  leaseEscPeriodYears?: number;
}

/** Единая точка сравнения: объект каталога или внешний компс. */
export interface CompPoint {
  ref: string; // RW-номер или "ext#id"
  source: "catalog" | "external";
  type: string;
  status?: string | null;
  district?: string | null;
  zone?: string | null;
  areaRai?: number | null;
  builtSqm?: number | null;
  bedrooms?: number | null;
  priceThb?: number | null;
  pricePerRai?: number | null;
  documentType?: string | null;
  roadType?: string | null;
  terrain?: string | null;
  condition?: string | null;
  seaView?: boolean;
  beachfront?: boolean;
  mountainView?: boolean;
  electricity?: boolean;
  pool?: boolean;
}

export interface EngineData {
  comps: CompPoint[];
  market: RentalMarket | null;
  factors: FactorMap;
}

// ---- Выход ----

export interface MethodResult {
  key: "comparative" | "income" | "cost";
  label: string;
  available: boolean;
  /** Asking-уровень (до поправки на сделку). */
  value?: number;
  low?: number;
  high?: number;
  weight: number;
  n?: number;
  basis?: string;
  details: string[];
}

export interface ValuationResult {
  ok: boolean;
  reason?: string;
  /** Рекомендованная цена размещения (asking-уровень). */
  listValue?: number;
  /** Ожидаемая сделка (list × ask_discount). */
  fairValue?: number;
  low?: number;
  high?: number;
  perRai?: number;
  confidence?: "high" | "medium" | "low";
  methods: MethodResult[];
  adjustments: Array<{ label: string; mult: number }>;
  leasehold?: {
    freeholdPerRai: number;
    fairRentPerRaiMonth: number;
    fairRentTotalMonth?: number;
    contractNpv?: number;
    fairNpv?: number;
    rentVerdict?: "fair" | "over" | "under";
  };
  askingVerdict?: { askingPrice: number; deltaPct: number; verdict: "fair" | "over" | "under" };
  caveats: string[];
}

// ---- Нормализация словарей ----

function docFactorKey(s: string | null | undefined): { key: string; label: string } | null {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v.includes("chanote") || v.includes("ns4") || v.includes("condominium")) {
    return { key: "doc.chanote", label: "Chanote" };
  }
  if (v.includes("3 gor") || v === "ns3k" || v === "ns3g") return { key: "doc.ns3g", label: "Nor Sor 3 Gor" };
  if (v.includes("nor sor 3") || v === "ns3") return { key: "doc.ns3", label: "Nor Sor 3" };
  if (
    v.includes("sor por kor") || v.includes("por bor tor") || v.includes("sor kor") ||
    v.includes("possession") || v.includes("no document") || v === "other"
  ) {
    return { key: "doc.weak", label: "Слабый документ" };
  }
  return null;
}

function roadFactorKey(s: string | null | undefined): { key: string; label: string } | null {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v === "none") return { key: "road.none", label: "Дороги нет" };
  if (v.includes("dirt")) return { key: "road.dirt", label: "Грунтовка" };
  if (v.includes("private")) return { key: "road.private", label: "Частная дорога" };
  return { key: "road.paved", label: "Дорога с покрытием" };
}

function terrainFactorKey(s: string | null | undefined): { key: string; label: string } | null {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v.includes("flat")) return { key: "terrain.flat", label: "Ровный рельеф" };
  if (v.includes("gentle")) return { key: "terrain.gentle", label: "Пологий склон" };
  if (v.includes("steep")) return { key: "terrain.steep", label: "Крутой склон" };
  if (v.includes("mixed")) return { key: "terrain.mixed", label: "Смешанный рельеф" };
  return null;
}

function sizeFactorKey(areaRai: number): { key: string; label: string } {
  if (areaRai < 0.5) return { key: "size.small", label: "Участок < 0.5 рая" };
  if (areaRai <= 2) return { key: "size.mid", label: "Участок 0.5–2 рая" };
  if (areaRai <= 5) return { key: "size.large", label: "Участок 2–5 раёв" };
  return { key: "size.xlarge", label: "Участок > 5 раёв" };
}

function zoneFactorKey(s: string | null | undefined): { key: string; label: string } | null {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v.includes("green")) return { key: "zone.green", label: "Зона: зелёная" };
  if (v.includes("yellow")) return { key: "zone.yellow", label: "Зона: жёлтая" };
  if (v.includes("orange")) return { key: "zone.orange", label: "Зона: оранжевая" };
  if (v.includes("red")) return { key: "zone.red", label: "Зона: красная" };
  if (v.includes("purple")) return { key: "zone.purple", label: "Зона: фиолетовая" };
  return null;
}

function conditionFactorKey(s: string | null | undefined): { key: string; label: string } | null {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v.includes("like new")) return { key: "condition.like_new", label: "Как новое" };
  if (v.includes("new")) return { key: "condition.new", label: "Новое" };
  if (v.includes("good")) return { key: "condition.good", label: "Хорошее" };
  if (v.includes("minor")) return { key: "condition.minor", label: "Мелкий ремонт" };
  if (v.includes("major") || v.includes("renovation")) return { key: "condition.major", label: "Реновация" };
  if (v.includes("off-plan") || v.includes("offplan")) return { key: "condition.offplan", label: "Off-plan" };
  return null;
}

function typeNorm(t: string | null | undefined): "land" | "villa" | "apartment" | "other" {
  const v = (t ?? "").toLowerCase();
  if (v === "land") return "land";
  if (v === "villa" || v === "house" || v === "townhouse") return "villa";
  if (v === "apartment" || v === "condo") return "apartment";
  return "other";
}

// ---- Утилиты ----

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function round1k(v: number): number {
  return Math.round(v / 1000) * 1000;
}

const fmtM = (v: number) => `${(v / 1e6).toFixed(2)}M`;

interface FactorBreakdown {
  mult: number;
  parts: Array<{ label: string; mult: number }>;
}

/**
 * Совокупный множитель участка/виллы относительно «эталона» (Chanote, ровный,
 * дорога с покрытием, без видов). Один и тот же расчёт нормализует компсы
 * (делением) и применяется к субъекту (умножением) — систематика словаря
 * сокращается, остаётся честная разница характеристик.
 */
function landFactor(
  p: {
    documentType?: string | null;
    roadType?: string | null;
    terrain?: string | null;
    zone?: string | null;
    areaRai?: number | null;
    seaView?: boolean;
    beachfront?: boolean;
    mountainView?: boolean;
    electricity?: boolean;
  },
  f: FactorMap,
): FactorBreakdown {
  const parts: FactorBreakdown["parts"] = [];
  const push = (k: { key: string; label: string } | null) => {
    if (k && f[k.key] !== undefined && f[k.key] !== 1) parts.push({ label: k.label, mult: f[k.key] });
  };
  push(docFactorKey(p.documentType));
  push(roadFactorKey(p.roadType));
  push(terrainFactorKey(p.terrain));
  push(zoneFactorKey(p.zone));
  if (p.areaRai && p.areaRai > 0) push(sizeFactorKey(p.areaRai));
  if (p.seaView) push({ key: "feature.sea_view", label: "Вид на море" });
  if (p.beachfront) push({ key: "feature.beachfront", label: "Первая линия" });
  if (p.mountainView) push({ key: "feature.mountain_view", label: "Вид на горы" });
  if (p.electricity) push({ key: "feature.electricity", label: "Электричество" });
  return { mult: parts.reduce((m, x) => m * x.mult, 1), parts };
}

function villaFactor(
  p: { seaView?: boolean; beachfront?: boolean; pool?: boolean; condition?: string | null },
  f: FactorMap,
): FactorBreakdown {
  const parts: FactorBreakdown["parts"] = [];
  const push = (k: { key: string; label: string } | null) => {
    if (k && f[k.key] !== undefined && f[k.key] !== 1) parts.push({ label: k.label, mult: f[k.key] });
  };
  if (p.seaView) push({ key: "feature.sea_view", label: "Вид на море" });
  if (p.beachfront) push({ key: "feature.beachfront", label: "Первая линия" });
  if (p.pool) push({ key: "feature.pool", label: "Бассейн" });
  push(conditionFactorKey(p.condition));
  return { mult: parts.reduce((m, x) => m * x.mult, 1), parts };
}

// Санитарные границы цены за рай (отсечка мусорных компсов), THB
const PER_RAI_MIN = 100_000;
const PER_RAI_MAX = 60_000_000;

interface TierStats {
  n: number;
  tier: "district" | "island";
  median: number;
  p25: number;
  p75: number;
}

/** Медиана/квартели нормализованных значений: район (n≥4), иначе весь остров. */
function tierStats(
  values: Array<{ district: string | null | undefined; v: number }>,
  district: string | undefined,
): TierStats | null {
  if (values.length === 0) return null;
  const inDistrict = district
    ? values.filter((x) => (x.district ?? "").toLowerCase() === district.toLowerCase())
    : [];
  const use = inDistrict.length >= 4 ? inDistrict : values;
  const tier: TierStats["tier"] = inDistrict.length >= 4 ? "district" : "island";
  const sorted = use.map((x) => x.v).sort((a, b) => a - b);
  return {
    n: sorted.length,
    tier,
    median: quantile(sorted, 0.5),
    p25: quantile(sorted, 0.25),
    p75: quantile(sorted, 0.75),
  };
}

// ---- Сравнительный метод: земля ----

function comparativeLand(
  subject: ValuationSubject,
  data: EngineData,
  caveats: string[],
): MethodResult {
  const f = data.factors;
  const res: MethodResult = {
    key: "comparative",
    label: "Сравнительный (цена за рай)",
    available: false,
    weight: f["weight.comparative"] ?? 0.45,
    details: [],
  };
  if (!subject.areaRai || subject.areaRai <= 0) {
    res.details.push("Не указана площадь в раях — метод недоступен.");
    return res;
  }
  const normalized: Array<{ district: string | null | undefined; v: number }> = [];
  for (const c of data.comps) {
    if (typeNorm(c.type) !== "land") continue;
    const perRai =
      c.pricePerRai && c.pricePerRai > 0
        ? c.pricePerRai
        : c.priceThb && c.areaRai && c.areaRai > 0
          ? c.priceThb / c.areaRai
          : null;
    if (!perRai || perRai < PER_RAI_MIN || perRai > PER_RAI_MAX) continue;
    const fc = landFactor(c, f);
    if (fc.mult <= 0) continue;
    normalized.push({ district: c.district, v: perRai / fc.mult });
  }
  const stats = tierStats(normalized, subject.district);
  if (!stats) {
    res.details.push("Нет пригодных земельных компсов.");
    return res;
  }
  const fs = landFactor(subject, f);
  const perRai = stats.median * fs.mult;
  res.available = true;
  res.n = stats.n;
  res.basis = stats.tier === "district" ? `медиана района (${stats.n} комп.)` : `медиана острова (${stats.n} комп.)`;
  res.value = round1k(perRai * subject.areaRai);
  res.low = round1k(stats.p25 * fs.mult * subject.areaRai);
  res.high = round1k(stats.p75 * fs.mult * subject.areaRai);
  res.details.push(
    `Эталонная цена за рай: ${fmtM(stats.median)} (${res.basis}).`,
    `Поправки субъекта: ×${fs.mult.toFixed(2)} → ${fmtM(perRai)} за рай.`,
    `Площадь ${subject.areaRai} рая → ${fmtM(res.value)}.`,
  );
  if (stats.tier === "island") {
    caveats.push("В районе меньше 4 земельных компсов — база расширена до всего острова.");
  }
  return res;
}

// ---- Сравнительный метод: вилла/кондо ----

function comparativeBuilt(
  subject: ValuationSubject,
  data: EngineData,
  caveats: string[],
): MethodResult {
  const f = data.factors;
  const subjType = typeNorm(subject.type);
  const res: MethodResult = {
    key: "comparative",
    label: "Сравнительный",
    available: false,
    weight: f["weight.comparative"] ?? 0.45,
    details: [],
  };
  const pool = data.comps.filter(
    (c) => typeNorm(c.type) === subjType && c.priceThb && c.priceThb > 0,
  );
  if (pool.length === 0) {
    res.details.push("Нет компсов данного типа.");
    return res;
  }
  // Базис: за м² постройки, иначе за спальню, иначе целиком
  let basisKey: "sqm" | "bedroom" | "whole" = "whole";
  if (subject.builtSqm && pool.some((c) => c.builtSqm && c.builtSqm > 0)) basisKey = "sqm";
  else if (subject.bedrooms && pool.some((c) => c.bedrooms && c.bedrooms > 0)) basisKey = "bedroom";

  const normalized: Array<{ district: string | null | undefined; v: number }> = [];
  for (const c of pool) {
    const fc = villaFactor(c, f);
    if (fc.mult <= 0) continue;
    let unit: number | null = null;
    if (basisKey === "sqm") unit = c.builtSqm && c.builtSqm > 0 ? c.priceThb! / c.builtSqm : null;
    else if (basisKey === "bedroom") unit = c.bedrooms && c.bedrooms > 0 ? c.priceThb! / c.bedrooms : null;
    else unit = c.priceThb!;
    if (!unit || unit <= 0) continue;
    normalized.push({ district: c.district, v: unit / fc.mult });
  }
  const stats = tierStats(normalized, subject.district);
  if (!stats) {
    res.details.push("Компсы не дали пригодного базиса сравнения.");
    return res;
  }
  const fs = villaFactor(subject, f);
  const scale = basisKey === "sqm" ? subject.builtSqm! : basisKey === "bedroom" ? subject.bedrooms! : 1;
  const basisLabel = basisKey === "sqm" ? "за м² постройки" : basisKey === "bedroom" ? "за спальню" : "целиком";
  res.available = true;
  res.n = stats.n;
  res.basis = `${basisLabel}, ${stats.tier === "district" ? "район" : "остров"} (${stats.n} комп.)`;
  res.label = `Сравнительный (${basisLabel})`;
  res.value = round1k(stats.median * fs.mult * scale);
  res.low = round1k(stats.p25 * fs.mult * scale);
  res.high = round1k(stats.p75 * fs.mult * scale);
  res.details.push(
    `Эталон ${basisLabel}: ${fmtM(stats.median)} × поправки ×${fs.mult.toFixed(2)}${scale !== 1 ? ` × ${scale}` : ""} → ${fmtM(res.value)}.`,
  );
  if (basisKey === "whole") caveats.push("Сравнение вилл «целиком» — грубое: нет площади постройки и спален у компсов.");
  if (stats.tier === "island") caveats.push("Мало компсов в районе — сравнение по всему острову.");
  return res;
}

// ---- Доходный метод (вилла/дом/кондо) ----

function incomeMethod(subject: ValuationSubject, data: EngineData, caveats: string[]): MethodResult {
  const f = data.factors;
  const res: MethodResult = {
    key: "income",
    label: "Доходный (ADR × загрузка / cap rate)",
    available: false,
    weight: f["weight.income"] ?? 0.35,
    details: [],
  };
  const m = data.market;
  if (!m || m.districts.length === 0) {
    res.details.push("Нет данных аналитики аренды.");
    return res;
  }
  if (!subject.bedrooms || subject.bedrooms <= 0) {
    res.details.push("Не указано число спален — метод недоступен.");
    return res;
  }
  // ADR: район+спальни → район → остров по спальням → остров
  let adr: number | null = null;
  let basis = "";
  let n = 0;
  const db = m.districtBedrooms.find(
    (x) =>
      subject.district &&
      x.district.toLowerCase() === subject.district.toLowerCase() &&
      x.bedrooms === Math.round(subject.bedrooms!) &&
      x.n >= 3,
  );
  if (db) {
    adr = db.adrMedian;
    basis = `ADR ${db.district}, ${db.bedrooms}BR (n=${db.n})`;
    n = db.n;
  } else {
    const d = subject.district
      ? m.districts.find((x) => x.name.toLowerCase() === subject.district!.toLowerCase())
      : undefined;
    if (d?.adrMedian) {
      adr = d.adrMedian;
      basis = `ADR района ${d.name} (n=${d.n})`;
      n = d.n;
      caveats.push("ADR взят по району без разбивки на спальни.");
    } else {
      const bb = m.byBedrooms.find((x) => x.bedrooms === Math.round(subject.bedrooms!));
      if (bb?.adrMedian) {
        adr = bb.adrMedian;
        basis = `ADR острова, ${bb.bedrooms}BR (n=${bb.n})`;
        n = bb.n;
        caveats.push("Район не найден в аренда-данных — ADR по острову.");
      } else if (m.meta.adrMedianAll) {
        adr = m.meta.adrMedianAll;
        basis = "медианный ADR острова";
        n = m.meta.sample;
        caveats.push("ADR — общая медиана острова, без района и спален.");
      }
    }
  }
  if (!adr) {
    res.details.push("Не удалось подобрать ADR.");
    return res;
  }
  // Премии к ADR за фичи (медианы их не учитывают) — только если базис не "район+спальни с фичами"
  let adrAdj = adr;
  if (subject.pool) adrAdj *= f["income.adr_pool_premium"] ?? 1.25;
  if (subject.seaView) adrAdj *= f["income.adr_seaview_premium"] ?? 1.2;

  const occBase = f["income.occupancy"] ?? m.meta.occupancy.base;
  const opex = f["income.opex_pct"] ?? 0.35;
  const cap = f["income.cap_rate"] ?? 0.07;
  const value = (adrAdj * 365 * occBase * (1 - opex)) / cap;
  const vLow = (adrAdj * 365 * m.meta.occupancy.conservative * (1 - opex)) / cap;
  const vHigh = (adrAdj * 365 * m.meta.occupancy.high * (1 - opex)) / cap;
  res.available = true;
  res.n = n;
  res.basis = basis;
  res.value = round1k(value);
  res.low = round1k(vLow);
  res.high = round1k(vHigh);
  res.details.push(
    `${basis}: ${Math.round(adr)} THB/ночь${adrAdj !== adr ? ` → с премиями ${Math.round(adrAdj)}` : ""}.`,
    `Выручка ${fmtM(adrAdj * 365 * occBase)} (загрузка ${Math.round(occBase * 100)}%) − OpEx ${Math.round(opex * 100)}% → NOI ${fmtM(adrAdj * 365 * occBase * (1 - opex))}.`,
    `NOI / cap rate ${Math.round(cap * 100)}% → ${fmtM(value)}.`,
  );
  caveats.push("Загрузка — модельное допущение (Airbnb её не публикует); вилка = сценарии 40/55/70%.");
  return res;
}

// ---- Затратный метод (вилла/дом) ----

function costMethod(
  subject: ValuationSubject,
  data: EngineData,
  landComparative: MethodResult | null,
): MethodResult {
  const f = data.factors;
  const res: MethodResult = {
    key: "cost",
    label: "Затратный (земля + стройка)",
    available: false,
    weight: f["weight.cost"] ?? 0.2,
    details: [],
  };
  if (!subject.builtSqm || subject.builtSqm <= 0) {
    res.details.push("Не указана площадь постройки — метод недоступен.");
    return res;
  }
  let landValue = 0;
  if (subject.areaRai && subject.areaRai > 0) {
    if (landComparative?.available && landComparative.value) {
      landValue = landComparative.value;
      res.details.push(`Земля (сравнительный): ${fmtM(landValue)}.`);
    } else {
      res.details.push("Земля не оценена (нет компсов) — считаем только стройку.");
    }
  }
  const buildSqm = f["cost.build_sqm"] ?? 28000;
  const depPerYear = f["cost.age_dep_per_year"] ?? 0.02;
  const margin = f["cost.entrepreneur_margin"] ?? 1.15;
  const age = subject.buildYear ? Math.max(0, new Date().getFullYear() - subject.buildYear) : 0;
  const dep = Math.max(0.6, 1 - depPerYear * age);
  const build = subject.builtSqm * buildSqm * dep;
  const total = (landValue + build) * margin;
  res.available = true;
  res.basis = `${Math.round(buildSqm).toLocaleString()} THB/м²${age ? `, износ ×${dep.toFixed(2)}` : ""}`;
  res.value = round1k(total);
  res.low = round1k(total * 0.85);
  res.high = round1k(total * 1.15);
  res.details.push(
    `Стройка: ${subject.builtSqm} м² × ${Math.round(buildSqm).toLocaleString()}${age ? ` × износ ${dep.toFixed(2)} (${age} лет)` : ""} = ${fmtM(build)}.`,
    `(Земля + стройка) × маржа ${margin.toFixed(2)} → ${fmtM(total)}.`,
  );
  return res;
}

// ---- Leasehold-блок (земля) ----

function leaseholdBlock(
  subject: ValuationSubject,
  perRaiAsking: number,
  f: FactorMap,
  caveats: string[],
): NonNullable<ValuationResult["leasehold"]> {
  const askDiscount = f["market.ask_discount"] ?? 0.92;
  const freeholdPerRai = perRaiAsking * askDiscount;
  const yieldYr = f["market.leasehold_yield"] ?? 0.05;
  const r = f["market.npv_discount_rate"] ?? 0.08;
  const fairMonth = (freeholdPerRai * yieldYr) / 12;
  const out: NonNullable<ValuationResult["leasehold"]> = {
    freeholdPerRai: round1k(freeholdPerRai),
    fairRentPerRaiMonth: Math.round(fairMonth / 100) * 100,
  };
  if (subject.areaRai && subject.areaRai > 0) {
    out.fairRentTotalMonth = Math.round((fairMonth * subject.areaRai) / 100) * 100;
  }
  const term = subject.leaseTermYears ?? 30;
  const escPct = (subject.leaseEscPercent ?? 0) / 100;
  const escPeriod = subject.leaseEscPeriodYears && subject.leaseEscPeriodYears > 0 ? subject.leaseEscPeriodYears : 1;
  const npvOf = (monthPerRai: number): number => {
    let npv = 0;
    for (let y = 0; y < term; y++) {
      const esc = Math.pow(1 + escPct, Math.floor(y / escPeriod));
      const annual = monthPerRai * 12 * (subject.areaRai ?? 1) * esc;
      npv += annual / Math.pow(1 + r, y + 0.5);
    }
    return npv;
  };
  out.fairNpv = round1k(npvOf(fairMonth));
  if (subject.rentPerRaiMonth && subject.rentPerRaiMonth > 0) {
    out.contractNpv = round1k(npvOf(subject.rentPerRaiMonth));
    const delta = subject.rentPerRaiMonth / fairMonth - 1;
    out.rentVerdict = delta > 0.15 ? "over" : delta < -0.15 ? "under" : "fair";
  }
  if (!subject.leaseTermYears) caveats.push("Срок lease не указан — NPV посчитан на 30 лет.");
  return out;
}

// ---- Свод ----

export function estimate(subject: ValuationSubject, data: EngineData): ValuationResult {
  const caveats: string[] = [];
  const f = data.factors;
  const subjType = typeNorm(subject.type);
  const methods: MethodResult[] = [];
  let landComp: MethodResult | null = null;

  if (subjType === "land") {
    landComp = comparativeLand(subject, data, caveats);
    methods.push(landComp);
  } else if (subjType === "villa" || subjType === "apartment") {
    methods.push(comparativeBuilt(subject, data, caveats));
    methods.push(incomeMethod(subject, data, caveats));
    if (subjType === "villa") {
      // земля под виллой — отдельная под-оценка для затратного метода
      if (subject.areaRai && subject.areaRai > 0) {
        landComp = comparativeLand({ ...subject, type: "Land" }, data, []);
      }
      methods.push(costMethod(subject, data, landComp));
    }
  } else {
    return {
      ok: false,
      reason: `Тип «${subject.type}» движок пока не оценивает (off-plan проекты — по юнитам).`,
      methods: [],
      adjustments: [],
      caveats,
    };
  }

  const usable = methods.filter((m) => m.available && m.value && m.value > 0);
  if (usable.length === 0) {
    return {
      ok: false,
      reason: "Ни один метод не дал оценку — не хватает данных (площадь/спальни/компсы).",
      methods,
      adjustments: [],
      caveats,
    };
  }

  const wSum = usable.reduce((s, m) => s + m.weight, 0);
  const blend = (pick: (m: MethodResult) => number) =>
    usable.reduce((s, m) => s + pick(m) * m.weight, 0) / wSum;
  const listValue = round1k(blend((m) => m.value!));
  const low = round1k(blend((m) => m.low ?? m.value!));
  const high = round1k(blend((m) => m.high ?? m.value!));
  const askDiscount = f["market.ask_discount"] ?? 0.92;
  const fairValue = round1k(listValue * askDiscount);

  // Расхождение методов >×1.6 — сигнал, что что-то из данных врёт
  if (usable.length > 1) {
    const vals = usable.map((m) => m.value!);
    if (Math.max(...vals) / Math.min(...vals) > 1.6) {
      caveats.push("Методы расходятся более чем в 1.6 раза — доверие к оценке снижено, проверьте вводные.");
    }
  }

  // Confidence: по сравнительному n и расхождению методов
  const compM = methods.find((m) => m.key === "comparative");
  const n = compM?.available ? (compM.n ?? 0) : 0;
  let confidence: ValuationResult["confidence"] = n >= 8 ? "high" : n >= 4 ? "medium" : "low";
  if (caveats.some((c) => c.startsWith("Методы расходятся")) && confidence !== "low") {
    confidence = confidence === "high" ? "medium" : "low";
  }

  const fs = subjType === "land" ? landFactor(subject, f) : villaFactor(subject, f);

  const result: ValuationResult = {
    ok: true,
    listValue,
    fairValue,
    low,
    high,
    confidence,
    methods,
    adjustments: fs.parts,
    caveats,
  };
  if (subjType === "land" && subject.areaRai && subject.areaRai > 0) {
    result.perRai = round1k(listValue / subject.areaRai);
    if (subject.tenure === "Leasehold" || (subject.rentPerRaiMonth ?? 0) > 0) {
      result.leasehold = leaseholdBlock(subject, result.perRai, f, caveats);
    }
  }
  if (subject.askingPrice && subject.askingPrice > 0) {
    const deltaPct = (subject.askingPrice / listValue - 1) * 100;
    result.askingVerdict = {
      askingPrice: subject.askingPrice,
      deltaPct: Math.round(deltaPct),
      verdict: deltaPct > 10 ? "over" : deltaPct < -10 ? "under" : "fair",
    };
  }
  caveats.push("Компсы — asking-цены объявлений, не сделки; ожидаемая сделка учитывает дисконт.");
  return result;
}

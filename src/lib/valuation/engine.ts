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
  /** Когда наблюдали цену (YYYY-MM-DD / DD.M.YY / др.) — для поправки на время. */
  date?: string | null;
  /** Сколько месяцев объявление на рынке — стайл-сигнал переоценки (asking). */
  onMarketMonths?: number | null;
}

export interface EngineData {
  comps: CompPoint[];
  market: RentalMarket | null;
  factors: FactorMap;
}

// ---- Выход ----

/** Компс, реально вошедший в оценку (для прозрачности — только админка). */
export interface CompUsed {
  ref: string;
  district: string | null;
  /** Сырая (приведённая к сегодня) цена за рай / за базис. */
  perRai: number;
  weight: number;
  tag: string; // "продан" / "завис" / "↑время" / ""
}

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
  /** Компсы в основе сравнительного метода (админка; в публичный выход не идёт). */
  compsUsed?: CompUsed[];
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
  /** Рычаги: на сколько % двигает оценку каждый фактор (аргументы для торга, админка). */
  sensitivity?: Array<{ label: string; deltaPct: number; applied: boolean }>;
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

/**
 * Непрерывный множитель размера: кусочно-линейная интерполяция между 4
 * редактируемыми size-факторами в контрольных точках по площади. Убирает
 * скачки на границах (0.5/2/5 рая) — мелкий участок плавно дороже за рай.
 */
function sizeFactor(areaRai: number, f: FactorMap): { label: string; mult: number } {
  const pts: Array<[number, string]> = [
    [0.25, "size.small"],
    [1.25, "size.mid"],
    [3.5, "size.large"],
    [8, "size.xlarge"],
  ];
  const val = (key: string) => (f[key] !== undefined ? f[key] : 1);
  let mult: number;
  if (areaRai <= pts[0][0]) mult = val(pts[0][1]);
  else if (areaRai >= pts[pts.length - 1][0]) mult = val(pts[pts.length - 1][1]);
  else {
    let i = 0;
    while (i < pts.length - 2 && areaRai > pts[i + 1][0]) i++;
    const [a, ka] = pts[i];
    const [b, kb] = pts[i + 1];
    const t = (areaRai - a) / (b - a);
    mult = val(ka) + (val(kb) - val(ka)) * t;
  }
  return { label: `Размер ${areaRai.toFixed(2)} рай`, mult };
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

// ---- Поправка на время + вес компса (улучшения 2026-06-13) ----

/** Парс даты компса: YYYY-MM-DD, DD.M.YY(YY), D/M/YY. null если не разобрать. */
function parseCompDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const t = s.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
  if (m) {
    let y = +m[3];
    if (y < 100) y += 2000;
    return new Date(y, +m[2] - 1, +m[1]);
  }
  return null;
}

/** Годовой рост %/год из аналитики (meta.appreciation.base), иначе 0 (не трогать). */
function apprPctOf(market: RentalMarket | null): number {
  const a = market?.meta?.appreciation?.base;
  return typeof a === "number" && a > 0 ? a : 0;
}

/**
 * Приведение прошлой цены к сегодняшней по годовому росту. Свежее полугода не
 * трогаем; срок капаем 3 годами, чтобы древние данные не раздувались.
 */
function timeAdjust(value: number, date: Date | null, apprPctYr: number): number {
  if (!date || apprPctYr <= 0) return value;
  const years = (Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years <= 0.5) return value;
  return value * Math.pow(1 + apprPctYr / 100, Math.min(years, 3));
}

/** Вес компса: проданные (реальная сделка) выше, заскоревшие asking — ниже. */
function compWeight(c: CompPoint, f: FactorMap): number {
  const st = (c.status ?? "").toLowerCase();
  if (st.includes("sold") || st.includes("gone")) return f["market.comp_sold_weight"] ?? 1.5;
  const staleMo = f["market.stale_months"] ?? 9;
  if (c.onMarketMonths != null && c.onMarketMonths > staleMo) return f["market.comp_stale_weight"] ?? 0.5;
  return 1;
}

interface WV {
  district?: string | null;
  v: number;
  w: number;
  ref?: string; // прозрачность: какой компс
  raw?: number; // сырая (приведённая к сегодня) цена за рай/базис — для показа
  tag?: string; // "продан" / "завис" / "↑время"
}

/** Взвешенная квантиль (по накопленному весу). */
function weightedQuantile(items: WV[], q: number): number {
  const sorted = [...items].sort((a, b) => a.v - b.v);
  const total = sorted.reduce((s, x) => s + x.w, 0);
  if (total <= 0) return NaN;
  const target = q * total;
  let acc = 0;
  for (const it of sorted) {
    acc += it.w;
    if (acc >= target) return it.v;
  }
  return sorted[sorted.length - 1].v;
}

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
  if (p.areaRai && p.areaRai > 0) {
    const sz = sizeFactor(p.areaRai, f);
    if (Math.abs(sz.mult - 1) > 1e-6) parts.push({ label: sz.label, mult: sz.mult });
  }
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
  used: WV[]; // компсы, реально вошедшие после tier-выбора и MAD-отсечки
}

/**
 * Взвешенные медиана/квартели нормализованных значений с MAD-отсечкой выбросов.
 * Район при n≥4, иначе весь остров. Веса — из compWeight (проданные выше,
 * заскоревшие asking ниже). MAD убирает мусорные компсы устойчивее санитарных
 * границ (только при n≥5, чтобы не терять и так скудные данные).
 */
function tierStats(values: WV[], district: string | undefined): TierStats | null {
  if (values.length === 0) return null;
  const inDistrict = district
    ? values.filter((x) => (x.district ?? "").toLowerCase() === district.toLowerCase())
    : [];
  let use = inDistrict.length >= 4 ? inDistrict : values;
  const tier: TierStats["tier"] = inDistrict.length >= 4 ? "district" : "island";
  if (use.length >= 5) {
    const vs = use.map((x) => x.v).sort((a, b) => a - b);
    const med = quantile(vs, 0.5);
    const devs = vs.map((v) => Math.abs(v - med)).sort((a, b) => a - b);
    const mad = quantile(devs, 0.5);
    if (mad > 0) {
      const lo = med - 3 * 1.4826 * mad;
      const hi = med + 3 * 1.4826 * mad;
      const trimmed = use.filter((x) => x.v >= lo && x.v <= hi);
      if (trimmed.length >= 4) use = trimmed;
    }
  }
  return {
    n: use.length,
    tier,
    median: weightedQuantile(use, 0.5),
    p25: weightedQuantile(use, 0.25),
    p75: weightedQuantile(use, 0.75),
    used: use,
  };
}

/** Тег компса для прозрачности: продан / завис / приведён по времени. */
function compTag(c: CompPoint, f: FactorMap): string {
  const st = (c.status ?? "").toLowerCase();
  if (st.includes("sold") || st.includes("gone")) return "продан";
  const staleMo = f["market.stale_months"] ?? 9;
  if (c.onMarketMonths != null && c.onMarketMonths > staleMo) return `завис ${Math.round(c.onMarketMonths)} мес`;
  return "";
}

/** Топ-N использованных компсов по весу → для панели прозрачности (админка). */
function compsUsedFrom(used: WV[], limit = 12): CompUsed[] {
  return [...used]
    .sort((a, b) => b.w - a.w || (b.raw ?? 0) - (a.raw ?? 0))
    .slice(0, limit)
    .map((x) => ({
      ref: x.ref ?? "?",
      district: x.district ?? null,
      perRai: Math.round(x.raw ?? x.v),
      weight: x.w,
      tag: x.tag ?? "",
    }));
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
  const apprPct = apprPctOf(data.market);
  const normalized: WV[] = [];
  for (const c of data.comps) {
    if (typeNorm(c.type) !== "land") continue;
    const perRai =
      c.pricePerRai && c.pricePerRai > 0
        ? c.pricePerRai
        : c.priceThb && c.areaRai && c.areaRai > 0
          ? c.priceThb / c.areaRai
          : null;
    if (!perRai || perRai < PER_RAI_MIN || perRai > PER_RAI_MAX) continue;
    const date = parseCompDate(c.date);
    const adj = timeAdjust(perRai, date, apprPct); // прошлую цену → к сегодня
    const fc = landFactor(c, f);
    if (fc.mult <= 0) continue;
    const baseTag = compTag(c, f);
    const tag = adj !== perRai ? (baseTag ? `${baseTag} · ↑время` : "↑время") : baseTag;
    normalized.push({ district: c.district, v: adj / fc.mult, w: compWeight(c, f), ref: c.ref, raw: adj, tag });
  }
  const stats = tierStats(normalized, subject.district);
  if (!stats) {
    res.details.push("Нет пригодных земельных компсов.");
    return res;
  }
  res.compsUsed = compsUsedFrom(stats.used);
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

  const apprPct = apprPctOf(data.market);
  const normalized: WV[] = [];
  for (const c of pool) {
    const fc = villaFactor(c, f);
    if (fc.mult <= 0) continue;
    let unit: number | null = null;
    if (basisKey === "sqm") unit = c.builtSqm && c.builtSqm > 0 ? c.priceThb! / c.builtSqm : null;
    else if (basisKey === "bedroom") unit = c.bedrooms && c.bedrooms > 0 ? c.priceThb! / c.bedrooms : null;
    else unit = c.priceThb!;
    if (!unit || unit <= 0) continue;
    const adj = timeAdjust(unit, parseCompDate(c.date), apprPct);
    const baseTag = compTag(c, f);
    const tag = adj !== unit ? (baseTag ? `${baseTag} · ↑время` : "↑время") : baseTag;
    normalized.push({ district: c.district, v: adj / fc.mult, w: compWeight(c, f), ref: c.ref, raw: adj, tag });
  }
  const stats = tierStats(normalized, subject.district);
  if (!stats) {
    res.details.push("Компсы не дали пригодного базиса сравнения.");
    return res;
  }
  res.compsUsed = compsUsedFrom(stats.used);
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

/**
 * Рычаги чувствительности: на сколько % каждый признак двигает оценку (значения
 * множителей из карты факторов). Аргументы для торга — какие фичи поднимают цену
 * и есть ли они у объекта. Только админка (в публичный выход не идёт).
 */
function buildSensitivity(
  subject: ValuationSubject,
  f: FactorMap,
  isLand: boolean,
): Array<{ label: string; deltaPct: number; applied: boolean }> {
  const out: Array<{ label: string; deltaPct: number; applied: boolean }> = [];
  const add = (label: string, key: string, applied: boolean) => {
    const m = f[key];
    if (m !== undefined && m !== 1) out.push({ label, deltaPct: Math.round((m - 1) * 100), applied });
  };
  add("Вид на море", "feature.sea_view", !!subject.seaView);
  add("Первая линия", "feature.beachfront", !!subject.beachfront);
  add("Вид на горы", "feature.mountain_view", !!subject.mountainView);
  add("Электричество на участке", "feature.electricity", !!subject.electricity);
  if (!isLand) add("Бассейн", "feature.pool", !!subject.pool);
  return out.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
}

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
    sensitivity: buildSensitivity(subject, f, subjType === "land"),
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

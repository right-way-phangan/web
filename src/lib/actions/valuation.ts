"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { getAllObjects } from "@/lib/data/objects";
import { getRentalMarket } from "@/lib/data/rental-market";
import { estimate, type ValuationSubject, type CompPoint, type ValuationResult } from "@/lib/valuation/engine";
import { buildFactorMap } from "@/lib/valuation/factors";
import { lookupZoneByLocation } from "@/lib/actions/zone-lookup";
import { explainValuation } from "@/lib/valuation/llm-explain";
import type { RealEstateObject } from "@/types/object";

const API = process.env.OBJECTS_API_URL;

export interface ExternalComp {
  id: number;
  type: string;
  district: string | null;
  areaRai: number | null;
  builtSqm: number | null;
  bedrooms: number | null;
  priceThb: number;
  documentType: string | null;
  seaView: boolean;
  beachfront: boolean;
  electricity: boolean;
  roadType: string | null;
  terrain: string | null;
  zone: string | null;
  status: string;
  sourceUrl: string | null;
  note: string | null;
  seenAt: string | null;
  createdAt: string;
}

/** Юниты off-plan (RW-P0001-3) — не компсы: цена юнита ≠ цена объекта-аналога. */
function isUnit(rw: string): boolean {
  return /^RW-P\d+-\d+$/i.test(rw);
}

function catalogComp(o: RealEstateObject): CompPoint {
  return {
    ref: o.rwNumber,
    source: "catalog",
    type: o.type,
    status: o.status,
    district: o.district ?? null,
    zone: o.zone ?? null,
    areaRai: o.areaRai ?? (o.areaSqm ? o.areaSqm / 1600 : null),
    builtSqm: null, // в каталоге areaSqm = площадь участка, не постройки
    bedrooms: o.bedrooms ?? null,
    priceThb: o.priceThb ?? null,
    pricePerRai: o.pricePerRai ?? null,
    documentType: o.documentType ?? null,
    roadType: o.roadType ?? null,
    terrain: o.terrain ?? null,
    condition: o.condition ?? null,
    seaView: o.seaView,
    beachfront: o.beachfront,
    mountainView: o.mountainView,
    electricity: o.electricity,
    pool: o.pool,
    date: o.dateAdded ?? null, // поправка на время (DD.M.YY как в каталоге)
    onMarketMonths: o.timeOnMarketMonths ?? null, // стайл-сигнал переоценки
    lat: o.lat ?? null, // «пешком до пляжа» (есть у объектов каталога — для скана)
    lng: o.lng ?? null,
  };
}

function externalComp(c: ExternalComp): CompPoint {
  return {
    ref: `ext#${c.id}`,
    source: "external",
    type: c.type,
    status: c.status,
    district: c.district,
    zone: c.zone,
    areaRai: c.areaRai,
    builtSqm: c.builtSqm,
    bedrooms: c.bedrooms,
    priceThb: c.priceThb,
    documentType: c.documentType,
    roadType: c.roadType,
    terrain: c.terrain,
    seaView: c.seaView,
    beachfront: c.beachfront,
    electricity: c.electricity,
    date: c.seenAt ?? c.createdAt ?? null,
  };
}

async function fetchFactorOverrides(): Promise<Array<{ key: string; value: number }>> {
  if (!API) return [];
  try {
    const r = await backendFetch("/valuation/factors", { cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as Array<{ key: string; value: number }>;
  } catch {
    return [];
  }
}

async function fetchExternalComps(): Promise<ExternalComp[]> {
  if (!API) return [];
  try {
    const r = await backendFetch("/valuation/comps", { cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as ExternalComp[];
  } catch {
    return [];
  }
}

/**
 * Выполнить оценку: каталог + внешние компсы + аналитика аренды + факторы →
 * движок; результат пишется в журнал valuations (best-effort, ошибки журнала
 * оценку не блокируют).
 */
export async function runValuation(
  subject: ValuationSubject,
  opts?: { rwNumber?: string; createdBy?: string },
): Promise<ValuationResult> {
  const [objects, overrides, external] = await Promise.all([
    getAllObjects(),
    fetchFactorOverrides(),
    fetchExternalComps(),
  ]);
  const comps: CompPoint[] = [
    ...objects.filter((o) => !isUnit(o.rwNumber) && o.type !== "Project").map(catalogComp),
    ...external.map(externalComp),
  ];
  const result = estimate(subject, {
    comps,
    market: getRentalMarket(),
    factors: buildFactorMap(overrides),
  });
  if (API && result.ok) {
    backendFetch("/valuations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        rwNumber: opts?.rwNumber,
        subject: subject as unknown as Record<string, unknown>,
        result: result as unknown as Record<string, unknown>,
        fairValue: result.fairValue,
        lowValue: result.low,
        highValue: result.high,
        confidence: result.confidence,
        createdBy: opts?.createdBy ?? "admin",
      }),
    }).catch(() => {});
  }
  return result;
}

/**
 * LLM-обоснование готовой оценки (админка). Оживает с `ANTHROPIC_API_KEY`; без
 * ключа возвращает {ok:false} — кнопка в UI показывается только когда фича
 * включена (флаг прокидывается со страницы). Модель пересказывает посчитанные
 * движком числа, ничего не считая сама.
 */
export async function explainValuationAction(
  subject: ValuationSubject,
  result: ValuationResult,
): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const text = await explainValuation(subject, result);
    if (!text) return { ok: false, error: "LLM не подключён или не дал ответ." };
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "ошибка LLM" };
  }
}

// ---- Скан каталога: asking против оценки по всем объектам ----

export interface ScanRow {
  rwNumber: string;
  titleEn: string | null;
  type: string;
  district: string | null;
  status: string;
  onSite: boolean;
  asking: number;
  estimateMid: number;
  low: number;
  high: number;
  deltaPct: number; // asking против рекомендации размещения
  verdict: "fair" | "over" | "under";
  confidence: "high" | "medium" | "low";
  grossYieldPct?: number; // валовая доходность посуточной аренды к оценке (built)
  netYieldPct?: number; // чистая доходность посуточной аренды (built)
  paybackYears?: number; // окупаемость, лет (built)
}

function areaRaiOf(o: RealEstateObject): number | undefined {
  return o.areaRai ?? (o.areaSqm ? o.areaSqm / 1600 : undefined);
}

function askingOf(o: RealEstateObject): number | undefined {
  if (o.type === "Land") {
    const rai = areaRaiOf(o);
    if (o.pricePerRai && rai) return o.pricePerRai * rai;
    return o.priceThb ?? (o.pricePerRai && rai ? o.pricePerRai * rai : undefined);
  }
  return o.priceThb ?? undefined;
}

function objectToSubject(o: RealEstateObject): ValuationSubject {
  return {
    type: (o.type === "Apartment" ? "Apartment" : o.type === "Villa" || o.type === "House" ? o.type : "Land") as ValuationSubject["type"],
    tenure: o.tenure?.includes("Leasehold") && !o.tenure?.includes("Freehold") ? "Leasehold" : "Freehold",
    district: o.district ?? undefined,
    zone: o.zone ?? undefined,
    areaRai: areaRaiOf(o),
    bedrooms: o.bedrooms ?? undefined,
    documentType: o.documentType ?? undefined,
    roadType: o.roadType ?? undefined,
    terrain: o.terrain ?? undefined,
    condition: o.condition ?? undefined,
    buildYear: o.buildYear ?? undefined,
    seaView: o.seaView,
    beachfront: o.beachfront,
    mountainView: o.mountainView,
    electricity: o.electricity,
    pool: o.pool,
    lat: o.lat,
    lng: o.lng,
  };
}

/** Параллельный map с ограничением одновременных задач (щадим внешний сервис). */
async function mapPool<T>(items: T[], limit: number, fn: (x: T) => Promise<void>): Promise<void> {
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

/**
 * Авто-зона по координатам (#6): для объектов с координатами и БЕЗ ручной зоны
 * подтягиваем цвет генплана ผังเมือง (lookupZoneByLocation — тайл Longdo + цвет
 * пикселя). Применяется в скане симметрично (одни и те же обогащённые объекты —
 * и субъекты, и компсы), поэтому zone-фактор нормализуется честно. Берём только
 * «действующие» зоны (Green/Yellow/Orange/Red/Purple); Unknown/ошибка → нейтраль.
 * Лимит параллелизма 5; тайлы кэшируются (revalidate 24ч) → повторный скан дёшев.
 */
const ACTIONABLE_ZONES = new Set(["Green", "Yellow", "Orange", "Red", "Purple"]);
async function enrichZones(objects: RealEstateObject[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const todo = objects.filter((o) => !o.zone && o.lat != null && o.lng != null);
  await mapPool(todo, 5, async (o) => {
    try {
      const r = await lookupZoneByLocation(o.lat!, o.lng!);
      if (r.ok && r.zone && ACTIONABLE_ZONES.has(r.zone)) map.set(o.rwNumber, r.zone);
    } catch {
      /* зона остаётся нейтральной */
    }
  });
  return map;
}

/**
 * Прогнать движок по всему каталогу: для каждого объекта оценка строится по
 * остальным (свой ref исключён из компсов — без само-сравнения). Возвращает
 * только объекты с asking-ценой и успешной оценкой, отсортированные по модулю
 * отклонения — переоценённые/недооценённые наверх (вход в L1 Vetting и
 * переоценку). В журнал НЕ пишет (массовый расчёт).
 */
export async function scanCatalog(): Promise<ScanRow[]> {
  const [objects, overrides, external] = await Promise.all([
    getAllObjects(),
    fetchFactorOverrides(),
    fetchExternalComps(),
  ]);
  const factors = buildFactorMap(overrides);
  const market = getRentalMarket();
  const subjects = objects.filter((o) => !isUnit(o.rwNumber) && o.type !== "Project");
  // #6: авто-зона по координатам там, где зона не задана вручную (симметрично —
  // обогащённые объекты служат и субъектами, и компсами).
  const zoneMap = await enrichZones(subjects);
  const withZone = (o: RealEstateObject): RealEstateObject =>
    o.zone || !zoneMap.has(o.rwNumber)
      ? o
      : { ...o, zone: zoneMap.get(o.rwNumber) as RealEstateObject["zone"] };
  const enriched = subjects.map(withZone);
  const catalogComps = enriched.map(catalogComp);
  const externalComps = external.map(externalComp);

  const rows: ScanRow[] = [];
  for (const o of enriched) {
    if (!["Land", "Villa", "House", "Apartment"].includes(o.type)) continue;
    const asking = askingOf(o);
    if (!asking || asking <= 0) continue;
    const comps = [...catalogComps.filter((c) => c.ref !== o.rwNumber), ...externalComps];
    const r = estimate(objectToSubject(o), { comps, market, factors });
    if (!r.ok || r.listValue == null) continue;
    const deltaPct = Math.round((asking / r.listValue - 1) * 100);
    const short = r.rental?.scenarios.find((s) => s.mode === "short");
    rows.push({
      rwNumber: o.rwNumber,
      titleEn: o.titleEn ?? null,
      type: o.type,
      district: o.district ?? null,
      status: o.status,
      onSite: o.status === "Active" && !!o.coverImage,
      asking,
      estimateMid: r.fairValue ?? r.listValue,
      low: r.low ?? r.listValue,
      high: r.high ?? r.listValue,
      deltaPct,
      verdict: deltaPct > 10 ? "over" : deltaPct < -10 ? "under" : "fair",
      confidence: r.confidence ?? "low",
      grossYieldPct: short?.grossYieldPct,
      netYieldPct: short?.netYieldPct,
      paybackYears: short?.paybackYears,
    });
  }
  rows.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
  return rows;
}

// ---- Бэктест точности: leave-one-out по реализованным сделкам ----

export interface BacktestPoint {
  ref: string;
  type: string;
  district: string | null;
  actual: number; // реальная цена сделки
  predicted: number; // оценка движка (ожидаемая сделка), субъект построен из компса
  errorPct: number; // (predicted/actual − 1)·100; >0 = переоценка
  bandPct: number; // ±полу-ширина предсказанной полосы, %
  covered: boolean; // факт попал в полосу (|errorPct| ≤ bandPct)
  confidence: "high" | "medium" | "low";
}

export interface BacktestResult {
  n: number;
  mapePct: number; // средняя абсолютная ошибка, %
  medianAbsPct: number;
  biasPct: number; // средняя ЗНАКОВАЯ ошибка (>0 = систематически завышаем)
  within10Pct: number; // доля |ошибки| ≤ 10%
  within20Pct: number;
  bandCoveragePct: number; // доля сделок, попавших в полосу неопределённости (цель ~80%)
  avgBandPct: number; // средняя ±ширина полосы
  points: BacktestPoint[];
  bySegment: Array<{ segment: string; n: number; mapePct: number; biasPct: number }>;
  caveat?: string;
}

/** Реконструкция оцениваемого субъекта из внешнего компса (для leave-one-out). */
function externalCompToSubject(c: ExternalComp): ValuationSubject {
  return {
    type: (["Land", "Villa", "House", "Apartment"].includes(c.type) ? c.type : "Land") as ValuationSubject["type"],
    district: c.district ?? undefined,
    zone: c.zone ?? undefined,
    areaRai: c.areaRai ?? undefined,
    builtSqm: c.builtSqm ?? undefined,
    bedrooms: c.bedrooms ?? undefined,
    documentType: c.documentType ?? undefined,
    roadType: c.roadType ?? undefined,
    terrain: c.terrain ?? undefined,
    seaView: c.seaView,
    beachfront: c.beachfront,
    electricity: c.electricity,
  };
}

const mean = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
function medianOf(a: number[]): number {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Бэктест точности движка: для каждой РЕАЛИЗОВАННОЙ сделки (внешний компс со
 * статусом sold/gone и известной ценой) строим субъект из её атрибутов и
 * оцениваем по всем ОСТАЛЬНЫМ компсам (leave-one-out — сам компс исключён,
 * без подглядывания в ответ). Сравниваем оценку (ожидаемая сделка `fairValue`,
 * т.е. сделочный уровень) с фактической ценой. Так «проверяемая методология»
 * становится числом: MAPE, медиана, систематический сдвиг, доля в пределах ±10/20%.
 * Малая выборка (7 сид-сделок сейчас) — индикативно; растёт по мере пометки
 * компсов sold. В журнал не пишет.
 */
export async function backtestAccuracy(): Promise<BacktestResult> {
  const empty: BacktestResult = {
    n: 0, mapePct: 0, medianAbsPct: 0, biasPct: 0, within10Pct: 0, within20Pct: 0,
    bandCoveragePct: 0, avgBandPct: 0,
    points: [], bySegment: [], caveat: "Нет реализованных сделок (компсов со статусом sold/gone) для бэктеста.",
  };
  const [objects, overrides, external] = await Promise.all([
    getAllObjects(),
    fetchFactorOverrides(),
    fetchExternalComps(),
  ]);
  const factors = buildFactorMap(overrides);
  const market = getRentalMarket();
  const catalogComps = objects.filter((o) => !isUnit(o.rwNumber) && o.type !== "Project").map(catalogComp);
  const allExternal = external.map(externalComp);

  const truth = external.filter((c) => {
    const st = (c.status ?? "").toLowerCase();
    return (st.includes("sold") || st.includes("gone")) && c.priceThb > 0 &&
      ["Land", "Villa", "House", "Apartment"].includes(c.type);
  });
  if (truth.length === 0) return empty;

  const points: BacktestPoint[] = [];
  for (const g of truth) {
    const subject = externalCompToSubject(g);
    const selfRef = `ext#${g.id}`;
    const comps = [...catalogComps, ...allExternal.filter((c) => c.ref !== selfRef)];
    const r = estimate(subject, { comps, market, factors });
    if (!r.ok || r.fairValue == null || r.fairValue <= 0) continue;
    const errorPct = Math.round((r.fairValue / g.priceThb - 1) * 100);
    const bandPct = r.uncertaintyPct ?? 0;
    points.push({
      ref: selfRef,
      type: g.type,
      district: g.district,
      actual: g.priceThb,
      predicted: r.fairValue,
      errorPct,
      bandPct,
      covered: Math.abs(errorPct) <= bandPct,
      confidence: r.confidence ?? "low",
    });
  }
  if (points.length === 0) return empty;

  const errs = points.map((p) => p.errorPct);
  const abs = errs.map((e) => Math.abs(e));
  const segMap = new Map<string, number[]>();
  for (const p of points) {
    const seg = p.type === "Villa" || p.type === "House" ? "Виллы/дома" : p.type === "Apartment" ? "Апартаменты" : "Земля";
    if (!segMap.has(seg)) segMap.set(seg, []);
    segMap.get(seg)!.push(p.errorPct);
  }
  return {
    n: points.length,
    mapePct: Math.round(mean(abs)),
    medianAbsPct: Math.round(medianOf(abs)),
    biasPct: Math.round(mean(errs)),
    within10Pct: Math.round((abs.filter((e) => e <= 10).length / abs.length) * 100),
    within20Pct: Math.round((abs.filter((e) => e <= 20).length / abs.length) * 100),
    bandCoveragePct: Math.round((points.filter((p) => p.covered).length / points.length) * 100),
    avgBandPct: Math.round(mean(points.map((p) => p.bandPct))),
    points: points.sort((a, b) => Math.abs(b.errorPct) - Math.abs(a.errorPct)),
    bySegment: [...segMap.entries()].map(([segment, es]) => ({
      segment, n: es.length, mapePct: Math.round(mean(es.map(Math.abs))), biasPct: Math.round(mean(es)),
    })),
    caveat: points.length < 15 ? `Малая выборка (${points.length} сделок) — оценка точности индикативная, не статистически устойчивая.` : undefined,
  };
}

// ---- Полнота данных каталога (детектор пробелов для оценки) ----

export interface CompletenessRow {
  rwNumber: string;
  type: string;
  titleEn: string | null;
  status: string;
  onSite: boolean;
  missing: string[]; // критичные пропуски, делающие объект бесполезным как компс
  weak: string[]; // важные, но не блокирующие (документ/дорога/зона/координаты…)
}

export interface CompletenessReport {
  landTotal: number;
  landUsable: number;
  villaTotal: number;
  villaUsable: number;
  fieldGaps: Array<{ field: string; scope: "land" | "villa"; missing: number; total: number }>;
  incomplete: CompletenessRow[]; // объекты с критичными пропусками, худшие сверху
}

/**
 * Детектор пробелов: сколько каталога реально пригодно для сравнительной оценки.
 * Компс бесполезен без цены/площади/района (движок его молча отбрасывает). Эта
 * сводка делает «пустые оболочки» видимыми → их заполняют в интейке или
 * архивируют. Главное узкое место точности — не алгоритм, а полнота данных.
 */
export async function catalogCompleteness(): Promise<CompletenessReport> {
  const objects = await getAllObjects();
  const objs = objects.filter((o) => !isUnit(o.rwNumber) && o.type !== "Project");
  const has = (v: unknown) => v != null && String(v).trim() !== "";
  const hasArea = (o: RealEstateObject) => (o.areaRai ?? 0) > 0 || (o.areaSqm ?? 0) > 0;
  const hasPrice = (o: RealEstateObject) => (o.priceThb ?? 0) > 0 || (o.pricePerRai ?? 0) > 0;
  const hasCoords = (o: RealEstateObject) => o.lat != null && o.lng != null;

  const land = objs.filter((o) => o.type === "Land");
  const villa = objs.filter((o) => o.type === "Villa" || o.type === "House");
  const usable = (o: RealEstateObject) => hasPrice(o) && hasArea(o) && has(o.district);

  const rowOf = (o: RealEstateObject): CompletenessRow => {
    const isLand = o.type === "Land";
    const missing: string[] = [];
    if (!hasPrice(o)) missing.push("цена");
    if (!hasArea(o)) missing.push("площадь");
    if (!has(o.district)) missing.push("район");
    const weak: string[] = [];
    if (isLand) {
      if (!has(o.documentType)) weak.push("документ");
      if (!has(o.roadType)) weak.push("дорога");
      if (!has(o.terrain)) weak.push("рельеф");
      if (!has(o.zone)) weak.push("зона");
    } else {
      if (!((o.bedrooms ?? 0) > 0)) weak.push("спальни");
      if (!((o.buildYear ?? 0) > 0)) weak.push("год");
      if (!has(o.condition)) weak.push("состояние");
    }
    if (!hasCoords(o)) weak.push("координаты");
    return {
      rwNumber: o.rwNumber, type: o.type, titleEn: o.titleEn ?? null, status: o.status,
      onSite: o.status === "Active" && !!o.coverImage, missing, weak,
    };
  };

  const gap = (scope: "land" | "villa", set: RealEstateObject[], field: string, ok: (o: RealEstateObject) => boolean) =>
    ({ field, scope, missing: set.filter((o) => !ok(o)).length, total: set.length });
  const fieldGaps = [
    gap("land", land, "цена", hasPrice), gap("land", land, "площадь", hasArea),
    gap("land", land, "район", (o) => has(o.district)), gap("land", land, "документ", (o) => has(o.documentType)),
    gap("land", land, "дорога", (o) => has(o.roadType)), gap("land", land, "зона", (o) => has(o.zone)),
    gap("land", land, "координаты", hasCoords),
    gap("villa", villa, "цена", hasPrice), gap("villa", villa, "площадь", hasArea),
    gap("villa", villa, "район", (o) => has(o.district)), gap("villa", villa, "спальни", (o) => (o.bedrooms ?? 0) > 0),
  ];

  const incomplete = objs
    .map(rowOf)
    .filter((r) => r.missing.length > 0)
    .sort((a, b) => b.missing.length - a.missing.length || Number(b.onSite) - Number(a.onSite));

  return {
    landTotal: land.length, landUsable: land.filter(usable).length,
    villaTotal: villa.length, villaUsable: villa.filter(usable).length,
    fieldGaps, incomplete,
  };
}

export type FactorActionResult = { ok: boolean; error?: string };

/** Сохранить переопределения факторов (value=null — вернуть дефолт). */
export async function saveFactorOverrides(
  entries: Array<{ key: string; value: number | null }>,
): Promise<FactorActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };
  try {
    const r = await backendFetch("/valuation/factors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(entries),
    });
    if (!r.ok) return { ok: false, error: `PUT factors: ${r.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
  revalidatePath("/admin/valuation");
  return { ok: true };
}

export async function addExternalComp(input: {
  type: string;
  district?: string;
  areaRai?: number;
  builtSqm?: number;
  bedrooms?: number;
  priceThb: number;
  documentType?: string;
  seaView?: boolean;
  beachfront?: boolean;
  electricity?: boolean;
  roadType?: string;
  terrain?: string;
  zone?: string;
  status?: string;
  sourceUrl?: string;
  note?: string;
  seenAt?: string;
}): Promise<FactorActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };
  try {
    const r = await backendFetch("/valuation/comps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(input),
    });
    if (!r.ok) {
      const body = (await r.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: body?.error ?? `POST comps: ${r.status}` };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
  revalidatePath("/admin/valuation");
  return { ok: true };
}

/** active → sold/gone: компс становится прокси сделки, не удаляем. */
export async function setCompStatus(id: number, status: string): Promise<FactorActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };
  try {
    const r = await backendFetch(`/valuation/comps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ status }),
    });
    if (!r.ok) return { ok: false, error: `PATCH comp ${id}: ${r.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
  revalidatePath("/admin/valuation");
  return { ok: true };
}

export async function deleteExternalComp(id: number): Promise<FactorActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };
  try {
    const r = await backendFetch(`/valuation/comps/${id}`, { method: "DELETE", cache: "no-store" });
    if (!r.ok) return { ok: false, error: `DELETE comp ${id}: ${r.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
  revalidatePath("/admin/valuation");
  return { ok: true };
}

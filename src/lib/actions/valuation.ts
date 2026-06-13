"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { getAllObjects } from "@/lib/data/objects";
import { getRentalMarket } from "@/lib/data/rental-market";
import { estimate, type ValuationSubject, type CompPoint, type ValuationResult } from "@/lib/valuation/engine";
import { buildFactorMap } from "@/lib/valuation/factors";
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
  const catalogComps = subjects.map(catalogComp);
  const externalComps = external.map(externalComp);

  const rows: ScanRow[] = [];
  for (const o of subjects) {
    if (!["Land", "Villa", "House", "Apartment"].includes(o.type)) continue;
    const asking = askingOf(o);
    if (!asking || asking <= 0) continue;
    const comps = [...catalogComps.filter((c) => c.ref !== o.rwNumber), ...externalComps];
    const r = estimate(objectToSubject(o), { comps, market, factors });
    if (!r.ok || r.listValue == null) continue;
    const deltaPct = Math.round((asking / r.listValue - 1) * 100);
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
    });
  }
  rows.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
  return rows;
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

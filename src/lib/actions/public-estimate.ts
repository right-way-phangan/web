"use server";

/**
 * Публичный фасад «RW Оценка» для лид-магнита /tools/estimate.
 *
 * Тот же детерминированный движок, что и в /admin/valuation, но результат
 * **санитизирован**: наружу уходит только вилка + уверенность + (для земли)
 * цена за рай. НЕ раскрываем: разбивку методов, число/цены компсов, множители
 * факторов, внутренние оговорки (это закупочные данные и методика — см. спеку
 * `docs/tech/Right Way — оценка недвижимости (спека).md`, раздел «Юр.рамка»).
 *
 * Это indicative market estimate, не appraisal. Оценка пишется в журнал
 * `valuations` (createdBy='public') — для калибровки и аналитики спроса.
 */
import { runValuation } from "@/lib/actions/valuation";
import type { ValuationSubject } from "@/lib/valuation/engine";

export interface PublicSubjectInput {
  type: "Land" | "Villa" | "House";
  district?: string;
  areaRai?: number;
  builtSqm?: number;
  bedrooms?: number;
  documentType?: string;
  roadType?: string;
  seaView?: boolean;
  beachfront?: boolean;
  mountainView?: boolean;
  electricity?: boolean;
  pool?: boolean;
  tenure?: "Freehold" | "Leasehold";
}

export type PublicEstimate =
  | {
      ok: true;
      low: number;
      high: number;
      mid: number;
      perRaiMid?: number;
      confidence: "high" | "medium" | "low";
    }
  | { ok: false; reason: "insufficient" | "unsupported" };

const num = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export async function estimatePublic(input: PublicSubjectInput): Promise<PublicEstimate> {
  const type = input.type;
  if (!["Land", "Villa", "House"].includes(type)) return { ok: false, reason: "unsupported" };

  const subject: ValuationSubject = {
    type,
    tenure: input.tenure === "Leasehold" ? "Leasehold" : "Freehold",
    district: input.district || undefined,
    areaRai: num(input.areaRai),
    builtSqm: num(input.builtSqm),
    bedrooms: num(input.bedrooms),
    documentType: input.documentType || undefined,
    roadType: input.roadType || undefined,
    seaView: !!input.seaView,
    beachfront: !!input.beachfront,
    mountainView: !!input.mountainView,
    electricity: !!input.electricity,
    pool: !!input.pool,
  };

  const r = await runValuation(subject, { createdBy: "public" });
  if (!r.ok || r.listValue == null) return { ok: false, reason: "insufficient" };

  return {
    ok: true,
    // Публично показываем диапазон вокруг ожидаемой сделки (fair), а не asking —
    // продавцу честнее ориентир достижимой цены.
    low: r.low ?? r.listValue,
    high: r.high ?? r.listValue,
    mid: r.fairValue ?? r.listValue,
    perRaiMid: r.perRai,
    confidence: r.confidence ?? "low",
  };
}

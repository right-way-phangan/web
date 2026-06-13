"use client";

/**
 * «RW Оценка» внутри интейка (/admin/new): кнопка «Оценить по рынку» берёт
 * текущие значения формы, прогоняет их через server action runValuation и
 * показывает компактную вилку + вердикт по введённой цене. Полная версия с
 * методами и факторами — /admin/valuation.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { runValuation } from "@/lib/actions/valuation";
import type { ValuationResult, ValuationSubject } from "@/lib/valuation/engine";

export interface IntakeEstimateInput {
  type: string;
  district: string;
  documentType: string;
  tenure: string[]; // ["Freehold","Leasehold"]
  areaText: string; // свободный текст «5 rai 2 ngan / 8400 m²»
  pricePerRai: string;
  priceThb: string;
  rentPerRaiMonth: string;
  leaseTermYears: string;
  leaseEscalationText: string; // «8% каждые 5 лет»
  zone: string;
  roadType: string;
  terrain: string;
  features: string[]; // codes: SEA_VIEW / BEACHFRONT / MOUNTAIN_VIEW / ELECTRICITY …
  villaFeatures: string[]; // POOL …
  bedrooms: string;
  buildYear: string;
  condition: string;
}

const num = (s: string): number | undefined => {
  const n = Number(String(s).replace(/[\s,]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** «5 rai 2 ngan / 8400 m²» → раи; голое число <50 считаем раями, иначе м². */
function parseAreaRai(text: string): number | undefined {
  const t = text.toLowerCase();
  let rai = 0;
  const mRai = t.match(/([\d.,]+)\s*(rai|рай|рая|ра[её]в)/);
  const mNgan = t.match(/([\d.,]+)\s*(ngan|нган)/);
  const mSqm = t.match(/([\d\s.,]+)\s*(m²|m2|sqm|кв|м²)/);
  if (mRai) rai += Number(mRai[1].replace(",", ".")) || 0;
  if (mNgan) rai += (Number(mNgan[1].replace(",", ".")) || 0) * 0.25;
  if (rai > 0) return rai;
  if (mSqm) {
    const sqm = Number(mSqm[1].replace(/[\s,]/g, ""));
    if (sqm > 0) return sqm / 1600;
  }
  const bare = Number(t.replace(/[\s,]/g, ""));
  if (Number.isFinite(bare) && bare > 0) return bare < 50 ? bare : bare / 1600;
  return undefined;
}

/** «8% каждые 5 лет» → {percent, periodYears}. */
function parseEscalation(text: string): { percent?: number; periodYears?: number } {
  const mPct = text.match(/([\d.,]+)\s*%/);
  const mPer = text.match(/(?:каждые|каждый|every)\s*([\d.,]+)/i);
  return {
    percent: mPct ? Number(mPct[1].replace(",", ".")) || undefined : undefined,
    periodYears: mPer ? Number(mPer[1].replace(",", ".")) || undefined : undefined,
  };
}

function toSubject(v: IntakeEstimateInput): ValuationSubject | { error: string } {
  const t = v.type;
  if (!["Land", "Villa", "House", "Apartment"].includes(t)) {
    return { error: "Оценка доступна для Land / Villa / House / Apartment." };
  }
  const areaRai = parseAreaRai(v.areaText);
  const pricePerRai = num(v.pricePerRai);
  const priceThb = num(v.priceThb);
  const esc = parseEscalation(v.leaseEscalationText);
  const askingPrice = priceThb ?? (pricePerRai && areaRai ? pricePerRai * areaRai : undefined);
  return {
    type: t as ValuationSubject["type"],
    tenure: v.tenure.includes("Leasehold") && !v.tenure.includes("Freehold") ? "Leasehold" : "Freehold",
    district: v.district || undefined,
    zone: v.zone || undefined,
    areaRai,
    bedrooms: num(v.bedrooms),
    documentType: v.documentType || undefined,
    roadType: v.roadType || undefined,
    terrain: v.terrain || undefined,
    condition: v.condition || undefined,
    buildYear: num(v.buildYear),
    seaView: v.features.includes("SEA_VIEW"),
    beachfront: v.features.includes("BEACHFRONT"),
    mountainView: v.features.includes("MOUNTAIN_VIEW"),
    electricity: v.features.includes("ELECTRICITY"),
    pool: v.villaFeatures.includes("POOL"),
    askingPrice,
    rentPerRaiMonth: num(v.rentPerRaiMonth),
    leaseTermYears: num(v.leaseTermYears),
    leaseEscPercent: esc.percent,
    leaseEscPeriodYears: esc.periodYears,
  };
}

const fmtM = (v: number | undefined | null) =>
  v == null ? "—" : v >= 1e6 ? `฿${(v / 1e6).toFixed(2)}M` : `฿${Math.round(v / 1000)}k`;

export function InlineEstimate({ values }: { values: IntakeEstimateInput }) {
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = () => {
    setError(null);
    const subject = toSubject(values);
    if ("error" in subject) {
      setError(subject.error);
      setResult(null);
      return;
    }
    startTransition(async () => {
      setResult(await runValuation(subject, { createdBy: "intake" }));
    });
  };

  const av = result?.askingVerdict;
  return (
    <div className="rounded-sm border border-brass-500/25 bg-brass-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">RW Оценка</p>
          <p className="text-xs text-forest-900/60">
            Проверка цены по рынку до публикации — каталог + компсы + аренда.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={run} disabled={pending}>
          {pending ? "Считаем…" : "Оценить по рынку"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      {result && !result.ok && <p className="mt-2 text-xs text-red-700">{result.reason}</p>}
      {result?.ok && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-forest-900">
            Размещение: <span className="font-semibold">{fmtM(result.listValue)}</span>
            {result.perRai != null && <span className="text-forest-900/60"> ({fmtM(result.perRai)}/рай)</span>}
            {" · "}сделка: <span className="font-semibold">{fmtM(result.fairValue)}</span>
            {" · "}вилка {fmtM(result.low)}–{fmtM(result.high)}
            {result.confidence && (
              <span className="text-forest-900/50">
                {" "}
                · уверенность: {result.confidence === "high" ? "высокая" : result.confidence === "medium" ? "средняя" : "низкая"}
              </span>
            )}
          </p>
          {av && (
            <p
              className={cn(
                "text-sm",
                av.verdict === "over" ? "text-red-700" : av.verdict === "under" ? "text-brass-700" : "text-forest-700",
              )}
            >
              Цена продавца {fmtM(av.askingPrice)}: {av.deltaPct > 0 ? "+" : ""}
              {av.deltaPct}% к рынку —{" "}
              {av.verdict === "fair" ? "в рынке ✓" : av.verdict === "over" ? "переоценён, аргумент для торга" : "ниже рынка"}
            </p>
          )}
          {result.leasehold && (
            <p className="text-xs text-forest-900/70">
              Leasehold: справедливая ставка ≈ {Math.round(result.leasehold.fairRentPerRaiMonth).toLocaleString()} ฿/рай/мес
              {result.leasehold.rentVerdict &&
                ` — заявленная ${result.leasehold.rentVerdict === "fair" ? "в рынке" : result.leasehold.rentVerdict === "over" ? "выше рынка" : "ниже рынка"}`}
              .
            </p>
          )}
          <p className="text-xs text-forest-900/50">
            {result.caveats.length > 0 && `Оговорок: ${result.caveats.length}. `}
            Полный разбор методов — в{" "}
            <Link href="/admin/valuation" className="underline" target="_blank">
              /admin/valuation
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

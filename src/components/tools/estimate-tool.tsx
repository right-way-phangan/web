"use client";

/**
 * Публичный лид-магнит «узнайте рыночную стоимость» (/tools/estimate).
 * Форма → детерминированная оценка (server action estimatePublic, без раскрытия
 * внутренних данных) → вилка + уверенность → лид-форма «бесплатная точная
 * оценка от команды» (LeadForm kind="valuation"). Двуязычный (EN+RU) через проп
 * lang, как калькулятор. Это indicative estimate, не appraisal.
 */
import { useState, useTransition } from "react";
import { track } from "@vercel/analytics";
import { LeadForm } from "@/components/forms/lead-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { estimatePublic, type PublicEstimate } from "@/lib/actions/public-estimate";

type Lang = "en" | "ru";

// Районы и документы — стабильные значения каталога (как в админ-форме), но
// подписи нейтральные; держим списком тут, чтобы публичный бандл не тянул
// внутренние словари.
const DISTRICTS = [
  "Sri Thanu", "Madeau Wan", "Haad Yao", "Ban Tai", "Chaloklum",
  "Khao Khao Haeng", "Nai Wok", "Wok Tum", "Ban Khai", "Haad Salad",
  "Phangan Hospital area", "Haad Rin", "Ban Nok", "Mae Haad",
  "Coconut lane area", "Thong Nai Pan", "Hin Kong",
] as const;
const DOCUMENTS = [
  "Chanote", "Nor Sor 3 Gor", "Nor Sor 3", "Sor Por Kor", "No documents / Possession only",
] as const;
const ROADS = ["Concrete", "Asphalt", "Dirt", "None"] as const;

const T = {
  en: {
    typeLabel: "What are you valuing?",
    types: { Land: "Land", Villa: "Villa", House: "House" } as Record<string, string>,
    district: "Area / district",
    areaRai: "Plot size (rai)",
    areaHint: "1 rai = 1,600 m². You can enter decimals (e.g. 1.5).",
    builtSqm: "Built area (m²)",
    bedrooms: "Bedrooms",
    document: "Land title",
    road: "Road access",
    tenure: "Ownership",
    tenureOpts: { Freehold: "Freehold", Leasehold: "Leasehold" } as Record<string, string>,
    features: "Features",
    seaView: "Sea view",
    beachfront: "Beachfront",
    mountainView: "Mountain view",
    electricity: "Electricity on plot",
    pool: "Pool",
    estimate: "Get my estimate",
    estimating: "Estimating…",
    pick: "—",
    resultEyebrow: "Indicative market estimate",
    expectedRange: "Likely market range",
    midpoint: "Midpoint",
    perRai: "per rai",
    confidence: { high: "Higher confidence", medium: "Moderate confidence", low: "Indicative only" } as Record<string, string>,
    confidenceNote:
      "Phangan is a thin market with few public sale records, so the range is wide on purpose. A site visit narrows it a lot.",
    disclaimer:
      "This is an automated estimate from Right Way's own market data — not a formal appraisal. For a precise figure we look at your title, access and exact location.",
    insufficient:
      "We don't have enough comparable data for this combination yet. Leave your details below and we'll value it manually — free.",
    unsupported: "This type isn't supported by the instant tool. Contact us and we'll value it manually.",
    leadHeading: "Get a precise valuation — free",
    leadLede:
      "Our team will confirm the figure against your title and location, and tell you what it would realistically sell or lease for. No obligation.",
    leadSubmit: "Request my free valuation",
    again: "Value another property",
  },
  ru: {
    typeLabel: "Что оцениваем?",
    types: { Land: "Земля", Villa: "Вилла", House: "Дом" } as Record<string, string>,
    district: "Район",
    areaRai: "Площадь участка (рай)",
    areaHint: "1 рай = 1 600 м². Можно дробно (например, 1.5).",
    builtSqm: "Площадь постройки (м²)",
    bedrooms: "Спальни",
    document: "Документ на землю",
    road: "Подъездная дорога",
    tenure: "Владение",
    tenureOpts: { Freehold: "Фрихолд", Leasehold: "Лизхолд" } as Record<string, string>,
    features: "Особенности",
    seaView: "Вид на море",
    beachfront: "Первая линия",
    mountainView: "Вид на горы",
    electricity: "Электричество на участке",
    pool: "Бассейн",
    estimate: "Узнать оценку",
    estimating: "Считаем…",
    pick: "—",
    resultEyebrow: "Ориентировочная рыночная оценка",
    expectedRange: "Вероятный рыночный диапазон",
    midpoint: "Середина",
    perRai: "за рай",
    confidence: { high: "Высокая уверенность", medium: "Средняя уверенность", low: "Только ориентир" } as Record<string, string>,
    confidenceNote:
      "Панган — тонкий рынок с малым числом публичных сделок, поэтому диапазон намеренно широкий. Выезд на участок сильно его сужает.",
    disclaimer:
      "Это автоматическая оценка по собственным рыночным данным Right Way — не официальная оценка. Точную цифру даём после проверки документа, доступа и точного расположения.",
    insufficient:
      "Пока недостаточно сопоставимых данных под эту комбинацию. Оставьте контакты ниже — оценим вручную, бесплатно.",
    unsupported: "Этот тип мгновенный инструмент не поддерживает. Напишите нам — оценим вручную.",
    leadHeading: "Точная оценка — бесплатно",
    leadLede:
      "Команда сверит цифру с вашим документом и расположением и скажет, за сколько реально продать или сдать в аренду. Без обязательств.",
    leadSubmit: "Запросить бесплатную оценку",
    again: "Оценить другой объект",
  },
} satisfies Record<Lang, Record<string, unknown>>;

const fmtTHB = (v: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 0 }).format(Math.round(v)) + " ฿";
const fmtCompact = (v: number) => (v >= 1e6 ? `฿${(v / 1e6).toFixed(2)}M` : `฿${Math.round(v / 1000)}k`);

const selectCls = cn(
  "flex h-11 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-4 py-2 text-sm text-forest-900",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:border-forest-500",
);

function Select({
  value, onChange, options, placeholder, labels, ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  labels?: Record<string, string>;
  ariaLabel?: string;
}) {
  return (
    <select aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{labels?.[o] ?? o}</option>
      ))}
    </select>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        on
          ? "border-forest-500 bg-panel text-panel-fg"
          : "border-forest-500/25 bg-cream-50 text-forest-900/70 hover:border-forest-500/50",
      )}
    >
      {label}
    </button>
  );
}

interface Form {
  type: string;
  district: string;
  areaRai: string;
  builtSqm: string;
  bedrooms: string;
  document: string;
  road: string;
  tenure: string;
  seaView: boolean;
  beachfront: boolean;
  mountainView: boolean;
  electricity: boolean;
  pool: boolean;
}

const empty: Form = {
  type: "Land", district: "", areaRai: "", builtSqm: "", bedrooms: "", document: "", road: "",
  tenure: "Freehold", seaView: false, beachfront: false, mountainView: false, electricity: false, pool: false,
};

export function EstimateTool({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [v, setV] = useState<Form>(empty);
  const [result, setResult] = useState<PublicEstimate | null>(null);
  const [pending, startTransition] = useTransition();
  const isLand = v.type === "Land";
  const isBuilt = v.type === "Villa" || v.type === "House";

  const run = () => {
    startTransition(async () => {
      const r = await estimatePublic({
        type: v.type as "Land" | "Villa" | "House",
        district: v.district || undefined,
        areaRai: isLand ? Number(v.areaRai) || undefined : undefined,
        builtSqm: isBuilt ? Number(v.builtSqm) || undefined : undefined,
        bedrooms: isBuilt ? Number(v.bedrooms) || undefined : undefined,
        documentType: v.document || undefined,
        roadType: v.road || undefined,
        tenure: v.tenure === "Leasehold" ? "Leasehold" : "Freehold",
        seaView: v.seaView,
        beachfront: v.beachfront,
        mountainView: v.mountainView,
        electricity: v.electricity,
        pool: v.pool,
      });
      setResult(r);
      track("public_estimate", { type: v.type, ok: r.ok, district: v.district || "n/a" });
    });
  };

  // Сводка введённого — кладётся в сообщение лида, чтобы команда видела объект.
  const subjectSummary = (): string => {
    const parts = [
      t.types[v.type] ?? v.type,
      v.district,
      isLand && v.areaRai ? `${v.areaRai} ${lang === "ru" ? "рай" : "rai"}` : "",
      isBuilt && v.builtSqm ? `${v.builtSqm} m²` : "",
      isBuilt && v.bedrooms ? `${v.bedrooms} BR` : "",
      v.document,
      v.tenure,
      [v.seaView && t.seaView, v.beachfront && t.beachfront, v.electricity && t.electricity, v.pool && t.pool]
        .filter(Boolean).join(", "),
    ].filter(Boolean);
    const head = lang === "ru" ? "Объект на оценку" : "Property to value";
    let line = `${head}: ${parts.join(" · ")}`;
    if (result?.ok) {
      const est = lang === "ru" ? "Авто-оценка" : "Auto-estimate";
      line += `\n${est}: ${fmtCompact(result.low)}–${fmtCompact(result.high)} (${t.confidence[result.confidence]})`;
    }
    return line;
  };

  return (
    <div className="space-y-8">
      {/* Форма */}
      <div className="rounded-sm border border-forest-900/10 bg-cream-50 p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label id="est-type-label">{t.typeLabel}</Label>
            <div className="flex gap-2" role="group" aria-labelledby="est-type-label">
              {(["Land", "Villa", "House"] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setV((p) => ({ ...p, type: tp }))}
                  className={cn(
                    "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-sm border px-3 py-2 text-sm transition-colors",
                    v.type === tp
                      ? "border-forest-500 bg-panel text-panel-fg"
                      : "border-forest-500/25 bg-cream-50 text-forest-900/70 hover:border-forest-500/50",
                  )}
                >
                  {t.types[tp]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t.district}</Label>
            <Select ariaLabel={t.district} value={v.district} onChange={(x) => setV((p) => ({ ...p, district: x }))} options={DISTRICTS} placeholder={t.pick} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.tenure}</Label>
            <Select ariaLabel={t.tenure} value={v.tenure} onChange={(x) => setV((p) => ({ ...p, tenure: x }))} options={["Freehold", "Leasehold"]} placeholder={t.pick} labels={t.tenureOpts} />
          </div>

          {isLand && (
            <div className="space-y-1.5">
              <Label>{t.areaRai}</Label>
              <Input aria-label={t.areaRai} value={v.areaRai} onChange={(e) => setV((p) => ({ ...p, areaRai: e.target.value }))} placeholder="1.5" inputMode="decimal" />
              <p className="text-xs text-forest-500/50">{t.areaHint}</p>
            </div>
          )}
          {isBuilt && (
            <>
              <div className="space-y-1.5">
                <Label>{t.builtSqm}</Label>
                <Input aria-label={t.builtSqm} value={v.builtSqm} onChange={(e) => setV((p) => ({ ...p, builtSqm: e.target.value }))} placeholder="180" inputMode="numeric" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.bedrooms}</Label>
                <Input aria-label={t.bedrooms} value={v.bedrooms} onChange={(e) => setV((p) => ({ ...p, bedrooms: e.target.value }))} placeholder="3" inputMode="numeric" />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>{t.document}</Label>
            <Select ariaLabel={t.document} value={v.document} onChange={(x) => setV((p) => ({ ...p, document: x }))} options={DOCUMENTS} placeholder={t.pick} />
          </div>
          {isLand && (
            <div className="space-y-1.5">
              <Label>{t.road}</Label>
              <Select ariaLabel={t.road} value={v.road} onChange={(x) => setV((p) => ({ ...p, road: x }))} options={ROADS} placeholder={t.pick} />
            </div>
          )}
        </div>

        <div className="mt-4 space-y-1.5">
          <Label id="est-features-label">{t.features}</Label>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="est-features-label">
            <Toggle label={t.seaView} on={v.seaView} set={(x) => setV((p) => ({ ...p, seaView: x }))} />
            <Toggle label={t.beachfront} on={v.beachfront} set={(x) => setV((p) => ({ ...p, beachfront: x }))} />
            <Toggle label={t.mountainView} on={v.mountainView} set={(x) => setV((p) => ({ ...p, mountainView: x }))} />
            <Toggle label={t.electricity} on={v.electricity} set={(x) => setV((p) => ({ ...p, electricity: x }))} />
            {isBuilt && <Toggle label={t.pool} on={v.pool} set={(x) => setV((p) => ({ ...p, pool: x }))} />}
          </div>
        </div>

        <div className="mt-5">
          <Button onClick={run} disabled={pending} size="lg">
            {pending ? t.estimating : t.estimate}
          </Button>
        </div>
      </div>

      {/* Результат */}
      {result && result.ok && (
        <div className="rounded-sm border border-brass-500/30 bg-brass-500/5 p-5 md:p-6">
          <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">{t.resultEyebrow}</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-forest-900/50">{t.expectedRange}</p>
              <p className="text-2xl font-semibold text-forest-900 md:text-3xl">
                {fmtTHB(result.low, lang)} – {fmtTHB(result.high, lang)}
              </p>
            </div>
            <div>
              <p className="text-xs text-forest-900/50">{t.midpoint}</p>
              <p className="text-xl font-semibold text-forest-900">{fmtTHB(result.mid, lang)}</p>
              {result.perRaiMid != null && (
                <p className="text-xs text-forest-900/50">{fmtCompact(result.perRaiMid)} {t.perRai}</p>
              )}
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                result.confidence === "high" && "border-forest-500/30 bg-forest-500/10 text-forest-700",
                result.confidence === "medium" && "border-brass-500/30 bg-brass-500/10 text-brass-700",
                result.confidence === "low" && "border-forest-900/20 bg-cream-100 text-forest-900/60",
              )}
            >
              {t.confidence[result.confidence]}
            </span>
          </div>
          <p className="mt-3 text-sm text-forest-900/70">{t.confidenceNote}</p>
          <p className="mt-2 text-xs text-forest-900/50">{t.disclaimer}</p>
        </div>
      )}

      {result && !result.ok && (
        <div className="rounded-sm border border-forest-900/15 bg-cream-50 p-5 text-sm text-forest-900/80">
          {result.reason === "unsupported" ? t.unsupported : t.insufficient}
        </div>
      )}

      {/* Лид-форма: показываем после любой попытки оценки */}
      {result && (
        <div className="rounded-sm border border-forest-900/10 bg-cream-50 p-5 md:p-6">
          <h2 className="text-xl font-semibold text-forest-900">{t.leadHeading}</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-forest-900/70">{t.leadLede}</p>
          <div className="mt-5">
            <LeadForm
              source="contact"
              kind="valuation"
              layout="block"
              locale={lang}
              defaultMessage={subjectSummary()}
              submitLabel={t.leadSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

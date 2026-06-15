"use client";

/**
 * «RW Оценка» — клиент /admin/valuation: форма субъекта → server action
 * runValuation → панель результата (вилка, методы, поправки, leasehold,
 * вердикт по asking). Ниже — редактор факторов (переопределения поверх
 * дефолтов движка) и внешние компсы (ручные наблюдения рынка).
 */
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import {
  DISTRICTS,
  DOCUMENT_TYPES,
  ROAD_TYPES,
  TERRAIN_TYPES,
  CONDITIONS,
  ZONES,
} from "@/lib/amocrm/dictionaries";
import { FACTOR_DEFS, FACTOR_GROUP_LABELS, type FactorDef } from "@/lib/valuation/factors";
import type { ValuationResult, ValuationSubject, MethodResult } from "@/lib/valuation/engine";
import {
  runValuation,
  saveFactorOverrides,
  addExternalComp,
  setCompStatus,
  deleteExternalComp,
  scanCatalog,
  explainValuationAction,
  backtestAccuracy,
  catalogCompleteness,
  type ExternalComp,
  type ScanRow,
  type BacktestResult,
  type CompletenessReport,
} from "@/lib/actions/valuation";

const fmt = (v: number | undefined | null) =>
  v == null ? "—" : `${Math.round(v).toLocaleString("en-US")} ฿`;
const fmtM = (v: number | undefined | null) =>
  v == null ? "—" : v >= 1e6 ? `฿${(v / 1e6).toFixed(2)}M` : `฿${Math.round(v / 1000)}k`;

const selectCls = cn(
  "flex h-11 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-4 py-2 text-sm text-forest-900",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:border-forest-500",
);

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-forest-500/50">{hint}</p> : null}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder = "—",
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        on
          ? "border-forest-500 bg-forest-500 text-cream-50"
          : "border-forest-500/25 bg-cream-50 text-forest-900/70 hover:border-forest-500/50",
      )}
    >
      {label}
    </button>
  );
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "высокая уверенность",
  medium: "средняя уверенность",
  low: "низкая уверенность",
};
const CONFIDENCE_CLS: Record<string, string> = {
  high: "bg-forest-500/10 text-forest-700 border-forest-500/30",
  medium: "bg-brass-500/10 text-brass-700 border-brass-500/30",
  low: "bg-red-500/10 text-red-700 border-red-500/30",
};

// ---- Форма субъекта ----

interface SubjectForm {
  type: string;
  tenure: string;
  district: string;
  zone: string;
  areaRai: string;
  builtSqm: string;
  bedrooms: string;
  documentType: string;
  roadType: string;
  terrain: string;
  condition: string;
  buildYear: string;
  seaView: boolean;
  beachfront: boolean;
  mountainView: boolean;
  electricity: boolean;
  pool: boolean;
  askingPrice: string;
  rentPerRaiMonth: string;
  leaseTermYears: string;
  leaseEscPercent: string;
  leaseEscPeriodYears: string;
}

const emptySubject: SubjectForm = {
  type: "Land",
  tenure: "Freehold",
  district: "",
  zone: "",
  areaRai: "",
  builtSqm: "",
  bedrooms: "",
  documentType: "",
  roadType: "",
  terrain: "",
  condition: "",
  buildYear: "",
  seaView: false,
  beachfront: false,
  mountainView: false,
  electricity: false,
  pool: false,
  askingPrice: "",
  rentPerRaiMonth: "",
  leaseTermYears: "",
  leaseEscPercent: "",
  leaseEscPeriodYears: "",
};

function toSubject(v: SubjectForm): ValuationSubject {
  const num = (s: string) => {
    const n = Number(s.replace(/[\s,]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return {
    type: (v.type || "Land") as ValuationSubject["type"],
    tenure: v.tenure === "Leasehold" ? "Leasehold" : "Freehold",
    district: v.district || undefined,
    zone: v.zone || undefined,
    areaRai: num(v.areaRai),
    builtSqm: num(v.builtSqm),
    bedrooms: num(v.bedrooms),
    documentType: v.documentType || undefined,
    roadType: v.roadType || undefined,
    terrain: v.terrain || undefined,
    condition: v.condition || undefined,
    buildYear: num(v.buildYear),
    seaView: v.seaView,
    beachfront: v.beachfront,
    mountainView: v.mountainView,
    electricity: v.electricity,
    pool: v.pool,
    askingPrice: num(v.askingPrice),
    rentPerRaiMonth: num(v.rentPerRaiMonth),
    leaseTermYears: num(v.leaseTermYears),
    leaseEscPercent: num(v.leaseEscPercent),
    leaseEscPeriodYears: num(v.leaseEscPeriodYears),
  };
}

// ---- Панель результата ----

function MethodCard({ m }: { m: MethodResult }) {
  return (
    <div
      className={cn(
        "rounded-sm border p-4",
        m.available ? "border-forest-900/10 bg-white" : "border-forest-900/10 bg-cream-50/60 opacity-60",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-forest-900">{m.label}</p>
        <p className="text-sm font-semibold text-forest-900">{m.available ? fmtM(m.value) : "н/д"}</p>
      </div>
      {m.available && (
        <p className="mt-0.5 text-xs text-forest-900/50">
          {fmtM(m.low)} – {fmtM(m.high)} · вес {Math.round(m.weight * 100)}%{m.basis ? ` · ${m.basis}` : ""}
        </p>
      )}
      <ul className="mt-2 space-y-1">
        {m.details.map((d, i) => (
          <li key={i} className="text-xs text-forest-900/60">
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultPanel({
  r,
  subject,
  llmEnabled,
}: {
  r: ValuationResult;
  subject: ValuationSubject;
  llmEnabled: boolean;
}) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainErr, setExplainErr] = useState<string | null>(null);
  const [explaining, startExplain] = useTransition();
  const explain = () => {
    setExplainErr(null);
    startExplain(async () => {
      const res = await explainValuationAction(subject, r);
      if (res.ok && res.text) setExplanation(res.text);
      else setExplainErr(res.error ?? "Не удалось получить обоснование.");
    });
  };
  if (!r.ok) {
    return (
      <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-800">
        {r.reason ?? "Оценка не удалась."}
      </div>
    );
  }
  const av = r.askingVerdict;
  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-forest-900/10 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Оценка</p>
          {r.confidence && (
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs", CONFIDENCE_CLS[r.confidence])}>
              {CONFIDENCE_LABEL[r.confidence]}
            </span>
          )}
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-forest-900/50">Рекомендуемая цена размещения</p>
            <p className="text-xl font-semibold text-forest-900">{fmt(r.listValue)}</p>
            {r.perRai != null && <p className="text-xs text-forest-900/50">{fmtM(r.perRai)} за рай</p>}
          </div>
          <div>
            <p className="text-xs text-forest-900/50">Ожидаемая сделка</p>
            <p className="text-xl font-semibold text-forest-900">{fmt(r.fairValue)}</p>
          </div>
          <div>
            <p className="text-xs text-forest-900/50">
              Вилка{r.uncertaintyPct != null ? ` (±${r.uncertaintyPct}%)` : ""}
            </p>
            <p className="text-xl font-semibold text-forest-900">
              {fmtM(r.low)} – {fmtM(r.high)}
            </p>
          </div>
        </div>
        {av && (
          <p
            className={cn(
              "mt-3 rounded-sm border px-3 py-2 text-sm",
              av.verdict === "fair" && "border-forest-500/30 bg-forest-500/5 text-forest-800",
              av.verdict === "over" && "border-red-500/30 bg-red-500/5 text-red-800",
              av.verdict === "under" && "border-brass-500/30 bg-brass-500/5 text-brass-700",
            )}
          >
            Запрошенная цена {fmt(av.askingPrice)} — {av.deltaPct > 0 ? "+" : ""}
            {av.deltaPct}% к рекомендации размещения:{" "}
            {av.verdict === "fair" ? "в рынке" : av.verdict === "over" ? "переоценён" : "ниже рынка"}.
          </p>
        )}
        {r.liquidity && (
          <p className="mt-3 text-sm text-forest-900/70">
            <span className="text-forest-900/50">Ликвидность сегмента:</span>{" "}
            <span className={cn("font-medium", r.liquidity.verdict === "slow" ? "text-red-700" : r.liquidity.verdict === "fast" ? "text-forest-700" : "text-brass-700")}>
              {r.liquidity.verdict === "slow" ? "медленный" : r.liquidity.verdict === "fast" ? "быстрый" : "обычный"}
            </span>{" "}
            — похожие объявления стоят на рынке типично {r.liquidity.medianMonths} мес, {r.liquidity.staleSharePct}% висят дольше порога ({r.liquidity.n} шт).
          </p>
        )}
        {r.adjustments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.adjustments.map((a, i) => (
              <span key={i} className="rounded-full bg-cream-100 px-2.5 py-1 text-xs text-forest-900/70">
                {a.label} ×{a.mult}
              </span>
            ))}
          </div>
        )}
      </div>

      {r.leasehold && (
        <div className="rounded-sm border border-forest-900/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Leasehold</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-forest-900/50">Справедливая ставка</p>
              <p className="text-lg font-semibold text-forest-900">
                {fmt(r.leasehold.fairRentPerRaiMonth)} <span className="text-xs font-normal">/рай/мес</span>
              </p>
              {r.leasehold.fairRentTotalMonth != null && (
                <p className="text-xs text-forest-900/50">{fmt(r.leasehold.fairRentTotalMonth)} за участок/мес</p>
              )}
            </div>
            <div>
              <p className="text-xs text-forest-900/50">NPV справедливой аренды</p>
              <p className="text-lg font-semibold text-forest-900">{fmtM(r.leasehold.fairNpv)}</p>
            </div>
            {r.leasehold.contractNpv != null && (
              <div>
                <p className="text-xs text-forest-900/50">NPV контракта ({fmt(subject.rentPerRaiMonth)}/рай/мес)</p>
                <p className="text-lg font-semibold text-forest-900">{fmtM(r.leasehold.contractNpv)}</p>
                {r.leasehold.rentVerdict && (
                  <p className="text-xs text-forest-900/60">
                    Ставка{" "}
                    {r.leasehold.rentVerdict === "fair"
                      ? "в рынке"
                      : r.leasehold.rentVerdict === "over"
                        ? "выше справедливой"
                        : "ниже справедливой"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {r.methods.map((m) => (
          <MethodCard key={m.key + m.label} m={m} />
        ))}
      </div>

      {(() => {
        const comp = r.methods.find((m) => m.key === "comparative" && m.compsUsed && m.compsUsed.length > 0);
        if (!comp?.compsUsed) return null;
        return (
          <details className="rounded-sm border border-forest-900/10 bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium text-forest-900">
              Компсы в основе оценки ({comp.compsUsed.length}) — для внутренней проверки
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-forest-900/10 text-forest-900/50">
                    <th className="px-2 py-1.5 font-medium">Объект</th>
                    <th className="px-2 py-1.5 font-medium">Район</th>
                    <th className="px-2 py-1.5 font-medium">За рай / базис</th>
                    <th className="px-2 py-1.5 font-medium">Вес</th>
                    <th className="px-2 py-1.5 font-medium">Метка</th>
                  </tr>
                </thead>
                <tbody>
                  {comp.compsUsed.map((c) => (
                    <tr key={c.ref} className="border-b border-forest-900/5">
                      <td className="px-2 py-1.5 text-forest-900">{c.ref}</td>
                      <td className="px-2 py-1.5 text-forest-900/70">{c.district ?? "—"}</td>
                      <td className="px-2 py-1.5">{fmtM(c.perRai)}</td>
                      <td className="px-2 py-1.5 text-forest-900/60">×{c.weight}</td>
                      <td className="px-2 py-1.5 text-forest-900/60">{c.tag || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-forest-900/40">
                Цена приведена к сегодняшней дате; вес: продан ×1.5, завис ×0.5. Спот плохих компсов → правьте в каталоге/вкладке «Компсы».
              </p>
            </div>
          </details>
        );
      })()}

      {r.sensitivity && r.sensitivity.length > 0 && (
        <div className="rounded-sm border border-forest-900/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">Рычаги — что двигает цену</p>
          <div className="mt-2 space-y-1.5">
            {r.sensitivity.map((s) => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                <span className="w-52 shrink-0 text-forest-900/80">{s.label}</span>
                <span className={cn("font-medium tabular-nums", s.deltaPct >= 0 ? "text-forest-700" : "text-red-700")}>
                  {s.deltaPct > 0 ? "+" : ""}
                  {s.deltaPct}%
                </span>
                <span className="text-xs text-forest-900/45">{s.applied ? "есть у объекта" : "нет — потенциал"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {r.caveats.length > 0 && (
        <ul className="space-y-1 rounded-sm border border-brass-500/20 bg-brass-500/5 p-4">
          {r.caveats.map((c, i) => (
            <li key={i} className="text-xs text-forest-900/70">
              ⚠ {c}
            </li>
          ))}
        </ul>
      )}

      {llmEnabled && (
        <div className="rounded-sm border border-forest-900/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">
              Обоснование оценки
            </p>
            <button
              type="button"
              onClick={explain}
              disabled={explaining}
              className="rounded-sm border border-forest-900/20 px-3 py-1 text-xs text-forest-900 hover:bg-forest-900/5 disabled:opacity-50"
            >
              {explaining ? "Готовлю…" : explanation ? "Обновить" : "Объяснить оценку"}
            </button>
          </div>
          <p className="mt-1 text-xs text-forest-900/45">
            ИИ пересказывает посчитанные движком числа и факторы — цифры не меняет.
          </p>
          {explainErr && <p className="mt-2 text-sm text-red-700">{explainErr}</p>}
          {explanation && (
            <div className="mt-3 space-y-2 whitespace-pre-wrap text-sm leading-relaxed text-forest-900/90">
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Редактор факторов ----

function FactorsEditor({ overrides }: { overrides: Array<{ key: string; value: number }> }) {
  const overrideMap = useMemo(() => new Map(overrides.map((o) => [o.key, o.value])), [overrides]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const groups = useMemo(() => {
    const g = new Map<FactorDef["group"], FactorDef[]>();
    for (const d of FACTOR_DEFS) {
      if (!g.has(d.group)) g.set(d.group, []);
      g.get(d.group)!.push(d);
    }
    return g;
  }, []);

  const save = () => {
    const entries: Array<{ key: string; value: number | null }> = [];
    for (const [key, raw] of Object.entries(draft)) {
      const def = FACTOR_DEFS.find((x) => x.key === key);
      if (!def) continue;
      const trimmed = raw.trim();
      if (trimmed === "") {
        if (overrideMap.has(key)) entries.push({ key, value: null }); // пусто = вернуть дефолт
        continue;
      }
      const n = Number(trimmed);
      if (!Number.isFinite(n)) continue;
      if (n === def.value) {
        if (overrideMap.has(key)) entries.push({ key, value: null });
      } else if (n !== overrideMap.get(key)) {
        entries.push({ key, value: n });
      }
    }
    if (entries.length === 0) {
      setMsg("Нет изменений.");
      return;
    }
    startTransition(async () => {
      const res = await saveFactorOverrides(entries);
      setMsg(res.ok ? `Сохранено: ${entries.length}.` : (res.error ?? "Ошибка."));
      if (res.ok) setDraft({});
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-forest-900/60">
        Дефолты зашиты в движок; здесь хранятся только переопределения. Пустое поле возвращает дефолт.
        Множители: 1 = нейтрально, 0.85 = −15%. Ставки — в долях (0.07 = 7%).
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {[...groups.entries()].map(([group, defs]) => (
          <div key={group} className="rounded-sm border border-forest-900/10 bg-white p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-brass-500">
              {FACTOR_GROUP_LABELS[group]}
            </p>
            <div className="space-y-1.5">
              {defs.map((d) => {
                const overridden = overrideMap.has(d.key);
                return (
                  <div key={d.key} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-forest-900/80" title={d.note ?? d.key}>
                        {d.label}
                        {overridden && <span className="ml-1 text-brass-500">●</span>}
                      </p>
                    </div>
                    <input
                      type="number"
                      step="any"
                      placeholder={String(d.value)}
                      value={draft[d.key] ?? (overridden ? String(overrideMap.get(d.key)) : "")}
                      onChange={(e) => setDraft((p) => ({ ...p, [d.key]: e.target.value }))}
                      className="h-8 w-24 rounded-sm border border-forest-500/20 bg-cream-50 px-2 text-right text-xs text-forest-900"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить факторы"}
        </Button>
        {msg && <p className="text-xs text-forest-900/60">{msg}</p>}
      </div>
    </div>
  );
}

// ---- Внешние компсы ----

const COMP_STATUS_LABEL: Record<string, string> = {
  active: "в продаже",
  sold: "продан",
  gone: "снят",
};

function CompsPanel({ comps }: { comps: ExternalComp[] }) {
  const [v, setV] = useState({
    type: "Land",
    district: "",
    areaRai: "",
    builtSqm: "",
    bedrooms: "",
    priceThb: "",
    documentType: "",
    roadType: "",
    seaView: false,
    beachfront: false,
    electricity: false,
    sourceUrl: "",
    note: "",
  });
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const add = () => {
    const price = Number(v.priceThb.replace(/[\s,]/g, ""));
    if (!Number.isFinite(price) || price <= 0) {
      setMsg("Укажите цену в THB.");
      return;
    }
    startTransition(async () => {
      const res = await addExternalComp({
        type: v.type,
        district: v.district || undefined,
        areaRai: Number(v.areaRai) || undefined,
        builtSqm: Number(v.builtSqm) || undefined,
        bedrooms: Number(v.bedrooms) || undefined,
        priceThb: price,
        documentType: v.documentType || undefined,
        roadType: v.roadType || undefined,
        seaView: v.seaView,
        beachfront: v.beachfront,
        electricity: v.electricity,
        sourceUrl: v.sourceUrl || undefined,
        note: v.note || undefined,
        seenAt: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date()),
      });
      setMsg(res.ok ? "Компс добавлен." : (res.error ?? "Ошибка."));
      if (res.ok) setV((p) => ({ ...p, areaRai: "", builtSqm: "", bedrooms: "", priceThb: "", sourceUrl: "", note: "" }));
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-forest-900/60">
        Чужие объявления (FazWaz, конкуренты, сарафан) — расширяют базу сравнения. Каталог RW подмешивается
        автоматически. Когда объявление исчезло — ставьте «продан»/«снят»: это прокси реальной сделки, не удаляйте.
      </p>
      <div className="rounded-sm border border-forest-900/10 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="Тип">
            <Select value={v.type} onChange={(x) => setV((p) => ({ ...p, type: x }))} options={["Land", "Villa", "House", "Apartment"]} placeholder="Land" />
          </Field>
          <Field label="Район">
            <Select value={v.district} onChange={(x) => setV((p) => ({ ...p, district: x }))} options={DISTRICTS} />
          </Field>
          <Field label="Цена, THB">
            <Input value={v.priceThb} onChange={(e) => setV((p) => ({ ...p, priceThb: e.target.value }))} placeholder="4 500 000" />
          </Field>
          <Field label="Площадь, рай">
            <Input value={v.areaRai} onChange={(e) => setV((p) => ({ ...p, areaRai: e.target.value }))} placeholder="1.5" />
          </Field>
          <Field label="Документ">
            <Select value={v.documentType} onChange={(x) => setV((p) => ({ ...p, documentType: x }))} options={DOCUMENT_TYPES} />
          </Field>
          <Field label="Дорога">
            <Select value={v.roadType} onChange={(x) => setV((p) => ({ ...p, roadType: x }))} options={ROAD_TYPES} />
          </Field>
          <Field label="Спальни (вилла)">
            <Input value={v.bedrooms} onChange={(e) => setV((p) => ({ ...p, bedrooms: e.target.value }))} placeholder="3" />
          </Field>
          <Field label="Постройка, м²">
            <Input value={v.builtSqm} onChange={(e) => setV((p) => ({ ...p, builtSqm: e.target.value }))} placeholder="180" />
          </Field>
          <Field label="Ссылка на объявление">
            <Input value={v.sourceUrl} onChange={(e) => setV((p) => ({ ...p, sourceUrl: e.target.value }))} placeholder="https://…" />
          </Field>
          <Field label="Заметка">
            <Input value={v.note} onChange={(e) => setV((p) => ({ ...p, note: e.target.value }))} placeholder="откуда инфо" />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Toggle label="Вид на море" on={v.seaView} set={(x) => setV((p) => ({ ...p, seaView: x }))} />
          <Toggle label="Первая линия" on={v.beachfront} set={(x) => setV((p) => ({ ...p, beachfront: x }))} />
          <Toggle label="Электричество" on={v.electricity} set={(x) => setV((p) => ({ ...p, electricity: x }))} />
          <Button onClick={add} disabled={pending} className="ml-auto">
            {pending ? "Добавляем…" : "Добавить компс"}
          </Button>
        </div>
        {msg && <p className="mt-2 text-xs text-forest-900/60">{msg}</p>}
      </div>

      {comps.length > 0 && (
        <div className="overflow-x-auto rounded-sm border border-forest-900/10 bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-forest-900/10 text-forest-900/50">
                <th className="px-3 py-2 font-medium">Тип</th>
                <th className="px-3 py-2 font-medium">Район</th>
                <th className="px-3 py-2 font-medium">Рай</th>
                <th className="px-3 py-2 font-medium">Цена</th>
                <th className="px-3 py-2 font-medium">За рай</th>
                <th className="px-3 py-2 font-medium">Документ</th>
                <th className="px-3 py-2 font-medium">Статус</th>
                <th className="px-3 py-2 font-medium">Добавлен</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {comps.map((c) => (
                <CompRow key={c.id} c={c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompRow({ c }: { c: ExternalComp }) {
  const [pending, startTransition] = useTransition();
  const perRai = c.areaRai && c.areaRai > 0 ? c.priceThb / c.areaRai : null;
  return (
    <tr className={cn("border-b border-forest-900/5", c.status !== "active" && "opacity-60")}>
      <td className="px-3 py-2 text-forest-900">{c.type}</td>
      <td className="px-3 py-2 text-forest-900">{c.district ?? "—"}</td>
      <td className="px-3 py-2">{c.areaRai ?? "—"}</td>
      <td className="px-3 py-2">{fmtM(c.priceThb)}</td>
      <td className="px-3 py-2">{perRai ? fmtM(perRai) : "—"}</td>
      <td className="px-3 py-2">{c.documentType ?? "—"}</td>
      <td className="px-3 py-2">
        <select
          value={c.status}
          disabled={pending}
          onChange={(e) => startTransition(async () => void (await setCompStatus(c.id, e.target.value)))}
          className="rounded-sm border border-forest-500/20 bg-cream-50 px-1.5 py-1 text-xs"
        >
          {Object.entries(COMP_STATUS_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-forest-900/50">
        {c.sourceUrl ? (
          <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="underline">
            {c.seenAt ?? "ссылка"}
          </a>
        ) : (
          (c.seenAt ?? "—")
        )}
      </td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("Удалить компс? (снятые с рынка лучше помечать «снят», не удалять)")) {
              startTransition(async () => void (await deleteExternalComp(c.id)));
            }
          }}
          className="text-xs text-red-700/70 hover:text-red-700"
        >
          удалить
        </button>
      </td>
    </tr>
  );
}

// ---- История ----

export interface ValuationHistoryRow {
  id: number;
  rwNumber: string | null;
  fairValue: number | null;
  lowValue: number | null;
  highValue: number | null;
  confidence: string | null;
  createdAt: string;
  subject: { type?: string; district?: string; areaRai?: number } | null;
}

function HistoryPanel({ rows }: { rows: ValuationHistoryRow[] }) {
  if (rows.length === 0)
    return <p className="text-xs text-forest-900/50">Оценок ещё не было.</p>;
  return (
    <div className="overflow-x-auto rounded-sm border border-forest-900/10 bg-white">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-forest-900/10 text-forest-900/50">
            <th className="px-3 py-2 font-medium">Когда</th>
            <th className="px-3 py-2 font-medium">Что</th>
            <th className="px-3 py-2 font-medium">Сделка (fair)</th>
            <th className="px-3 py-2 font-medium">Вилка</th>
            <th className="px-3 py-2 font-medium">Уверенность</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-forest-900/5">
              <td className="px-3 py-2 text-forest-900/60">
                {new Date(r.createdAt).toLocaleDateString("ru-RU")}
              </td>
              <td className="px-3 py-2 text-forest-900">
                {r.rwNumber ?? [r.subject?.type, r.subject?.district, r.subject?.areaRai && `${r.subject.areaRai} рай`].filter(Boolean).join(" · ") ?? "—"}
              </td>
              <td className="px-3 py-2">{fmtM(r.fairValue)}</td>
              <td className="px-3 py-2">
                {fmtM(r.lowValue)} – {fmtM(r.highValue)}
              </td>
              <td className="px-3 py-2">{r.confidence ? CONFIDENCE_LABEL[r.confidence] : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Скан каталога ----

const VERDICT_CLS: Record<string, string> = {
  over: "text-red-700",
  under: "text-brass-700",
  fair: "text-forest-700",
};
const VERDICT_LABEL: Record<string, string> = {
  over: "переоценён",
  under: "ниже рынка",
  fair: "в рынке",
};

function CatalogScanPanel() {
  const [rows, setRows] = useState<ScanRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | "over" | "under">("all");
  const [pending, startTransition] = useTransition();

  const run = () => startTransition(async () => setRows(await scanCatalog()));

  const shown = (rows ?? []).filter((r) => filter === "all" || r.verdict === filter);
  const counts = {
    over: (rows ?? []).filter((r) => r.verdict === "over").length,
    under: (rows ?? []).filter((r) => r.verdict === "under").length,
    fair: (rows ?? []).filter((r) => r.verdict === "fair").length,
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-forest-900/60">
        Прогон движка по всему каталогу: цена объекта против оценки по остальным (свой объект исключён из
        сравнения). Переоценённые наверх — вход для L1 Vetting и переоценки. Не пишется в журнал.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={pending}>
          {pending ? "Сканируем…" : rows ? "Пересканировать" : "Сканировать каталог"}
        </Button>
        {rows && (
          <div className="flex gap-1.5 text-xs">
            {(["all", "over", "under"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-sm px-2.5 py-1 transition-colors",
                  filter === f ? "bg-forest-500 text-cream-50" : "bg-cream-100 text-forest-900/70 hover:bg-cream-200",
                )}
              >
                {f === "all" ? `Все (${rows.length})` : f === "over" ? `Переоценены (${counts.over})` : `Ниже рынка (${counts.under})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {rows && shown.length > 0 && (
        <div className="overflow-x-auto rounded-sm border border-forest-900/10 bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-forest-900/10 text-forest-900/50">
                <th className="px-3 py-2 font-medium">RW</th>
                <th className="px-3 py-2 font-medium">Тип</th>
                <th className="px-3 py-2 font-medium">Район</th>
                <th className="px-3 py-2 font-medium">Цена</th>
                <th className="px-3 py-2 font-medium">Оценка (сделка)</th>
                <th className="px-3 py-2 font-medium">Δ к рынку</th>
                <th className="px-3 py-2 font-medium">Увер.</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.rwNumber} className="border-b border-forest-900/5">
                  <td className="px-3 py-2">
                    <a href={`/admin/objects?q=${r.rwNumber}`} className="font-medium text-forest-900 underline">
                      {r.rwNumber}
                    </a>
                    {r.onSite && <span className="ml-1 text-forest-500/50" title="На сайте">●</span>}
                  </td>
                  <td className="px-3 py-2 text-forest-900/70">{r.type}</td>
                  <td className="px-3 py-2 text-forest-900/70">{r.district ?? "—"}</td>
                  <td className="px-3 py-2">{fmtM(r.asking)}</td>
                  <td className="px-3 py-2">{fmtM(r.estimateMid)} <span className="text-forest-900/40">({fmtM(r.low)}–{fmtM(r.high)})</span></td>
                  <td className={cn("px-3 py-2 font-medium", VERDICT_CLS[r.verdict])}>
                    {r.deltaPct > 0 ? "+" : ""}{r.deltaPct}% · {VERDICT_LABEL[r.verdict]}
                  </td>
                  <td className="px-3 py-2 text-forest-900/50">
                    {r.confidence === "high" ? "выс." : r.confidence === "medium" ? "сред." : "низ."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows && shown.length === 0 && <p className="text-xs text-forest-900/50">Нет объектов под фильтр.</p>}
    </div>
  );
}

// ---- Точность: бэктест по реализованным сделкам ----

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-sm border border-forest-900/10 bg-white p-4">
      <p className="text-xs text-forest-900/50">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-forest-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-forest-900/45">{hint}</p>}
    </div>
  );
}

function AccuracyPanel() {
  const [res, setRes] = useState<BacktestResult | null>(null);
  const [pending, startTransition] = useTransition();
  const run = () => startTransition(async () => setRes(await backtestAccuracy()));

  return (
    <div className="space-y-4">
      <p className="text-xs text-forest-900/60">
        Бэктест «leave-one-out»: каждую реализованную сделку (компс sold/gone) оцениваем по всем остальным —
        сам объект исключён, без подглядывания в ответ — и сравниваем с фактической ценой. Превращает
        «проверяемую методологию» в число и показывает систематический сдвиг (что тюнить). В журнал не пишет.
      </p>
      <Button onClick={run} disabled={pending}>
        {pending ? "Считаем…" : res ? "Пересчитать" : "Прогнать бэктест"}
      </Button>

      {res && res.n === 0 && (
        <p className="rounded-sm border border-brass-500/20 bg-brass-500/5 p-4 text-sm text-forest-900/70">
          {res.caveat ?? "Нет данных для бэктеста."}
        </p>
      )}

      {res && res.n > 0 && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Средняя ошибка (MAPE)" value={`${res.mapePct}%`} hint={`медиана ${res.medianAbsPct}%`} />
            <Metric
              label="Систематический сдвиг"
              value={`${res.biasPct > 0 ? "+" : ""}${res.biasPct}%`}
              hint={res.biasPct > 3 ? "склонны завышать" : res.biasPct < -3 ? "склонны занижать" : "сдвига почти нет"}
            />
            <Metric label="В пределах ±10%" value={`${res.within10Pct}%`} hint={`сделок: ${res.n}`} />
            <Metric
              label="Покрытие полосой"
              value={`${res.bandCoveragePct}%`}
              hint={`средняя ±${res.avgBandPct}% · цель ~80%`}
            />
          </div>

          {res.caveat && (
            <p className="rounded-sm border border-brass-500/20 bg-brass-500/5 p-3 text-xs text-forest-900/70">
              ⚠ {res.caveat}
            </p>
          )}

          {res.bySegment.length > 1 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {res.bySegment.map((s) => (
                <span key={s.segment} className="rounded-sm border border-forest-900/10 bg-cream-50 px-2.5 py-1 text-forest-900/70">
                  {s.segment}: MAPE {s.mapePct}% · сдвиг {s.biasPct > 0 ? "+" : ""}{s.biasPct}% (n={s.n})
                </span>
              ))}
            </div>
          )}

          <div className="overflow-x-auto rounded-sm border border-forest-900/10 bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-forest-900/10 text-forest-900/50">
                  <th className="px-3 py-2 font-medium">Сделка</th>
                  <th className="px-3 py-2 font-medium">Тип</th>
                  <th className="px-3 py-2 font-medium">Район</th>
                  <th className="px-3 py-2 font-medium">Факт</th>
                  <th className="px-3 py-2 font-medium">Оценка</th>
                  <th className="px-3 py-2 font-medium">Ошибка</th>
                  <th className="px-3 py-2 font-medium">Полоса</th>
                  <th className="px-3 py-2 font-medium">Увер.</th>
                </tr>
              </thead>
              <tbody>
                {res.points.map((p) => (
                  <tr key={p.ref} className="border-b border-forest-900/5">
                    <td className="px-3 py-2 text-forest-900/60">{p.ref}</td>
                    <td className="px-3 py-2 text-forest-900">{p.type}</td>
                    <td className="px-3 py-2 text-forest-900/70">{p.district ?? "—"}</td>
                    <td className="px-3 py-2">{fmtM(p.actual)}</td>
                    <td className="px-3 py-2">{fmtM(p.predicted)}</td>
                    <td className={cn("px-3 py-2 font-medium tabular-nums", Math.abs(p.errorPct) <= 10 ? "text-forest-700" : Math.abs(p.errorPct) <= 20 ? "text-brass-700" : "text-red-700")}>
                      {p.errorPct > 0 ? "+" : ""}{p.errorPct}%
                    </td>
                    <td className={cn("px-3 py-2 tabular-nums", p.covered ? "text-forest-700" : "text-red-700")}>
                      ±{p.bandPct}% {p.covered ? "✓" : "✗"}
                    </td>
                    <td className="px-3 py-2">{CONFIDENCE_LABEL[p.confidence]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Полнота данных каталога ----

function CompletenessPanel() {
  const [rep, setRep] = useState<CompletenessReport | null>(null);
  const [pending, startTransition] = useTransition();
  const run = () => startTransition(async () => setRep(await catalogCompleteness()));

  const pct = (u: number, t: number) => (t ? Math.round((u / t) * 100) : 0);
  return (
    <div className="space-y-4">
      <p className="text-xs text-forest-900/60">
        Сколько каталога реально пригодно для оценки. Без цены/площади/района объект бесполезен как компс —
        движок его молча отбрасывает. Заполнить пропуски (интейк/правка) или архивировать пустые оболочки.
        Главное узкое место точности — полнота данных, не алгоритм.
      </p>
      <Button onClick={run} disabled={pending}>
        {pending ? "Считаю…" : rep ? "Пересчитать" : "Проверить полноту"}
      </Button>

      {rep && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric
              label="Земля: пригодно для оценки"
              value={`${rep.landUsable}/${rep.landTotal}`}
              hint={`${pct(rep.landUsable, rep.landTotal)}% · ${rep.landTotal - rep.landUsable} пустых оболочек`}
            />
            <Metric
              label="Вилла/дом: пригодно"
              value={`${rep.villaUsable}/${rep.villaTotal}`}
              hint={`${pct(rep.villaUsable, rep.villaTotal)}%`}
            />
          </div>

          <div className="rounded-sm border border-forest-900/10 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">Пропуски по полям</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {rep.fieldGaps.map((g) => {
                const p = pct(g.missing, g.total);
                return (
                  <span
                    key={`${g.scope}-${g.field}`}
                    className={cn("rounded-sm border px-2.5 py-1", p >= 50 ? "border-red-500/30 bg-red-500/5 text-red-700" : p >= 20 ? "border-brass-500/30 bg-brass-500/5 text-brass-700" : "border-forest-900/10 bg-cream-50 text-forest-900/60")}
                  >
                    {g.scope === "land" ? "🟫" : "🏠"} {g.field}: нет у {g.missing}/{g.total} ({p}%)
                  </span>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto rounded-sm border border-forest-900/10 bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-forest-900/10 text-forest-900/50">
                  <th className="px-3 py-2 font-medium">RW</th>
                  <th className="px-3 py-2 font-medium">Тип</th>
                  <th className="px-3 py-2 font-medium">Статус</th>
                  <th className="px-3 py-2 font-medium">🔴 Критично (нет компса)</th>
                  <th className="px-3 py-2 font-medium">🟡 Желательно</th>
                </tr>
              </thead>
              <tbody>
                {rep.incomplete.map((r) => (
                  <tr key={r.rwNumber} className="border-b border-forest-900/5">
                    <td className="px-3 py-2 text-forest-900">{r.rwNumber}{r.onSite ? " 🌐" : ""}</td>
                    <td className="px-3 py-2 text-forest-900/70">{r.type}</td>
                    <td className="px-3 py-2 text-forest-900/60">{r.status}</td>
                    <td className="px-3 py-2 text-red-700">{r.missing.join(", ")}</td>
                    <td className="px-3 py-2 text-forest-900/45">{r.weak.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rep.incomplete.length === 0 && <p className="text-xs text-forest-700">Все объекты заполнены — пробелов нет.</p>}
        </div>
      )}
    </div>
  );
}

// ---- Корневой компонент ----

type Tab = "estimate" | "catalog" | "accuracy" | "completeness" | "factors" | "comps" | "history";

export function ValuationTool({
  overrides,
  comps,
  history,
  llmEnabled = false,
}: {
  overrides: Array<{ key: string; value: number }>;
  comps: ExternalComp[];
  history: ValuationHistoryRow[];
  llmEnabled?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("estimate");
  const [v, setV] = useState<SubjectForm>(emptySubject);
  const [result, setResult] = useState<{ r: ValuationResult; s: ValuationSubject } | null>(null);
  const [pending, startTransition] = useTransition();

  const isLand = v.type === "Land" || v.type === "";
  const isBuilt = v.type === "Villa" || v.type === "House" || v.type === "Apartment";
  const isLease = v.tenure === "Leasehold";

  const run = () => {
    const subject = toSubject(v);
    startTransition(async () => {
      const r = await runValuation(subject);
      setResult({ r, s: subject });
    });
  };

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "estimate", label: "Оценка" },
    { key: "catalog", label: "Скан каталога" },
    { key: "accuracy", label: "Точность" },
    { key: "completeness", label: "Полнота данных" },
    { key: "factors", label: `Факторы${overrides.length ? ` (${overrides.length} изм.)` : ""}` },
    { key: "comps", label: `Компсы (${comps.length})` },
    { key: "history", label: "История" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm transition-colors",
              tab === t.key
                ? "bg-forest-500 text-cream-50"
                : "bg-cream-100 text-forest-900/70 hover:bg-cream-200",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "estimate" && (
        <div className="space-y-6">
          <div className="rounded-sm border border-forest-900/10 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Field label="Тип">
                <Select value={v.type} onChange={(x) => setV((p) => ({ ...p, type: x }))} options={["Land", "Villa", "House", "Apartment"]} placeholder="Land" />
              </Field>
              <Field label="Владение">
                <Select value={v.tenure} onChange={(x) => setV((p) => ({ ...p, tenure: x }))} options={["Freehold", "Leasehold"]} placeholder="Freehold" />
              </Field>
              <Field label="Район">
                <Select value={v.district} onChange={(x) => setV((p) => ({ ...p, district: x }))} options={DISTRICTS} />
              </Field>
              <Field label="Зона генплана">
                <Select value={v.zone} onChange={(x) => setV((p) => ({ ...p, zone: x }))} options={ZONES} />
              </Field>
              <Field label="Площадь участка, рай" hint="1 рай = 1600 м²">
                <Input value={v.areaRai} onChange={(e) => setV((p) => ({ ...p, areaRai: e.target.value }))} placeholder="1.25" />
              </Field>
              <Field label="Документ">
                <Select value={v.documentType} onChange={(x) => setV((p) => ({ ...p, documentType: x }))} options={DOCUMENT_TYPES} />
              </Field>
              <Field label="Дорога">
                <Select value={v.roadType} onChange={(x) => setV((p) => ({ ...p, roadType: x }))} options={ROAD_TYPES} />
              </Field>
              <Field label="Рельеф">
                <Select value={v.terrain} onChange={(x) => setV((p) => ({ ...p, terrain: x }))} options={TERRAIN_TYPES} />
              </Field>
              {isBuilt && (
                <>
                  <Field label="Спальни">
                    <Input value={v.bedrooms} onChange={(e) => setV((p) => ({ ...p, bedrooms: e.target.value }))} placeholder="3" />
                  </Field>
                  <Field label="Площадь постройки, м²">
                    <Input value={v.builtSqm} onChange={(e) => setV((p) => ({ ...p, builtSqm: e.target.value }))} placeholder="180" />
                  </Field>
                  <Field label="Состояние">
                    <Select value={v.condition} onChange={(x) => setV((p) => ({ ...p, condition: x }))} options={CONDITIONS} />
                  </Field>
                  <Field label="Год постройки">
                    <Input value={v.buildYear} onChange={(e) => setV((p) => ({ ...p, buildYear: e.target.value }))} placeholder="2021" />
                  </Field>
                </>
              )}
              {isLand && isLease && (
                <>
                  <Field label="Ставка, THB/рай/мес" hint="если уже названа продавцом">
                    <Input value={v.rentPerRaiMonth} onChange={(e) => setV((p) => ({ ...p, rentPerRaiMonth: e.target.value }))} placeholder="25 000" />
                  </Field>
                  <Field label="Срок lease, лет">
                    <Input value={v.leaseTermYears} onChange={(e) => setV((p) => ({ ...p, leaseTermYears: e.target.value }))} placeholder="30" />
                  </Field>
                  <Field label="Индексация, %">
                    <Input value={v.leaseEscPercent} onChange={(e) => setV((p) => ({ ...p, leaseEscPercent: e.target.value }))} placeholder="10" />
                  </Field>
                  <Field label="Период индексации, лет">
                    <Input value={v.leaseEscPeriodYears} onChange={(e) => setV((p) => ({ ...p, leaseEscPeriodYears: e.target.value }))} placeholder="5" />
                  </Field>
                </>
              )}
              <Field label="Запрошенная цена, THB" hint="опционально — для вердикта">
                <Input value={v.askingPrice} onChange={(e) => setV((p) => ({ ...p, askingPrice: e.target.value }))} placeholder="4 900 000" />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Toggle label="Вид на море" on={v.seaView} set={(x) => setV((p) => ({ ...p, seaView: x }))} />
              <Toggle label="Первая линия" on={v.beachfront} set={(x) => setV((p) => ({ ...p, beachfront: x }))} />
              <Toggle label="Вид на горы" on={v.mountainView} set={(x) => setV((p) => ({ ...p, mountainView: x }))} />
              <Toggle label="Электричество" on={v.electricity} set={(x) => setV((p) => ({ ...p, electricity: x }))} />
              {isBuilt && <Toggle label="Бассейн" on={v.pool} set={(x) => setV((p) => ({ ...p, pool: x }))} />}
              <Button onClick={run} disabled={pending} className="ml-auto" size="lg">
                {pending ? "Считаем…" : "Оценить"}
              </Button>
            </div>
          </div>
          {result && <ResultPanel r={result.r} subject={result.s} llmEnabled={llmEnabled} />}
        </div>
      )}

      {tab === "factors" && <FactorsEditor overrides={overrides} />}
      {tab === "comps" && <CompsPanel comps={comps} />}
      {tab === "catalog" && <CatalogScanPanel />}
      {tab === "accuracy" && <AccuracyPanel />}
      {tab === "completeness" && <CompletenessPanel />}
      {tab === "history" && <HistoryPanel rows={history} />}
    </div>
  );
}

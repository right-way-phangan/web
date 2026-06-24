"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  Pencil,
  Send,
  ExternalLink,
  Star,
  X,
  ChevronUp,
  ChevronDown,
  FileText,
  Sparkles,
  MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { createObject, type NewObjectState } from "@/lib/actions/new-object";
import { previewObjectTitle } from "@/lib/actions/title";
import { lookupZoneByLocation } from "@/lib/actions/zone-lookup";
import { InlineEstimate } from "@/components/admin/inline-estimate";
import { CoordPicker } from "./coord-picker";
import { polygonAreaSqm, formatAreaRu } from "@/lib/utils/geo";
import {
  DISTRICTS,
  DOCUMENT_TYPES,
  TENURE_TYPES,
  OBJECT_TYPES,
  ZONES,
  ROAD_TYPES,
  WATER_TYPES,
  INTERNET_TYPES,
  TERRAIN_TYPES,
  CONDITIONS,
  FEATURES,
  VILLA_FEATURES,
  STAGES,
  FURNISHINGS,
  STATUSES,
} from "@/lib/amocrm/dictionaries";

const initialState: NewObjectState = { status: "idle" };

// Pull lat/lng out of a Google Maps URL (or a bare "lat, lng" string). Mirrors
// what the server later derives for the catalog pin; used client-side by the
// zoning helper before the object is saved.
function parseLatLng(s: string): { lat: number; lng: number } | null {
  const m =
    s.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) ??
    s.match(/[?&](?:q|query|ll|center)=(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/) ??
    s.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/) ??
    s.match(/^\s*(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{1,3}\.\d+)\s*$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

// ---- Small field primitives ----

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-forest-500/50">{hint}</p> : null}
    </div>
  );
}

function Select({
  name,
  value,
  onChange,
  options,
  placeholder = "—",
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-11 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-4 py-2 text-sm text-forest-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:border-forest-500",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function CheckGroup({
  name,
  options,
  selected,
  onToggle,
}: {
  name: string;
  options: readonly { code: string; label: string }[] | readonly string[];
  selected: Set<string>;
  onToggle: (code: string) => void;
}) {
  const norm = options.map((o) => (typeof o === "string" ? { code: o, label: o } : o));
  return (
    <div className="flex flex-wrap gap-2">
      {norm.map(({ code, label }) => {
        const on = selected.has(code);
        return (
          <label
            key={code}
            className={cn(
              "cursor-pointer select-none rounded-sm border px-3 py-1.5 text-sm transition-colors",
              on
                ? "border-forest-500 bg-panel text-panel-fg"
                : "border-forest-500/20 bg-cream-50 text-forest-900 hover:border-forest-500/40",
            )}
          >
            <input
              type="checkbox"
              name={name}
              value={code}
              checked={on}
              onChange={() => onToggle(code)}
              className="sr-only"
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}

// ---- Form state ----

interface FormValues {
  type: string;
  district: string;
  documentType: string;
  tenure: Set<string>;
  area: string;
  pricePerRai: string;
  rentPerRaiMonth: string;
  rentPerMonth: string;
  leaseTermYears: string;
  leaseEscalation: string;
  leaseAddTerms: string;
  buildingRules: string;
  priceThb: string;
  // Контакт продавца (первый, обычно собственник) — структурно. Остальные
  // контакты и роли добавляются на карточке объекта после создания.
  contactRole: string;
  contactName: string;
  contactPhone: string;
  contactLine: string;
  contactWhatsapp: string;
  contactTelegram: string;
  commission: string;
  locationUrl: string;
  zone: string;
  roadType: string;
  waterType: string;
  internetType: string;
  terrain: string;
  features: Set<string>;
  bedrooms: string;
  bathrooms: string;
  buildYear: string;
  condition: string;
  villaFeatures: Set<string>;
  stage: string;
  developer: string;
  completion: string;
  paymentTerms: string;
  furnishing: string;
  netYieldPct: string;
  estNetIncomeYear: string;
  leasePrepayment: string;
  unitsTotal: string;
  unitsAvailable: string;
  videoUrls: string;
  floorplanUrls: string;
  priceStages: string;
  timeline: string;
  team: string;
  parentProjectRw: string;
  status: string;
  description: string;
  title: string;
}

const emptyValues: FormValues = {
  type: "",
  district: "",
  documentType: "",
  tenure: new Set(),
  area: "",
  pricePerRai: "",
  rentPerRaiMonth: "",
  rentPerMonth: "",
  leaseTermYears: "",
  leaseEscalation: "",
  leaseAddTerms: "",
  buildingRules: "",
  priceThb: "",
  contactRole: "owner",
  contactName: "",
  contactPhone: "",
  contactLine: "",
  contactWhatsapp: "",
  contactTelegram: "",
  commission: "",
  locationUrl: "",
  zone: "",
  roadType: "",
  waterType: "",
  internetType: "",
  terrain: "",
  features: new Set(),
  bedrooms: "",
  bathrooms: "",
  buildYear: "",
  condition: "",
  villaFeatures: new Set(),
  stage: "",
  developer: "",
  completion: "",
  paymentTerms: "",
  furnishing: "",
  netYieldPct: "",
  estNetIncomeYear: "",
  leasePrepayment: "",
  unitsTotal: "",
  unitsAvailable: "",
  videoUrls: "",
  floorplanUrls: "",
  priceStages: "",
  timeline: "",
  team: "",
  parentProjectRw: "",
  status: "",
  description: "",
  title: "",
};

function PublishButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      <Send /> {pending ? "Публикуем…" : "Опубликовать"}
    </Button>
  );
}

export function ObjectForm() {
  const [state, formAction] = useActionState(createObject, initialState);
  const [v, setV] = useState<FormValues>(emptyValues);
  const [stage, setStage] = useState<"edit" | "preview">("edit");
  // Photos managed as an ordered list so the user controls the cover (index 0)
  // and order. We sync the chosen order back into the native file input via a
  // DataTransfer, so the server action receives files in this exact order.
  const [genTitleLoading, setGenTitleLoading] = useState(false);
  const titleNonce = useRef(0);
  // Zoning auto-detect (colour of the DPT city-plan tile at the location).
  const [zoneLookup, setZoneLookup] = useState<{
    status: "idle" | "busy" | "done" | "error";
    label?: string;
    colorHex?: string;
    error?: string;
  }>({ status: "idle" });
  // Traced plot contour ([lat, lng] ring) from the map editor → hidden input.
  const [plotPoly, setPlotPoly] = useState<Array<[number, number]>>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  // Photos the user manually tagged as documents (tracked by File identity so the
  // flag survives reordering). On submit we send their current indices so the
  // server routes them to DOCS even before the vision classifier is enabled.
  const [docFlags, setDocFlags] = useState<Set<File>>(new Set());
  const [docNames, setDocNames] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Object URLs for thumbnails, derived from the current photo order.
  const previewUrls = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => {
    return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [previewUrls]);

  // Push the current order into the native <input type=file> so form submit
  // sends them in this order (browsers allow assigning input.files).
  const syncPhotoInput = (list: File[]) => {
    if (!photoInputRef.current) return;
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    photoInputRef.current.files = dt.files;
  };
  const applyPhotos = (list: File[]) => {
    setPhotos(list);
    syncPhotoInput(list);
  };

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: "tenure" | "features" | "villaFeatures", code: string) =>
    setV((prev) => {
      const next = new Set(prev[key]);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return { ...prev, [key]: next };
    });

  // Suggest the zone from the DPT city-plan colour at the pasted location.
  const detectZone = async () => {
    const coords = parseLatLng(v.locationUrl);
    if (!coords) {
      setZoneLookup({
        status: "error",
        error: "Сначала вставьте Google Maps URL с координатами в поле «Локация» ниже",
      });
      return;
    }
    setZoneLookup({ status: "busy" });
    try {
      const r = await lookupZoneByLocation(coords.lat, coords.lng);
      if (r.ok && r.zone) {
        set("zone", r.zone);
        setZoneLookup({ status: "done", label: r.label, colorHex: r.colorHex });
      } else {
        setZoneLookup({ status: "error", error: r.error ?? "Не удалось определить зону" });
      }
    } catch {
      setZoneLookup({ status: "error", error: "Не удалось определить зону" });
    }
  };

  // Ask the server to suggest a title from the current fields. Each click bumps
  // a nonce so repeated presses surface different phrasings. The result is
  // editable and submitted as-is; an empty title auto-generates on publish.
  const generateTitle = async () => {
    if (!v.type) return;
    setGenTitleLoading(true);
    try {
      titleNonce.current += 1;
      const t = await previewObjectTitle({
        type: v.type,
        district: v.district || undefined,
        area: v.area || undefined,
        bedrooms: v.bedrooms ? Number(v.bedrooms) : undefined,
        unitsTotal: v.unitsTotal ? Number(v.unitsTotal) : undefined,
        documentType: v.documentType || undefined,
        features: Array.from(v.features),
        villaFeatures: Array.from(v.villaFeatures),
        terrain: v.terrain || undefined,
        condition: v.condition || undefined,
        stage: v.stage || undefined,
        nonce: `${v.type}-${v.district}-${Date.now()}-${titleNonce.current}`,
      });
      if (t) set("title", t);
    } catch {
      /* leave the field as-is on failure */
    } finally {
      setGenTitleLoading(false);
    }
  };

  const isLand = v.type === "Land";
  const isProject = v.type === "Project";
  const isBuilding = v.type === "Villa" || v.type === "House" || v.type === "Project";

  // On success: reset everything back to a clean edit stage.
  useEffect(() => {
    if (state.status === "ok") {
      setStage("edit");
      setV(emptyValues);
      setPhotos([]);
      setDocFlags(new Set());
      setDocNames([]);
      formRef.current?.reset();
    }
  }, [state.status]);

  // Newly selected photos are appended, then ordered by a filename heuristic
  // (likely cover first, plans/drawings last). The user can still override the
  // cover with ★. Real content-based cover detection arrives with the AI layer.
  const onPhotosPicked = (files: FileList | null) => {
    if (!files?.length) return;
    const merged = orderPhotos([...photos, ...Array.from(files)], v.type);
    applyPhotos(merged);
  };
  const setCover = (i: number) => {
    if (i <= 0) return;
    const next = [...photos];
    const [f] = next.splice(i, 1);
    next.unshift(f);
    applyPhotos(next);
  };
  const movePhoto = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    applyPhotos(next);
  };
  const removePhoto = (i: number) => {
    const f = photos[i];
    if (f && docFlags.has(f)) {
      const next = new Set(docFlags);
      next.delete(f);
      setDocFlags(next);
    }
    applyPhotos(photos.filter((_, k) => k !== i));
  };
  // Mark/unmark a photo as a document (→ goes to DOCS, never published).
  const toggleDoc = (i: number) => {
    const f = photos[i];
    if (!f) return;
    const next = new Set(docFlags);
    if (next.has(f)) next.delete(f);
    else next.add(f);
    setDocFlags(next);
  };
  // Current indices of doc-flagged photos, in submit order — sent to the server.
  const docFlagIdx = useMemo(
    () => photos.map((f, i) => (docFlags.has(f) ? i : -1)).filter((i) => i >= 0),
    [photos, docFlags],
  );

  const onDocsPicked = (files: FileList | null) =>
    setDocNames(files ? Array.from(files).map((f) => f.name) : []);

  const canPreview = v.type !== "";

  const previewRows = useMemo(
    () => buildPreviewRows(v, photos.length - docFlagIdx.length, plotPoly),
    [v, photos.length, docFlagIdx.length, plotPoly],
  );

  if (state.status === "ok") {
    return (
      <div className="rounded-sm border border-forest-500/20 bg-cream-50 p-6">
        <div className="mb-3 flex items-center gap-2 text-forest-500">
          <CheckCircle2 /> <span className="font-medium">{state.message}</span>
        </div>
        <p className="text-sm text-forest-900/70">
          Опубликовано фото: {state.photoCount}
          {state.docCount > 0 ? ` · документов (не публичны): ${state.docCount}` : ""}. Карточка
          появится в каталоге сайта (статус Active) после ближайшего обновления кэша.
        </p>
        <a
          href={state.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-forest-500 underline-offset-4 hover:underline"
        >
          Открыть {state.rwNumber} в amoCRM <ExternalLink className="size-4" />
        </a>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      {/* ===== EDIT STAGE (kept mounted under preview so FormData stays intact) ===== */}
      <div className={cn("space-y-8", stage === "preview" && "hidden")}>
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
            Основное
          </h2>
          <div className="rounded-sm border border-dashed border-forest-500/20 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Юнит проекта (RW-P####)"
                hint="Заполни, чтобы карточка стала юнитом проекта: номер будет RW-P####-N"
              >
                <Input
                  name="parentProjectRw"
                  value={v.parentProjectRw}
                  onChange={(e) => set("parentProjectRw", e.target.value)}
                  placeholder="напр. RW-P0001"
                />
              </Field>
              <Field label="Статус" hint="Пусто = Active. Для проданных юнитов — Sold/Reserved">
                <Select
                  name="status"
                  value={v.status}
                  onChange={(x) => set("status", x)}
                  options={STATUSES}
                  placeholder="Active (по умолчанию)"
                />
              </Field>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Тип объекта *">
              <Select
                name="type"
                value={v.type}
                onChange={(x) => set("type", x)}
                options={OBJECT_TYPES}
                placeholder="Выберите тип"
              />
            </Field>
            <Field label="Район">
              <Select
                name="district"
                value={v.district}
                onChange={(x) => set("district", x)}
                options={DISTRICTS}
              />
            </Field>
            <Field label="Стадия" hint="Off-plan / строится / готов">
              <Select
                name="stage"
                value={v.stage}
                onChange={(x) => set("stage", x)}
                options={STAGES}
              />
            </Field>
            <Field label="Документ">
              <Select
                name="documentType"
                value={v.documentType}
                onChange={(x) => set("documentType", x)}
                options={DOCUMENT_TYPES}
              />
            </Field>
            <Field label="Площадь" hint="Свободный текст: «5 rai 2 ngan / 8400 m²»">
              <Input
                name="area"
                value={v.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="5 rai 2 ngan / 8400 m²"
              />
            </Field>
          </div>
          <Field label="Вид владения (можно несколько)">
            <CheckGroup
              name="tenure"
              options={TENURE_TYPES}
              selected={v.tenure}
              onToggle={(c) => toggle("tenure", c)}
            />
          </Field>
          <Field
            label="Название (EN) — SEO-заголовок для сайта"
            hint="Заполните поля выше, затем «Сгенерировать». Можно отредактировать вручную. Если оставить пустым — заголовок сгенерируется автоматически при публикации."
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  name="title"
                  value={v.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="напр. Sea-view 2-rai plot in Sri Thanu"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generateTitle}
                disabled={!v.type || genTitleLoading}
                className="shrink-0"
                title={!v.type ? "Сначала выберите тип объекта" : "Сгенерировать заголовок"}
              >
                <Sparkles /> {genTitleLoading ? "…" : "Сгенерировать"}
              </Button>
            </div>
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
            Цена / аренда
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Цена за рай, THB" hint="Freehold-земля">
              <Input
                name="pricePerRai"
                inputMode="numeric"
                value={v.pricePerRai}
                onChange={(e) => set("pricePerRai", e.target.value)}
                placeholder="напр. 3 000 000"
              />
            </Field>
            <Field label="Цена объекта, THB" hint="Вилла/дом или единый лот">
              <Input
                name="priceThb"
                inputMode="numeric"
                value={v.priceThb}
                onChange={(e) => set("priceThb", e.target.value)}
                placeholder="напр. 8 175 000"
              />
            </Field>
            <Field label="Аренда за рай / мес, THB" hint="Leasehold-земля">
              <Input
                name="rentPerRaiMonth"
                inputMode="numeric"
                value={v.rentPerRaiMonth}
                onChange={(e) => set("rentPerRaiMonth", e.target.value)}
              />
            </Field>
            <Field label="Аренда объекта / мес, THB" hint="Вилла/дом/кондо помесячно (вкладка «Аренда»)">
              <Input
                name="rentPerMonth"
                inputMode="numeric"
                value={v.rentPerMonth}
                onChange={(e) => set("rentPerMonth", e.target.value)}
                placeholder="напр. 80 000"
              />
            </Field>
            <Field label="Срок аренды, лет">
              <Input
                name="leaseTermYears"
                inputMode="numeric"
                value={v.leaseTermYears}
                onChange={(e) => set("leaseTermYears", e.target.value)}
              />
            </Field>
            <Field label="Предоплата за землю, THB" hint="Leasehold lump sum (напр. 1 200 000 за 30 лет)">
              <Input
                name="leasePrepayment"
                inputMode="numeric"
                value={v.leasePrepayment}
                onChange={(e) => set("leasePrepayment", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Индексация аренды" hint="Свободный текст: «8% каждые 5 лет»">
            <Input
              name="leaseEscalation"
              value={v.leaseEscalation}
              onChange={(e) => set("leaseEscalation", e.target.value)}
              placeholder="8% каждые 5 лет"
            />
          </Field>
          <Field label="Доп. условия аренды">
            <Textarea
              name="leaseAddTerms"
              value={v.leaseAddTerms}
              onChange={(e) => set("leaseAddTerms", e.target.value)}
            />
          </Field>
          <InlineEstimate
            values={{
              type: v.type,
              district: v.district,
              documentType: v.documentType,
              tenure: [...v.tenure],
              areaText: v.area,
              pricePerRai: v.pricePerRai,
              priceThb: v.priceThb,
              rentPerRaiMonth: v.rentPerRaiMonth,
              leaseTermYears: v.leaseTermYears,
              leaseEscalationText: v.leaseEscalation,
              zone: v.zone,
              roadType: v.roadType,
              terrain: v.terrain,
              features: [...v.features],
              villaFeatures: [...v.villaFeatures],
              bedrooms: v.bedrooms,
              buildYear: v.buildYear,
              condition: v.condition,
            }}
          />
        </section>

        {isLand ? (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
              Земля
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Зона"
                hint="Цвет ผังเมือง по тайлу DPT — ориентир; перед публикацией сверяйте на landsmaps."
              >
                <Select name="zone" value={v.zone} onChange={(x) => set("zone", x)} options={ZONES} />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={detectZone}
                    disabled={zoneLookup.status === "busy"}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-forest-500/20 px-2.5 py-1.5 text-xs font-medium text-forest-900 transition-colors hover:bg-cream-100 disabled:opacity-50"
                  >
                    <MapPinned size={14} aria-hidden />
                    {zoneLookup.status === "busy" ? "Определяем…" : "Определить по локации"}
                  </button>
                  {zoneLookup.status === "done" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-forest-900">
                      <i
                        className="inline-block h-3 w-3 shrink-0 rounded-[2px] border border-black/10"
                        style={{ background: zoneLookup.colorHex }}
                        aria-hidden
                      />
                      {zoneLookup.label}
                    </span>
                  ) : null}
                  {zoneLookup.status === "error" ? (
                    <span className="text-xs text-red-700">{zoneLookup.error}</span>
                  ) : null}
                  {(() => {
                    const c = parseLatLng(v.locationUrl);
                    return c ? (
                      <>
                        <a
                          href={`https://map.longdo.com/main/?lat=${c.lat}&long=${c.lng}&zoom=18`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-forest-500 underline-offset-2 hover:underline"
                        >
                          Longdo (кадастр) ↗
                        </a>
                        <a
                          href="https://landsmaps.dol.go.th/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-forest-500 underline-offset-2 hover:underline"
                        >
                          landsmaps ↗
                        </a>
                      </>
                    ) : null;
                  })()}
                </div>
              </Field>
              <Field label="Рельеф">
                <Select
                  name="terrain"
                  value={v.terrain}
                  onChange={(x) => set("terrain", x)}
                  options={TERRAIN_TYPES}
                />
              </Field>
            </div>
            <Field label="Правила застройки">
              <Textarea
                name="buildingRules"
                value={v.buildingRules}
                onChange={(e) => set("buildingRules", e.target.value)}
              />
            </Field>
          </section>
        ) : null}

        {isBuilding ? (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
              Здание
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Спальни">
                <Input
                  name="bedrooms"
                  inputMode="numeric"
                  value={v.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                />
              </Field>
              <Field label="Санузлы">
                <Input
                  name="bathrooms"
                  inputMode="numeric"
                  value={v.bathrooms}
                  onChange={(e) => set("bathrooms", e.target.value)}
                />
              </Field>
              <Field label="Год постройки">
                <Input
                  name="buildYear"
                  inputMode="numeric"
                  value={v.buildYear}
                  onChange={(e) => set("buildYear", e.target.value)}
                />
              </Field>
              <Field label="Состояние">
                <Select
                  name="condition"
                  value={v.condition}
                  onChange={(x) => set("condition", x)}
                  options={CONDITIONS}
                />
              </Field>
            </div>
            <Field label="Особенности здания">
              <CheckGroup
                name="villaFeatures"
                options={VILLA_FEATURES}
                selected={v.villaFeatures}
                onToggle={(c) => toggle("villaFeatures", c)}
              />
            </Field>
          </section>
        ) : null}

        {isProject || v.stage === "Off-plan" || v.stage === "Under construction" ? (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
              Проект / застройщик (off-plan)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Застройщик">
                <Input
                  name="developer"
                  value={v.developer}
                  onChange={(e) => set("developer", e.target.value)}
                />
              </Field>
              <Field label="Срок сдачи" hint="«Q4 2026» / «~8 мес от старта»">
                <Input
                  name="completion"
                  value={v.completion}
                  onChange={(e) => set("completion", e.target.value)}
                />
              </Field>
              <Field label="Юнитов в проекте">
                <Input
                  name="unitsTotal"
                  inputMode="numeric"
                  value={v.unitsTotal}
                  onChange={(e) => set("unitsTotal", e.target.value)}
                />
              </Field>
              <Field label="Доступно сейчас">
                <Input
                  name="unitsAvailable"
                  inputMode="numeric"
                  value={v.unitsAvailable}
                  onChange={(e) => set("unitsAvailable", e.target.value)}
                />
              </Field>
              <Field label="Меблировка">
                <Select
                  name="furnishing"
                  value={v.furnishing}
                  onChange={(x) => set("furnishing", x)}
                  options={FURNISHINGS}
                />
              </Field>
              <Field label="Чистая доходность, %" hint="Projected net yield">
                <Input
                  name="netYieldPct"
                  inputMode="decimal"
                  value={v.netYieldPct}
                  onChange={(e) => set("netYieldPct", e.target.value)}
                  placeholder="напр. 15"
                />
              </Field>
              <Field label="Чистый доход / год, THB" hint="Est. annual net income">
                <Input
                  name="estNetIncomeYear"
                  inputMode="numeric"
                  value={v.estNetIncomeYear}
                  onChange={(e) => set("estNetIncomeYear", e.target.value)}
                  placeholder="напр. 734 000"
                />
              </Field>
            </div>
            <Field
              label="График платежей / условия"
              hint="Рассрочка, депозит, привязка к этапам стройки"
            >
              <Textarea
                name="paymentTerms"
                value={v.paymentTerms}
                onChange={(e) => set("paymentTerms", e.target.value)}
              />
            </Field>

            <div className="rounded-sm border border-dashed border-forest-500/20 p-4 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brass-500">
                Лендинг проекта (необязательно)
              </p>
              <Field label="Видео / туры" hint="По одной ссылке на строку — YouTube, Vimeo, mp4">
                <Textarea
                  name="videoUrls"
                  value={v.videoUrls}
                  onChange={(e) => set("videoUrls", e.target.value)}
                  placeholder={"https://youtu.be/...\nhttps://vimeo.com/..."}
                />
              </Field>
              <Field label="Планировки / мастерплан" hint="По одной ссылке на картинку на строку">
                <Textarea
                  name="floorplanUrls"
                  value={v.floorplanUrls}
                  onChange={(e) => set("floorplanUrls", e.target.value)}
                  placeholder={"https://.../floorplan-1.jpg\nhttps://.../masterplan.png"}
                />
              </Field>
              <Field label="Лестница цен по готовности" hint="Строка: «этап | цена». Первая = текущая">
                <Textarea
                  name="priceStages"
                  value={v.priceStages}
                  onChange={(e) => set("priceStages", e.target.value)}
                  placeholder={"Off-plan | 4 490 000\nСтарт стройки | 4 690 000\nГотовность 50% | 5 290 000\n100% | 5 690 000"}
                />
              </Field>
              <Field label="Этапы строительства" hint="Строка: «дата | событие»">
                <Textarea
                  name="timeline"
                  value={v.timeline}
                  onChange={(e) => set("timeline", e.target.value)}
                  placeholder={"Май 2026 | Старт стройки\nДек 2026 | Первая вилла\nОкт 2027 | Сдача проекта"}
                />
              </Field>
              <Field label="Команда застройщика" hint="Строка: «роль | имя/компания»">
                <Textarea
                  name="team"
                  value={v.team}
                  onChange={(e) => set("team", e.target.value)}
                  placeholder={"Генподрядчик | First Construction\nАрхбюро | Nine Develop & Design\nГарантия | 5 лет на конструкцию"}
                />
              </Field>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
            Инфраструктура и фичи
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Дорога">
              <Select
                name="roadType"
                value={v.roadType}
                onChange={(x) => set("roadType", x)}
                options={ROAD_TYPES}
              />
            </Field>
            <Field label="Вода">
              <Select
                name="waterType"
                value={v.waterType}
                onChange={(x) => set("waterType", x)}
                options={WATER_TYPES}
              />
            </Field>
            <Field label="Интернет">
              <Select
                name="internetType"
                value={v.internetType}
                onChange={(x) => set("internetType", x)}
                options={INTERNET_TYPES}
              />
            </Field>
          </div>
          <Field label="Особенности / виды">
            <CheckGroup
              name="features"
              options={FEATURES}
              selected={v.features}
              onToggle={(c) => toggle("features", c)}
            />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
            Контакты, локация, медиа
          </h2>
          <div className="space-y-3 rounded-sm border border-forest-500/15 bg-cream-50/40 p-4">
            <p className="text-sm font-medium text-forest-900">
              Контакт продавца{" "}
              <span className="font-normal text-forest-500/60">
                — с кем связываться (на сайт не попадает)
              </span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Имя">
                <Input
                  name="contactName"
                  value={v.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  placeholder="Имя собственника / посредника"
                />
              </Field>
              <Field label="Роль">
                <select
                  name="contactRole"
                  value={v.contactRole}
                  onChange={(e) => set("contactRole", e.target.value)}
                  className="flex h-11 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-4 py-2 text-sm text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:border-forest-500"
                >
                  <option value="owner">Собственник</option>
                  <option value="broker">Посредник / брокер</option>
                  <option value="caretaker">Смотритель / ключи</option>
                  <option value="lawyer">Юрист</option>
                  <option value="other">Другое</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Телефон">
                <Input
                  name="contactPhone"
                  value={v.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  placeholder="+66…"
                />
              </Field>
              <Field label="LINE">
                <Input
                  name="contactLine"
                  value={v.contactLine}
                  onChange={(e) => set("contactLine", e.target.value)}
                  placeholder="LINE ID"
                />
              </Field>
              <Field label="WhatsApp">
                <Input
                  name="contactWhatsapp"
                  value={v.contactWhatsapp}
                  onChange={(e) => set("contactWhatsapp", e.target.value)}
                  placeholder="WhatsApp"
                />
              </Field>
              <Field label="Telegram">
                <Input
                  name="contactTelegram"
                  value={v.contactTelegram}
                  onChange={(e) => set("contactTelegram", e.target.value)}
                  placeholder="@username"
                />
              </Field>
            </div>
            <p className="text-xs text-forest-500/50">
              Это первый контакт по объекту. Остальные (посредник, смотритель, юрист) и правки —
              на карточке объекта после создания.
            </p>
          </div>
          <Field label="Комиссия">
            <Input
              name="commission"
              value={v.commission}
              onChange={(e) => set("commission", e.target.value)}
            />
          </Field>
          <Field label="Локация (Google Maps URL)" hint="Или поставьте пин на карте ниже — URL заполнится сам.">
            <Input
              name="locationUrl"
              value={v.locationUrl}
              onChange={(e) => set("locationUrl", e.target.value)}
              placeholder="https://maps.google.com/?q=9.73,100.0"
            />
          </Field>
          <CoordPicker
            pin={parseLatLng(v.locationUrl)}
            polygon={plotPoly}
            onPin={(lat, lng) =>
              set("locationUrl", `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`)
            }
            onPolygon={setPlotPoly}
          />
          {/* Traced contour rides along as JSON; server validates and stores it. */}
          <input
            type="hidden"
            name="plotPolygon"
            value={plotPoly.length >= 3 ? JSON.stringify(plotPoly.map(([a, b]) => [Number(a.toFixed(6)), Number(b.toFixed(6))])) : ""}
          />
          <Field
            label="Фото (публикуются)"
            hint={
              isLand
                ? "Обложка (★) — вид облёта/аэро, если есть. Только изображения; документы не публикуются."
                : "Обложка (★) — общий вид виллы/дома. Только изображения; документы не публикуются."
            }
          >
            <input
              ref={photoInputRef}
              type="file"
              name="photos"
              accept="image/*"
              multiple
              onChange={(e) => onPhotosPicked(e.target.files)}
              className="block w-full text-sm text-forest-900 file:mr-3 file:rounded-sm file:border-0 file:bg-panel file:px-4 file:py-2 file:text-panel-fg hover:file:bg-forest-400"
            />
            {/* Indices the user marked as documents → server routes them to DOCS. */}
            <input type="hidden" name="photoDocFlags" value={docFlagIdx.join(",")} />
          </Field>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((f, i) => {
                const flagged = docFlags.has(f);
                return (
                <div
                  key={`${f.name}-${i}`}
                  className="group relative overflow-hidden rounded-sm border border-forest-500/15"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrls[i]}
                    alt=""
                    className={cn(
                      "h-28 w-full object-cover",
                      flagged && "opacity-40 grayscale",
                    )}
                  />
                  {flagged ? (
                    <span className="absolute left-1 top-1 rounded-sm bg-panel/80 px-1.5 py-0.5 text-[10px] font-medium text-panel-fg">
                      Документ
                    </span>
                  ) : i === 0 ? (
                    <span className="absolute left-1 top-1 rounded-sm bg-brass-500 px-1.5 py-0.5 text-[10px] font-medium text-panel-fg">
                      Обложка
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-panel/70 px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      title={flagged ? "Это фото (публиковать)" : "Это документ (не публиковать)"}
                      onClick={() => toggleDoc(i)}
                      className={cn(
                        "text-panel-fg hover:text-brass-400",
                        flagged && "text-brass-400",
                      )}
                    >
                      <FileText className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Сделать обложкой"
                      onClick={() => setCover(i)}
                      className="text-panel-fg hover:text-brass-400"
                    >
                      <Star className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Левее"
                      onClick={() => movePhoto(i, -1)}
                      className="text-panel-fg hover:text-brass-400"
                    >
                      <ChevronUp className="size-4 -rotate-90" />
                    </button>
                    <button
                      type="button"
                      title="Правее"
                      onClick={() => movePhoto(i, 1)}
                      className="text-panel-fg hover:text-brass-400"
                    >
                      <ChevronDown className="size-4 -rotate-90" />
                    </button>
                    <button
                      type="button"
                      title="Убрать"
                      onClick={() => removePhoto(i)}
                      className="text-panel-fg hover:text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : null}
          <Field
            label="Документы / рабочие файлы (НЕ публикуются)"
            hint="PDF, презентации, договоры, чертежи и т.п. Хранятся на карточке, на сайт не идут."
          >
            <input
              type="file"
              name="docs"
              multiple
              onChange={(e) => onDocsPicked(e.target.files)}
              className="block w-full text-sm text-forest-900 file:mr-3 file:rounded-sm file:border-0 file:bg-forest-500/70 file:px-4 file:py-2 file:text-panel-fg hover:file:bg-panel"
            />
          </Field>
          {docNames.length > 0 ? (
            <ul className="space-y-1">
              {docNames.map((n, i) => (
                <li key={`${n}-${i}`} className="flex items-center gap-2 text-xs text-forest-900/70">
                  <FileText className="size-3.5 shrink-0 text-forest-500/60" /> {n}
                </li>
              ))}
            </ul>
          ) : null}
          <Field label="Описание / свободный текст" hint="Идёт в Description карточки">
            <Textarea
              name="description"
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              className="min-h-[140px]"
            />
          </Field>
        </section>
      </div>

      {/* ===== PREVIEW STAGE ===== */}
      {stage === "preview" ? (
        <div className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-500/60">
            Предпросмотр карточки
          </h2>
          <div className="rounded-sm border border-forest-500/20 bg-cream-50 p-5">
            <p className="mb-1 text-xs text-forest-500/50">
              RW-номер присвоится автоматически при публикации (следующий в серии типа).
            </p>
            <h3 className="mb-1 text-lg font-semibold text-forest-900">
              {v.title || (
                <span className="font-normal italic text-forest-500/50">
                  Заголовок сгенерируется при публикации (поле «Название» пустое)
                </span>
              )}
            </h3>
            <p className="mb-4 text-sm text-forest-500/60">
              {v.type || "—"}
              {v.district ? ` · ${v.district}` : ""}
            </p>
            {previewUrls.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {previewUrls.map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={u} src={u} alt="" className="h-24 w-24 rounded-sm object-cover" />
                ))}
              </div>
            ) : null}
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {previewRows.map(([k, val]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-forest-500/10 py-1">
                  <dt className="text-sm text-forest-500/60">{k}</dt>
                  <dd className="text-right text-sm text-forest-900">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {state.message}
        </div>
      ) : null}

      {/* ===== Actions ===== */}
      <div className="flex flex-wrap items-center gap-3">
        {stage === "edit" ? (
          <Button
            type="button"
            size="lg"
            onClick={() => canPreview && setStage("preview")}
            disabled={!canPreview}
          >
            <Eye /> Предпросмотр
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" size="lg" onClick={() => setStage("edit")}>
              <Pencil /> Править
            </Button>
            <PublishButton />
          </>
        )}
        {!canPreview ? (
          <span className="text-xs text-forest-500/50">Сначала выберите тип объекта</span>
        ) : null}
      </div>
    </form>
  );
}

// Filename heuristic for a default photo order: likely cover first, plans /
// drawings / aerials last (for buildings) — for Land the aerial goes first.
// Stable within each bucket. Content-based detection comes with the AI layer;
// the user can always override the cover with ★.
function orderPhotos(files: File[], type: string): File[] {
  const AERIAL = /(aerial|drone|облет|обл[её]т|aero|birds?-?eye|сверху|план\s*участка)/i;
  const PLAN = /(plan|floor|layout|генплан|план|чертеж|чертёж|drawing|scheme|схема|2d|3d)/i;
  const EXTERIOR = /(exterior|facade|fasad|общий|фасад|вид|outside|front|house|villa|вилла)/i;
  const weight = (name: string): number => {
    const isLand = type === "Land";
    if (AERIAL.test(name)) return isLand ? 0 : 3; // aerial = cover for land
    if (PLAN.test(name)) return 4; // plans/drawings → back
    if (EXTERIOR.test(name)) return 1; // exterior = cover for buildings
    return 2;
  };
  return files
    .map((f, i) => ({ f, i, w: weight(f.name) }))
    .sort((a, b) => a.w - b.w || a.i - b.i)
    .map((x) => x.f);
}

const CONTACT_ROLE_LABEL: Record<string, string> = {
  owner: "Собственник",
  broker: "Посредник",
  caretaker: "Смотритель",
  lawyer: "Юрист",
  other: "Контакт",
};

// Build a readable label/value list for the preview from the current form values.
function buildPreviewRows(
  v: FormValues,
  photoCount: number,
  plotPoly: Array<[number, number]> = [],
): [string, string][] {
  const rows: [string, string][] = [];
  const push = (k: string, val: string | undefined) => {
    if (val && val.trim()) rows.push([k, val.trim()]);
  };
  push("Стадия", v.stage);
  push("Документ", v.documentType);
  push("Владение", Array.from(v.tenure).join(", "));
  push("Площадь", v.area);
  push("Цена за рай", v.pricePerRai);
  push("Цена объекта", v.priceThb);
  push("Предоплата земли", v.leasePrepayment);
  push("Аренда/рай/мес", v.rentPerRaiMonth);
  push("Аренда объекта/мес", v.rentPerMonth);
  push("Срок аренды", v.leaseTermYears ? `${v.leaseTermYears} лет` : undefined);
  push("Индексация", v.leaseEscalation);
  if (v.type === "Project" || v.stage === "Off-plan" || v.stage === "Under construction") {
    push("Застройщик", v.developer);
    push("Срок сдачи", v.completion);
    push("Юнитов", v.unitsTotal);
    push("Доступно", v.unitsAvailable);
    push("Меблировка", v.furnishing);
    push("Доходность", v.netYieldPct ? `${v.netYieldPct}%` : undefined);
    push("Чистый доход/год", v.estNetIncomeYear);
    push("График платежей", v.paymentTerms);
  }
  if (v.type === "Villa" || v.type === "House" || v.type === "Project") {
    push("Спальни", v.bedrooms);
    push("Санузлы", v.bathrooms);
    push("Год", v.buildYear);
    push("Состояние", v.condition);
    push("Здание", Array.from(v.villaFeatures).join(", "));
  }
  if (v.type === "Land") {
    push("Зона", v.zone);
    push("Рельеф", v.terrain);
  }
  push("Особенности", Array.from(v.features).join(", "));
  push("Дорога", v.roadType);
  push("Вода", v.waterType);
  push("Интернет", v.internetType);
  const contactSummary = [
    v.contactName,
    v.contactPhone,
    v.contactLine ? `LINE ${v.contactLine}` : "",
    v.contactWhatsapp ? `WA ${v.contactWhatsapp}` : "",
    v.contactTelegram ? `TG ${v.contactTelegram}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  push(CONTACT_ROLE_LABEL[v.contactRole] ?? "Контакт", contactSummary);
  push("Комиссия", v.commission);
  push("Локация", v.locationUrl);
  if (plotPoly.length >= 3)
    push("Контур участка", `${plotPoly.length} точек · ${formatAreaRu(polygonAreaSqm(plotPoly))}`);
  if (photoCount > 0) push("Фото", `${photoCount} шт.`);
  push("Описание", v.description);
  return rows;
}

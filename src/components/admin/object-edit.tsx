"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateObjectAction,
  regenerateDescriptionAction,
  type ObjectPatch,
} from "@/lib/actions/update-object";
import { addObjectPhotosAction } from "@/lib/actions/object-photos";
import { CoordPicker } from "@/components/forms/coord-picker";
import { parseLatLngText } from "@/lib/utils/geo";

const STATUSES = ["Active", "Reserved", "Hold", "Sold", "Withdrawn"] as const;

/** Minimal object shape the editor needs (passed from the server table). */
export interface EditableObject {
  rwNumber: string;
  type: string;
  status: string;
  titleEn?: string | null;
  district?: string | null;
  priceThb?: number | null;
  pricePerRai?: number | null;
  rentPerRaiMonth?: number | null;
  rentPerMonth?: number | null;
  leaseTermYears?: number | null;
  unitsAvailable?: number | null;
  locationUrl?: string | null;
  plotPolygon?: Array<[number, number]> | null;
  descriptionManualEn?: string | null;
  descriptionManualRu?: string | null;
}

function numOrNull(v: string): number | null {
  const s = v.trim().replace(/[\s,]/g, "");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Pencil button on a table row that opens a modal to edit whitelisted fields. */
export function ObjectEditButton({ object }: { object: EditableObject }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Photo upload state.
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPending, startPhotos] = useTransition();
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  // Папка → живой объект одним действием: залить фото и сразу опубликовать.
  const [publishAfter, setPublishAfter] = useState(false);

  function uploadPhotos() {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;
    setPhotoMsg(null);
    // Шлём по одному файлу за раз: тело Server Action ограничено (дефолт Next
    // ~1МБ, потолок платформы Vercel — 4.5МБ), и пачка тяжёлых рендеров его
    // превышает — запрос падает ещё до загрузки. Сортируем по имени, чтобы
    // обложка `01_…` ушла первой и на пустом объекте стала cover.
    const list = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
    startPhotos(async () => {
      let added = 0;
      let coverSet = false;
      for (let i = 0; i < list.length; i++) {
        setPhotoMsg(`Загружаю ${i + 1} из ${list.length}…`);
        const fd = new FormData();
        fd.set("rwNumber", object.rwNumber);
        fd.append("photos", list[i]);
        const res = await addObjectPhotosAction(fd);
        if (!res.ok) {
          setPhotoMsg(
            `Загружено ${added} из ${list.length}. Сбой на «${list[i].name}»: ${res.error ?? "не удалось"}`,
          );
          router.refresh();
          return;
        }
        added += res.added;
        if (res.coverSet) coverSet = true;
      }
      if (publishAfter && status !== "Active") {
        setPhotoMsg(`Загружено ${added}. Публикую…`);
        const pub = await updateObjectAction(object.rwNumber, { status: "Active" });
        if (pub.ok) {
          setStatus("Active");
          setPhotoMsg(`Загружено фото: ${added}. Объект опубликован (Active).`);
        } else {
          setPhotoMsg(`Загружено фото: ${added}, но публикация не удалась: ${pub.error ?? ""}`);
        }
      } else {
        setPhotoMsg(
          `Загружено фото: ${added}.` +
            (coverSet ? " Обложка задана — объект теперь на сайте." : ""),
        );
      }
      if (fileRef.current) fileRef.current.value = "";
      setFileCount(0);
      router.refresh();
    });
  }

  const isLand = object.type === "Land";
  const isProject = object.type === "Project";

  // Local form state, seeded from the object.
  const [status, setStatus] = useState(object.status);
  const [titleEn, setTitleEn] = useState(object.titleEn ?? "");
  const [district, setDistrict] = useState(object.district ?? "");
  const [priceThb, setPriceThb] = useState(object.priceThb?.toString() ?? "");
  const [pricePerRai, setPricePerRai] = useState(object.pricePerRai?.toString() ?? "");
  const [rentPerRaiMonth, setRentPerRaiMonth] = useState(
    object.rentPerRaiMonth?.toString() ?? "",
  );
  const [rentPerMonth, setRentPerMonth] = useState(
    object.rentPerMonth?.toString() ?? "",
  );
  const [leaseTermYears, setLeaseTermYears] = useState(
    object.leaseTermYears?.toString() ?? "",
  );
  const [unitsAvailable, setUnitsAvailable] = useState(
    object.unitsAvailable?.toString() ?? "",
  );
  const [locationUrl, setLocationUrl] = useState(object.locationUrl ?? "");
  const [plotPoly, setPlotPoly] = useState<Array<[number, number]>>(object.plotPolygon ?? []);
  const [descEn, setDescEn] = useState(object.descriptionManualEn ?? "");
  const [descRu, setDescRu] = useState(object.descriptionManualRu ?? "");
  const [descGen, setDescGen] = useState(false);
  const [descMsg, setDescMsg] = useState<string | null>(null);

  function regenDesc() {
    setDescMsg(null);
    setDescGen(true);
    regenerateDescriptionAction(object.rwNumber).then((r) => {
      setDescGen(false);
      if (r.ok) {
        setDescEn(r.en ?? "");
        setDescRu(r.ru ?? "");
        setDescMsg("Черновик сгенерирован — проверьте и сохраните.");
      } else {
        setDescMsg(r.error ?? "Ошибка генерации.");
      }
    });
  }

  function save() {
    setError(null);
    const patch: ObjectPatch = {
      status,
      titleEn: titleEn.trim(),
      district: district.trim(),
      locationUrl: locationUrl.trim(),
      plotPolygon: plotPoly.length >= 3 ? plotPoly : null,
    };
    if (isLand) {
      patch.pricePerRai = numOrNull(pricePerRai);
      patch.rentPerRaiMonth = numOrNull(rentPerRaiMonth);
      patch.leaseTermYears = numOrNull(leaseTermYears);
    } else {
      patch.priceThb = numOrNull(priceThb);
      patch.rentPerMonth = numOrNull(rentPerMonth);
    }
    if (isProject) patch.unitsAvailable = numOrNull(unitsAvailable);
    patch.descriptionManualEn = descEn.trim() || null;
    patch.descriptionManualRu = descRu.trim() || null;

    start(async () => {
      const res = await updateObjectAction(object.rwNumber, patch);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Не удалось сохранить.");
      }
    });
  }

  const field =
    "w-full rounded-md border border-forest-900/15 bg-cream-50 px-2.5 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500";
  const labelCls = "block text-xs font-medium text-forest-900/55";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Редактировать"
        className="rounded-md px-2 py-1 text-xs font-medium text-forest-900/55 hover:bg-forest-900/10 hover:text-forest-900"
      >
        ✎
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-panel/40 p-4 backdrop-blur-sm"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="mt-12 w-full max-w-lg rounded-2xl bg-cream-50 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-forest-900">
                Правка{" "}
                <span className="font-mono text-sm text-brass-600">{object.rwNumber}</span>
              </h2>
              <span className="text-xs text-forest-900/50">{object.type}</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className={labelCls}>Статус</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={field}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className={labelCls}>Район</span>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={field}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className={labelCls}>Название (EN)</span>
                <input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className={field}
                />
              </label>

              {isLand ? (
                <div className="grid grid-cols-3 gap-3">
                  <label className="space-y-1">
                    <span className={labelCls}>฿ / rai (freehold)</span>
                    <input
                      inputMode="numeric"
                      value={pricePerRai}
                      onChange={(e) => setPricePerRai(e.target.value)}
                      className={field}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>฿ / rai·мес (lease)</span>
                    <input
                      inputMode="numeric"
                      value={rentPerRaiMonth}
                      onChange={(e) => setRentPerRaiMonth(e.target.value)}
                      className={field}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>Срок lease, лет</span>
                    <input
                      inputMode="numeric"
                      value={leaseTermYears}
                      onChange={(e) => setLeaseTermYears(e.target.value)}
                      className={field}
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className={labelCls}>Цена, ฿</span>
                    <input
                      inputMode="numeric"
                      value={priceThb}
                      onChange={(e) => setPriceThb(e.target.value)}
                      className={field}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelCls}>฿ / мес (аренда)</span>
                    <input
                      inputMode="numeric"
                      value={rentPerMonth}
                      onChange={(e) => setRentPerMonth(e.target.value)}
                      className={field}
                    />
                  </label>
                  {isProject && (
                    <label className="space-y-1">
                      <span className={labelCls}>Юнитов в продаже</span>
                      <input
                        inputMode="numeric"
                        value={unitsAvailable}
                        onChange={(e) => setUnitsAvailable(e.target.value)}
                        className={field}
                      />
                    </label>
                  )}
                </div>
              )}

              <label className="block space-y-1">
                <span className={labelCls}>Google Maps URL</span>
                <input
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://maps.google.com/…"
                  className={field}
                />
              </label>

              {/* Pin + plot contour over the cadastral layer; saves with the form. */}
              <CoordPicker
                pin={parseLatLngText(locationUrl)}
                polygon={plotPoly}
                onPin={(la, ln) =>
                  setLocationUrl(`https://maps.google.com/?q=${la.toFixed(6)},${ln.toFixed(6)}`)
                }
                onPolygon={setPlotPoly}
              />
            </div>

            {/* Photo upload — closes the photo-less → live loop */}
            <div className="mt-4 rounded-xl border border-forest-900/10 bg-cream-50/60 p-3">
              <p className="text-xs font-medium text-forest-900/55">
                Добавить фото {object.type === "Land" ? "(аэро на обложку)" : "(экстерьер на обложку)"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
                  className="text-xs text-forest-900/70 file:mr-2 file:rounded-full file:border-0 file:bg-forest-900/5 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-forest-900/70 hover:file:bg-forest-900/10"
                />
                <button
                  type="button"
                  disabled={photoPending || fileCount === 0}
                  onClick={uploadPhotos}
                  className="rounded-full bg-brass-600 px-3 py-1.5 text-xs font-medium text-panel-fg hover:bg-brass-600/90 disabled:opacity-40"
                >
                  {photoPending ? "Загружаю…" : fileCount > 0 ? `Загрузить ${fileCount}` : "Загрузить"}
                </button>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-forest-900/60">
                <input
                  type="checkbox"
                  checked={publishAfter}
                  onChange={(e) => setPublishAfter(e.target.checked)}
                  disabled={photoPending}
                  className="accent-brass-600"
                />
                …и сразу опубликовать (Active) после загрузки
              </label>
              {photoMsg && <p className="mt-2 text-xs text-emerald-700">{photoMsg}</p>}
            </div>

            {/* Ручное описание (override). Пусто → на сайте авто-описание.
                Кнопка собирает черновик (Claude при ключе, иначе шаблон). */}
            <div className="mt-4 rounded-xl border border-forest-900/10 bg-cream-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-forest-900/55">
                  Описание (override) — пусто = авто на сайте
                </p>
                <button
                  type="button"
                  disabled={descGen}
                  onClick={regenDesc}
                  className="rounded-full bg-forest-900/5 px-3 py-1.5 text-xs font-medium text-forest-900/70 hover:bg-forest-900/10 disabled:opacity-40"
                >
                  {descGen ? "Генерирую…" : "✨ Сгенерировать черновик"}
                </button>
              </div>
              {descMsg && <p className="mt-2 text-xs text-emerald-700">{descMsg}</p>}
              <textarea
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={4}
                placeholder="EN — оставьте пустым для авто-описания"
                className="mt-2 w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2 text-sm text-forest-900 placeholder:text-forest-900/35"
              />
              <textarea
                value={descRu}
                onChange={(e) => setDescRu(e.target.value)}
                rows={4}
                placeholder="RU — оставьте пустым для авто-описания"
                className="mt-2 w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2 text-sm text-forest-900 placeholder:text-forest-900/35"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-forest-900/60 hover:bg-forest-900/5 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={save}
                className="rounded-full bg-panel px-4 py-1.5 text-sm font-medium text-panel-fg hover:bg-panel/90 disabled:opacity-50"
              >
                {pending ? "Сохраняю…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

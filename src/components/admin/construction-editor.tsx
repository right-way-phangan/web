"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import type { ConstructionUpdate } from "@/types/object";
import {
  saveConstructionUpdatesAction,
  uploadConstructionPhotosAction,
} from "@/lib/actions/construction-updates";

const field =
  "w-full rounded-md border border-forest-900/15 bg-cream-50 px-2.5 py-1.5 text-sm text-forest-900 focus:border-brass-600 focus:outline-none";
const labelCls = "text-xs font-medium text-forest-900/55";

/**
 * Редактор ленты «ход стройки» на карточке объекта (/admin/objects/[rw]).
 * Запись = дата (EN+RU) + подпись (EN+RU) + фото. Порядок записей = порядок
 * показа на сайте, поэтому новый отчёт добавляется сверху.
 */
export function ConstructionEditor({
  rwNumber,
  initial,
  publicHref,
}: {
  rwNumber: string;
  initial: ConstructionUpdate[];
  publicHref: string;
}) {
  const [updates, setUpdates] = useState<ConstructionUpdate[]>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const patch = (i: number, next: Partial<ConstructionUpdate>) =>
    setUpdates((list) => list.map((u, j) => (i === j ? { ...u, ...next } : u)));

  function addUpdate() {
    setUpdates((list) => [{ date: "", dateRu: "", note: "", noteRu: "", photos: [] }, ...list]);
  }

  async function uploadInto(i: number, files: FileList) {
    setMsg(null);
    setUploading(i);
    const fd = new FormData();
    for (const f of Array.from(files).sort((a, b) => a.name.localeCompare(b.name))) {
      fd.append("photos", f);
    }
    const res = await uploadConstructionPhotosAction(fd);
    setUploading(null);
    if (!res.ok) {
      setMsg(res.error ?? "Не удалось загрузить фото.");
      return;
    }
    patch(i, { photos: [...updates[i].photos, ...res.urls] });
    setMsg(`Загружено фото: ${res.urls.length}. Не забудьте сохранить.`);
    if (fileRefs.current[i]) fileRefs.current[i]!.value = "";
  }

  function save() {
    setMsg(null);
    // Записи без фото на сайте не нужны — backend их всё равно отбросит.
    const clean = updates.filter((u) => u.photos.length > 0);
    start(async () => {
      const res = await saveConstructionUpdatesAction(rwNumber, clean);
      if (res.ok) {
        setUpdates(clean);
        setMsg("Сохранено. Страница хода стройки обновится в течение 5 минут.");
        router.refresh();
      } else {
        setMsg(res.error ?? "Не удалось сохранить.");
      }
    });
  }

  const totalPhotos = updates.reduce((n, u) => n + u.photos.length, 0);

  return (
    <section className="mt-6 rounded-2xl border border-forest-900/10 bg-panel p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-forest-900">Ход стройки</h2>
          <p className="mt-0.5 text-xs text-forest-900/55">
            Фотоотчёты по датам · {updates.length} записей / {totalPhotos} фото ·{" "}
            <a href={publicHref} target="_blank" rel="noreferrer" className="text-brass-600 hover:underline">
              публичная страница ↗
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addUpdate}
            className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/15 px-3 py-1.5 text-xs font-medium text-forest-900/75 hover:bg-forest-900/5"
          >
            <Plus className="h-3.5 w-3.5" /> Отчёт
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-brass-600 px-3 py-1.5 text-xs font-medium text-panel-fg hover:bg-brass-600/90 disabled:opacity-40"
          >
            {pending ? "Сохраняю…" : "Сохранить"}
          </button>
        </div>
      </div>

      {msg && <p className="mt-2 text-xs text-emerald-700">{msg}</p>}

      <div className="mt-4 space-y-4">
        {updates.length === 0 && (
          <p className="text-xs text-forest-900/50">
            Пока пусто. «Отчёт» → дата, подпись и фото со стройплощадки.
          </p>
        )}
        {updates.map((u, i) => (
          <div key={i} className="rounded-xl border border-forest-900/10 bg-cream-50/60 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className={labelCls}>Дата (EN) — «July 2026»</span>
                <input value={u.date} onChange={(e) => patch(i, { date: e.target.value })} className={field} />
              </label>
              <label className="space-y-1">
                <span className={labelCls}>Дата (RU) — «Июль 2026»</span>
                <input
                  value={u.dateRu ?? ""}
                  onChange={(e) => patch(i, { dateRu: e.target.value })}
                  className={field}
                />
              </label>
              <label className="space-y-1">
                <span className={labelCls}>Подпись (EN)</span>
                <textarea
                  rows={2}
                  value={u.note ?? ""}
                  onChange={(e) => patch(i, { note: e.target.value })}
                  className={field}
                />
              </label>
              <label className="space-y-1">
                <span className={labelCls}>Подпись (RU)</span>
                <textarea
                  rows={2}
                  value={u.noteRu ?? ""}
                  onChange={(e) => patch(i, { noteRu: e.target.value })}
                  className={field}
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={(el) => {
                  fileRefs.current[i] = el;
                }}
                type="file"
                accept="image/*"
                multiple
                disabled={uploading !== null}
                onChange={(e) => e.target.files?.length && uploadInto(i, e.target.files)}
                className="text-xs text-forest-900/70 file:mr-2 file:rounded-full file:border-0 file:bg-forest-900/5 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-forest-900/70 hover:file:bg-forest-900/10"
              />
              {uploading === i && <span className="text-xs text-forest-900/55">Загружаю…</span>}
              <button
                type="button"
                onClick={() => setUpdates((list) => list.filter((_, j) => j !== i))}
                className="ml-auto inline-flex items-center gap-1.5 text-xs text-red-700/80 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Удалить отчёт
              </button>
            </div>

            {u.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {u.photos.map((url) => (
                  <div key={url} className="relative aspect-[3/4] overflow-hidden rounded-md bg-forest-900/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => patch(i, { photos: u.photos.filter((p) => p !== url) })}
                      className="absolute right-1 top-1 rounded-full bg-panel/80 p-1 text-forest-900/70 hover:text-red-700"
                      aria-label="Убрать фото"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

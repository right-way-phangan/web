"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { ConstructionUpdate } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { updateDate, updateNote } from "@/lib/utils/construction";

/**
 * Лента фотоотчётов со стройки: запись = дата + подпись + сетка фото.
 * Лайтбокс общий на всю ленту — фото листаются насквозь, через все записи.
 * Plain <img>: снимки со стройки приходят с R2-прокси и не нуждаются в
 * оптимизаторе (см. memory project_image_optimization_limit).
 */
export function ConstructionLog({
  updates,
  locale,
}: {
  updates: ConstructionUpdate[];
  locale: Locale;
}) {
  // Словарь берём здесь: функции-форматтеры нельзя передать пропом из
  // серверного компонента (Next: "Functions cannot be passed to Client Components").
  const photosLabel = getProjectsDict(locale).construction.photos;
  const flat = updates.flatMap((u) =>
    u.photos.map((url) => ({ url, caption: updateDate(u, locale) })),
  );
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + flat.length) % flat.length),
    [flat.length],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % flat.length), [flat.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  // Смещение записи в плоском списке — чтобы клик по фото открыл именно его.
  let offset = 0;

  return (
    <>
      <ol className="space-y-14">
        {updates.map((u, ui) => {
          const start = offset;
          offset += u.photos.length;
          return (
            <li key={`${u.date}-${ui}`}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-serif text-2xl text-forest-900">{updateDate(u, locale)}</h2>
                <span className="text-xs uppercase tracking-[0.15em] text-forest-500/55">
                  {photosLabel(u.photos.length)}
                </span>
              </div>
              {updateNote(u, locale) ? (
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-forest-500/85">
                  {updateNote(u, locale)}
                </p>
              ) : null}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {u.photos.map((url, i) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => openAt(start + i)}
                    className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={updateDate(u, locale)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute right-2 top-2 rounded-sm bg-cream-50/90 p-1.5 text-forest-500 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-panel/90 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex flex-col focus:outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">{flat[index]?.caption ?? ""}</Dialog.Title>
            <div className="flex items-center justify-between px-4 py-4 text-panel-fg md:px-8">
              <span className="text-sm text-panel-fg/80">
                <span className="tabular-nums">
                  {index + 1} / {flat.length}
                </span>
                <span className="ml-3">{flat[index]?.caption}</span>
              </span>
              <Dialog.Close className="rounded-sm p-2 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 md:px-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flat[index]?.url}
                alt={flat[index]?.caption ?? ""}
                className="max-h-full max-w-full object-contain"
              />
              {flat.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-panel/40 p-2 text-panel-fg transition-colors hover:bg-panel/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60 md:left-6 md:p-3"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-panel/40 p-2 text-panel-fg transition-colors hover:bg-panel/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60 md:right-6 md:p-3"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}


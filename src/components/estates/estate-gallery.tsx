"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { EstatePlot } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { PlotStatusBadge } from "./plot-status-badge";

interface Props {
  photoPlots: EstatePlot[];
  estateName: string;
  locale: Locale;
}

/**
 * Галерея «Фото с участков», сгруппированная по лоту (якоря lot-<code> — на них
 * скроллит клик по схеме плана). Клик по фото открывает полноэкранный лайтбокс с
 * каруселью (стрелки/Esc/←/→). Картинки — unoptimized (обход лимита оптимизатора).
 */
export function EstateGallery({ photoPlots, estateName, locale }: Props) {
  const t = getEstatesDict(locale);
  // Плоский список для карусели: [{src, code, alt}]
  const flat = photoPlots.flatMap((p) =>
    (p.photos ?? []).map((src, i) => ({ src, code: p.code, alt: `${estateName} — ${p.code} (${i + 1})` })),
  );
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((cur) => (cur === null ? cur : (cur + d + flat.length) % flat.length)),
    [flat.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (flat.length === 0) return null;
  let flatIndex = -1;

  return (
    <>
      <div className="space-y-8">
        {photoPlots.map((plot) => (
          <div key={plot.code} id={`lot-${plot.code}`} className="scroll-mt-28">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="text-sm font-medium text-forest-900">{plot.code}</span>
              <PlotStatusBadge status={plot.status} locale={locale} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(plot.photos ?? []).map((src, i) => {
                flatIndex += 1;
                const idx = flatIndex;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setOpen(idx)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-forest-900/5"
                  >
                    <Image
                      src={src}
                      alt={`${estateName} — ${plot.code} (${i + 1})`}
                      fill
                      unoptimized
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {open !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-900/92 p-4 print:hidden"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={t.sections.gallery}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-cream-50/10 p-2 text-cream-50 transition-colors hover:bg-cream-50/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {flat.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-3 rounded-full bg-cream-50/10 p-2.5 text-cream-50 transition-colors hover:bg-cream-50/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-3 rounded-full bg-cream-50/10 p-2.5 text-cream-50 transition-colors hover:bg-cream-50/20"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <figure className="relative max-h-[88vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={flat[open].src}
              alt={flat[open].alt}
              width={1280}
              height={960}
              unoptimized
              className="mx-auto max-h-[88vh] w-auto rounded-sm object-contain"
            />
            <figcaption className="mt-3 text-center text-xs text-cream-100/70">
              {flat[open].code} · {open + 1} / {flat.length}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}

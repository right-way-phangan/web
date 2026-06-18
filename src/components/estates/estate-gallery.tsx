"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { EstatePlot } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { EstateLotCarousel } from "./estate-lot-carousel";
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
  // Базовый плоский индекс для первого фото каждого лота (для лайтбокса).
  const starts: number[] = [];
  let acc = 0;
  for (const p of photoPlots) {
    starts.push(acc);
    acc += p.photos?.length ?? 0;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        {photoPlots.map((plot, pi) => (
          <div key={plot.code} id={`lot-${plot.code}`} className="scroll-mt-28">
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="text-sm font-medium text-forest-900">{plot.code}</span>
              <PlotStatusBadge status={plot.status} locale={locale} />
            </div>
            <EstateLotCarousel
              photos={plot.photos ?? []}
              altPrefix={`${estateName} — ${plot.code}`}
              onOpen={(i) => setOpen(starts[pi] + i)}
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </div>
        ))}
      </div>

      {open !== null ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-forest-900/92 p-4 print:hidden"
          style={{ animation: "lbFade 0.2s ease" }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={t.sections.gallery}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 rounded-full bg-cream-50/10 p-2 text-cream-50 transition-colors hover:bg-cream-50/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {flat.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-cream-50/10 p-2.5 text-cream-50 transition-colors hover:bg-cream-50/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-cream-50/10 p-2.5 text-cream-50 transition-colors hover:bg-cream-50/20"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <figure className="relative flex min-h-0 flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image
              key={open}
              src={flat[open].src}
              alt={flat[open].alt}
              width={1280}
              height={960}
              unoptimized
              style={{ animation: "lbZoom 0.28s cubic-bezier(0.22,1,0.36,1)" }}
              className="max-h-[78vh] w-auto rounded-sm object-contain"
            />
          </figure>
          <figcaption className="text-center text-xs text-cream-100/70" onClick={(e) => e.stopPropagation()}>
            {flat[open].code} · {open + 1} / {flat.length}
          </figcaption>
          {flat.length > 1 ? (
            <div
              className="flex max-w-full gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]"
              onClick={(e) => e.stopPropagation()}
            >
              {flat.map((f, i) => (
                <button
                  key={`${f.src}-${i}`}
                  type="button"
                  onClick={() => setOpen(i)}
                  className={`relative h-11 w-16 shrink-0 overflow-hidden rounded-sm ring-2 transition ${
                    i === open ? "ring-brass-400" : "opacity-50 ring-transparent hover:opacity-90"
                  }`}
                  aria-label={`${f.code} ${i + 1}`}
                  aria-current={i === open}
                >
                  <Image src={f.src} alt="" fill unoptimized sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

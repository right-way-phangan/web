"use client";

import { useState } from "react";
import type { EstatePlot } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { EstateLotCarousel } from "./estate-lot-carousel";
import { PlotStatusBadge } from "./plot-status-badge";
import { PhotoLightbox } from "@/components/media/photo-lightbox";

interface Props {
  photoPlots: EstatePlot[];
  estateName: string;
  locale: Locale;
}

/**
 * Галерея «Фото с участков», сгруппированная по лоту (якоря lot-<code> — на них
 * скроллит клик по схеме плана). У каждого лота — свайп-карусель; тап по фото
 * открывает общий полноэкранный лайтбокс ([[photo-lightbox]]) со свайпом, зумом
 * и лентой превью. Картинки — unoptimized (обход лимита оптимизатора).
 */
export function EstateGallery({ photoPlots, estateName, locale }: Props) {
  const t = getEstatesDict(locale);
  // Плоский список для лайтбокса: [{src, alt, caption}]
  const flat = photoPlots.flatMap((p) =>
    (p.photos ?? []).map((src, i) => ({ src, alt: `${estateName} — ${p.code} (${i + 1})`, caption: p.code })),
  );
  const [open, setOpen] = useState<number | null>(null);

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

      <PhotoLightbox
        photos={flat}
        index={open}
        onIndexChange={setOpen}
        onClose={() => setOpen(null)}
        unoptimized
        title={t.sections.gallery}
        labels={{
          prev: locale === "ru" ? "Назад" : "Previous",
          next: locale === "ru" ? "Вперёд" : "Next",
          close: locale === "ru" ? "Закрыть" : "Close",
        }}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import type { DeveloperPhotoSet } from "@/content/developers/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { EstateLotCarousel } from "@/components/estates/estate-lot-carousel";
import { PhotoLightbox } from "@/components/media/photo-lightbox";

/**
 * «Проекты в фото» на странице застройщика: по свайп-карусели на проект
 * ([[estate-lot-carousel]] — тот же компонент, что в галерее посёлка), тап по
 * кадру открывает общий полноэкранный лайтбокс со свайпом, зумом и лентой
 * превью. В карусели показывается лёгкое `-sm.webp` превью, в лайтбоксе —
 * полный JPEG, поэтому у каждого кадра обязан быть webp-сосед.
 */
export function DeveloperGallery({
  sets,
  locale,
  title,
}: {
  sets: DeveloperPhotoSet[];
  locale: Locale;
  title: string;
}) {
  // Плоский список для лайтбокса + индекс первого кадра каждой группы.
  const flat = sets.flatMap((set) =>
    set.photos.map((src, i) => ({
      src,
      alt: `${set.title} (${i + 1})`,
      caption: set.title,
    })),
  );
  const starts: number[] = [];
  let acc = 0;
  for (const set of sets) {
    starts.push(acc);
    acc += set.photos.length;
  }
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <h2 className="font-serif text-3xl text-forest-900">{title}</h2>
      <div className="mt-8 space-y-10">
        {sets.map((set, si) => (
          <div key={set.title}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <h3 className="font-medium text-forest-900">{set.title}</h3>
                {set.note ? (
                  <p className="mt-0.5 text-xs text-forest-500/60">{set.note[locale]}</p>
                ) : null}
              </div>
              <span className="text-xs text-forest-500/55">
                {set.photos.length} {locale === "ru" ? "фото" : "photos"}
              </span>
            </div>
            <EstateLotCarousel
              photos={set.photos}
              altPrefix={set.title}
              onOpen={(i) => setOpen(starts[si] + i)}
              aspect="3 / 2"
              sizes="(min-width: 1280px) 1216px, 100vw"
              hint={si === 0}
              hintLabel={locale === "ru" ? "Листайте" : "Swipe"}
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
        title={title}
        labels={{
          prev: locale === "ru" ? "Назад" : "Previous",
          next: locale === "ru" ? "Вперёд" : "Next",
          close: locale === "ru" ? "Закрыть" : "Close",
        }}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import type { EstatePlot } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { BLUR_PLACEHOLDER } from "@/lib/utils/blur";
import { PhotoLightbox } from "@/components/media/photo-lightbox";

interface Props {
  photoPlots: EstatePlot[];
  estateName: string;
  locale: Locale;
}

/**
 * «Продающий» коллаж фото в начале страницы (правая колонка обзора): по одному
 * лучшему кадру с разных лотов — большой герой + плитки; тап открывает общий
 * лайтбокс ([[photo-lightbox]]) со свайпом/зумом по ВСЕМ фото подборки. Так
 * картинки идут первыми и заполняют пустую правую часть на десктопе, а схема
 * («навигационная карта») остаётся сразу под обзором. Картинки — unoptimized.
 */
export function EstateLeadGallery({ photoPlots, estateName, locale }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const viewLabel = locale === "ru" ? "Открыть фото" : "View photo";

  // Полный плоский список (для лайтбокса) + индекс первого фото каждого лота.
  const flat: { src: string; alt: string; caption: string }[] = [];
  const firstOfLot: { src: string; flatIndex: number; code: string }[] = [];
  for (const p of photoPlots) {
    const photos = p.photos ?? [];
    if (photos.length > 0) firstOfLot.push({ src: photos[0], flatIndex: flat.length, code: p.code });
    photos.forEach((src, i) => flat.push({ src, alt: `${estateName} — ${p.code} (${i + 1})`, caption: p.code }));
  }
  if (flat.length === 0) return null;

  const tiles = firstOfLot.slice(0, 5);
  const hero = tiles[0];
  const rest = tiles.slice(1);
  const remaining = flat.length - 1; // «ещё фото» помимо героя

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setOpen(hero.flatIndex)}
          aria-label={`${viewLabel} 1`}
          className="group relative col-span-4 aspect-[16/10] overflow-hidden rounded-sm bg-forest-900/5"
        >
          <Image
            src={hero.src}
            alt={`${estateName} — ${hero.code}`}
            fill
            unoptimized
            priority
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            sizes="(min-width: 1024px) 30rem, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-forest-900/0 transition-colors duration-300 group-hover:bg-forest-900/10" />
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-forest-900/55 px-2.5 py-1 text-[11px] font-medium text-cream-50 backdrop-blur-sm">
            <Images className="h-3.5 w-3.5" />
            {flat.length} {locale === "ru" ? "фото" : "photos"}
          </span>
        </button>

        {rest.map((tile, i) => {
          const isLast = i === rest.length - 1;
          const more = remaining - rest.length; // сколько ещё помимо показанных плиток
          return (
            <button
              type="button"
              key={tile.code}
              onClick={() => setOpen(tile.flatIndex)}
              aria-label={`${viewLabel} ${tile.flatIndex + 1}`}
              className="group relative col-span-1 aspect-square overflow-hidden rounded-sm bg-forest-900/5"
            >
              <Image
                src={tile.src}
                alt={`${estateName} — ${tile.code}`}
                fill
                unoptimized
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                sizes="(min-width: 1024px) 7rem, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-forest-900/0 transition-colors duration-300 group-hover:bg-forest-900/10" />
              {isLast && more > 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-forest-900/55 text-sm font-medium text-cream-50">
                  +{more}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <PhotoLightbox
        photos={flat}
        index={open}
        onIndexChange={setOpen}
        onClose={() => setOpen(null)}
        unoptimized
        title={estateName}
        labels={{
          prev: locale === "ru" ? "Назад" : "Previous",
          next: locale === "ru" ? "Вперёд" : "Next",
          close: locale === "ru" ? "Закрыть" : "Close",
        }}
      />
    </>
  );
}

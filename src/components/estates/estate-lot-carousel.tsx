"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  photos: string[];
  altPrefix: string;
  /** Клик/тап по слайду — например, открыть лайтбокс на этом индексе. */
  onOpen?: (index: number) => void;
  /** Соотношение сторон рамки. */
  aspect?: string;
  sizes?: string;
}

/**
 * Карусель фото одного лота на нативной scroll-snap-ленте — как в мобильной
 * галерее карточки объекта ([[object-gallery]]): свайп пальцем работает «из
 * коробки» (overflow-x-auto + snap), счётчик/точки синхронятся по прокрутке.
 * Стрелки — для десктопа (по наведению). Тап по кадру → onOpen (лайтбокс).
 * Картинки — unoptimized (обход лимита оптимизатора).
 */
export function EstateLotCarousel({ photos, altPrefix, onOpen, aspect = "4 / 3", sizes = "(min-width: 640px) 50vw, 100vw" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = photos.length;

  if (n === 0) return null;

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== i) setI(Math.min(Math.max(idx, 0), n - 1));
  };
  const scrollTo = (idx: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };
  const go = (d: number) => scrollTo((i + d + n) % n);

  return (
    <div className="group relative overflow-hidden rounded-sm bg-forest-900/5" style={{ aspectRatio: aspect }}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        role="region"
        aria-roledescription="carousel"
        aria-label={altPrefix}
      >
        {photos.map((src, idx) => (
          <button
            key={src}
            type="button"
            onClick={() => onOpen?.(idx)}
            aria-label={`${altPrefix} (${idx + 1})`}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <Image
              src={src}
              alt={`${altPrefix} (${idx + 1})`}
              fill
              unoptimized
              sizes={sizes}
              className="object-cover"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {n > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/45 p-1.5 text-cream-50 opacity-0 transition-opacity hover:bg-forest-900/65 focus-visible:opacity-100 group-hover:opacity-100 sm:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/45 p-1.5 text-cream-50 opacity-0 transition-opacity hover:bg-forest-900/65 focus-visible:opacity-100 group-hover:opacity-100 sm:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollTo(idx)}
                aria-label={`${idx + 1}`}
                aria-current={idx === i}
                className={`pointer-events-auto h-1.5 rounded-full transition-all ${idx === i ? "w-4 bg-cream-50" : "w-1.5 bg-cream-50/55 hover:bg-cream-50/80"}`}
              />
            ))}
          </div>
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-forest-900/45 px-1.5 py-0.5 text-[10px] text-cream-50">
            {i + 1}/{n}
          </span>
        </>
      ) : null}
    </div>
  );
}

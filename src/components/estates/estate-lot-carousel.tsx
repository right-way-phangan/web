"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  photos: string[];
  altPrefix: string;
  /** Клик по слайду — например, открыть лайтбокс на этом индексе. */
  onOpen?: (index: number) => void;
  /** Соотношение сторон рамки. */
  aspect?: string;
  sizes?: string;
}

/**
 * Карусель фото одного лота: один слайд, стрелки, точки, счётчик. Свайп — за счёт
 * нативной прокрутки нет; листание кнопками/точками (надёжно в драуэре и сетке).
 * Картинки — unoptimized (обход лимита оптимизатора). Клик по кадру → onOpen.
 */
export function EstateLotCarousel({ photos, altPrefix, onOpen, aspect = "4 / 3", sizes = "(min-width: 640px) 50vw, 100vw" }: Props) {
  const [i, setI] = useState(0);
  if (photos.length === 0) return null;
  const n = photos.length;
  const go = (d: number) => setI((c) => (c + d + n) % n);

  return (
    <div className="group relative overflow-hidden rounded-sm bg-forest-900/5" style={{ aspectRatio: aspect }}>
      {/* слайды (кросс-фейд через opacity) */}
      {photos.map((src, idx) => (
        <button
          key={src}
          type="button"
          onClick={() => onOpen?.(idx)}
          aria-hidden={idx !== i}
          tabIndex={idx === i ? 0 : -1}
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? "auto" : "none" }}
        >
          <Image
            src={src}
            alt={`${altPrefix} (${idx + 1})`}
            fill
            unoptimized
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>
      ))}

      {n > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-forest-900/45 p-1.5 text-cream-50 opacity-0 transition-opacity hover:bg-forest-900/65 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-forest-900/45 p-1.5 text-cream-50 opacity-0 transition-opacity hover:bg-forest-900/65 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`${idx + 1}`}
                aria-current={idx === i}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-4 bg-cream-50" : "w-1.5 bg-cream-50/55 hover:bg-cream-50/80"}`}
              />
            ))}
          </div>
          <span className="absolute right-2 top-2 rounded-full bg-forest-900/45 px-1.5 py-0.5 text-[10px] text-cream-50">
            {i + 1}/{n}
          </span>
        </>
      ) : null}
    </div>
  );
}

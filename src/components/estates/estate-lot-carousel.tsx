"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";
import { BLUR_PLACEHOLDER } from "@/lib/utils/blur";
import { estateThumb } from "@/lib/utils/thumb";

interface Props {
  photos: string[];
  altPrefix: string;
  /** Клик/тап по слайду — например, открыть лайтбокс на этом индексе. */
  onOpen?: (index: number) => void;
  /** Соотношение сторон рамки. */
  aspect?: string;
  sizes?: string;
  /** Инфо-чип поверх кадра: вид (море/горы) + цена — видно при листании. */
  info?: { seaView?: boolean; viewLabel?: string; priceLabel?: string | null };
  /** Одноразовая подсказка свайпа на тач-устройстве (показываем один раз). */
  hint?: boolean;
  hintLabel?: string;
}

const HINT_KEY = "rw-estate-swipe-hint";

/**
 * Карусель фото одного лота на нативной scroll-snap-ленте — как в мобильной
 * галерее карточки объекта ([[object-gallery]]): свайп пальцем работает «из
 * коробки» (overflow-x-auto + snap), счётчик/точки синхронятся по прокрутке.
 * Стрелки — для десктопа (по наведению). Тап по кадру → onOpen (лайтбокс).
 * Доп.: инфо-чип (вид/цена) поверх кадра + одноразовая подсказка свайпа на моб.
 * Картинки — unoptimized (обход лимита оптимизатора).
 */
export function EstateLotCarousel({
  photos,
  altPrefix,
  onOpen,
  aspect = "4 / 3",
  sizes = "(min-width: 640px) 50vw, 100vw",
  info,
  hint,
  hintLabel,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const n = photos.length;

  // Одноразовая подсказка свайпа: только тач, только если не видели, + «нудж».
  useEffect(() => {
    if (!hint || n <= 1 || typeof window === "undefined") return;
    if (!window.matchMedia?.("(pointer: coarse)")?.matches) return;
    try {
      if (localStorage.getItem(HINT_KEY) === "1") return;
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* приватный режим — просто покажем один раз за сессию */
    }
    const t1 = setTimeout(() => {
      setShowHint(true);
      const el = trackRef.current;
      if (el) {
        el.scrollTo({ left: 34, behavior: "smooth" });
        setTimeout(() => trackRef.current?.scrollTo({ left: 0, behavior: "smooth" }), 650);
      }
    }, 600);
    const t2 = setTimeout(() => setShowHint(false), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hint, n]);

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
        onTouchStart={() => showHint && setShowHint(false)}
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
              src={estateThumb(src)}
              alt={`${altPrefix} (${idx + 1})`}
              fill
              unoptimized
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              sizes={sizes}
              className="object-cover"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Инфо-чип: вид + цена */}
      {info && (info.viewLabel || info.priceLabel) ? (
        <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-forest-900/55 px-2.5 py-1 text-[11px] font-medium text-cream-50 backdrop-blur-sm">
          {info.viewLabel ? (
            <>
              <span aria-hidden>{info.seaView ? "🌊" : "⛰"}</span>
              {info.viewLabel}
            </>
          ) : null}
          {info.priceLabel ? <span className="text-brass-200">· {info.priceLabel}</span> : null}
        </span>
      ) : null}

      {/* Подсказка свайпа (одноразовая, моб.) */}
      {showHint ? (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-forest-900/70 px-3 py-1.5 text-xs font-medium text-cream-50 backdrop-blur-sm"
          style={{ animation: "lbFade 0.3s ease" }}
        >
          <MoveHorizontal className="h-4 w-4" />
          {hintLabel ?? "Свайп"}
        </span>
      ) : null}

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
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollTo(idx)}
                aria-label={`${idx + 1}`}
                aria-current={idx === i}
                className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition-[transform,background-color] duration-300 ${idx === i ? "scale-x-[2.67] bg-cream-50" : "bg-cream-50/55 hover:bg-cream-50/80"}`}
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

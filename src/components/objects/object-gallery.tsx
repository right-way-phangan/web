"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import {
  TreePine,
  Home,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Images,
} from "lucide-react";
import type { ObjectType } from "@/types/object";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

const TYPE_ICON: Record<ObjectType, typeof Home> = {
  Land: TreePine,
  Villa: Home,
  House: Home,
  Apartment: Building2,
  Townhouse: Home,
  Hotel: Building2,
  Business: Building2,
  Project: Building2,
};

function hueFor(seed: string, offset = 0): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h + offset) % 360;
}

const SWIPE_THRESHOLD_PX = 48;
const MAX_DOTS = 8;

interface Props {
  rwNumber: string;
  type: ObjectType;
  gallery?: string[];
}

/**
 * Photo block backed by real photos (migrated Drive → Vercel Blob, see
 * bot/scripts/migrate_photos_to_blob.py).
 *
 * Mobile: swipeable snap carousel over every photo with a live counter.
 * Desktop: Airbnb-style 1+4 grid. Either opens a full-screen lightbox with
 * keyboard / swipe navigation, a thumbnail filmstrip, and neighbour
 * preloading. Falls back to deterministic gradient panels when an object has
 * no photos yet.
 */
export function ObjectGallery({ rwNumber, type, gallery }: Props) {
  const Icon = TYPE_ICON[type];
  const t = getObjectDict(useLocale());
  const photos = (gallery ?? []).filter(Boolean);
  const hasPhotos = photos.length > 0;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  // Keep the active filmstrip thumb in view as the user navigates.
  useEffect(() => {
    if (!open) return;
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, index]);

  // ---- No photos: deterministic gradient placeholder grid ----
  if (!hasPhotos) {
    const tiles = [0, 60, 120, 180, 240].map((offset, i) => ({
      key: i,
      style: {
        backgroundImage: `linear-gradient(135deg, hsl(${hueFor(rwNumber, offset)} 30% 86%) 0%, hsl(${hueFor(rwNumber, offset + 40)} 25% 76%) 100%)`,
      },
    }));
    return (
      <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:col-span-2 md:row-span-2 md:aspect-auto"
          style={tiles[0].style}
        >
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/25">
            <Icon className="h-24 w-24" strokeWidth={0.8} />
          </div>
        </div>
        {tiles.slice(1).map((tile) => (
          <div
            key={tile.key}
            className="relative hidden aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:block"
            style={tile.style}
          >
            <div className="absolute inset-0 flex items-center justify-center text-forest-500/15">
              <Icon className="h-10 w-10" strokeWidth={0.8} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---- Real photos ----
  const sideTiles = photos.slice(1, 5);
  const heroSpansFull = sideTiles.length === 0;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== mobileIndex) setMobileIndex(Math.min(Math.max(i, 0), photos.length - 1));
  };

  const onStageTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onStageTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || photos.length < 2) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) prev();
    else next();
  };

  const photosButton = (
    <button
      type="button"
      onClick={() => openAt(0)}
      className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-sm bg-cream-50/90 px-3 py-1.5 text-xs font-medium text-forest-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-cream-50 md:bottom-5 md:right-5"
    >
      <Images className="h-4 w-4" />
      {t.photosCount(photos.length)}
    </button>
  );

  return (
    <>
      {/* Mobile: swipeable snap carousel over every photo */}
      <div className="relative md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-sm"
          role="region"
          aria-roledescription="carousel"
          aria-label={t.galleryCaption(rwNumber, mobileIndex + 1, photos.length)}
        >
          {photos.map((url, i) => (
            <button
              type="button"
              key={url}
              onClick={() => openAt(i)}
              aria-label={t.viewPhoto(i + 1)}
              className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden bg-forest-500/5"
            >
              <Image
                src={url}
                alt={`${rwNumber} — photo ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {photos.length > 1 ? (
          <>
            <span className="num pointer-events-none absolute right-3 top-3 rounded-sm bg-forest-900/60 px-2 py-1 text-xs text-cream-50 backdrop-blur-sm">
              {mobileIndex + 1} / {photos.length}
            </span>
            {photos.length <= MAX_DOTS ? (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
                aria-hidden
              >
                {photos.map((url, i) => (
                  <span
                    key={url}
                    className={cn(
                      "h-1.5 rounded-full bg-cream-50 shadow-sm transition-all duration-300",
                      i === mobileIndex ? "w-4 opacity-95" : "w-1.5 opacity-55",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Desktop: 1+4 grid */}
      <div className="relative hidden gap-2 md:grid md:grid-cols-4 md:grid-rows-2">
        {/* Hero */}
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={t.viewPhoto(1)}
          className={`group relative overflow-hidden rounded-sm bg-forest-500/5 md:row-span-2 ${
            heroSpansFull ? "md:col-span-4 md:aspect-[2/1]" : "md:col-span-2"
          }`}
        >
          <Image
            src={photos[0]}
            alt={`${rwNumber} — photo 1`}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-forest-900/0 transition-colors duration-300 group-hover:bg-forest-900/10" />
        </button>

        {sideTiles.map((url, i) => {
          const photoIndex = i + 1;
          const isLastVisible = i === sideTiles.length - 1;
          const remaining = photos.length - 5;
          return (
            <button
              type="button"
              key={photoIndex}
              onClick={() => openAt(photoIndex)}
              aria-label={t.viewPhoto(photoIndex + 1)}
              className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5"
            >
              <Image
                src={url}
                alt={`${rwNumber} — photo ${photoIndex + 1}`}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-forest-900/0 transition-colors duration-300 group-hover:bg-forest-900/10" />
              {isLastVisible && remaining > 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-forest-900/55 text-lg font-medium text-cream-50 transition-colors duration-300 group-hover:bg-forest-900/65">
                  +{remaining}
                </span>
              ) : null}
            </button>
          );
        })}

        {photosButton}
      </div>

      {/* Lightbox */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-900/90 backdrop-blur-sm motion-safe:animate-[lbFade_200ms_ease-out]" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex flex-col focus:outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">
              {t.galleryCaption(rwNumber, index + 1, photos.length)}
            </Dialog.Title>

            {/* Top bar. On short viewports (landscape phones) it overlays the
                photo as a gradient instead of taking a row of its own. */}
            <div className="flex items-center justify-between px-4 py-4 text-cream-50 md:px-8 [@media(max-height:500px)]:absolute [@media(max-height:500px)]:inset-x-0 [@media(max-height:500px)]:top-0 [@media(max-height:500px)]:z-10 [@media(max-height:500px)]:bg-gradient-to-b [@media(max-height:500px)]:from-forest-900/70 [@media(max-height:500px)]:to-transparent [@media(max-height:500px)]:py-2">
              <span className="text-sm tabular-nums text-cream-50/80">
                {index + 1} / {photos.length}
              </span>
              <Dialog.Close className="rounded-sm p-2 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/40">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            {/* Stage */}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4 md:px-16 [@media(max-height:500px)]:p-0"
              onTouchStart={onStageTouchStart}
              onTouchEnd={onStageTouchEnd}
            >
              <div
                key={photos[index]}
                className="relative h-full w-full motion-safe:animate-[lbFade_240ms_ease-out]"
              >
                <Image
                  src={photos[index]}
                  alt={`${rwNumber} — photo ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              {/* Preload neighbours so arrow / swipe navigation feels instant */}
              {photos.length > 1 ? (
                <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
                  {[
                    (index + 1) % photos.length,
                    (index - 1 + photos.length) % photos.length,
                  ]
                    .filter((i, pos, arr) => i !== index && arr.indexOf(i) === pos)
                    .map((i) => (
                      <Image
                        key={photos[i]}
                        src={photos[i]}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-contain"
                      />
                    ))}
                </div>
              ) : null}

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label={t.prevPhoto}
                    className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 sm:block md:left-6 md:p-3"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label={t.nextPhoto}
                    className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 sm:block md:right-6 md:p-3"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}
            </div>

            {/* Thumbnail filmstrip */}
            {photos.length > 1 ? (
              <div
                ref={stripRef}
                className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 pt-1 md:justify-center md:px-8 [@media(max-height:500px)]:hidden"
              >
                {photos.map((url, i) => (
                  <button
                    type="button"
                    key={url}
                    data-thumb={i}
                    onClick={() => setIndex(i)}
                    aria-label={t.viewPhoto(i + 1)}
                    aria-current={i === index ? "true" : undefined}
                    className={cn(
                      "relative h-12 w-16 shrink-0 overflow-hidden rounded-sm transition-all duration-200 md:h-14 md:w-20",
                      i === index
                        ? "opacity-100 ring-2 ring-brass-300"
                        : "opacity-55 ring-1 ring-cream-50/20 hover:opacity-90",
                    )}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

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
import { BLUR_PLACEHOLDER } from "@/lib/utils/blur";
import { cn } from "@/lib/utils/cn";
import { trackObjectEvent } from "@/lib/analytics/track-event";
import { useLightboxGestures } from "@/lib/hooks/use-lightbox-gestures";

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

/**
 * `next/image` that degrades to the same deterministic gradient panel used for
 * photo-less objects when the source can't load (e.g. the optimizer hits its
 * monthly cap → 402, or the blob store is blocked → 403). Without this the
 * browser paints the raw `alt` text over a grey box — see
 * memory `project_image_optimization_limit`. Keeps working photos as-is.
 */
function SafeImage({
  src,
  alt,
  seed,
  hueOffset,
  icon: Icon,
  sizes,
  className,
  priority,
  draggable,
  iconClassName = "h-10 w-10",
}: {
  src: string;
  alt: string;
  seed: string;
  hueOffset: number;
  icon: typeof Home;
  sizes: string;
  className?: string;
  priority?: boolean;
  draggable?: boolean;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-forest-500/5"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${hueFor(seed, hueOffset)} 30% 86%) 0%, hsl(${hueFor(seed, hueOffset + 40)} 25% 76%) 100%)`,
        }}
        aria-hidden
      >
        <Icon className={cn(iconClassName, "text-forest-500/25")} strokeWidth={0.8} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
      className={className}
      draggable={draggable}
      onError={() => setFailed(true)}
    />
  );
}

const MAX_DOTS = 8;

interface Props {
  rwNumber: string;
  type: ObjectType;
  gallery?: string[];
  /** Listing title for descriptive alt text (image SEO + screen readers). */
  title?: string;
}

/**
 * Photo block backed by real photos (migrated Drive → Vercel Blob, see
 * bot/scripts/migrate_photos_to_blob.py).
 *
 * Mobile: swipeable snap carousel over every photo with a live counter.
 * Desktop: Airbnb-style 1+4 grid. Either opens a full-screen lightbox with
 * keyboard / swipe navigation, pinch & double-tap zoom with panning, a
 * thumbnail filmstrip, and neighbour preloading. Falls back to deterministic
 * gradient panels when an object has no photos yet.
 */
export function ObjectGallery({ rwNumber, type, gallery, title }: Props) {
  const Icon = TYPE_ICON[type];
  const t = getObjectDict(useLocale());
  const photos = (gallery ?? []).filter(Boolean);
  const hasPhotos = photos.length > 0;
  const altFor = (n: number) => `${title ?? rwNumber} (${rwNumber}) — photo ${n}`;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const galleryFired = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length],
  );

  // ---- Lightbox gestures (pinch / double-tap / swipe) ----
  const { zoom, gesturing, stageRef, stageProps } = useLightboxGestures({
    imageCount: photos.length,
    index,
    active: open,
    onPrev: prev,
    onNext: next,
  });

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
    // On-page engagement: lightbox opened (media interest), once per page view.
    if (!galleryFired.current) {
      galleryFired.current = true;
      trackObjectEvent("gallery_open", rwNumber);
    }
  };

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== mobileIndex) setMobileIndex(Math.min(Math.max(i, 0), photos.length - 1));
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
              className="relative aspect-[4/3] w-full shrink-0 snap-center touch-manipulation overflow-hidden bg-forest-500/5"
            >
              <SafeImage
                src={url}
                alt={altFor(i + 1)}
                seed={rwNumber}
                hueOffset={i * 60}
                icon={Icon}
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
          <SafeImage
            src={photos[0]}
            alt={altFor(1)}
            seed={rwNumber}
            hueOffset={0}
            icon={Icon}
            priority
            iconClassName="h-24 w-24"
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
              <SafeImage
                src={url}
                alt={altFor(photoIndex + 1)}
                seed={rwNumber}
                hueOffset={photoIndex * 60}
                icon={Icon}
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
            className="fixed inset-0 z-50 focus:outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">
              {t.galleryCaption(rwNumber, index + 1, photos.length)}
            </Dialog.Title>

            {/* Top bar — overlays the photo as a gradient so the stage gets
                the full viewport in every orientation. */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-forest-900/70 to-transparent px-4 py-3 text-cream-50 md:px-8">
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
              ref={stageRef}
              className="absolute inset-0 flex touch-none items-center justify-center overflow-hidden"
              {...stageProps}
            >
              <div
                key={photos[index]}
                className={cn(
                  "relative h-full w-full motion-safe:animate-[lbFade_240ms_ease-out]",
                  zoom.scale > 1 && "cursor-grab",
                )}
                style={{
                  transform: `translate3d(${zoom.tx}px, ${zoom.ty}px, 0) scale(${zoom.scale})`,
                  transition: gesturing ? "none" : "transform 200ms ease-out",
                }}
              >
                <SafeImage
                  src={photos[index]}
                  alt={altFor(index + 1)}
                  seed={rwNumber}
                  hueOffset={index * 60}
                  icon={Icon}
                  iconClassName="h-24 w-24"
                  sizes="100vw"
                  className="object-contain"
                  draggable={false}
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
                    className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/60 sm:block md:left-6 md:p-3"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label={t.nextPhoto}
                    className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/60 sm:block md:right-6 md:p-3"
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
                className="no-scrollbar absolute inset-x-0 bottom-0 z-10 flex gap-2 overflow-x-auto bg-gradient-to-t from-forest-900/70 to-transparent px-4 pb-3 pt-8 md:justify-center md:px-8 [@media(max-height:500px)]:hidden"
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
                    <SafeImage
                      src={url}
                      alt=""
                      seed={rwNumber}
                      hueOffset={i * 60}
                      icon={Icon}
                      iconClassName="h-5 w-5"
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Progress bar — replaces the filmstrip on short (landscape)
                viewports where the strip would cover half the photo. */}
            {photos.length > 1 ? (
              <div
                className="absolute inset-x-0 bottom-0 z-10 hidden h-1 bg-cream-50/15 [@media(max-height:500px)]:block"
                aria-hidden
              >
                <div
                  className="h-full bg-brass-400 transition-[width] duration-300"
                  style={{ width: `${((index + 1) / photos.length) * 100}%` }}
                />
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

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
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_RADIUS_PX = 40;

interface ZoomState {
  scale: number;
  tx: number;
  ty: number;
}

const ZOOM_RESET: ZoomState = { scale: 1, tx: 0, ty: 0 };

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
  const stripRef = useRef<HTMLDivElement>(null);

  // ---- Lightbox zoom (pinch / double-tap / pan) ----
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomState>(ZOOM_RESET);
  const [gesturing, setGesturing] = useState(false);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const panLast = useRef<{ x: number; y: number } | null>(null);
  const swipeStart = useRef<{ x: number; y: number; multi: boolean } | null>(null);
  const lastTap = useRef<{ x: number; y: number; time: number } | null>(null);

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

  // Fresh photo → fresh zoom.
  useEffect(() => {
    setZoom(ZOOM_RESET);
  }, [index, open]);

  // Keep the active filmstrip thumb in view as the user navigates.
  useEffect(() => {
    if (!open) return;
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, index]);

  const clampZoom = (z: ZoomState): ZoomState => {
    const rect = stageRef.current?.getBoundingClientRect();
    const scale = Math.min(MAX_ZOOM, Math.max(1, z.scale));
    if (scale <= 1.05) return ZOOM_RESET;
    const maxX = ((scale - 1) * (rect?.width ?? 0)) / 2;
    const maxY = ((scale - 1) * (rect?.height ?? 0)) / 2;
    return {
      scale,
      tx: Math.min(maxX, Math.max(-maxX, z.tx)),
      ty: Math.min(maxY, Math.max(-maxY, z.ty)),
    };
  };

  const zoomAtPoint = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const s = DOUBLE_TAP_ZOOM;
    setZoom(
      clampZoom({ scale: s, tx: -(clientX - cx) * (s - 1), ty: -(clientY - cy) * (s - 1) }),
    );
  };

  const toggleZoom = (clientX: number, clientY: number) => {
    if (zoomRef.current.scale > 1) setZoom(ZOOM_RESET);
    else zoomAtPoint(clientX, clientY);
  };

  const onStagePointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      pinchStart.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        scale: zoomRef.current.scale,
      };
      panLast.current = null;
      if (swipeStart.current) swipeStart.current.multi = true;
      setGesturing(true);
    } else if (pts.length === 1) {
      panLast.current = { x: e.clientX, y: e.clientY };
      swipeStart.current = { x: e.clientX, y: e.clientY, multi: false };
      if (zoomRef.current.scale > 1) setGesturing(true);
    }
  };

  const onStagePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && pinchStart.current) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const scale = (dist / pinchStart.current.dist) * pinchStart.current.scale;
      setZoom((z) => clampZoom({ ...z, scale }));
    } else if (pts.length === 1 && zoomRef.current.scale > 1 && panLast.current) {
      const dx = e.clientX - panLast.current.x;
      const dy = e.clientY - panLast.current.y;
      panLast.current = { x: e.clientX, y: e.clientY };
      setZoom((z) => clampZoom({ ...z, tx: z.tx + dx, ty: z.ty + dy }));
    }
  };

  const onStagePointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      pinchStart.current = null;
      panLast.current = null;
      setGesturing(false);

      const start = swipeStart.current;
      swipeStart.current = null;
      if (!start || start.multi || e.pointerType !== "touch") return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const moved = Math.hypot(dx, dy);

      // Double-tap → toggle zoom.
      const now = Date.now();
      if (moved < DOUBLE_TAP_RADIUS_PX) {
        const last = lastTap.current;
        if (
          last &&
          now - last.time < DOUBLE_TAP_MS &&
          Math.hypot(e.clientX - last.x, e.clientY - last.y) < DOUBLE_TAP_RADIUS_PX
        ) {
          lastTap.current = null;
          toggleZoom(e.clientX, e.clientY);
          return;
        }
        lastTap.current = { x: e.clientX, y: e.clientY, time: now };
        return;
      }

      // Swipe → navigate (only when not zoomed in).
      if (
        zoomRef.current.scale === 1 &&
        photos.length > 1 &&
        Math.abs(dx) >= SWIPE_THRESHOLD_PX &&
        Math.abs(dx) > Math.abs(dy)
      ) {
        if (dx > 0) prev();
        else next();
      }
    }
  };

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
                alt={altFor(i + 1)}
                fill
                priority={i === 0}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {photos.length > 1 ? (
          <>
            <span className="num pointer-events-none absolute right-3 top-3 rounded-sm bg-panel/60 px-2 py-1 text-xs text-panel-fg backdrop-blur-sm">
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
            alt={altFor(1)}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
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
                alt={altFor(photoIndex + 1)}
                fill
                sizes="25vw"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-forest-900/0 transition-colors duration-300 group-hover:bg-forest-900/10" />
              {isLastVisible && remaining > 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-panel/55 text-lg font-medium text-panel-fg transition-colors duration-300 group-hover:bg-panel/65">
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
          <Dialog.Overlay className="fixed inset-0 z-50 bg-panel/90 backdrop-blur-sm motion-safe:animate-[lbFade_200ms_ease-out]" />
          <Dialog.Content
            className="fixed inset-0 z-50 focus:outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">
              {t.galleryCaption(rwNumber, index + 1, photos.length)}
            </Dialog.Title>

            {/* Top bar — overlays the photo as a gradient so the stage gets
                the full viewport in every orientation. */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-panel/70 to-transparent px-4 py-3 text-panel-fg md:px-8">
              <span className="text-sm tabular-nums text-panel-fg/80">
                {index + 1} / {photos.length}
              </span>
              <Dialog.Close className="rounded-sm p-2 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/40">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            {/* Stage */}
            <div
              ref={stageRef}
              className="absolute inset-0 flex touch-none items-center justify-center overflow-hidden"
              onPointerDown={onStagePointerDown}
              onPointerMove={onStagePointerMove}
              onPointerUp={onStagePointerUp}
              onPointerCancel={onStagePointerUp}
              onDoubleClick={(e) => toggleZoom(e.clientX, e.clientY)}
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
                <Image
                  src={photos[index]}
                  alt={altFor(index + 1)}
                  fill
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
                    className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-panel/40 p-2 text-panel-fg transition-colors hover:bg-panel/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60 sm:block md:left-6 md:p-3"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label={t.nextPhoto}
                    className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-panel/40 p-2 text-panel-fg transition-colors hover:bg-panel/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60 sm:block md:right-6 md:p-3"
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
                className="no-scrollbar absolute inset-x-0 bottom-0 z-10 flex gap-2 overflow-x-auto bg-gradient-to-t from-panel/70 to-transparent px-4 pb-3 pt-8 md:justify-center md:px-8 [@media(max-height:500px)]:hidden"
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
                        : "opacity-55 ring-1 ring-panel-fg/20 hover:opacity-90",
                    )}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="80px"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
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

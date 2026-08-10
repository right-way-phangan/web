"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ImageOff } from "lucide-react";
import { BLUR_PLACEHOLDER } from "@/lib/utils/blur";
import { cn } from "@/lib/utils/cn";

const SWIPE_THRESHOLD_PX = 48;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_RADIUS_PX = 40;

export interface LightboxPhoto {
  src: string;
  alt: string;
  /** Подпись под счётчиком (напр. код лота). */
  caption?: string;
  /**
   * Лёгкое превью для ленты миниатюр; полный кадр остаётся в `src`. Без него
   * альбом на 38 кадров тянет все полноразмерные JPEG ради 80-пиксельных плиток.
   */
  thumb?: string;
}

interface ZoomState {
  scale: number;
  tx: number;
  ty: number;
}
const ZOOM_RESET: ZoomState = { scale: 1, tx: 0, ty: 0 };

interface Props {
  photos: LightboxPhoto[];
  /** Текущий индекс; null = закрыт. */
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  /** next/image без оптимизатора (для Blob-фото вне лимита /_next/image). */
  unoptimized?: boolean;
  title?: string;
  labels?: { prev?: string; next?: string; close?: string };
}

function LBImage({ src, alt, unoptimized }: { src: string; alt: string; unoptimized?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-forest-900/40" aria-hidden>
        <ImageOff className="h-12 w-12 text-cream-50/30" strokeWidth={1} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={unoptimized}
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
      sizes="100vw"
      className="object-contain"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Переиспользуемый полноэкранный лайтбокс «как в карточке объекта»
 * ([[object-gallery]]): свайп пальцем (pointer events), пинч- и дабл-тап-зум с
 * панорамированием, клавиши ←/→/Esc, лента превью-миниатюр, преднагрузка
 * соседних кадров и прогресс-бар в ландшафте. Контролируется родителем через
 * `index` (null = закрыт). Radix Dialog даёт фокус-ловушку и блок прокрутки.
 */
export function PhotoLightbox({ photos, index, onIndexChange, onClose, unoptimized, title, labels }: Props) {
  const open = index !== null;
  const i = index ?? 0;
  const n = photos.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomState>(ZOOM_RESET);
  const [gesturing, setGesturing] = useState(false);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const panLast = useRef<{ x: number; y: number } | null>(null);
  const swipeStart = useRef<{ x: number; y: number; multi: boolean } | null>(null);
  const lastTap = useRef<{ x: number; y: number; time: number } | null>(null);

  const prev = useCallback(() => onIndexChange((i - 1 + n) % n), [i, n, onIndexChange]);
  const next = useCallback(() => onIndexChange((i + 1) % n), [i, n, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  // Свежий кадр → сброс зума.
  useEffect(() => {
    setZoom(ZOOM_RESET);
  }, [i, open]);

  // Активная миниатюра — всегда в кадре.
  useEffect(() => {
    if (!open) return;
    const active = stripRef.current?.querySelector<HTMLElement>(`[data-thumb="${i}"]`);
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, i]);

  const clampZoom = (z: ZoomState): ZoomState => {
    const rect = stageRef.current?.getBoundingClientRect();
    const scale = Math.min(MAX_ZOOM, Math.max(1, z.scale));
    if (scale <= 1.05) return ZOOM_RESET;
    const maxX = ((scale - 1) * (rect?.width ?? 0)) / 2;
    const maxY = ((scale - 1) * (rect?.height ?? 0)) / 2;
    return { scale, tx: Math.min(maxX, Math.max(-maxX, z.tx)), ty: Math.min(maxY, Math.max(-maxY, z.ty)) };
  };

  const zoomAtPoint = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const s = DOUBLE_TAP_ZOOM;
    setZoom(clampZoom({ scale: s, tx: -(clientX - cx) * (s - 1), ty: -(clientY - cy) * (s - 1) }));
  };

  const toggleZoom = (clientX: number, clientY: number) => {
    if (zoomRef.current.scale > 1) setZoom(ZOOM_RESET);
    else zoomAtPoint(clientX, clientY);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      pinchStart.current = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), scale: zoomRef.current.scale };
      panLast.current = null;
      if (swipeStart.current) swipeStart.current.multi = true;
      setGesturing(true);
    } else if (pts.length === 1) {
      panLast.current = { x: e.clientX, y: e.clientY };
      swipeStart.current = { x: e.clientX, y: e.clientY, multi: false };
      if (zoomRef.current.scale > 1) setGesturing(true);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
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

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    pinchStart.current = null;
    panLast.current = null;
    setGesturing(false);

    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.multi || e.pointerType !== "touch") return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const moved = Math.hypot(dx, dy);

    // Дабл-тап → зум.
    const now = Date.now();
    if (moved < DOUBLE_TAP_RADIUS_PX) {
      const last = lastTap.current;
      if (last && now - last.time < DOUBLE_TAP_MS && Math.hypot(e.clientX - last.x, e.clientY - last.y) < DOUBLE_TAP_RADIUS_PX) {
        lastTap.current = null;
        toggleZoom(e.clientX, e.clientY);
        return;
      }
      lastTap.current = { x: e.clientX, y: e.clientY, time: now };
      return;
    }

    // Свайп → листание (только без зума).
    if (zoomRef.current.scale === 1 && n > 1 && Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev();
      else next();
    }
  };

  if (n === 0) return null;
  const cur = photos[i];

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-forest-900/92 backdrop-blur-sm motion-safe:animate-[lbFade_200ms_ease-out]" />
        {/* Фейд принадлежит открытию, а не листанию: анимация на Content играет
            один раз. Кадры сменяются мгновенно — иначе быстрый перебор стрелками
            превращается в мигание, а keyframes на каждой смене стартует с нуля
            и не даёт себя прервать. */}
        <Dialog.Content className="fixed inset-0 z-[100] focus:outline-none print:hidden motion-safe:animate-[lbFade_240ms_ease-out]" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{title ?? `${i + 1} / ${n}`}</Dialog.Title>

          {/* Верхняя панель */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-forest-900/70 to-transparent px-4 py-3 text-cream-50 md:px-8">
            <span className="text-sm tabular-nums text-cream-50/85">
              {cur.caption ? `${cur.caption} · ` : ""}{i + 1} / {n}
            </span>
            <Dialog.Close
              className="rounded-sm p-2 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/40"
              aria-label={labels?.close ?? "Close"}
            >
              <X className="h-6 w-6" />
            </Dialog.Close>
          </div>

          {/* Сцена */}
          <div
            ref={stageRef}
            className="absolute inset-0 flex touch-none items-center justify-center overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={(e) => toggleZoom(e.clientX, e.clientY)}
          >
            <div
              key={cur.src}
              className={cn("relative h-full w-full", zoom.scale > 1 && "cursor-grab")}
              style={{
                transform: `translate3d(${zoom.tx}px, ${zoom.ty}px, 0) scale(${zoom.scale})`,
                transition: gesturing ? "none" : "transform 200ms ease-out",
              }}
            >
              <LBImage src={cur.src} alt={cur.alt} unoptimized={unoptimized} />
            </div>

            {/* Преднагрузка соседей */}
            {n > 1 ? (
              <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
                {[(i + 1) % n, (i - 1 + n) % n]
                  .filter((x, pos, arr) => x !== i && arr.indexOf(x) === pos)
                  .map((x) => (
                    <Image key={photos[x].src} src={photos[x].src} alt="" fill unoptimized={unoptimized} sizes="100vw" className="object-contain" />
                  ))}
              </div>
            ) : null}

            {n > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label={labels?.prev ?? "Previous"}
                  className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/60 sm:block md:left-6 md:p-3"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label={labels?.next ?? "Next"}
                  className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/60 sm:block md:right-6 md:p-3"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>

          {/* Лента миниатюр */}
          {n > 1 ? (
            <div
              ref={stripRef}
              className="no-scrollbar absolute inset-x-0 bottom-0 z-10 flex gap-2 overflow-x-auto bg-gradient-to-t from-forest-900/70 to-transparent px-4 pb-3 pt-8 md:justify-center md:px-8 [@media(max-height:500px)]:hidden"
            >
              {photos.map((p, x) => (
                <button
                  type="button"
                  key={`${p.src}-${x}`}
                  data-thumb={x}
                  onClick={() => onIndexChange(x)}
                  aria-label={p.caption ? `${p.caption} ${x + 1}` : `${x + 1}`}
                  aria-current={x === i ? "true" : undefined}
                  className={cn(
                    "relative h-12 w-16 shrink-0 overflow-hidden rounded-sm transition-[opacity,box-shadow] duration-200 md:h-14 md:w-20",
                    x === i ? "opacity-100 ring-2 ring-brass-300" : "opacity-55 ring-1 ring-cream-50/20 hover:opacity-90",
                  )}
                >
                  <Image src={p.thumb ?? p.src} alt="" fill unoptimized={unoptimized} sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Прогресс-бар вместо ленты в ландшафте */}
          {n > 1 ? (
            <div className="absolute inset-x-0 bottom-0 z-10 hidden h-1 bg-cream-50/15 [@media(max-height:500px)]:block" aria-hidden>
              <div className="h-full bg-brass-400 transition-[width] duration-300" style={{ width: `${((i + 1) / n) * 100}%` }} />
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

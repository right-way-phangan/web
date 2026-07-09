"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";

const SWIPE_THRESHOLD_PX = 48;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_RADIUS_PX = 40;
// Палец сдвинулся меньше этого — жест считается тапом (кандидатом на дабл-тап);
// больше — это свайп/движение, чтобы короткие свайпы не срабатывали как зум.
const TAP_MOVE_MAX_PX = 10;

interface ZoomState {
  scale: number;
  tx: number;
  ty: number;
}
const ZOOM_RESET: ZoomState = { scale: 1, tx: 0, ty: 0 };

interface Options {
  /** Число кадров — свайп-навигация отключена при ≤ 1. */
  imageCount: number;
  /** Индекс текущего кадра — зум сбрасывается при его смене. */
  index: number;
  /** Открыт ли лайтбокс — зум сбрасывается на открытии/закрытии. */
  active: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Общий жест-слой полноэкранного лайтбокса для [[object-gallery]] и
 * [[photo-lightbox]] (раньше дублировался в обоих дословно — из-за чего баг
 * ложного зума пришлось чинить дважды). Пинч- и дабл-тап-зум с
 * панорамированием + горизонтальный свайп-листание поверх одной «сцены».
 *
 * Возвращает текущий зум-трансформ, флаг `gesturing` (гасит CSS-переход на
 * время жеста), ref сцены, `stageProps` (pointer/dbl-click хендлеры для
 * `{...spread}` на сцену) и `toggleZoom` для внешнего onDoubleClick.
 */
export function useLightboxGestures({ imageCount, index, active, onPrev, onNext }: Options) {
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

  // Свежий кадр → сброс зума.
  useEffect(() => {
    setZoom(ZOOM_RESET);
  }, [index, active]);

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

    // Дабл-тап → зум (только когда палец фактически не двигался).
    const now = Date.now();
    if (moved < TAP_MOVE_MAX_PX) {
      const last = lastTap.current;
      if (last && now - last.time < DOUBLE_TAP_MS && Math.hypot(e.clientX - last.x, e.clientY - last.y) < DOUBLE_TAP_RADIUS_PX) {
        lastTap.current = null;
        toggleZoom(e.clientX, e.clientY);
        return;
      }
      lastTap.current = { x: e.clientX, y: e.clientY, time: now };
      return;
    }
    // Любой заметный сдвиг (свайп) прерывает потенциальный дабл-тап.
    lastTap.current = null;

    // Свайп → листание (только без зума).
    if (zoomRef.current.scale === 1 && imageCount > 1 && Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) onPrev();
      else onNext();
    }
  };

  return {
    zoom,
    gesturing,
    stageRef,
    toggleZoom,
    stageProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick: (e: React.MouseEvent) => toggleZoom(e.clientX, e.clientY),
    },
  };
}

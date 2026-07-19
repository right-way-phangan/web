/**
 * Чистая логика скраб-видео героя («пролёт над Панганом с пикированием»).
 * Вынесена из компонента, чтобы покрыть vitest'ом без DOM: маппинг прогресса
 * скролла в таймкод видео, квантизация к сетке кадров, окна титров-чекпоинтов
 * и единый гейт «включать ли пролёт». Компонент — hero-flight.tsx.
 */

/** Окно проявления титра по прогрессу: [появление, начало плато, конец плато, исчезновение]. */
export type FadeWindow = [number, number, number, number];

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Прогресс скролла [0..1] → секунда таймлайна видео. Последняя доля `tail`
 * скролла держит финальный кадр (под ним видео гаснет, раскрывается hero),
 * поэтому время достигает `duration` уже к прогрессу (1 − tail) и там клампится.
 */
export function progressToTime(progress: number, duration: number, tail = 0.1): number {
  if (!(duration > 0)) return 0;
  const usable = Math.max(0, 1 - tail);
  const p = usable === 0 ? 1 : clamp01(progress / usable);
  return p * duration;
}

/** Секунда → ближайшая граница кадра при заданном fps (не спамим суб-кадровыми seek). */
export function quantizeToFrame(time: number, fps: number): number {
  if (!(fps > 0)) return Math.max(0, time);
  return Math.max(0, Math.round(time * fps) / fps);
}

/**
 * Прозрачность титра-чекпоинта на позиции `progress` — трапеция по окну
 * [fadeIn, holdStart, holdEnd, fadeOut]: подъём fadeIn→holdStart, плато =1,
 * спад holdEnd→fadeOut, вне окна 0.
 */
export function segmentOpacity(progress: number, win: FadeWindow): number {
  const [fadeIn, holdStart, holdEnd, fadeOut] = win;
  if (progress <= fadeIn || progress >= fadeOut) return 0;
  if (progress < holdStart) return clamp01((progress - fadeIn) / (holdStart - fadeIn));
  if (progress <= holdEnd) return 1;
  return clamp01((fadeOut - progress) / (fadeOut - holdEnd));
}

export interface FlightGateInput {
  /** prefers-reduced-motion. */
  reduce: boolean;
  /** matchMedia("(pointer: fine)") — мышь/трекпад, не тач. */
  pointerFine: boolean;
  /** window.innerWidth. */
  viewportWidth: number;
  /** порог десктопа (px). */
  minWidth: number;
  /** navigator.connection?.saveData. */
  saveData: boolean;
  /** navigator.connection?.effectiveType ("4g" | "3g" | "2g" | "slow-2g"). */
  effectiveType?: string;
  /** window.scrollY на момент готовности видео. */
  scrollY: number;
  /** window.innerHeight. */
  viewportHeight: number;
}

/**
 * Единственный гейт «превращать ли hero в скраб-пролёт». Пролёт — только на
 * десктопе с точным указателем, без reduced-motion и экономии трафика, на
 * небедленном соединении, и лишь пока пользователь ещё у верха страницы (иначе
 * рост высоты 88vh→320svh дёрнул бы вёрстку под ним). Любой false → сегодняшний
 * статичный hero.
 */
export function shouldEnableFlight(i: FlightGateInput): boolean {
  if (i.reduce) return false;
  if (!i.pointerFine) return false;
  if (i.viewportWidth < i.minWidth) return false;
  if (i.saveData) return false;
  if (i.effectiveType === "2g" || i.effectiveType === "slow-2g") return false;
  if (i.scrollY > i.viewportHeight * 0.5) return false;
  return true;
}

export type Spring2d = {
  /** Новая цель; интегратор сам запускается и сам останавливается, дойдя. */
  set(x: number, y: number): void;
  stop(): void;
};

/**
 * Двумерная пружина на rAF — замена useSpring из motion для декоративных
 * эффектов (магнитная кнопка, spotlight карточки). Полу-неявный Эйлер с
 * подшагом 1/120 с: устойчив при stiffness/mass до ~2000, чего хватает всем
 * пресетам сайта. Кадр рисуется только пока пружина не улеглась.
 */
export function createSpring2d(
  onFrame: (x: number, y: number) => void,
  { stiffness, damping, mass = 1 }: { stiffness: number; damping: number; mass?: number },
  initial = { x: 0, y: 0 },
): Spring2d {
  let x = initial.x;
  let y = initial.y;
  let vx = 0;
  let vy = 0;
  let tx = x;
  let ty = y;
  let raf = 0;
  let last = 0;

  const step = (now: number) => {
    let dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    while (dt > 0) {
      const h = Math.min(dt, 1 / 120);
      dt -= h;
      vx += ((stiffness * (tx - x) - damping * vx) / mass) * h;
      vy += ((stiffness * (ty - y) - damping * vy) / mass) * h;
      x += vx * h;
      y += vy * h;
    }
    const settled =
      Math.abs(tx - x) < 0.05 &&
      Math.abs(ty - y) < 0.05 &&
      Math.abs(vx) < 0.5 &&
      Math.abs(vy) < 0.5;
    if (settled) {
      x = tx;
      y = ty;
      vx = 0;
      vy = 0;
    }
    onFrame(x, y);
    raf = settled ? 0 : requestAnimationFrame(step);
  };

  return {
    set(nx, ny) {
      tx = nx;
      ty = ny;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

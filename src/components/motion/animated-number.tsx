"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced";

/**
 * Инерционный счётчик: при выходе в кадр число набегает от 0 к целевому с мягким
 * easing. SSR и no-JS рендерят финальное значение как обычный текст (для краулеров
 * и доступности), анимация — только украшение поверх: кадры пишутся прямо в
 * textContent, без ре-рендеров. Срабатывает один раз; под
 * prefers-reduced-motion число просто статично.
 */
export function AnimatedNumber({
  value,
  className,
  duration = 1.2,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || prefersReducedMotion()) return;
    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(value * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

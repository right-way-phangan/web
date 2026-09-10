"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Полный ход по Y в пикселях за всё время прохода блока через вьюпорт.
   * Положительный = слой «отстаёт» от скролла (уезжает вниз) → фон/глубина;
   * отрицательный = опережает → передний план. Дальние слои — меньше, ближние
   * — больше по модулю, это и создаёт ощущение глубины.
   */
  speed?: number;
  /** Доп. зум на скролле: от 1 до zoom (для фоновых сцен героя). 1 = выкл. */
  zoom?: number;
};

/**
 * Лёгкий scroll-parallax на GPU (только transform). Слой смещается/масштабируется
 * по мере прохода через кадр — основа «иммерсивной глубины» героя и акцентов
 * секций. SSR-safe: на сервере и под prefers-reduced-motion слой статичен
 * (ничего не прячем, никаких прыжков). Прогресс считается по РОДИТЕЛЮ
 * (секции): у самого слоя transform, и его rect уже сдвинут — замер по нему
 * дал бы обратную связь. Пассивный scroll-листенер + один rAF на кадр.
 */
export function Parallax({
  children,
  className,
  speed = 60,
  zoom = 1,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || prefersReducedMotion()) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 — верх секции у нижней кромки экрана, 1 — низ секции у верхней.
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const y = -speed / 2 + p * speed;
      el.style.transform =
        zoom === 1
          ? `translateY(${y}px)`
          : `translateY(${y}px) scale(${1 + (zoom - 1) * p})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [speed, zoom]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

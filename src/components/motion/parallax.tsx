"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

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
 * секций. SSR-safe: на сервере и под prefers-reduced-motion рендерится обычный
 * статичный div (ничего не прячем, никаких прыжков). useScroll сам слушает
 * пассивно — без ручных scroll-листенеров (никаких reflow на каждый кадр).
 */
export function Parallax({
  children,
  className,
  speed = 60,
  zoom = 1,
}: ParallaxProps) {
  const reduce = useReducedMotion();
  const localRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: localRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed / 2, speed / 2]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, zoom]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={localRef}
      className={className}
      style={{ y, scale: zoom === 1 ? undefined : scale, willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

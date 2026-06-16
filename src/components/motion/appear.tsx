"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type AppearProps = {
  children: React.ReactNode;
  className?: string;
  /** Стартовое смещение по Y в пикселях. */
  y?: number;
  /** Задержка старта в секундах — для каскада карточек в сетке. */
  delay?: number;
  /** Длительность проявления в секундах. */
  duration?: number;
};

/**
 * Премиальный fade-up при выходе блока в кадр. Повторяет SSR-инвариант
 * <Reveal>: на сервере и до гидрации контент полностью видим (краулеры и
 * посетители без JS видят всё), элемент прячется ТОЛЬКО после гидрации и лишь
 * если он ещё ниже сгиба — поэтому нет мигания того, что уже на экране. Скрытие
 * мгновенное (как у .reveal), проявление — с мягким «дорогим» easing.
 * Полностью отключается под prefers-reduced-motion.
 */
export function Appear({
  children,
  className,
  y = 28,
  delay = 0,
  duration = 0.7,
}: AppearProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // "ready" — статичный видимый рендер (SSR + до решения); затем hidden/shown.
  const [phase, setPhase] = useState<"ready" | "hidden" | "shown">("ready");

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !("IntersectionObserver" in window)) return;
    // Уже на экране при гидрации → показываем сразу, без скрытия и анимации.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      setPhase("shown");
      return;
    }
    setPhase("hidden");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("shown");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduce]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={phase === "hidden" ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      // Прятать — мгновенно (как .reveal через класс), проявлять — плавно.
      transition={
        phase === "hidden"
          ? { duration: 0 }
          : { duration, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}

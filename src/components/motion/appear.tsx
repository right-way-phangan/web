"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced";

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
 * мгновенное, проявление — CSS-transition с мягким «дорогим» easing
 * (.appear-hidden / .appear-visible в globals.css). Без motion: этот компонент
 * стоит на каждой карточке каталога, и тащить ради него 44 КБ библиотеки в
 * критический путь всех страниц было главным источником TBT главной.
 * Полностью отключается под prefers-reduced-motion.
 */
export function Appear({
  children,
  className,
  y = 18,
  delay = 0,
  duration = 0.45,
}: AppearProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "hidden" | "visible">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || prefersReducedMotion()) return;
    // Уже на экране — не прятать то, на что смотрит посетитель.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setPhase("hidden");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("visible");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px 12% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Класс `appear` нужен для print-оверрайда в globals.css: при печати
  // (брошюра объекта) блоки ниже сгиба иначе остались бы скрытыми (opacity:0).
  const cls = ["appear", phase !== "idle" && `appear-${phase}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={cls}
      style={
        {
          "--appear-y": `${y}px`,
          "--appear-duration": `${duration}s`,
          "--appear-delay": `${delay}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

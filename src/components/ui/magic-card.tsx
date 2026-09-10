"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { prefersReducedMotion } from "@/lib/motion/reduced";
import { createSpring2d, type Spring2d } from "@/lib/motion/spring";

// Пятно догоняет курсор пружиной, а не липнет к нему пиксель в пиксель: жёсткая
// привязка читается механически, инерция делает подсветку живой. Эффект чисто
// декоративный — ровно тот случай, где физика уместна.
const SPOTLIGHT_SPRING = { stiffness: 150, damping: 20, mass: 0.1 };

/**
 * MagicCard — рамка-spotlight, следящая за курсором (подсветка границы +
 * мягкая заливка тела при наведении).
 *
 * Адаптировано из 21st.dev / magicui «Magic Card» (dillionverma) под канон
 * Right Way:
 *  • без motion: пружина на rAF (lib/motion/spring) пишет координаты пятна в
 *    CSS-переменные --spot-x/--spot-y, а рамка и заливка читают их через var().
 *    Карточка стоит на каждой странице каталога — библиотека в критическом
 *    пути была бы платой всех страниц за декор при наведении;
 *  • убраны next-themes + orb-режим — чтобы не тянуть новые зависимости;
 *  • цвета берутся из CSS-переменных палитры (rgb(var(--c-*))) — поэтому
 *    компонент автоматически перекрашивается в тёмной теме (класс .dark),
 *    как и весь сайт; никакого хардкода hex;
 *  • дефолтные фиолетовые #9E7AFF/#FE8BBB → brass (без «AI purple bias»);
 *  • добавлен motion-reduce для доступности.
 */
interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  /** Диаметр пятна подсветки, px. */
  gradientSize?: number;
  /** Цвет градиента рамки (старт). */
  gradientFrom?: string;
  /** Цвет градиента рамки (финиш). */
  gradientTo?: string;
  /** Цвет мягкой заливки тела карточки при наведении. */
  gradientColor?: string;
  /** Прозрачность заливки-подсветки (0–1). */
  gradientOpacity?: number;
  /** Цвет подложки/«щели» рамки (поверхность карточки). */
  background?: string;
  /** Цвет статичной рамки вне пятна. */
  borderColor?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientFrom = "rgb(var(--c-brass-300))",
  gradientTo = "rgb(var(--c-brass-500))",
  gradientColor = "rgb(var(--c-brass-500) / 0.10)",
  gradientOpacity = 1,
  background = "rgb(var(--c-cream-50))",
  borderColor = "rgb(var(--c-forest-500) / 0.12)",
}: MagicCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const spring = useRef<Spring2d | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const s = createSpring2d(
      (x, y) => {
        el.style.setProperty("--spot-x", `${x}px`);
        el.style.setProperty("--spot-y", `${y}px`);
      },
      SPOTLIGHT_SPRING,
      { x: -gradientSize, y: -gradientSize },
    );
    spring.current = s;
    // Курсор может покинуть страницу мимо pointerleave — гасим пятно глобально.
    const hide = () => s.set(-gradientSize, -gradientSize);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("blur", hide);
      s.stop();
      spring.current = null;
    };
  }, [gradientSize]);

  const reset = () => spring.current?.set(-gradientSize, -gradientSize);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Палец ничего не «наводит»: на тач-экране подсветка курсора смысла не
    // имеет и только жжёт кадры во время скролла каталога.
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    spring.current?.set(e.clientX - rect.left, e.clientY - rect.top);
  };

  // Рамка: поверхность (padding-box) + радиальный brass-градиент (border-box).
  const borderBackground = `linear-gradient(${background} 0 0) padding-box, radial-gradient(${gradientSize}px circle at var(--spot-x) var(--spot-y), ${gradientFrom}, ${gradientTo}, ${borderColor} 100%) border-box`;

  return (
    <div
      ref={ref}
      className={cn(
        "group/magic relative isolate overflow-hidden rounded-sm border border-transparent",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={
        {
          "--spot-x": `${-gradientSize}px`,
          "--spot-y": `${-gradientSize}px`,
          background: borderBackground,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-px z-20 rounded-[inherit]"
        style={{ background }}
      />
      {/* Пятно всегда «включено» — за пределами карточки его просто не видно
          (overflow-hidden у корня), поэтому гасить его на hover не нужно.
          Размер слоя — диаметр, отрицательные margin центруют его на курсоре. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-30 rounded-full"
        style={{
          width: gradientSize * 2,
          height: gradientSize * 2,
          marginLeft: -gradientSize,
          marginTop: -gradientSize,
          background: `radial-gradient(circle ${gradientSize}px at center, ${gradientColor}, transparent 100%)`,
          opacity: gradientOpacity,
          transform: "translate3d(var(--spot-x), var(--spot-y), 0)",
        }}
      />
      <div className="relative z-40 h-full">{children}</div>
    </div>
  );
}

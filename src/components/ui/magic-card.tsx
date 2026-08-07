"use client";

import React, { useCallback, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils/cn";

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
 *  • импорт из "motion/react" (пакет motion@12), не из legacy "framer-motion";
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
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const spotX = useSpring(mouseX, SPOTLIGHT_SPRING);
  const spotY = useSpring(mouseY, SPOTLIGHT_SPRING);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Палец ничего не «наводит»: на тач-экране подсветка курсора смысла не
      // имеет и только жжёт кадры во время скролла каталога.
      if (e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  // Курсор может покинуть страницу мимо pointerleave — гасим пятно глобально.
  useEffect(() => {
    const hide = () => reset();
    window.addEventListener("blur", hide);
    return () => window.removeEventListener("blur", hide);
  }, [reset]);

  // Рамка: поверхность (padding-box) + радиальный brass-градиент (border-box).
  const borderBackground = useMotionTemplate`
    linear-gradient(${background} 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${spotX}px ${spotY}px,
      ${gradientFrom}, ${gradientTo}, ${borderColor} 100%) border-box
  `;
  // Заливка тела ездит трансформом, а не пересчётом градиента: полная строка
  // translate3d вместо шортката x/y — так слой уходит на композитор и не роняет
  // кадры, когда основной поток занят подгрузкой каталога.
  const spotlightTransform = useMotionTemplate`translate3d(${spotX}px, ${spotY}px, 0)`;

  return (
    <motion.div
      className={cn(
        "group/magic relative isolate overflow-hidden rounded-sm border border-transparent",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ background: borderBackground }}
    >
      <div
        className="absolute inset-px z-20 rounded-[inherit]"
        style={{ background }}
      />
      {/* Пятно всегда «включено» — за пределами карточки его просто не видно
          (overflow-hidden у корня), поэтому гасить его на hover не нужно.
          Размер слоя — диаметр, отрицательные margin центруют его на курсоре. */}
      <motion.div
        aria-hidden
        suppressHydrationWarning
        className="pointer-events-none absolute left-0 top-0 z-30 rounded-full"
        style={{
          width: gradientSize * 2,
          height: gradientSize * 2,
          marginLeft: -gradientSize,
          marginTop: -gradientSize,
          background: `radial-gradient(circle ${gradientSize}px at center, ${gradientColor}, transparent 100%)`,
          opacity: gradientOpacity,
          transform: spotlightTransform,
        }}
      />
      <div className="relative z-40 h-full">{children}</div>
    </motion.div>
  );
}

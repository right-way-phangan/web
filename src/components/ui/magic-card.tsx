"use client";

import React, { useCallback, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";

import { cn } from "@/lib/utils/cn";

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

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom}, ${gradientTo}, ${borderColor} 100%) border-box
  `;
  // Заливка тела: мягкое пятно, проявляется только на hover.
  const spotlight = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor}, transparent 100%)
  `;

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
      <motion.div
        suppressHydrationWarning
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/magic:opacity-100 motion-reduce:transition-none"
        style={{ background: spotlight, opacity: gradientOpacity }}
      />
      <div className="relative z-40 h-full">{children}</div>
    </motion.div>
  );
}

"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

/**
 * Магнитная обёртка для CTA: при наведении мышью содержимое слегка тянется к
 * курсору на пружине — кинетическое «дорогое» микро-взаимодействие. Только для
 * мыши (на тач-устройствах и под prefers-reduced-motion — обычный inline-блок,
 * без обработчиков), чтобы не ломать тапы. Сам ребёнок (Button) сохраняет свой
 * press-scale — магнетизм лишь добавляет смещение поверх.
 */
export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const x = useSpring(mvX, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(mvY, { stiffness: 220, damping: 16, mass: 0.4 });

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y, display: "inline-flex", willChange: "transform" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        mvX.set((e.clientX - (r.left + r.width / 2)) * strength);
        mvY.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        mvX.set(0);
        mvY.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

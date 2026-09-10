"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced";
import { createSpring2d } from "@/lib/motion/spring";

const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

/**
 * Деликатный «магнитный» эффект для ключевых CTA: элемент слегка тянется к
 * курсору и пружинно возвращается. Сдвиг жёстко ограничен (±12/±8px), чтобы
 * читалось как премиум-деталь, а не аттракцион. Под prefers-reduced-motion и на
 * сенсорных вводах (без точного указателя) — обычный статичный элемент.
 */
export function Magnetic({
  children,
  className,
  strength = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const spring = createSpring2d(
      (x, y) => {
        el.style.transform = `translate(${x}px, ${y}px)`;
      },
      { stiffness: 200, damping: 15, mass: 0.3 },
    );
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      spring.set(clamp(mx * strength, 12), clamp(my * strength, 8));
    };
    const reset = () => spring.set(0, 0);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      spring.stop();
    };
  }, [strength]);

  return (
    <span ref={ref} className={className} style={{ display: "inline-flex" }}>
      {children}
    </span>
  );
}

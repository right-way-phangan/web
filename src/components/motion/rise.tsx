"use client";

import { motion, useReducedMotion } from "motion/react";

type RiseProps = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
};

/**
 * Лёгкий entrance на маунте — для второстепенных акцентов над сгибом (надзаголовки,
 * блоки кнопок), которые НЕ критичны для SEO/AEO. Важный текст (H1, лид-абзац)
 * сюда не оборачиваем: он остаётся статично видимым в SSR. motion рендерит
 * скрытое состояние сразу в разметке, поэтому появление плавное, без мигания.
 * Под prefers-reduced-motion — статичный видимый рендер.
 */
export function Rise({
  children,
  className,
  y = 16,
  delay = 0,
  duration = 0.6,
}: RiseProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

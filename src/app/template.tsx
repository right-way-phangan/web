"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Плавный переход между страницами — мягкий кросс-фейд контента при навигации.
 * template.tsx ремаунтится на каждый переход, поэтому модульный флаг `navigated`
 * (переживает ремаунты) даёт ключевое: ПЕРВЫЙ рендер (initial load + SSR) НЕ
 * анимируем — иначе фейд задел бы LCP; анимируем только последующие клиентские
 * переходы. Только opacity (без transform) — чтобы не создавать containing block
 * и не ломать position: sticky (липкая карта на /listings). Под reduced-motion
 * переходы выключены.
 */
let navigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const isFirst = useRef(!navigated);
  // Флаг ставится после монтирования, а НЕ во время рендера. Пока он менялся
  // прямо в теле, повторный рендер (React прерывает и перезапускает гидрацию,
  // когда разметка приходит медленно) видел navigated=true и подмешивал
  // <motion.div>, которого нет в серверном HTML: hydration-ошибка React #418.
  // Замерено на прод-сборке при Fast 3G: /calculator 5/12 прогонов → 0/12.
  useEffect(() => {
    navigated = true;
  }, []);

  if (reduce || isFirst.current) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

/**
 * Тонкая латунная полоса прогресса чтения у верхней кромки страницы —
 * сдержанная «дорогая» деталь. Пружинно сглажена, чтобы не дёргаться за
 * скроллом. Чисто декоративная (aria-hidden), под prefers-reduced-motion
 * не рендерится вовсе.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-brass-500 via-brass-400 to-brass-300 print:hidden"
      style={{ scaleX }}
    />
  );
}

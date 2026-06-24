"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Пока есть советы в очереди/обработке (веб-дверь «Спросить совет» асинхронна —
 * локальный бот считает на Max ~1–2 мин), мягко перезапрашиваем страницу, чтобы
 * статус и ответ появились сами, без ручного F5. Останавливается, когда активных
 * нет.
 */
export function CouncilAutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [active, router]);
  return null;
}

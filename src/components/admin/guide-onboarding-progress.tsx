"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Сводный прогресс онбординга: агрегирует все чек-листы страницы «С чего
 * начать» (ключи localStorage `rwguide:checklist:onboarding:*`) в один
 * индикатор. Обновляется на тик любого чекбокса (событие rwguide:checklist).
 * Вставляется маркером {{onboarding-progress}}.
 */

const PREFIX = "rwguide:checklist:onboarding:";

function readProgress(): { done: number; total: number } {
  let done = 0;
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const arr = JSON.parse(localStorage.getItem(k) || "[]");
      if (Array.isArray(arr)) {
        total += arr.length;
        done += arr.filter(Boolean).length;
      }
    }
  } catch {
    /* localStorage недоступен */
  }
  return { done, total };
}

export function GuideOnboardingProgress() {
  const [{ done, total }, setProgress] = useState({ done: 0, total: 0 });
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => setProgress(readProgress()), []);

  useEffect(() => {
    refresh();
    setReady(true);
    const onChange = () => refresh();
    window.addEventListener("rwguide:checklist", onChange);
    window.addEventListener("storage", onChange); // синхронизация между вкладками
    return () => {
      window.removeEventListener("rwguide:checklist", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  // Пока не смонтировались / нет отмеченных пунктов — не мешаем чтению.
  if (!ready || total === 0) return null;

  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-forest-900">
          {allDone ? "Онбординг пройден 🎉" : "Прогресс онбординга"}
        </span>
        <span className="text-sm font-semibold tabular-nums text-forest-900/60">
          {pct}% · {done}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-forest-900/10">
        <div
          className={"h-full w-full origin-left rounded-full transition-transform duration-300 " + (allDone ? "bg-panel" : "bg-brass-500")}
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      <p className="mt-2 text-xs text-forest-900/50">
        Считается по галочкам в чек-листах ниже. Отметки сохраняются в этом браузере.
      </p>
    </div>
  );
}

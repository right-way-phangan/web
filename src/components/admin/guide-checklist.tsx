"use client";

import { useEffect, useState } from "react";

/**
 * Интерактивный чек-лист в справочнике (markdown `- [ ] …` / `- [x] …`).
 * Прогресс сохраняется в localStorage по ключу (slug страницы + хеш текстов
 * пунктов) — переживает перезагрузку и переходы. Используется в онбординге
 * агента: «отметил сделанное — видно, сколько осталось». Чисто клиентский
 * прогресс, без backend (один агент на старте).
 */

// Стабильный хеш набора пунктов (djb2) — ключ инвалидируется, если текст
// чек-листа изменили (тогда старый прогресс не подтянется, и это правильно).
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function GuideChecklist({
  items,
  storageKey,
}: {
  items: string[];
  storageKey: string;
}) {
  const key = `rwguide:checklist:${storageKey}:${hash(items.join("|"))}`;
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw) as boolean[];
        if (Array.isArray(arr) && arr.length === items.length) setDone(arr);
      }
    } catch {
      /* localStorage недоступен — работаем в памяти */
    }
    setReady(true);
    // key включает хеш items — пересоберётся при смене набора
  }, [key, items.length]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = prev.slice();
      next[i] = !next[i];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const count = done.filter(Boolean).length;
  const pct = items.length ? Math.round((count / items.length) * 100) : 0;
  const allDone = count === items.length && items.length > 0;

  return (
    <div className="rounded-xl border border-forest-900/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest-900/10">
          <div
            className={"h-full rounded-full transition-all " + (allDone ? "bg-forest-500" : "bg-brass-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-forest-900/55">
          {allDone ? "✓ готово" : `${count}/${items.length}`}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={done[i]}
              className="flex w-full items-start gap-2.5 rounded-lg px-1.5 py-1 text-left text-sm hover:bg-forest-900/[0.03]"
            >
              <span
                className={
                  "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] transition " +
                  (done[i]
                    ? "border-forest-500 bg-forest-500 text-white"
                    : "border-forest-900/30 text-transparent")
                }
              >
                ✓
              </span>
              <span className={done[i] ? "text-forest-900/45 line-through" : "text-forest-900/80"}>
                {it}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {ready && allDone && (
        <p className="mt-3 text-xs text-forest-500">Все пункты отмечены — отличная работа.</p>
      )}
    </div>
  );
}

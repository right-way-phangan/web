"use client";

import { useState } from "react";

/** Поле «только чтение» с кнопкой копирования — для выдачи ссылок из админки. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-xs text-forest-900/50">{label}</span>
      <input
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-md border border-forest-900/10 bg-white px-2 py-1 font-mono text-xs text-forest-900/80"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          } catch {
            // без clipboard API — поле выделяется по фокусу, копируют руками
          }
        }}
        className="shrink-0 rounded-full border border-forest-900/15 px-3 py-1 text-xs text-forest-900/70 hover:bg-forest-900/5"
      >
        {done ? "Скопировано" : "Копировать"}
      </button>
    </div>
  );
}

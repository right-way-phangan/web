"use client";

import { Printer } from "lucide-react";
import { track } from "@/lib/analytics/track";

/**
 * Кнопка «Печать / PDF» подборки — вызывает системный диалог печати (туда же —
 * «Сохранить как PDF»). Печатные стили в globals.css прячут навигацию/оверлеи и
 * раскрывают план/таблицу. Клиентский компонент (window.print).
 */
export function EstatePrintButton({ label, slug }: { label: string; slug: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        track("estate_print", { estate: slug });
        window.print();
      }}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-forest-500/20 px-3 py-2.5 text-xs font-medium text-forest-900 transition-colors hover:border-brass-500 hover:text-brass-700 print:hidden"
    >
      <Printer className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

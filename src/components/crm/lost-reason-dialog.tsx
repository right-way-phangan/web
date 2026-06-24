"use client";

import { useState } from "react";

export const LOST_REASONS = [
  "Цена",
  "Передумал",
  "Ушёл к конкуренту",
  "Не отвечает",
] as const;

/**
 * Tiny modal asked whenever a lead is moved to a lost stage: pick why the deal
 * died (or type a custom reason) so the dashboard can aggregate loss causes.
 */
export function LostReasonDialog({
  contactName,
  onConfirm,
  onCancel,
}: {
  contactName?: string | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [other, setOther] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-panel/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream-50 p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-forest-900">
          Почему потеряли{contactName ? ` ${contactName}` : " лид"}?
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {LOST_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onConfirm(r)}
              className="rounded-lg border border-forest-900/15 px-3 py-2 text-sm text-forest-900/80 hover:border-brass-500/50 hover:bg-brass-500/5"
            >
              {r}
            </button>
          ))}
        </div>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (other.trim()) onConfirm(other.trim());
          }}
        >
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Другая причина…"
            className="min-w-0 flex-1 rounded-lg border border-forest-900/15 px-3 py-2 text-sm outline-none focus:border-brass-500"
          />
          <button
            type="submit"
            disabled={!other.trim()}
            className="rounded-lg bg-panel px-3 py-2 text-sm font-medium text-panel-fg disabled:opacity-40"
          >
            OK
          </button>
        </form>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full text-center text-xs text-forest-900/50 hover:text-forest-900"
        >
          Отмена — не переносить
        </button>
      </div>
    </div>
  );
}

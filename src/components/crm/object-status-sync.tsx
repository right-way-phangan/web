"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateObjectAction } from "@/lib/actions/update-object";

const STATUSES = ["Active", "Reserved", "Sold"] as const;
const LABEL: Record<string, string> = {
  Active: "Active · на сайте",
  Reserved: "Reserved",
  Sold: "Sold",
};

/**
 * Manual object↔deal status sync on the lead card — deliberately NOT automatic.
 * When a deal advances (reservation→transfer→won), the linked object should
 * leave the public site (only Active is listed). This shows the object's live
 * status, warns if it's out of sync with the deal stage, and lets the agent flip
 * it with one click. Reversible — set it back to Active to relist. Touching the
 * public site stays the agent's explicit decision, not a side effect.
 */
export function ObjectStatusSync({
  rwNumber,
  currentStatus,
  suggested,
}: {
  rwNumber: string;
  currentStatus: string;
  /** Status the deal stage implies (Reserved for reservation+, Sold for won). */
  suggested: "Reserved" | "Sold";
}) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const mismatch = status === "Active"; // deal advanced but object still public

  function set(next: string) {
    setError(null);
    setStatus(next);
    start(async () => {
      const res = await updateObjectAction(rwNumber, { status: next });
      if (!res.ok) {
        setError(res.error ?? "Не удалось сохранить");
        setStatus(currentStatus);
      }
      router.refresh();
    });
  }

  return (
    <div
      className={
        "rounded-xl border p-3 " +
        (mismatch ? "border-amber-400/50 bg-amber-50" : "border-forest-900/10 bg-cream-50")
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-forest-900">
          Статус объекта {rwNumber} на сайте
        </p>
        <span
          className={
            "rounded-full px-2 py-0.5 text-xs font-medium " +
            (status === "Active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-forest-900/10 text-forest-900/60")
          }
        >
          {LABEL[status] ?? status}
        </span>
      </div>

      {mismatch ? (
        <p className="mt-1.5 text-xs text-amber-800">
          ⚠️ Сделка уже продвинута, а объект ещё <b>Active</b> — публично доступен. Пометьте{" "}
          <b>{suggested}</b>, чтобы снять с продажи и исключить двойную бронь.
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-forest-900/50">
          Объект не на публичном сайте (только Active виден). Вернуть в продажу — кнопка Active.
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => {
          const isCur = s === status;
          const isSuggested = s === suggested && mismatch;
          return (
            <button
              key={s}
              type="button"
              disabled={pending || isCur}
              onClick={() => set(s)}
              className={
                "rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-default " +
                (isCur
                  ? "bg-panel text-panel-fg"
                  : isSuggested
                    ? "bg-amber-500 text-panel-fg hover:bg-amber-600"
                    : "border border-forest-900/15 text-forest-900/70 hover:bg-forest-900/5")
              }
            >
              {isCur ? "✓ " : isSuggested ? "→ " : ""}
              {LABEL[s] ?? s}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

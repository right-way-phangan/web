"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMonthlyTarget } from "@/lib/actions/settings";

/** Inline editor for the monthly commission target (THB) — drives «% от цели». */
export function TargetEditor({ value }: { value: number | null }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value != null ? String(value) : "");
  const router = useRouter();

  function save() {
    const parsed = Number(draft.replace(/[^\d.]/g, ""));
    start(async () => {
      await setMonthlyTarget(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-[11px] font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
      >
        {value != null ? "изменить цель" : "+ задать цель месяца"}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-white/70">฿</span>
      <input
        autoFocus
        inputMode="numeric"
        value={draft}
        disabled={pending}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="цель, THB"
        className="w-28 rounded border border-white/25 bg-white/10 px-2 py-0.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/60"
      />
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-forest-900 disabled:opacity-40"
      >
        ОК
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setDraft(value != null ? String(value) : "");
          setEditing(false);
        }}
        className="text-xs text-white/50 hover:text-white/80"
      >
        ✕
      </button>
    </span>
  );
}

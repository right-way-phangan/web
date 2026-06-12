"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadValue } from "@/lib/actions/lead-meta";

/** Inline editor for the expected deal size (THB) — feeds pipeline money. */
export function DealValue({
  leadId,
  value,
  objectPrice,
}: {
  leadId: number;
  value: number | null;
  objectPrice?: number | null;
}) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(value != null ? String(value) : "");
  const router = useRouter();

  function save(v: number | null) {
    start(async () => {
      await updateLeadValue(leadId, v);
      router.refresh();
    });
  }

  const parsed = Number(draft.replace(/[^\d.]/g, ""));
  const dirty = (Number.isFinite(parsed) && parsed > 0 ? parsed : null) !== (value ?? null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-forest-900/55">฿</span>
      <input
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="сумма сделки, THB"
        className="w-36 rounded-md border border-forest-900/15 bg-white px-2 py-1 text-sm outline-none focus:border-brass-500"
      />
      {dirty && (
        <button
          type="button"
          disabled={pending}
          onClick={() => save(Number.isFinite(parsed) && parsed > 0 ? parsed : null)}
          className="rounded-md bg-forest-900 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
        >
          Сохранить
        </button>
      )}
      {!draft && objectPrice ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setDraft(String(objectPrice));
            save(objectPrice);
          }}
          className="rounded-md bg-brass-500/10 px-2.5 py-1 text-xs font-medium text-brass-600 hover:bg-brass-500/20 disabled:opacity-40"
        >
          ← цена объекта ฿{new Intl.NumberFormat("en-US").format(objectPrice)}
        </button>
      ) : null}
    </div>
  );
}

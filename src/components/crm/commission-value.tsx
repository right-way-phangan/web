"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadCommission } from "@/lib/actions/lead-meta";

/** Inline editor for the actual commission earned (THB) on a won deal —
 * feeds the deals ledger on /admin/finance. The formula amount is one tap. */
export function CommissionValue({
  leadId,
  value,
  suggested,
}: {
  leadId: number;
  value: number | null;
  /** max(5% × dealValue; 150k) — prefill button when the field is empty. */
  suggested?: number | null;
}) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(value != null ? String(value) : "");
  const router = useRouter();

  function save(v: number | null) {
    start(async () => {
      await updateLeadCommission(leadId, v);
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
        placeholder="комиссия (факт), THB"
        className="w-36 rounded-md border border-forest-900/15 bg-cream-50 px-2 py-1 text-sm outline-none focus:border-brass-500"
      />
      {dirty && (
        <button
          type="button"
          disabled={pending}
          onClick={() => save(Number.isFinite(parsed) && parsed > 0 ? parsed : null)}
          className="rounded-md bg-panel px-2.5 py-1 text-xs font-medium text-panel-fg disabled:opacity-40"
        >
          Сохранить
        </button>
      )}
      {!draft && suggested ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setDraft(String(suggested));
            save(suggested);
          }}
          className="rounded-md bg-brass-500/10 px-2.5 py-1 text-xs font-medium text-brass-600 hover:bg-brass-500/20 disabled:opacity-40"
        >
          ← по формуле ฿{new Intl.NumberFormat("en-US").format(suggested)}
        </button>
      ) : null}
    </div>
  );
}

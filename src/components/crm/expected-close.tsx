"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateExpectedClose } from "@/lib/actions/lead-meta";

/** ISO instant → "YYYY-MM-DD" for the date input (UTC, matches storage). */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/**
 * Inline editor for the forecasted close date — feeds the monthly revenue
 * forecast on /admin/crm/stats. Stored as UTC midnight of the picked day.
 */
export function ExpectedClose({ leadId, value }: { leadId: number; value: string | null }) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(toDateInput(value));
  const router = useRouter();

  function save(dateStr: string) {
    start(async () => {
      // date-only → UTC midnight; empty clears.
      await updateExpectedClose(leadId, dateStr ? `${dateStr}T00:00:00.000Z` : null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={draft}
        disabled={pending}
        onChange={(e) => {
          setDraft(e.target.value);
          save(e.target.value);
        }}
        className="rounded-md border border-forest-900/15 bg-white px-2 py-1 text-sm text-forest-900/80 outline-none focus:border-brass-500 disabled:opacity-50"
      />
      {draft && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setDraft("");
            save("");
          }}
          className="text-xs text-forest-900/40 hover:text-forest-900/70 disabled:opacity-40"
        >
          очистить
        </button>
      )}
    </div>
  );
}

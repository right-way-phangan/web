"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { remindLeadAction } from "@/lib/actions/lead-actions";

const OPTIONS = [
  { days: 3, label: "+3 дня" },
  { days: 7, label: "+7 дней" },
  { days: 14, label: "+2 недели" },
];

/** One-tap "remind me about this lead later" — drops a dated follow-up task. */
export function LeadSnooze({ leadId }: { leadId: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<number | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-forest-900/50">🔔 Напомнить:</span>
      {OPTIONS.map(({ days, label }) => (
        <button
          key={days}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await remindLeadAction(leadId, days);
              setDone(days);
              router.refresh();
            })
          }
          className={`rounded-full border px-2.5 py-1 text-xs font-medium disabled:opacity-40 ${
            done === days
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
              : "border-forest-900/15 text-forest-900/65 hover:bg-forest-900/5"
          }`}
        >
          {done === days ? "✓ " : ""}
          {label}
        </button>
      ))}
    </div>
  );
}

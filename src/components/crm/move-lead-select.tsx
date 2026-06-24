"use client";

import { useTransition } from "react";
import { moveLead } from "@/lib/actions/move-lead";

/** Stage selector on a lead card — changing it moves the lead (server action). */
export function MoveLeadSelect({
  leadId,
  stages,
  currentStageKey,
}: {
  leadId: number;
  stages: Array<{ key: string; name: string }>;
  currentStageKey?: string | null;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={currentStageKey ?? ""}
      disabled={pending}
      onChange={(e) => start(() => moveLead(leadId, e.target.value))}
      className="w-full rounded-md border border-forest-900/15 bg-cream-50 px-2 py-1 text-xs text-forest-900 outline-none focus:border-brass-500 disabled:opacity-50"
      aria-label="Move to stage"
    >
      {stages.map((s) => (
        <option key={s.key} value={s.key}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

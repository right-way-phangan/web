"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleDealStep } from "@/lib/actions/lead-meta";
import { DEAL_CHECKLIST, dealProgress } from "@/lib/crm/deal-checklist";

/**
 * Transaction execution checklist — the "what's left to close" panel for a deal
 * in reservation→transfer. Groups by stage; the group matching the lead's
 * current stage is highlighted as the active focus.
 */
export function DealChecklist({
  leadId,
  checklist,
  currentStageKey,
}: {
  leadId: number;
  checklist: Record<string, string> | null;
  currentStageKey?: string | null;
}) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, string>>(checklist ?? {});
  const router = useRouter();

  const progress = dealProgress(optimistic);

  function toggle(key: string, done: boolean) {
    setOptimistic((cur) => {
      const next = { ...cur };
      if (done) next[key] = new Date().toISOString();
      else delete next[key];
      return next;
    });
    start(async () => {
      await toggleDealStep(leadId, key, done);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-forest-900">Чек-лист сделки</h3>
        <span className="text-xs text-forest-900/55">
          {progress.doneCount}/{progress.total}
          {progress.nextGroup ? ` · далее: ${progress.nextGroup}` : " · готово ✓"}
        </span>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-forest-900/10">
        <div
          className="h-full w-full origin-left rounded-full bg-brass-500 transition-transform duration-300"
          style={{ transform: `scaleX(${progress.doneCount / progress.total})` }}
        />
      </div>
      <div className="space-y-4">
        {DEAL_CHECKLIST.map((group) => {
          const active = group.stageKey === currentStageKey;
          return (
            <div key={group.stageKey}>
              <p
                className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${
                  active ? "text-brass-600" : "text-forest-900/45"
                }`}
              >
                {group.title}
                {active && <span className="ml-1.5 normal-case text-brass-500">• текущая</span>}
              </p>
              <ul className="space-y-1">
                {group.steps.map((step) => {
                  const done = Boolean(optimistic[step.key]);
                  return (
                    <li key={step.key}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={pending}
                          onChange={(e) => toggle(step.key, e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-forest-900/30 accent-brass-500 disabled:opacity-50"
                        />
                        <span className={done ? "text-forest-900/40 line-through" : "text-forest-900/80"}>
                          {step.label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

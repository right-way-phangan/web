"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviveLeadAction, markDeadAction, triageLaterAction } from "@/lib/actions/triage-actions";

const DEAD_REASONS = ["Не отвечает", "Неактуально", "Чужой рынок", "Спам/мусор"];

/**
 * The three big triage verdicts for one legacy lead. Every action refreshes
 * the server page, which then serves the next lead in the queue.
 */
export function TriageActions({ leadId }: { leadId: number }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [askDead, setAskDead] = useState(false);
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Не получилось.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => reviveLeadAction(leadId, "land"))}
          className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-500/25 disabled:opacity-40"
        >
          ♻️ Реанимировать → Land
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => reviveLeadAction(leadId, "villa_house"))}
          className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-500/25 disabled:opacity-40"
        >
          ♻️ Реанимировать → Villas
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => setAskDead((v) => !v)}
          className="rounded-xl bg-forest-900/5 px-4 py-3 text-sm font-semibold text-forest-900/60 hover:bg-forest-900/10 disabled:opacity-40"
        >
          ☠️ Мёртв…
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => triageLaterAction(leadId, 7))}
          className="rounded-xl bg-forest-900/5 px-4 py-3 text-sm font-semibold text-forest-900/60 hover:bg-forest-900/10 disabled:opacity-40"
        >
          ⏳ Позже (+7 дн)
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            // Skip is pure navigation — the server page resumes after this id.
            router.push(`/admin/crm/triage?after=${leadId}` as Parameters<typeof router.push>[0]);
          }}
          className="rounded-xl border border-forest-900/15 px-4 py-3 text-sm font-semibold text-forest-900/60 hover:bg-forest-900/5 disabled:opacity-40"
        >
          ⤼ Пропустить
        </button>
      </div>
      {askDead && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-forest-900/10 bg-cream-50 p-3">
          {DEAD_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              disabled={pending}
              onClick={() => {
                setAskDead(false);
                run(() => markDeadAction(leadId, r));
              }}
              className="rounded-full bg-forest-900/5 px-3 py-1.5 text-sm text-forest-900/70 hover:bg-forest-900/10 disabled:opacity-40"
            >
              {r}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

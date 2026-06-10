"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { moveLead } from "@/lib/actions/move-lead";
import { MoveLeadSelect } from "@/components/crm/move-lead-select";
import type { CrmLead, CrmStage } from "@/lib/data/leads";

/**
 * Kanban board with native HTML5 drag-and-drop. Drag a card onto a column to
 * move the lead to that stage; the move is optimistic (card jumps immediately)
 * and persisted via the moveLead server action. The per-card stage selector
 * stays as a touch/keyboard-friendly fallback.
 */
export function CrmBoard({
  pipelineKey,
  stages,
  leads,
}: {
  pipelineKey: string;
  stages: CrmStage[];
  leads: CrmLead[];
}) {
  const [items, setItems] = useState<CrmLead[]>(leads);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [, start] = useTransition();

  function applyMove(leadId: number, stageKey: string) {
    const lead = items.find((l) => l.id === leadId);
    if (!lead || lead.stageKey === stageKey) return;
    setItems((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stageKey } : l)),
    );
    start(() => moveLead(leadId, stageKey));
  }

  function fmtDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    } catch {
      return "";
    }
  }

  /** Whole days since the lead was last touched (updatedAt, else createdAt). */
  function daysSinceTouch(lead: CrmLead): number {
    const iso = lead.updatedAt || lead.createdAt;
    if (!iso) return 0;
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return 0;
    return Math.floor((Date.now() - t) / 86_400_000);
  }
  const STALE_DAYS = 3;

  const stageOptions = stages.map((s) => ({ key: s.key, name: s.name }));

  return (
    <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:overflow-x-auto">
      {stages.map((stage) => {
        const colItems = items.filter(
          (l) => l.pipelineKey === pipelineKey && l.stageKey === stage.key,
        );
        const isOver = overStage === stage.key;
        return (
          <div
            key={stage.key}
            onDragOver={(e) => {
              e.preventDefault();
              if (overStage !== stage.key) setOverStage(stage.key);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const id = Number(e.dataTransfer.getData("text/plain")) || dragId;
              if (id) applyMove(id, stage.key);
              setOverStage(null);
              setDragId(null);
            }}
            className="flex w-full flex-col lg:min-w-[280px] lg:max-w-[280px]"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <h2
                className={
                  "text-xs font-semibold uppercase tracking-wide " +
                  (stage.isWon
                    ? "text-emerald-600"
                    : stage.isLost
                      ? "text-forest-900/40"
                      : "text-forest-900/70")
                }
              >
                {stage.name}
              </h2>
              <span className="text-xs text-forest-900/40">{colItems.length}</span>
            </div>
            <div
              className={
                "flex flex-col gap-2 rounded-lg p-2 transition-colors lg:min-h-[80px] " +
                (isOver
                  ? "bg-brass-500/10 ring-2 ring-brass-500/40"
                  : "bg-forest-900/[0.03]")
              }
            >
              {colItems.length === 0 ? (
                <p className="px-1 py-4 text-center text-xs text-forest-900/30">
                  {isOver ? "Отпустите здесь" : "—"}
                </p>
              ) : (
                colItems.map((lead) => {
                  const contact = [lead.email, lead.phone].filter(Boolean).join(" · ");
                  const isOpen = (lead.status ?? "open") === "open";
                  const days = daysSinceTouch(lead);
                  const stale = isOpen && days >= STALE_DAYS;
                  return (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(lead.id));
                        e.dataTransfer.effectAllowed = "move";
                        setDragId(lead.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverStage(null);
                      }}
                      className={
                        "cursor-grab rounded-lg border bg-white p-3 shadow-sm active:cursor-grabbing " +
                        (stale
                          ? "border-forest-900/10 border-l-2 border-l-amber-400 "
                          : "border-forest-900/10 ") +
                        (dragId === lead.id ? "opacity-50" : "")
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/crm/${lead.id}`}
                          className="text-sm font-medium leading-snug text-forest-900 hover:text-brass-600 hover:underline"
                        >
                          {lead.contactName || "—"}
                        </Link>
                        <span className="flex shrink-0 items-center gap-1">
                          {(lead.overdueTasks ?? 0) > 0 ? (
                            <span
                              title={`${lead.overdueTasks} просроченных задач`}
                              className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-red-700"
                            >
                              ⏰ {lead.overdueTasks}
                            </span>
                          ) : (lead.openTasks ?? 0) > 0 ? (
                            <span
                              title={`${lead.openTasks} открытых задач`}
                              className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] font-medium text-forest-900/55"
                            >
                              ✓ {lead.openTasks}
                            </span>
                          ) : null}
                          <span className="text-[10px] uppercase tracking-wide text-forest-900/40">
                            {fmtDate(lead.createdAt)}
                          </span>
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-forest-900/70">{lead.name}</p>
                      {contact && <p className="mt-1 text-xs text-forest-900/55">{contact}</p>}
                      {stale && (
                        <p className="mt-1 text-[11px] font-medium text-amber-600">
                          💤 {days} дн без касания
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lead.rwNumber && (
                          <span className="rounded bg-brass-500/10 px-1.5 py-0.5 text-[10px] font-medium text-brass-600">
                            {lead.rwNumber}
                          </span>
                        )}
                        {(lead.tags ?? [])
                          .filter((t) => !t.startsWith("object:"))
                          .slice(0, 4)
                          .map((t) => (
                            <span
                              key={t}
                              className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] text-forest-900/60"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                      <div className="mt-2">
                        <MoveLeadSelect
                          leadId={lead.id}
                          stages={stageOptions}
                          currentStageKey={lead.stageKey}
                        />
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

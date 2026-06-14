"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { moveLead } from "@/lib/actions/move-lead";
import { bulkMoveLeads, bulkDeleteLeads } from "@/lib/actions/bulk-leads";
import { MoveLeadSelect } from "@/components/crm/move-lead-select";
import { LostReasonDialog } from "@/components/crm/lost-reason-dialog";
import type { CrmLead, CrmStage } from "@/lib/data/leads";
import { leadScore } from "@/lib/crm/score";
import { dealProgress, DEAL_STAGE_KEYS } from "@/lib/crm/deal-checklist";
import { slaStatus } from "@/lib/crm/sla";
import { nextAction, URGENCY_STYLE } from "@/lib/crm/next-action";

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
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStage, setBulkStage] = useState("");
  const [pendingLost, setPendingLost] = useState<{ leadId: number; stageKey: string } | null>(null);
  const [pending, start] = useTransition();

  function applyMove(leadId: number, stageKey: string, lostReason?: string) {
    const lead = items.find((l) => l.id === leadId);
    if (!lead || lead.stageKey === stageKey) return;
    // Moving into a lost stage: ask why first (loss analytics), then move.
    const target = stages.find((s) => s.key === stageKey);
    if (target?.isLost && !lostReason && (lead.status ?? "open") !== "lost") {
      setPendingLost({ leadId, stageKey });
      return;
    }
    setItems((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stageKey } : l)),
    );
    start(() => moveLead(leadId, stageKey, lostReason));
  }

  function toggleSelect(leadId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  }

  function runBulkMove() {
    if (!bulkStage || selected.size === 0) return;
    const ids = [...selected];
    setItems((prev) =>
      prev.map((l) => (selected.has(l.id) ? { ...l, stageKey: bulkStage } : l)),
    );
    setSelected(new Set());
    setBulkStage("");
    start(async () => {
      await bulkMoveLeads(ids, bulkStage);
    });
  }

  function runBulkDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Удалить ${selected.size} лид(ов)? Заметки и задачи тоже удалятся.`)) return;
    const ids = [...selected];
    setItems((prev) => prev.filter((l) => !selected.has(l.id)));
    setSelected(new Set());
    start(async () => {
      await bulkDeleteLeads(ids);
    });
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
    <>
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
                        <span className="flex min-w-0 items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selected.has(lead.id)}
                            onChange={() => toggleSelect(lead.id)}
                            aria-label="Выбрать лид"
                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-forest-900/25 accent-brass-500"
                          />
                          <Link
                            href={`/admin/crm/${lead.id}`}
                            className="text-sm font-medium leading-snug text-forest-900 hover:text-brass-600 hover:underline"
                          >
                            {isOpen && (() => {
                              const s = leadScore(lead);
                              return s.level !== "cold" ? (
                                <span
                                  title={`Готовность ${s.score}/100`}
                                  className="mr-1"
                                >
                                  {s.emoji}
                                </span>
                              ) : null;
                            })()}
                            {lead.contactName || "—"}
                          </Link>
                        </span>
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
                      {(() => {
                        if (!isOpen) return null;
                        const sla = slaStatus(lead.stageKey, lead.stageSince || lead.createdAt);
                        if (sla.breached) {
                          return (
                            <p
                              className="mt-1 text-[10px] font-semibold text-red-600"
                              title={`SLA стадии ${sla.sla} дн — просрочка ${sla.over} дн`}
                            >
                              ⏰ SLA +{sla.over}д · на стадии {sla.days} дн
                            </p>
                          );
                        }
                        return sla.days >= 1 ? (
                          <p className="mt-1 text-[10px] text-forest-900/40">
                            ⏳ на стадии {sla.days} дн
                          </p>
                        ) : null;
                      })()}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(lead.dealValue ?? 0) > 0 && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            ฿{lead.dealValue! >= 1_000_000
                              ? `${(lead.dealValue! / 1_000_000).toFixed(1)}M`
                              : new Intl.NumberFormat("en-US").format(lead.dealValue!)}
                          </span>
                        )}
                        {lead.stageKey && DEAL_STAGE_KEYS.has(lead.stageKey) && (() => {
                          const p = dealProgress(lead.dealChecklist);
                          return (
                            <span
                              title={p.nextGroup ? `Далее: ${p.nextGroup}` : "Сделка закрыта по чек-листу"}
                              className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] font-medium text-forest-900/60"
                            >
                              📋 {p.doneCount}/{p.total}
                            </span>
                          );
                        })()}
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
                      {isOpen && (() => {
                        const nba = nextAction(lead);
                        return nba ? (
                          <div
                            title={nba.detail}
                            className={`mt-2 flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-[11px] font-medium ${URGENCY_STYLE[nba.urgency]}`}
                          >
                            <span>{nba.icon}</span>
                            <span className="truncate">{nba.label}</span>
                          </div>
                        ) : null;
                      })()}
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

    {pendingLost && (
      <LostReasonDialog
        contactName={items.find((l) => l.id === pendingLost.leadId)?.contactName}
        onConfirm={(reason) => {
          applyMove(pendingLost.leadId, pendingLost.stageKey, reason);
          setPendingLost(null);
        }}
        onCancel={() => setPendingLost(null)}
      />
    )}

    {/* Bulk bar — appears when at least one card is checked */}
    {selected.size > 0 && (
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-forest-900 px-4 py-3 shadow-xl">
          <span className="text-sm font-medium text-white">Выбрано: {selected.size}</span>
          <select
            value={bulkStage}
            onChange={(e) => setBulkStage(e.target.value)}
            className="rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white outline-none [&>option]:text-forest-900"
          >
            <option value="">Стадия…</option>
            {stages.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!bulkStage || pending}
            onClick={runBulkMove}
            className="rounded-md bg-brass-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brass-600 disabled:opacity-40"
          >
            Переместить
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={runBulkDelete}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-white/20 disabled:opacity-40"
          >
            🗑 Удалить
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="px-2 py-1.5 text-sm text-white/60 hover:text-white"
          >
            Отмена
          </button>
        </div>
      </div>
    )}
    </>
  );
}

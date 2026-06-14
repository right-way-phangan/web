import type { CrmEvent, CrmLead, CrmStage } from "@/lib/data/leads";

export interface FunnelStep {
  key: string;
  name: string;
  /** Leads that ever reached this stage (current stage OR a past toStage). */
  reached: number;
  /** reached / reached(prev) — share that advanced from the previous stage. */
  convFromPrev: number | null;
  /** Median days a lead spent sitting in this stage (completed transitions). */
  medianDays: number | null;
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Build a true funnel from lead history: of the leads that reached stage i,
 * what share advanced to i+1, and how long they sat in each stage. "Reached"
 * uses a lead's furthest progress (current stage OR any past toStage), so a
 * lead now at `viewing` counts as having reached incoming…viewing — the
 * monotonic count needed for a funnel. `lost` is excluded (an exit, not a
 * step). Accurate while the event window holds full history.
 */
export function computeFunnel(
  leads: Pick<CrmLead, "id" | "stageKey">[],
  stages: CrmStage[],
  events: CrmEvent[],
): FunnelStep[] {
  const linear = stages.filter((s) => !s.isLost).sort((a, b) => a.sort - b.sort);
  const sortOf = new Map(linear.map((s) => [s.key, s.sort] as const));

  // Furthest stage-sort each lead reached — from its current stage and history.
  const furthest = new Map<number, number>();
  const bump = (id: number, sort: number | undefined) => {
    if (sort == null) return;
    furthest.set(id, Math.max(furthest.get(id) ?? -1, sort));
  };
  for (const l of leads) bump(l.id, sortOf.get(l.stageKey ?? ""));
  for (const e of events) {
    if (e.type === "stage" && e.leadId && e.toStage) bump(e.leadId, sortOf.get(e.toStage));
  }
  const reachedAt = (sort: number) => [...furthest.values()].filter((f) => f >= sort).length;

  // Per-stage durations: between entering a stage and the next stage move.
  const byLead = new Map<number, CrmEvent[]>();
  for (const e of events) {
    if (e.type !== "stage" || !e.leadId) continue;
    const list = byLead.get(e.leadId);
    if (list) list.push(e);
    else byLead.set(e.leadId, [e]);
  }
  const durations = new Map<string, number[]>();
  for (const evs of byLead.values()) {
    const sorted = evs
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const stage = sorted[i].toStage;
      if (!stage) continue;
      const days =
        (new Date(sorted[i + 1].createdAt).getTime() - new Date(sorted[i].createdAt).getTime()) /
        86_400_000;
      if (days < 0) continue;
      const list = durations.get(stage);
      if (list) list.push(days);
      else durations.set(stage, [days]);
    }
  }

  let prev: number | null = null;
  return linear.map((s) => {
    const reached = reachedAt(s.sort);
    const convFromPrev = prev != null && prev > 0 ? reached / prev : null;
    prev = reached;
    return { key: s.key, name: s.name, reached, convFromPrev, medianDays: median(durations.get(s.key) ?? []) };
  });
}

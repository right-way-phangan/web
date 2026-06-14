/**
 * Per-stage SLA — how long a lead may sit on a stage before it's "stuck". The
 * generic 3-day staleness flag treats a fresh `incoming` like a long `dd`; a
 * deal in Due Diligence legitimately takes weeks, while an unanswered `incoming`
 * is a problem within a day. Days are deliberate operating targets for a solo
 * agent on Phangan, not contractual. Stages without an entry (won/lost) have no
 * SLA.
 */
export const STAGE_SLA_DAYS: Record<string, number> = {
  incoming: 1,
  contacted: 2,
  qualified: 5,
  viewing: 7,
  negotiation: 7,
  reservation: 5,
  dd: 14,
  spa: 10,
  transfer: 7,
  // legacy «Разбор»
  revived: 3,
};

export interface SlaStatus {
  /** SLA target in days, or null when the stage has none (won/lost/unknown). */
  sla: number | null;
  /** Days the lead has sat on the current stage. */
  days: number;
  /** Past the SLA target. */
  breached: boolean;
  /** Days over the target (0 when within SLA). */
  over: number;
}

function daysOn(stageSince?: string | null): number {
  if (!stageSince) return 0;
  const t = new Date(stageSince).getTime();
  return Number.isFinite(t) ? Math.max(0, Math.floor((Date.now() - t) / 86_400_000)) : 0;
}

export function slaStatus(
  stageKey: string | null | undefined,
  stageSince: string | null | undefined,
): SlaStatus {
  const sla = stageKey ? (STAGE_SLA_DAYS[stageKey] ?? null) : null;
  const days = daysOn(stageSince);
  const breached = sla != null && days > sla;
  return { sla, days, breached, over: breached ? days - (sla as number) : 0 };
}

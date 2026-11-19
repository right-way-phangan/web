/**
 * Partner lead isolation (pure policy, no Next APIs — unit-tested).
 * A partner bound to developer `arqa-development` may touch a lead only if the
 * lead carries the tag `developer:arqa-development`.
 */
export const developerTag = (developer: string) => `developer:${developer.trim().toLowerCase()}`;

export function leadInPartnerScope(tags: readonly string[] | null | undefined, developer: string | null | undefined): boolean {
  if (!developer?.trim()) return false;
  return (tags ?? []).includes(developerTag(developer));
}

export function filterLeadsForPartner<T extends { tags?: string[] | null }>(leads: T[], developer: string | null | undefined): T[] {
  return leads.filter((l) => leadInPartnerScope(l.tags, developer));
}

/**
 * Notes a partner may read: only those explicitly shared (`sharedWithPartner === true`).
 * Missing flag (older backend) → internal. Fails closed.
 */
export function partnerVisibleNotes<T extends { sharedWithPartner?: boolean | null }>(notes: readonly T[] | null | undefined): T[] {
  return (notes ?? []).filter((n) => n.sharedWithPartner === true);
}

/**
 * Agent lead isolation (CRM for hired agents, 2026-11-19). A lead belongs to an
 * agent when it carries `agent:<userId>`; an agent sees and touches only those.
 * Admin assigns by adding the tag; a lead an agent creates is tagged at once.
 */
export const agentTag = (userId: number) => `agent:${userId}`;

export function leadInAgentScope(tags: readonly string[] | null | undefined, userId: number | null | undefined): boolean {
  if (!Number.isInteger(userId) || (userId as number) <= 0) return false;
  return (tags ?? []).includes(agentTag(userId as number));
}

export function filterLeadsForAgent<T extends { tags?: string[] | null }>(leads: T[], userId: number | null | undefined): T[] {
  return leads.filter((l) => leadInAgentScope(l.tags, userId));
}

/** userIds a lead is assigned to (parsed from `agent:<id>` tags). */
export function assignedAgentIds(tags: readonly string[] | null | undefined): number[] {
  return (tags ?? [])
    .map((t) => /^agent:(\d+)$/.exec(t)?.[1])
    .filter((v): v is string => !!v)
    .map(Number);
}

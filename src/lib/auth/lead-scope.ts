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

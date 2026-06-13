import type { CrmLead } from "@/lib/data/leads";
import type { RealEstateObject } from "@/types/object";

/**
 * Shared lead↔object matching. The lead card already matches objects to a lead
 * ("Что показать"); this module adds the reverse — given an object, which open
 * leads want something like it — so a new listing becomes a calling list.
 */

const VILLA_TYPES = new Set(["Villa", "House", "Apartment", "Project"]);

/** What object types a lead is after: explicit interest: tag wins, else pipeline. */
export function leadWantTypes(lead: Pick<CrmLead, "tags" | "pipelineKey">): Set<string> | null {
  const interest = (lead.tags ?? []).find((t) => t.startsWith("interest:"))?.slice(9);
  if (interest) return new Set([interest]);
  if (lead.pipelineKey === "villa_house") return new Set(VILLA_TYPES);
  if (lead.pipelineKey === "land") return new Set(["Land"]);
  return null; // unknown — don't exclude on type
}

export interface LeadMatch {
  lead: CrmLead;
  score: number;
  reasons: string[];
}

const isUnit = (rw: string) => /^RW-P\d+-\d+$/i.test(rw);

/**
 * Open leads that match an object, ranked. Signals:
 *  +6 already shortlisted this exact object (object:RW tag) — explicit want
 *  +5 inquired about this exact object (lead.rwNumber)
 *  +3 district named in the lead's name/notes
 *  +2 type matches what the lead wants
 *  +1 hot tag · +1 has a budget/deal value
 * Leads in a closed (won/lost) state are excluded.
 */
export function matchLeadsToObject(
  object: Pick<RealEstateObject, "rwNumber" | "type" | "district">,
  leads: CrmLead[],
  opts: { limit?: number } = {},
): LeadMatch[] {
  const { limit = 12 } = opts;
  const district = (object.district ?? "").toLowerCase();
  const out: LeadMatch[] = [];

  for (const lead of leads) {
    if ((lead.status ?? "open") !== "open") continue;
    if (lead.pipelineKey === "legacy") continue; // разбирается в конвейере, не для рассылки

    const reasons: string[] = [];
    let score = 0;

    const tags = lead.tags ?? [];
    if (tags.includes(`object:${object.rwNumber}`)) {
      score += 6;
      reasons.push("в шортлисте");
    }
    if (lead.rwNumber && lead.rwNumber === object.rwNumber) {
      score += 5;
      reasons.push("спрашивал этот объект");
    }

    const wantTypes = leadWantTypes(lead);
    const typeOk = !wantTypes || wantTypes.has(object.type);
    if (wantTypes && wantTypes.has(object.type)) {
      score += 2;
      reasons.push("тип совпадает");
    }

    const leadText = `${lead.name ?? ""} ${lead.notesText ?? ""}`.toLowerCase();
    if (district && leadText.includes(district)) {
      score += 3;
      reasons.push(`район ${object.district}`);
    }
    if (tags.includes("hot")) {
      score += 1;
      reasons.push("горячий");
    }
    if ((lead.dealValue ?? 0) > 0) score += 1;

    // Require a real signal: either type fits, or an explicit object link.
    const explicit = tags.includes(`object:${object.rwNumber}`) || lead.rwNumber === object.rwNumber;
    if (score > 0 && (typeOk || explicit)) {
      out.push({ lead, score, reasons });
    }
  }

  return out
    .filter((m) => !isUnit(object.rwNumber)) // off-plan unit cards don't drive calls
    .sort((a, b) => b.score - a.score || (b.lead.dealValue ?? 0) - (a.lead.dealValue ?? 0))
    .slice(0, limit);
}

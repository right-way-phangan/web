import "server-only";
import { backendFetch } from "@/lib/api/backend";
import { currentPartnerDeveloper } from "@/lib/auth/require-admin";
import { filterLeadsForPartner, leadInPartnerScope, partnerVisibleNotes } from "@/lib/auth/lead-scope";

/**
 * CRM data (Phase B) — reads the own backend (OBJECTS_API_URL). The CRM board
 * at /admin/crm is only meaningful when the own backend is wired; without the
 * flag these return empty and the page shows a setup notice.
 */
const API = process.env.OBJECTS_API_URL;
export const CRM_ENABLED = Boolean(API);

export interface CrmLead {
  id: number;
  name: string;
  status: string;
  rwNumber?: string | null;
  source?: string | null;
  kind?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  pipeline?: string | null;
  pipelineKey?: string | null;
  stage?: string | null;
  stageKey?: string | null;
  stageId?: number | null;
  openTasks?: number;
  overdueTasks?: number;
  /** When the lead landed on its current stage (last event) — "days on stage". */
  stageSince?: string | null;
  /** Last real touch (call/message/meeting via one-tap log) — staleness signal. */
  lastTouchAt?: string | null;
  lostReason?: string | null;
  /** Expected deal size, THB — pipeline money. */
  dealValue?: number | null;
  /** Actual commission earned, THB (won deals; co-agency/referral splits make it ≠ formula). */
  commissionValue?: number | null;
  /** Transaction execution checklist (stepKey → ISO done-at) — deal in progress. */
  dealChecklist?: Record<string, string> | null;
  /** Forecasted close date (ISO) — feeds the monthly revenue forecast. */
  expectedCloseAt?: string | null;
  /** Concatenated notes (truncated) — board search looks into them. */
  notesText?: string;
  telegram?: string | null;
  whatsapp?: string | null;
  preferredChannel?: string | null;
  intent?: string | null;
  qualification?: { goal?: string; budget?: string; horizon?: string } | null;
  attribution?: { first?: Record<string, string>; last?: Record<string, string> } | null;
}

export interface CrmStage {
  id: number;
  key: string;
  name: string;
  sort: number;
  isWon: boolean;
  isLost: boolean;
}

export interface CrmPipeline {
  id: number;
  key: string;
  name: string;
  stages: CrmStage[];
}

export async function getLeads(): Promise<CrmLead[]> {
  if (!API) return [];
  try {
    const r = await backendFetch("/leads", { cache: "no-store" });
    if (!r.ok) return [];
    const all = (await r.json()) as CrmLead[];
    // Partner: server-side isolation — only leads tagged developer:<their developer>.
    const dev = await currentPartnerDeveloper();
    // notesText concatenates ALL notes (incl. internal) — never for a partner.
    return dev === null ? all : filterLeadsForPartner(all, dev).map((l) => ({ ...l, notesText: undefined }));
  } catch (err) {
    console.error("[crm] getLeads failed:", err);
    return [];
  }
}

export async function getPipelines(): Promise<CrmPipeline[]> {
  if (!API) return [];
  try {
    const r = await backendFetch("/pipelines", { cache: "no-store" });
    return r.ok ? ((await r.json()) as CrmPipeline[]) : [];
  } catch (err) {
    console.error("[crm] getPipelines failed:", err);
    return [];
  }
}

export interface CrmNote {
  id: number;
  text: string;
  /** Visible to the developer's partner. Absent (older backend) = internal. */
  sharedWithPartner?: boolean;
  createdAt: string;
}

export interface CrmTask {
  id: number;
  title: string;
  dueAt: string | null;
  done: boolean;
  createdAt: string;
}

/** A contact-book row — contact with lead counters (GET /contacts). */
export interface CrmContact {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  leadsCount: number;
  openLeads: number;
  lastLeadId: number | null;
}

/** The contact book: every contact (incl. the imported amo book), name-ascending. */
export async function getContacts(): Promise<CrmContact[]> {
  if (!API || (await currentPartnerDeveloper()) !== null) return [];
  try {
    const r = await backendFetch("/contacts", { cache: "no-store" });
    return r.ok ? ((await r.json()) as CrmContact[]) : [];
  } catch (err) {
    console.error("[crm] getContacts failed:", err);
    return [];
  }
}

/** A task joined with its lead/contact — the cross-CRM tasks page (GET /tasks). */
export interface CrmTaskItem extends CrmTask {
  leadId: number;
  leadName: string | null;
  leadStatus?: string | null;
  contactName?: string | null;
  phone?: string | null;
}

/** Open (or done=true) tasks across all leads, due-date ascending, NULLs last. */
export async function getTasks(done = false): Promise<CrmTaskItem[]> {
  if (!API || (await currentPartnerDeveloper()) !== null) return [];
  try {
    const r = await backendFetch(`/tasks${done ? "?done=1" : ""}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as CrmTaskItem[]) : [];
  } catch (err) {
    console.error("[crm] getTasks failed:", err);
    return [];
  }
}

export interface CrmEvent {
  id: number;
  type: string; // created | stage
  fromStage: string | null;
  toStage: string | null;
  createdAt: string;
  // Present on the cross-CRM feed (GET /events), absent inside a lead detail.
  leadId?: number;
  leadName?: string | null;
  contactName?: string | null;
}

/** Recent activity across all leads — dashboard feed + stage-cycle analytics. */
export async function getEvents(limit = 200): Promise<CrmEvent[]> {
  if (!API || (await currentPartnerDeveloper()) !== null) return [];
  try {
    const r = await backendFetch(`/events?limit=${limit}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as CrmEvent[]) : [];
  } catch (err) {
    console.error("[crm] getEvents failed:", err);
    return [];
  }
}

export interface CrmLeadDetail extends CrmLead {
  updatedAt: string;
  contactId?: number | null;
  notes: CrmNote[];
  tasks: CrmTask[];
  events?: CrmEvent[];
  stages: CrmStage[];
}

export async function getLead(id: number): Promise<CrmLeadDetail | null> {
  if (!API) return null;
  try {
    const r = await backendFetch(`/leads/${id}`, { cache: "no-store" });
    if (!r.ok) return null;
    const lead = (await r.json()) as CrmLeadDetail;
    // Partner: a lead outside their developer is indistinguishable from a missing one.
    const dev = await currentPartnerDeveloper();
    if (dev === null) return lead;
    if (!leadInPartnerScope(lead.tags, dev)) return null;
    // Partner sees only notes explicitly shared with them; internal ones never leave the server.
    return { ...lead, notes: partnerVisibleNotes(lead.notes) };
  } catch (err) {
    console.error("[crm] getLead failed:", err);
    return null;
  }
}

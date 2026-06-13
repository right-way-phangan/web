import "server-only";
import { backendFetch } from "@/lib/api/backend";

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
  /** Concatenated notes (truncated) — board search looks into them. */
  notesText?: string;
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
    return r.ok ? ((await r.json()) as CrmLead[]) : [];
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
  if (!API) return [];
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
  if (!API) return [];
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
  if (!API) return [];
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
    return r.ok ? ((await r.json()) as CrmLeadDetail) : null;
  } catch (err) {
    console.error("[crm] getLead failed:", err);
    return null;
  }
}

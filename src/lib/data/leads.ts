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

export interface CrmLeadDetail extends CrmLead {
  updatedAt: string;
  notes: CrmNote[];
  tasks: CrmTask[];
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

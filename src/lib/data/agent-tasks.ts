import "server-only";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/**
 * Данные AI-команды для /admin/agents: список задач (голос/текст/совет) и история
 * советов консилиума. Источник правды — таблицы agent_tasks / council_sessions в
 * бэкенде (бот пишет туда через API). Здесь — только чтение для админки.
 */

export type AgentTaskStatus = "open" | "done";

export interface DbAgentTask {
  id: number;
  text: string;
  status: AgentTaskStatus;
  source: string; // voice | text | council
  createdAt: string;
  doneAt: string | null;
}

export interface DbCouncilSession {
  id: number;
  question: string;
  answer: string;
  source: string; // advice | task
  createdAt: string;
}

/** Задачи; status опционален (по умолчанию — все, свежие первыми). */
export async function getAgentTasks(status?: AgentTaskStatus): Promise<DbAgentTask[]> {
  if (!BACKEND_URL) return [];
  try {
    const q = status ? `?status=${status}` : "";
    const r = await backendFetch(`/agent-tasks${q}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DbAgentTask[]) : [];
  } catch (err) {
    console.error("[agent-tasks] getAgentTasks failed:", err);
    return [];
  }
}

/** Число открытых задач — для бейджа в навигации. */
export async function getOpenTaskCount(): Promise<number> {
  if (!BACKEND_URL) return 0;
  try {
    const r = await backendFetch(`/agent-tasks/open-count`, { cache: "no-store" });
    if (!r.ok) return 0;
    const data = (await r.json()) as { count?: number };
    return data.count ?? 0;
  } catch (err) {
    console.error("[agent-tasks] getOpenTaskCount failed:", err);
    return 0;
  }
}

/** История советов консилиума, свежие первыми. */
export async function getCouncilSessions(limit = 30): Promise<DbCouncilSession[]> {
  if (!BACKEND_URL) return [];
  try {
    const r = await backendFetch(`/council-sessions?limit=${limit}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DbCouncilSession[]) : [];
  } catch (err) {
    console.error("[agent-tasks] getCouncilSessions failed:", err);
    return [];
  }
}

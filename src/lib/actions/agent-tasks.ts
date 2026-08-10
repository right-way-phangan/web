"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { requireAdmin } from "@/lib/auth/require-admin";

const API = process.env.OBJECTS_API_URL;

function revalidateAgents() {
  revalidatePath("/admin/agents");
  revalidatePath("/admin");
}

/**
 * Веб-дверь «Спросить совет»: кладёт вопрос в очередь (status=pending). Считать
 * совет может только локальный бот-«мозг» (claude на Max) — он заберёт pending
 * поллером, посчитает и заполнит ответ. Здесь только постановка в очередь.
 */
export async function askCouncil(formData: FormData): Promise<void> {
  await requireAdmin();
  if (!API) return;
  const question = String(formData.get("question") ?? "").trim();
  if (!question) return;
  try {
    const res = await backendFetch(`/council-sessions/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ question, source: "web" }),
    });
    if (!res.ok) console.error(`[council] askCouncil → HTTP ${res.status}`);
  } catch (err) {
    console.error("[council] askCouncil failed:", err);
  }
  revalidateAgents();
}

/** Отметить задачу выполненной. */
export async function markTaskDone(id: number): Promise<void> {
  await requireAdmin();
  if (!API) return;
  try {
    const res = await backendFetch(`/agent-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ status: "done" }),
    });
    // fetch не бросает на 4xx/5xx — проверяем явно, иначе UI «соврёт» об успехе.
    if (!res.ok) console.error(`[agent-tasks] markTaskDone #${id} → HTTP ${res.status}`);
  } catch (err) {
    console.error("[agent-tasks] markTaskDone failed:", err);
  }
  revalidateAgents();
}

/** Вернуть выполненную задачу в открытые. */
export async function reopenTask(id: number): Promise<void> {
  await requireAdmin();
  if (!API) return;
  try {
    const res = await backendFetch(`/agent-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ status: "open" }),
    });
    if (!res.ok) console.error(`[agent-tasks] reopenTask #${id} → HTTP ${res.status}`);
  } catch (err) {
    console.error("[agent-tasks] reopenTask failed:", err);
  }
  revalidateAgents();
}

/** Удалить задачу. */
export async function deleteAgentTask(id: number): Promise<void> {
  await requireAdmin();
  if (!API) return;
  try {
    const res = await backendFetch(`/agent-tasks/${id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) console.error(`[agent-tasks] deleteAgentTask #${id} → HTTP ${res.status}`);
  } catch (err) {
    console.error("[agent-tasks] deleteAgentTask failed:", err);
  }
  revalidateAgents();
}

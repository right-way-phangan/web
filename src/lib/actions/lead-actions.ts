"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;
const JSON_HEADERS = { "Content-Type": "application/json" };

export type LeadEditResult = { ok: boolean; error?: string };

/** Edit a lead's contact details + linked object (CRM detail card editor). */
export async function updateLeadContactAction(
  leadId: number,
  patch: { contactName?: string; email?: string; phone?: string; rwNumber?: string },
): Promise<LeadEditResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  try {
    const res = await backendFetch(`/leads/${leadId}/contact`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify(patch),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
  } catch (err) {
    console.error("[crm] updateLeadContact failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm");
  return { ok: true };
}

/** Delete a lead (test-lead cleanup), then return to the board. Form action. */
export async function deleteLeadAction(formData: FormData): Promise<void> {
  const leadId = Number(formData.get("leadId"));
  if (API && leadId) {
    try {
      await backendFetch(`/leads/${leadId}`, { method: "DELETE", cache: "no-store" });
    } catch (err) {
      console.error("[crm] deleteLead failed:", err);
    }
  }
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  redirect("/admin/crm");
}

/** Add a note to a lead (history feed). Form action. */
export async function addNoteAction(formData: FormData): Promise<void> {
  const leadId = Number(formData.get("leadId"));
  const text = String(formData.get("text") ?? "").trim();
  if (API && text) {
    try {
      await backendFetch(`/leads/${leadId}/notes`, {
        method: "POST",
        headers: JSON_HEADERS,
        cache: "no-store",
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      console.error("[crm] addNote failed:", err);
    }
  }
  revalidatePath(`/admin/crm/${leadId}`);
}

/** Add a task to a lead. Form action. */
export async function addTaskAction(formData: FormData): Promise<void> {
  const leadId = Number(formData.get("leadId"));
  const title = String(formData.get("title") ?? "").trim();
  const dueAt = String(formData.get("dueAt") ?? "") || null;
  if (API && title) {
    try {
      await backendFetch(`/leads/${leadId}/tasks`, {
        method: "POST",
        headers: JSON_HEADERS,
        cache: "no-store",
        body: JSON.stringify({ title, dueAt }),
      });
    } catch (err) {
      console.error("[crm] addTask failed:", err);
    }
  }
  revalidatePath(`/admin/crm/${leadId}`);
}

/** Toggle a task done/undone. */
export async function toggleTaskAction(
  taskId: number,
  leadId: number,
  done: boolean,
): Promise<void> {
  if (API) {
    try {
      await backendFetch(`/tasks/${taskId}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        cache: "no-store",
        body: JSON.stringify({ done }),
      });
    } catch (err) {
      console.error("[crm] toggleTask failed:", err);
    }
  }
  revalidatePath(`/admin/crm/${leadId}`);
}

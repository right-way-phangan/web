"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;
const JSON_HEADERS = { "Content-Type": "application/json" };

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

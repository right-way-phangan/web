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

export type CreateLeadResult = { ok: boolean; leadId?: number; error?: string };

/**
 * Create a lead by hand from the admin (offline channels — Telegram/WhatsApp/
 * walk-in/referral/phone — which never hit the website form). Mirrors the
 * site's submitInquiry payload but tagged "manual" + a channel tag so the
 * board shows where the lead came from. Returns the new id for client redirect.
 */
export async function createManualLeadAction(formData: FormData): Promise<CreateLeadResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };

  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const contactName = s("contactName");
  if (!contactName) return { ok: false, error: "Укажите имя контакта." };

  const pipeline = s("pipeline") === "villa_house" ? "villa_house" : "land";
  const email = s("email");
  const phone = s("phone");
  const rwNumber = s("rwNumber");
  const channel = s("channel"); // telegram | whatsapp | walk-in | referral | phone | other
  const note = s("note");
  const leadName = rwNumber ? `Лид · ${rwNumber} · ${contactName}` : `Лид · ${contactName}`;

  const tags = [
    "manual",
    ...(channel ? [`channel:${channel}`] : []),
    ...(rwNumber ? [`object:${rwNumber}`] : []),
  ];

  try {
    const res = await backendFetch(`/leads`, {
      method: "POST",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({
        leadName,
        pipeline,
        contact: { name: contactName, email: email || undefined, phone: phone || undefined },
        note: note || undefined,
        tags,
        rwNumber: rwNumber || undefined,
        source: "manual",
        kind: "manual",
      }),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
    const body = (await res.json()) as { leadId?: number };
    revalidatePath("/admin/crm");
    revalidatePath("/admin");
    return { ok: true, leadId: body.leadId };
  } catch (err) {
    console.error("[crm] createManualLead failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
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

"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;
const JSON_HEADERS = { "Content-Type": "application/json" };

function refresh(leadId?: number) {
  revalidatePath("/admin/crm/triage");
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  if (leadId) revalidatePath(`/admin/crm/${leadId}`);
}

export type TriageResult = { ok: boolean; newLeadId?: number; error?: string };

/**
 * Revive a legacy lead: re-create it in a working pipeline on the SAME contact
 * (no duplicate in the book), carry a back-reference note, then park the old
 * lead on the «Реанимирован → в работу» stage.
 */
export async function reviveLeadAction(
  leadId: number,
  pipeline: "land" | "villa_house",
): Promise<TriageResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  try {
    const d = await backendFetch(`/leads/${leadId}`, { cache: "no-store" });
    if (!d.ok) return { ok: false, error: `API ${d.status}` };
    const lead = (await d.json()) as {
      contactId?: number | null;
      contactName?: string | null;
      email?: string | null;
      phone?: string | null;
      name: string;
      rwNumber?: string | null;
    };
    const contactName = lead.contactName || lead.name || `Лид #${leadId}`;
    const res = await backendFetch(`/leads`, {
      method: "POST",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({
        leadName: `Лид · ${contactName} (реанимирован)`,
        pipeline,
        contactId: lead.contactId ?? undefined,
        contact: {
          name: contactName,
          email: lead.email || undefined,
          phone: lead.phone || undefined,
        },
        note: `Реанимирован из разбора legacy (лид #${leadId}).`,
        tags: ["legacy-revived"],
        rwNumber: lead.rwNumber || undefined,
        source: "legacy",
        kind: "revived",
      }),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
    const body = (await res.json()) as { leadId?: number };
    await backendFetch(`/leads/${leadId}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({ stageKey: "revived" }),
    });
    refresh(leadId);
    return { ok: true, newLeadId: body.leadId };
  } catch (err) {
    console.error("[triage] revive failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
}

/** Mark a legacy lead dead with a reason. */
export async function markDeadAction(leadId: number, reason: string): Promise<TriageResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  try {
    const res = await backendFetch(`/leads/${leadId}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({ stageKey: "dead", lostReason: reason || "Разбор: мёртв" }),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
    refresh(leadId);
    return { ok: true };
  } catch (err) {
    console.error("[triage] dead failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
}

/** «Позже»: leave in the queue but pin a date-only follow-up task. */
export async function triageLaterAction(leadId: number, days: number): Promise<TriageResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  try {
    const due = new Date();
    due.setUTCDate(due.getUTCDate() + Math.max(1, days));
    const res = await backendFetch(`/leads/${leadId}/tasks`, {
      method: "POST",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({
        title: "🧹 Вернуться к разбору (отложено с конвейера)",
        dueAt: due.toISOString().slice(0, 10),
      }),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
    refresh(leadId);
    return { ok: true };
  } catch (err) {
    console.error("[triage] later failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
}

/** One-tap touch log on the lead card: call / message / meeting. */
export async function touchLeadAction(
  leadId: number,
  kind: "call" | "message" | "meet",
): Promise<void> {
  if (API) {
    try {
      await backendFetch(`/leads/${leadId}/touch`, {
        method: "POST",
        headers: JSON_HEADERS,
        cache: "no-store",
        body: JSON.stringify({ kind }),
      });
    } catch (err) {
      console.error("[crm] touch failed:", err);
    }
  }
  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm");
}

/** Merge duplicate contacts (keep ← merge). */
export async function mergeContactsAction(
  keepId: number,
  mergeId: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  try {
    const res = await backendFetch(`/contacts/merge`, {
      method: "POST",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({ keepId, mergeId }),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
    revalidatePath("/admin/crm/contacts");
    revalidatePath("/admin/crm/contacts/dupes");
    return { ok: true };
  } catch (err) {
    console.error("[crm] merge failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
}

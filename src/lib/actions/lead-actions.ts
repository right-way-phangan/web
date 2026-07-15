"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/api/backend";
import { isAdmin } from "@/lib/auth/require-admin";

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

export type CreateLeadResult = {
  ok: boolean;
  leadId?: number;
  error?: string;
  /** Set when an existing lead matches the phone/email — the form asks to confirm. */
  duplicate?: { id: number; contactName: string | null; stage: string | null };
};

const SOURCE_LABEL: Record<string, string> = {
  "walk-in": "Walk-in (офис)",
  ad: "Реклама",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  phone: "Звонок",
  referral: "Рекомендация",
  other: "Другое",
};
const TIMEFRAME_LABEL: Record<string, string> = {
  now: "готов сейчас",
  "1-3m": "1–3 мес",
  "3-6m": "3–6 мес",
  browsing: "присматривается",
};

/** Villa/House/Apartment/Project → villa_house pipeline; Land/empty → land. */
function pipelineForInterest(type: string): "land" | "villa_house" {
  return ["Villa", "House", "Apartment", "Project"].includes(type) ? "villa_house" : "land";
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9а-я]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

/**
 * Create a lead by hand from the admin. Covers every non-website origin a real
 * agency sees: a walk-in into the office (often just a name + what they want),
 * an ad-driven call (attribution: source=ad + campaign), or messenger/referral.
 * Builds a structured first note (source · ad · qualification) + attribution
 * tags so the board shows where the lead came from and how warm it is. Pipeline
 * auto-derives from the interest type. Returns the new id for client redirect.
 */
export async function createManualLeadAction(formData: FormData): Promise<CreateLeadResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };

  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const contactName = s("contactName");
  if (!contactName) return { ok: false, error: "Укажите имя контакта." };

  const email = s("email");
  const phone = s("phone");
  const source = s("source"); // walk-in | ad | telegram | whatsapp | phone | referral | other
  const adCampaign = s("adCampaign"); // free text when source=ad: "Meta / lead-form / June-land"
  const interestType = s("interestType"); // ''|Land|Villa|House|Apartment|Project
  const district = s("district");
  const budget = s("budget");
  const timeframe = s("timeframe"); // ''|now|1-3m|3-6m|browsing
  const rwNumber = s("rwNumber");
  const freeNote = s("note");

  // Duplicate guard: ad/walk-in contacts often come back twice. Best-effort —
  // a failed check never blocks creation. "force" (confirm button) skips it.
  if (!formData.get("force") && (phone || email)) {
    try {
      const r = await backendFetch("/leads", { cache: "no-store" });
      if (r.ok) {
        const all = (await r.json()) as {
          id: number;
          contactName?: string | null;
          email?: string | null;
          phone?: string | null;
          stage?: string | null;
        }[];
        const digits = (v: string) => v.replace(/\D/g, "");
        const pd = digits(phone).slice(-9); // last 9 digits — survives +66 vs 0 prefixes
        const dup = all.find((l) => {
          if (email && l.email && l.email.toLowerCase() === email.toLowerCase()) return true;
          if (pd.length >= 7 && l.phone) return digits(l.phone).slice(-9) === pd;
          return false;
        });
        if (dup) {
          return {
            ok: false,
            duplicate: { id: dup.id, contactName: dup.contactName ?? null, stage: dup.stage ?? null },
          };
        }
      }
    } catch (err) {
      console.error("[crm] duplicate check failed:", err);
    }
  }

  // Pipeline: interest type wins; else the explicit select; else land.
  const pipeline = interestType
    ? pipelineForInterest(interestType)
    : s("pipeline") === "villa_house"
      ? "villa_house"
      : "land";

  // Structured first note — what the agent will read at a glance.
  const interestParts = [
    interestType || null,
    district || null,
    budget ? `бюджет ${budget}` : null,
    timeframe ? `срок ${TIMEFRAME_LABEL[timeframe] ?? timeframe}` : null,
  ].filter(Boolean);
  const noteLines = [
    source ? `Источник: ${SOURCE_LABEL[source] ?? source}` : null,
    source === "ad" && adCampaign ? `Реклама: ${adCampaign}` : null,
    interestParts.length ? `Интерес: ${interestParts.join(" · ")}` : null,
  ].filter(Boolean);
  const note = [noteLines.join("\n"), freeNote].filter(Boolean).join("\n———\n") || undefined;

  // Lead title: object → interest → name.
  const interestLabel = [interestType, district].filter(Boolean).join(" ");
  const leadName = rwNumber
    ? `Лид · ${rwNumber} · ${contactName}`
    : interestLabel
      ? `Лид · ${interestLabel} · ${contactName}`
      : `Лид · ${contactName}`;

  const tags = [
    "manual",
    ...(source === "ad" ? ["source:ad"] : source ? [`channel:${source}`] : []),
    ...(source === "ad" && adCampaign ? [`campaign:${slug(adCampaign)}`] : []),
    ...(interestType ? [`interest:${interestType}`] : []),
    ...(timeframe === "now" ? ["hot"] : []),
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
        note,
        tags,
        rwNumber: rwNumber || undefined,
        source: source === "ad" ? "ad" : "manual",
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
  if (!(await isAdmin())) redirect("/admin/crm");
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
  const dueDate = String(formData.get("dueAt") ?? "").trim();
  const dueTime = String(formData.get("dueTime") ?? "").trim();
  // Time is entered in office (Phangan, UTC+7) hours; date-only stays as-is
  // (backend parses it as UTC midnight = "due that day", digest convention).
  const dueAt = dueDate ? (dueTime ? `${dueDate}T${dueTime}:00+07:00` : dueDate) : null;
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

/**
 * One-tap snooze: drop a dated follow-up task on the lead N days out (date-only
 * → caught by the morning digest). The fast "remind me about this one later"
 * button on the card, no form.
 */
export async function remindLeadAction(leadId: number, days: number): Promise<void> {
  if (API && leadId && days > 0) {
    const due = new Date();
    due.setUTCDate(due.getUTCDate() + days);
    try {
      await backendFetch(`/leads/${leadId}/tasks`, {
        method: "POST",
        headers: JSON_HEADERS,
        cache: "no-store",
        body: JSON.stringify({
          title: "🔔 Напомнить о лиде",
          dueAt: due.toISOString().slice(0, 10),
        }),
      });
    } catch (err) {
      console.error("[crm] remindLead failed:", err);
    }
  }
  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm/tasks");
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
  revalidatePath("/admin/crm/tasks");
}

/** Reschedule a task (snooze): new dueAt ISO/date, or null to clear the deadline. */
export async function rescheduleTaskAction(
  taskId: number,
  leadId: number,
  dueAt: string | null,
): Promise<void> {
  if (API) {
    try {
      await backendFetch(`/tasks/${taskId}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        cache: "no-store",
        body: JSON.stringify({ dueAt }),
      });
    } catch (err) {
      console.error("[crm] rescheduleTask failed:", err);
    }
  }
  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm/tasks");
}

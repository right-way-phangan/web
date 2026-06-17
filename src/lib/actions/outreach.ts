"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;

export type OutreachOutcome = "confirmed" | "archived" | "leasehold_ok" | "no_answer";

export type OutreachResult = { ok: boolean; error?: string };

function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}

async function patchObject(rw: string, body: Record<string, unknown>): Promise<OutreachResult> {
  try {
    const r = await backendFetch(`/objects/${encodeURIComponent(rw)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    });
    if (!r.ok) return { ok: false, error: `PATCH ${rw}: ${r.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

/**
 * Записать итог звонка собственнику (admin /admin/outreach).
 * - archived дополнительно переводит объект в STATUS=Archive (просьба из
 *   задачи обзвона: неактуальные → Archive);
 * - no_answer инкрементит счётчик попыток (текущее значение передаёт клиент);
 * - заметка дописывается с датой, история не затирается.
 */
export async function recordCallOutcome(
  rwNumber: string,
  outcome: OutreachOutcome,
  opts: { note?: string; prevNote?: string; prevAttempts?: number } = {},
): Promise<OutreachResult> {
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };

  const stamp = today();
  const labels: Record<OutreachOutcome, string> = {
    confirmed: "подтверждён",
    archived: "в архив",
    leasehold_ok: "согласен на leasehold",
    no_answer: "недозвон",
  };
  const noteLine = `${stamp}: ${labels[outcome]}${opts.note ? ` — ${opts.note.trim()}` : ""}`;
  const mergedNote = opts.prevNote ? `${opts.prevNote}\n${noteLine}` : noteLine;

  const body: Record<string, unknown> = {
    outreachStatus: outcome,
    outreachDate: stamp,
    outreachNote: mergedNote,
  };
  if (outcome === "no_answer") body.outreachAttempts = (opts.prevAttempts ?? 0) + 1;
  if (outcome === "archived") body.status = "Archive";

  const res = await patchObject(rwNumber, body);
  if (!res.ok) return res;

  revalidatePath("/admin/outreach");
  revalidatePath("/admin/objects");
  if (outcome === "archived") revalidatePath("/listings");
  return { ok: true };
}

// Контакт собственника теперь структурный (object_contacts): быстрая правка в
// обзвоне идёт через saveObjectContacts (@/lib/actions/object-contacts), а не
// через legacy-поле ownerName. См. ObjectContactsEditor на карточке объекта.

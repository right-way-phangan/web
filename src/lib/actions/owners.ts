"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { requireStaff } from "@/lib/auth/require-admin";

export type OwnerActionResult = { ok: boolean; error?: string; missing?: string[] };

async function call(path: string, method: string, body?: unknown): Promise<OwnerActionResult & { data?: unknown }> {
  await requireStaff();
  try {
    const r = await backendFetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: (data as { error?: string }).error ?? `${method} ${path}: ${r.status}` };
    revalidatePath("/admin/owners");
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

/** Поля собственника из формы; пустые строки бэкенд превращает в null. */
export type OwnerFields = {
  name?: string;
  role?: string;
  phone?: string;
  whatsapp?: string;
  line?: string;
  telegram?: string;
  email?: string;
  lang?: string;
  status?: string;
  note?: string;
};

function rwList(text: string): string[] {
  return text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
}

export async function createOwnerAction(fields: OwnerFields, rwText: string): Promise<OwnerActionResult> {
  const res = await call(`/owners`, "POST", fields);
  if (!res.ok) return res;
  const rws = rwList(rwText);
  if (!rws.length) return { ok: true };
  const id = (res.data as { id: number }).id;
  return linkObjectsAction(id, rws.join(" "));
}

/** touch=true — это касание (звонок/сообщение): ставит дату последнего контакта. */
export async function updateOwnerAction(id: number, fields: OwnerFields, touch = false): Promise<OwnerActionResult> {
  return call(`/owners/${id}`, "PATCH", { ...fields, touch });
}

export async function deleteOwnerAction(id: number): Promise<OwnerActionResult> {
  return call(`/owners/${id}`, "DELETE");
}

export async function linkObjectsAction(id: number, rwText: string): Promise<OwnerActionResult> {
  const res = await call(`/owners/${id}/objects`, "POST", { rwNumbers: rwList(rwText) });
  if (!res.ok) return res;
  const missing = (res.data as { missing?: string[] }).missing ?? [];
  return missing.length ? { ok: true, missing } : { ok: true };
}

export async function unlinkObjectAction(rw: string): Promise<OwnerActionResult> {
  return call(`/owners/objects/${encodeURIComponent(rw)}`, "DELETE");
}

"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { isAdmin } from "@/lib/auth/require-admin";
import { agentTag } from "@/lib/auth/lead-scope";

export type UserActionResult = { ok: boolean; error?: string };

async function call(path: string, method: string, body?: unknown): Promise<UserActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Только для администратора." };
  try {
    const r = await backendFetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!r.ok) {
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error ?? `API ${r.status}` };
    }
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

/** Create an account, or reset the password of an existing email (backend is idempotent by email). */
export async function saveUserAction(input: {
  email: string;
  password: string;
  name?: string;
  role: "agent" | "admin";
  lang?: string;
}): Promise<UserActionResult> {
  return call("/users", "POST", input);
}

export async function setUserLangAction(id: number, lang: string): Promise<UserActionResult> {
  return call(`/users/${id}`, "PATCH", { lang: lang || null });
}

export async function deleteUserAction(id: number): Promise<UserActionResult> {
  return call(`/users/${id}`, "DELETE");
}

/** Assign a lead to an agent (tag agent:<id>) or unassign (userId=null). Admin only. */
export async function assignLeadAction(leadId: number, userId: number | null): Promise<UserActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Только для администратора." };
  try {
    const r = await backendFetch(`/leads/${leadId}`, { cache: "no-store" });
    if (!r.ok) return { ok: false, error: `API ${r.status}` };
    const lead = (await r.json()) as { tags?: string[] | null };
    const tags = (lead.tags ?? []).filter((t) => !t.startsWith("agent:"));
    if (userId) tags.push(agentTag(userId));
    const p = await backendFetch(`/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ tags }),
    });
    if (!p.ok) return { ok: false, error: `API ${p.status}` };
    revalidatePath(`/admin/crm/${leadId}`);
    revalidatePath("/admin/crm");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

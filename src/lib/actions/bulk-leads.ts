"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { isAdmin } from "@/lib/auth/require-admin";

const API = process.env.OBJECTS_API_URL;
const JSON_HEADERS = { "Content-Type": "application/json" };

export type BulkLeadsResult = { ok: boolean; done: number; failed: number };

function settle(results: PromiseSettledResult<Response>[]): BulkLeadsResult {
  const done = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
  return { ok: done === results.length, done, failed: results.length - done };
}

/** Move several leads to one stage at once (board bulk bar). */
export async function bulkMoveLeads(ids: number[], stageKey: string): Promise<BulkLeadsResult> {
  if (!API || ids.length === 0) return { ok: false, done: 0, failed: ids.length };
  const results = await Promise.allSettled(
    ids.map((id) =>
      backendFetch(`/leads/${id}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        cache: "no-store",
        body: JSON.stringify({ stageKey }),
      }),
    ),
  );
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  return settle(results);
}

/** Delete several leads at once (bulk test-lead cleanup). */
export async function bulkDeleteLeads(ids: number[]): Promise<BulkLeadsResult> {
  if (!(await isAdmin())) return { ok: false, done: 0, failed: ids.length };
  if (!API || ids.length === 0) return { ok: false, done: 0, failed: ids.length };
  const results = await Promise.allSettled(
    ids.map((id) => backendFetch(`/leads/${id}`, { method: "DELETE", cache: "no-store" })),
  );
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  return settle(results);
}

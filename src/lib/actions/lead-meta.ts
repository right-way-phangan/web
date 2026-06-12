"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;
const JSON_HEADERS = { "Content-Type": "application/json" };

async function patchLead(leadId: number, body: object): Promise<boolean> {
  if (!API) return false;
  try {
    const r = await backendFetch(`/leads/${leadId}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify(body),
    });
    return r.ok;
  } catch (err) {
    console.error("[crm] patchLead failed:", err);
    return false;
  } finally {
    revalidatePath(`/admin/crm/${leadId}`);
    revalidatePath("/admin/crm");
    revalidatePath("/admin");
  }
}

/** Set / clear the expected deal size (THB). */
export async function updateLeadValue(leadId: number, dealValue: number | null): Promise<boolean> {
  return patchLead(leadId, { dealValue });
}

/** Replace the lead's tags — used by the shortlist (object:RW-… tags). */
export async function updateLeadTags(leadId: number, tags: string[]): Promise<boolean> {
  return patchLead(leadId, { tags });
}

/** Set / clear the actual commission earned (THB) on a won deal — deals ledger. */
export async function updateLeadCommission(
  leadId: number,
  commissionValue: number | null,
): Promise<boolean> {
  const ok = await patchLead(leadId, { commissionValue });
  revalidatePath("/admin/finance");
  return ok;
}

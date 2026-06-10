"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;

/** Move a lead to a stage (own CRM). Used by the board's stage selector. */
export async function moveLead(leadId: number, stageKey: string): Promise<void> {
  if (!API) return;
  try {
    await backendFetch(`/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ stageKey }),
    });
  } catch (err) {
    console.error("[crm] moveLead failed:", err);
  }
  revalidatePath("/admin/crm");
}

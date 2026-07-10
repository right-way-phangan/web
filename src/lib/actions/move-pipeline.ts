"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;

/**
 * Move a lead to another pipeline (own CRM). The everyday case: a website
 * contact that turns out to be a property owner → move it into the Собственники
 * pipeline. The backend lands the lead on the new pipeline's first stage
 * (incoming) and records the move in the timeline.
 */
export async function moveLeadPipeline(leadId: number, pipelineKey: string): Promise<void> {
  if (!API) return;
  try {
    await backendFetch(`/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ pipelineKey }),
    });
  } catch (err) {
    console.error("[crm] moveLeadPipeline failed:", err);
  }
  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

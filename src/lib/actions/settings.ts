"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { MONTHLY_TARGET_KEY } from "@/lib/data/settings";

const API = process.env.OBJECTS_API_URL;

/** Set / clear the monthly commission target (THB). null clears it. */
export async function setMonthlyTarget(thb: number | null): Promise<boolean> {
  if (!API) return false;
  try {
    const r = await backendFetch(`/settings/${MONTHLY_TARGET_KEY}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ value: thb && thb > 0 ? String(Math.round(thb)) : null }),
    });
    if (!r.ok) return false;
  } catch (err) {
    console.error("[settings] setMonthlyTarget failed:", err);
    return false;
  } finally {
    revalidatePath("/admin/crm/stats");
    revalidatePath("/admin/crm/today");
  }
  return true;
}

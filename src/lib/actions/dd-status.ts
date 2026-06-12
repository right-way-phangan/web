"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { DD_STATUSES, type DdStatus } from "@/lib/dd";

const API = process.env.OBJECTS_API_URL;

export type DdResult = { ok: boolean; error?: string };

/**
 * Set the due-diligence verdict on an object (admin /admin/dd). Writes to the
 * Neon backend (source of truth post-cutover); the public Vetted badge and the
 * admin queue both read it back from there. Date defaults to today (Bangkok).
 */
export async function setDdStatus(
  rwNumber: string,
  status: DdStatus | "",
  lawyer?: string,
): Promise<DdResult> {
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };
  if (status !== "" && !DD_STATUSES.includes(status as DdStatus)) {
    return { ok: false, error: `Неизвестный статус: ${status}` };
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
  }).format(new Date()); // YYYY-MM-DD

  const body =
    status === ""
      ? { ddStatus: null, ddDate: null, ddLawyer: null }
      : { ddStatus: status, ddDate: today, ddLawyer: lawyer?.trim() || null };

  try {
    const r = await backendFetch(`/objects/${encodeURIComponent(rwNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    });
    if (!r.ok) return { ok: false, error: `PATCH ${rwNumber}: ${r.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }

  revalidatePath("/admin/dd");
  revalidatePath("/admin/objects");
  revalidatePath(`/object/${rwNumber}`);
  return { ok: true };
}

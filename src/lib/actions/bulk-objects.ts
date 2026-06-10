"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;

export type BulkResult = { ok: boolean; updated: number; failed: number; error?: string };

/**
 * Set the same status on many objects at once (admin bulk action). Each object
 * is patched via PATCH /objects/:rw; we report how many succeeded so the UI can
 * surface partial failures. Revalidates the admin table + public surfaces.
 */
export async function bulkUpdateObjectStatus(
  rwNumbers: string[],
  status: string,
): Promise<BulkResult> {
  if (!API) return { ok: false, updated: 0, failed: 0, error: "Backend не подключён." };
  if (rwNumbers.length === 0) return { ok: true, updated: 0, failed: 0 };

  const results = await Promise.allSettled(
    rwNumbers.map((rw) =>
      backendFetch(`/objects/${encodeURIComponent(rw)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ status }),
      }).then((r) => {
        if (!r.ok) throw new Error(`${rw}: ${r.status}`);
        return rw;
      }),
    ),
  );

  const updated = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - updated;

  revalidatePath("/admin/objects");
  revalidatePath("/admin");
  revalidatePath("/listings");
  return { ok: failed === 0, updated, failed };
}

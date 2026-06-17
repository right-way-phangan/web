"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;

/** Fields the admin table is allowed to edit — mirrors the backend PATCHABLE set. */
export type ObjectPatch = Partial<{
  status: string;
  titleEn: string;
  district: string;
  priceThb: number | null;
  pricePerRai: number | null;
  rentPerRaiMonth: number | null;
  rentPerMonth: number | null;
  leaseTermYears: number | null;
  locationUrl: string;
  unitsAvailable: number | null;
  plotPolygon: Array<[number, number]> | null; // traced contour; null clears
  // дозаполнение каталога для оценки (детектор полноты /admin/valuation)
  areaRai: number | null;
  areaSqm: number | null;
  bedrooms: number | null;
  documentType: string;
  condition: string;
  buildYear: number | null;
  roadType: string;
  zone: string;
  terrain: string;
}>;

export type UpdateObjectResult = { ok: boolean; error?: string };

/**
 * Patch whitelisted scalar columns of an object by RW number (own DB via API).
 * Used by the inline editor on /admin/objects. Revalidates the admin table and
 * the public surfaces the object appears on so edits show up immediately.
 */
export async function updateObjectAction(
  rwNumber: string,
  patch: ObjectPatch,
): Promise<UpdateObjectResult> {
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };
  try {
    const res = await backendFetch(`/objects/${encodeURIComponent(rwNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `API ${res.status}: ${body.slice(0, 120)}` };
    }
  } catch (err) {
    console.error("[admin] updateObject failed:", err);
    return { ok: false, error: "Сетевая ошибка при сохранении." };
  }
  revalidatePath("/admin/objects");
  revalidatePath("/listings");
  revalidatePath(`/object/${rwNumber}`);
  return { ok: true };
}

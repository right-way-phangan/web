"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { requireStaff, requireAdmin, isAdmin } from "@/lib/auth/require-admin";

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
  descriptionManualEn: string | null; // ручной override описания (перебивает авто)
  descriptionManualRu: string | null;
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
  await requireStaff();
  // Agents don't edit the catalogue (prices, texts) — only the deal-driven status
  // flip from the lead card (Reserved ↔ Active). Everything else is admin.
  if (!(await isAdmin())) {
    const keys = Object.keys(patch);
    const st = (patch as { status?: string }).status;
    if (keys.length !== 1 || keys[0] !== "status" || !["Active", "Reserved"].includes(String(st))) {
      return { ok: false, error: "Only an admin can edit objects." };
    }
  }
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
  // Каталог-грид кэшируется под тегом "catalog" (TTL 1 ч). Статус/цена меняют
  // видимость и карточку — без сброса тега правка всплыла бы только по TTL.
  revalidateTag("catalog");
  revalidatePath("/listings");
  revalidatePath(`/object/${rwNumber}`);
  revalidatePath(`/ru/object/${rwNumber}`);
  revalidatePath(`/th/object/${rwNumber}`);
  return { ok: true };
}

/**
 * Generate a draft description (EN+RU) for the admin editor's manual-override
 * fields. Uses Claude when ANTHROPIC_API_KEY is set, deterministic template
 * otherwise — the human reviews/edits before saving.
 */
export async function regenerateDescriptionAction(
  rwNumber: string,
): Promise<{ ok: boolean; en?: string; ru?: string; error?: string }> {
  await requireAdmin();
  const { getObjectByRwNumber } = await import("@/lib/data/objects");
  const { generateObjectDescription } = await import("@/lib/generate/object-description");
  const obj = await getObjectByRwNumber(rwNumber);
  if (!obj) return { ok: false, error: "Объект не найден" };
  try {
    const [en, ru] = await Promise.all([
      generateObjectDescription(obj, "en"),
      generateObjectDescription(obj, "ru"),
    ]);
    return { ok: true, en, ru };
  } catch (err) {
    console.error("[admin] regenerateDescription failed:", err);
    return { ok: false, error: "Ошибка генерации" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { uploadImageToR2 } from "@/lib/storage/r2";
import type { ConstructionUpdate } from "@/types/object";

const API = process.env.OBJECTS_API_URL;
const MAX_FILES = 30;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

/** Загрузка фото со стройки в R2. Возвращает URL — запись сохраняет редактор. */
export async function uploadConstructionPhotosAction(
  formData: FormData,
): Promise<{ ok: boolean; urls: string[]; error?: string }> {
  const valid = (f: FormDataEntryValue): f is File =>
    f instanceof File &&
    f.size > 0 &&
    f.size <= MAX_FILE_BYTES &&
    f.type.startsWith("image/") &&
    f.type !== "image/svg+xml";
  const files = formData.getAll("photos").filter(valid).slice(0, MAX_FILES);
  if (files.length === 0) return { ok: false, urls: [], error: "Выберите изображения (image/*)." };
  try {
    const urls = await Promise.all(files.map((f) => uploadImageToR2(f, "construction")));
    return { ok: true, urls };
  } catch (err) {
    console.error("[admin] construction photo upload failed:", err);
    return { ok: false, urls: [], error: "Не удалось загрузить файлы." };
  }
}

/**
 * Полная замена ленты хода стройки объекта (редактор всегда шлёт весь список).
 * Пустой список очищает поле — страница /projects/[slug]/construction тогда 404.
 */
export async function saveConstructionUpdatesAction(
  rwNumber: string,
  updates: ConstructionUpdate[],
): Promise<{ ok: boolean; error?: string }> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  try {
    const res = await backendFetch(`/objects/${encodeURIComponent(rwNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ constructionUpdates: updates }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `API ${res.status}: ${body.slice(0, 120)}` };
    }
    revalidatePath(`/admin/objects/${rwNumber}`);
    revalidatePath("/projects", "layout");
    revalidatePath("/ru/projects", "layout");
    return { ok: true };
  } catch (err) {
    console.error("[admin] saveConstructionUpdates failed:", err);
    return { ok: false, error: "Сетевая ошибка при сохранении." };
  }
}

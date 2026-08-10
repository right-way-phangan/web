"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { requireStaff } from "@/lib/auth/require-admin";
import type { ObjectContact } from "@/types/object";

const API = process.env.OBJECTS_API_URL;

export type SaveContactsResult =
  | { ok: true; contacts: ObjectContact[] }
  | { ok: false; error: string };

/**
 * Заменить весь список контактов продавца по объекту (карточка объекта в
 * админке + быстрая правка в обзвоне шлют полный список). Бэкенд сам отбросит
 * пустые контакты и проставит primary, если он не задан. Контакты — НЕ
 * публичное поле (режутся в sanitizePublicObject), но ревалидируем только
 * admin-маршруты, чтобы не дёргать кэш каталога.
 */
export async function saveObjectContacts(
  rwNumber: string,
  contacts: ObjectContact[],
): Promise<SaveContactsResult> {
  await requireStaff();
  if (!API) return { ok: false, error: "Backend не подключён (OBJECTS_API_URL)." };
  try {
    const r = await backendFetch(`/objects/${encodeURIComponent(rwNumber)}/contacts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ contacts }),
    });
    if (r.status === 404) return { ok: false, error: `Объект ${rwNumber} не найден.` };
    if (!r.ok) return { ok: false, error: `Сохранение не удалось: ${r.status}` };
    const body = (await r.json().catch(() => ({}))) as { contacts?: ObjectContact[] };
    revalidatePath(`/admin/objects/${rwNumber}`);
    revalidatePath("/admin/objects");
    revalidatePath("/admin/outreach");
    return { ok: true, contacts: body.contacts ?? [] };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

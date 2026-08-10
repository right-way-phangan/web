"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { GUIDE_PUBLISHED_KEY, getPublishedGuideSlugs } from "@/lib/data/settings";
import { requireAdmin } from "@/lib/auth/require-admin";

const API = process.env.OBJECTS_API_URL;

/** Записать обновлённый список опубликованных slug'ов в app_settings. */
async function writePublished(slugs: string[]): Promise<boolean> {
  if (!API) return false;
  try {
    const r = await backendFetch(`/settings/${GUIDE_PUBLISHED_KEY}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ value: JSON.stringify(slugs) }),
    });
    return r.ok;
  } catch (err) {
    console.error("[guide] writePublished failed:", err);
    return false;
  }
}

/** Снять статус черновика со страницы справочника (оверрайд в app_settings). */
export async function publishGuidePage(slug: string): Promise<boolean> {
  await requireAdmin();
  const current = await getPublishedGuideSlugs();
  current.add(slug);
  const ok = await writePublished([...current]);
  revalidatePath("/admin/guide");
  revalidatePath(`/admin/guide/${slug}`);
  return ok;
}

/** Вернуть страницу справочника в черновики (убрать оверрайд). */
export async function unpublishGuidePage(slug: string): Promise<boolean> {
  await requireAdmin();
  const current = await getPublishedGuideSlugs();
  current.delete(slug);
  const ok = await writePublished([...current]);
  revalidatePath("/admin/guide");
  revalidatePath(`/admin/guide/${slug}`);
  return ok;
}

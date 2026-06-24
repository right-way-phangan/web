"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const API = process.env.OBJECTS_API_URL;

function revalidatePosts() {
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
}

async function patchPost(id: number, patch: Record<string, unknown>): Promise<boolean> {
  if (!API) return false;
  try {
    const res = await backendFetch(`/social-posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(patch),
    });
    // fetch не бросает на 4xx/5xx — проверяем явно, чтобы UI не «соврал».
    if (!res.ok) console.error(`[social-posts] PATCH #${id} → HTTP ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error("[social-posts] patchPost failed:", err);
    return false;
  }
}

/**
 * Согласовать пару (обе версии → scheduled). Это НЕ публикация: фактический постинг
 * в канал держится до запуска (launch sequencing) — «scheduled» = вычитано и готово.
 */
export async function approvePostPair(ids: number[]): Promise<void> {
  for (const id of ids) await patchPost(id, { status: "scheduled" });
  revalidatePosts();
}

/** Вернуть пару в черновики (на доработку Гермесом / ручную правку). */
export async function reopenPostPair(ids: number[]): Promise<void> {
  for (const id of ids) await patchPost(id, { status: "draft" });
  revalidatePosts();
}

/** Отклонить пару с заметкой-причиной. */
export async function rejectPostPair(formData: FormData): Promise<void> {
  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  const note = String(formData.get("note") ?? "").trim();
  for (const id of ids) await patchPost(id, { status: "rejected", reviewerNote: note });
  revalidatePosts();
}

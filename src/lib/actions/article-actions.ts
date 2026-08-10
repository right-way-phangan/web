"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { requireAdmin } from "@/lib/auth/require-admin";

const API = process.env.OBJECTS_API_URL;

/** Refresh both the admin queue and the public blog after a status change. */
function revalidateBlog() {
  revalidateTag("articles");
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath("/ru/blog");
}

/** Approve → publish (goes live on /blog). */
export async function approveArticle(id: number): Promise<void> {
  await requireAdmin();
  if (!API) return;
  try {
    await backendFetch(`/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ status: "published" }),
    });
  } catch (err) {
    console.error("[articles] approve failed:", err);
  }
  revalidateBlog();
}

/** Return for rework with an optional reviewer note. */
export async function rejectArticle(id: number, note: string): Promise<void> {
  await requireAdmin();
  if (!API) return;
  try {
    await backendFetch(`/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ status: "rejected", reviewerNote: note || null }),
    });
  } catch (err) {
    console.error("[articles] reject failed:", err);
  }
  revalidateBlog();
}

/** Unpublish a live post back to pending (rare — pulled for an edit). */
export async function unpublishArticle(id: number): Promise<void> {
  await requireAdmin();
  if (!API) return;
  try {
    await backendFetch(`/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ status: "pending" }),
    });
  } catch (err) {
    console.error("[articles] unpublish failed:", err);
  }
  revalidateBlog();
}

/** Delete an article (e.g. a rejected draft we won't revive). */
export async function deleteArticle(id: number): Promise<void> {
  await requireAdmin();
  if (!API) return;
  try {
    await backendFetch(`/articles/${id}`, { method: "DELETE", cache: "no-store" });
  } catch (err) {
    console.error("[articles] delete failed:", err);
  }
  revalidateBlog();
}

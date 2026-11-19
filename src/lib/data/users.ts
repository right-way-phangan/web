import "server-only";
import { backendFetch } from "@/lib/api/backend";

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "agent" | "partner";
  developer: string | null;
  lang: "ru" | "en" | "th" | null;
  createdAt: string;
}

/** Admin accounts (no password hashes). Callers must be admin-gated. */
export async function getUsers(): Promise<AdminUser[]> {
  try {
    const r = await backendFetch("/users", { cache: "no-store" });
    return r.ok ? ((await r.json()) as AdminUser[]) : [];
  } catch (err) {
    console.error("[users] getUsers failed:", err);
    return [];
  }
}

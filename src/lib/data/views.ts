import "server-only";
import { backendFetch } from "@/lib/api/backend";

/** Per-object first-party view counts (backend GET /views/summary). */
export interface ObjectViews {
  rwNumber: string;
  d7: number;
  d30: number;
  total: number;
}

const API = process.env.OBJECTS_API_URL;

/** rw → counts; empty map when the backend is not wired or unreachable. */
export async function getViewsByRw(): Promise<Map<string, ObjectViews>> {
  if (!API) return new Map();
  try {
    const r = await backendFetch("/views/summary", { cache: "no-store" });
    if (!r.ok) return new Map();
    const rows = (await r.json()) as ObjectViews[];
    return new Map(rows.map((v) => [v.rwNumber, v]));
  } catch (err) {
    console.error("[views] summary failed:", err);
    return new Map();
  }
}

import "server-only";
import { backendFetch } from "@/lib/api/backend";

/**
 * App settings (key-value) from the backend — editable config without a deploy.
 * Used for the monthly commission target («темп месяца» → «% от цели»).
 */
const API = process.env.OBJECTS_API_URL;

export const MONTHLY_TARGET_KEY = "crm_monthly_target_thb";

async function getSetting(key: string): Promise<string | null> {
  if (!API) return null;
  try {
    const r = await backendFetch(`/settings/${key}`, { cache: "no-store" });
    if (!r.ok) return null; // 404 = unset
    const data = (await r.json()) as { value?: string };
    return data.value ?? null;
  } catch (err) {
    console.error("[settings] get failed:", err);
    return null;
  }
}

/** Monthly commission target in THB, or null when not set. */
export async function getMonthlyTargetThb(): Promise<number | null> {
  const raw = await getSetting(MONTHLY_TARGET_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

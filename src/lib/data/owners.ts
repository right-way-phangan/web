import "server-only";
import { backendFetch } from "@/lib/api/backend";

/** Справочник собственников (/admin/owners). Целиком внутреннее. */
export type OwnerRole = "owner" | "developer" | "broker";
export type OwnerStatus = "new" | "contacted" | "confirmed" | "no_answer" | "refused";

export interface OwnerObject {
  rwNumber: string;
  titleEn: string | null;
  type: string;
  status: string;
  district: string | null;
  priceThb: number | null;
  outreachStatus: string | null;
  outreachDate: string | null;
  needsReview: boolean | null;
}

export interface Owner {
  id: number;
  name: string;
  role: OwnerRole;
  phone: string | null;
  whatsapp: string | null;
  line: string | null;
  telegram: string | null;
  email: string | null;
  lang: "th" | "en" | "ru" | null;
  status: OwnerStatus;
  note: string | null;
  lastTouchAt: string | null;
  objects: OwnerObject[];
}

export async function getOwners(): Promise<{ owners: Owner[]; unassigned: OwnerObject[] } | null> {
  try {
    const r = await backendFetch(`/owners`, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as { owners: Owner[]; unassigned: OwnerObject[] };
  } catch (err) {
    console.error("[owners] getOwners failed:", err);
    return null;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import type { ReferralStatus, TermsStatus } from "@/lib/data/partner-referrals";

/**
 * Actions раздела /admin/referrals — партнёры (developer-fee) и передачи
 * лидов. Денежных полей нет by design (суммы — в личном учёте вне продукта).
 * Гейт handed (нужны confirmed_at + ack_artifact) живёт в backend; здесь —
 * только сбор формы и человеческие ошибки.
 */

const API = process.env.OBJECTS_API_URL;
const JSON_HEADERS = { "Content-Type": "application/json" };

export type ReferralActionResult = { ok: boolean; error?: string };

function refresh() {
  revalidatePath("/admin/referrals");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Новый партнёр. linkedRw — RW-номера через запятую/пробел. */
export async function createPartnerAction(formData: FormData): Promise<ReferralActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const name = s("name");
  if (!name) return { ok: false, error: "Название партнёра обязательно." };
  const linkedRw = s("linkedRw")
    .split(/[,\s]+/)
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);
  try {
    const res = await backendFetch("/partners", {
      method: "POST",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({
        slug: s("slug") ? slugify(s("slug")) : slugify(name),
        name,
        contactName: s("contactName") || null,
        messenger: s("messenger") || null,
        linkedRw,
        notes: s("notes") || null,
      }),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
  } catch (err) {
    console.error("[referrals] createPartner failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
  refresh();
  return { ok: true };
}

/**
 * Смена статуса term-sheet. sent/accepted проставляют свою дату; artifact —
 * ГДЕ лежит акцепт (скрин/ссылка на переписку), не условия и не цифры.
 */
export async function updatePartnerTermsAction(
  id: number,
  status: TermsStatus,
  artifact: string,
): Promise<ReferralActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  const patch: Record<string, unknown> = { termsStatus: status };
  if (artifact.trim()) patch.termsArtifact = artifact.trim();
  const now = new Date().toISOString();
  if (status === "sent") patch.termsSentAt = now;
  if (status === "accepted") patch.termsAcceptedAt = now;
  try {
    const res = await backendFetch(`/partners/${id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify(patch),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
  } catch (err) {
    console.error("[referrals] updatePartnerTerms failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
  refresh();
  return { ok: true };
}

/**
 * Новая передача. Гейт квалификации v1: лид + партнёр + непустой тизер
 * (что отправили партнёру — бюджет/сроки/что ищет, БЕЗ имени клиента).
 */
export async function createReferralAction(formData: FormData): Promise<ReferralActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  const leadId = Number(formData.get("leadId"));
  const partnerId = Number(formData.get("partnerId"));
  const teaserText = String(formData.get("teaserText") ?? "").trim();
  const objectRw = String(formData.get("objectRw") ?? "").trim().toUpperCase();
  if (!Number.isFinite(leadId) || leadId <= 0) return { ok: false, error: "Выбери лида." };
  if (!Number.isFinite(partnerId) || partnerId <= 0) return { ok: false, error: "Выбери партнёра." };
  if (!teaserText) return { ok: false, error: "Тизер обязателен — это гейт квалификации." };
  try {
    const res = await backendFetch("/referrals", {
      method: "POST",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify({
        leadId,
        partnerId,
        objectRw: objectRw || null,
        teaserText,
        // Словами, без цифр — деньги вне системы.
        feeMilestone: "per partnership terms, due at contract signing",
      }),
    });
    if (!res.ok) return { ok: false, error: `API ${res.status}` };
  } catch (err) {
    console.error("[referrals] createReferral failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
  refresh();
  return { ok: true };
}

/**
 * Переход статуса / правка полей передачи. confirmed без даты получает её
 * здесь; handed_at и protection_until (+12 мес) ставит backend на гейте.
 */
export async function updateReferralAction(
  id: number,
  patch: {
    status?: ReferralStatus;
    ackArtifact?: string;
    nextFollowUp?: string | null;
    lostReason?: string;
    notes?: string;
  },
): Promise<ReferralActionResult> {
  if (!API) return { ok: false, error: "Backend не подключён." };
  const body: Record<string, unknown> = { ...patch };
  if (patch.status === "confirmed") body.confirmedAt = new Date().toISOString();
  try {
    const res = await backendFetch(`/referrals/${id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      cache: "no-store",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: text ? `API ${res.status}: ${text.slice(0, 120)}` : `API ${res.status}` };
    }
  } catch (err) {
    console.error("[referrals] updateReferral failed:", err);
    return { ok: false, error: "Сетевая ошибка." };
  }
  refresh();
  return { ok: true };
}

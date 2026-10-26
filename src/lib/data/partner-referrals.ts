import "server-only";
import { backendFetch } from "@/lib/api/backend";

/**
 * Партнёры-застройщики (плательщики developer-fee) и передачи лидов им —
 * backend GET /partners и GET /referrals. Денежных полей нет нигде: суммы
 * и проценты живут в личном учёте вне продукта (решение 2026-07-03), в
 * системе — только статусы и артефакты. `null` = API недоступен (миграция
 * ещё не применена) — страница показывает подсказку, а не пустой список.
 */

export type TermsStatus = "draft" | "sent" | "accepted" | "declined";

export interface Partner {
  id: number;
  slug: string;
  name: string;
  contactName: string | null;
  /** Канал связи: tg/line/wa + хэндл. */
  messenger: string | null;
  /** RW-номера проектов/объектов партнёра. */
  linkedRw: string[] | null;
  termsStatus: TermsStatus;
  termsSentAt: string | null;
  termsAcceptedAt: string | null;
  /** ГДЕ лежит акцепт term-sheet (скрин/ссылка на переписку) — не цифры. */
  termsArtifact: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export type ReferralStatus =
  | "teaser_sent"
  | "confirmed"
  | "handed"
  | "viewing"
  | "negotiation"
  | "closed"
  | "lost";

export interface PartnerReferral {
  id: number;
  leadId: number;
  partnerId: number;
  objectRw: string | null;
  status: ReferralStatus;
  /** Что отправили партнёру (бюджет/сроки/что ищет — БЕЗ имени клиента). */
  teaserText: string | null;
  teaserSentAt: string | null;
  confirmedAt: string | null;
  /** Текст/скрин ack партнёра — обязателен для перехода в handed. */
  ackArtifact: string | null;
  handedAt: string | null;
  /** Словами, без цифр: "per partnership terms, due at contract signing". */
  feeMilestone: string | null;
  /** Атрибуция: handed_at + 12 мес, ставится backend'ом при handed. */
  protectionUntil: string | null;
  nextFollowUp: string | null;
  lastClientTouch: string | null;
  verifiedBy: string | null;
  lostReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  // Джойны из GET /referrals
  partnerName: string | null;
  partnerSlug: string | null;
  leadName: string | null;
}

const API = process.env.OBJECTS_API_URL;

export async function getPartners(): Promise<Partner[] | null> {
  if (!API) return null;
  try {
    const r = await backendFetch("/partners", { cache: "no-store" });
    return r.ok ? ((await r.json()) as Partner[]) : null;
  } catch (err) {
    console.error("[partner-referrals] getPartners failed:", err);
    return null;
  }
}

export async function getPartnerReferrals(): Promise<PartnerReferral[] | null> {
  if (!API) return null;
  try {
    const r = await backendFetch("/referrals", { cache: "no-store" });
    return r.ok ? ((await r.json()) as PartnerReferral[]) : null;
  } catch (err) {
    console.error("[partner-referrals] getPartnerReferrals failed:", err);
    return null;
  }
}

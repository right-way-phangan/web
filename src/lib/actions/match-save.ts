"use server";

import { backendFetch } from "@/lib/api/backend";
import { getPublicObjects } from "@/lib/data/objects";
import { deriveFilterOptions } from "@/lib/filters/listings";
import { sanitizeProfile } from "@/lib/match/engine";
import { makeMatchToken, verifyMatchToken } from "@/lib/match/match-token";
import { rateLimit } from "@/lib/ratelimit";
import type { BuyerProfile } from "@/types/match";

/**
 * RW Match — сохранение профиля подбора и доступ к нему по HMAC-токену.
 * Профиль лежит в своей БД (match_profiles); клиентская страница «Мои
 * совпадения» читает его по токену и считает выдачу тем же движком.
 */

const CRM_API_URL = process.env.OBJECTS_API_URL;

/** Сохранить профиль → вернуть токен для страницы «Мои совпадения». */
export async function saveMatchProfile(
  rawProfile: unknown,
  locale: "en" | "ru" = "en",
): Promise<{ ok: boolean; token?: string; error?: string }> {
  if (!CRM_API_URL) return { ok: false, error: "unavailable" };
  if (!(await rateLimit("match-save", 10, 60 * 60)))
    return { ok: false, error: "rate" };

  const objects = await getPublicObjects();
  const { districts } = deriveFilterOptions(objects);
  const profile = sanitizeProfile(
    rawProfile as Record<string, unknown>,
    districts,
  );
  // Не сохраняем пустой профиль (только lang) — защита от мусора.
  if (Object.keys(profile).filter((k) => k !== "lang").length === 0) {
    return { ok: false, error: "empty" };
  }

  try {
    const res = await backendFetch(`/match-profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ profile, lang: locale }),
    });
    if (!res.ok) return { ok: false, error: `api ${res.status}` };
    const body = (await res.json()) as { id?: number };
    if (!body.id) return { ok: false, error: "no id" };
    return { ok: true, token: makeMatchToken(body.id) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Прочитать сохранённый профиль по токену (для страницы «Мои совпадения»). */
export async function fetchMatchProfile(
  token: string,
): Promise<{
  profile: BuyerProfile;
  active: boolean;
  lang: string | null;
} | null> {
  const id = verifyMatchToken(token);
  if (id == null || !CRM_API_URL) return null;
  try {
    const res = await backendFetch(`/match-profiles/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const row = (await res.json()) as {
      profile?: Record<string, unknown>;
      active?: boolean;
      lang?: string | null;
    };
    return {
      profile: sanitizeProfile(row.profile ?? {}),
      active: row.active !== false,
      lang: row.lang ?? null,
    };
  } catch {
    return null;
  }
}

/** Отписаться от уведомлений (деактивировать профиль). */
export async function unsubscribeMatchProfile(
  token: string,
): Promise<{ ok: boolean }> {
  const id = verifyMatchToken(token);
  if (id == null || !CRM_API_URL) return { ok: false };
  try {
    const res = await backendFetch(`/match-profiles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ active: false }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

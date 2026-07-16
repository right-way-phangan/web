"use server";

import { getAllObjects, slimObjectForCard } from "@/lib/data/objects";
import { deriveFilterOptions } from "@/lib/filters/listings";
import {
  sanitizeProfile,
  shortlistCandidates,
  deterministicRank,
} from "@/lib/match/engine";
import { rankShortlist } from "@/lib/match/llm";
import { backendFetch } from "@/lib/api/backend";
import type { BuyerProfile, MatchResult } from "@/types/match";

/**
 * RW Match — server actions админ-twin (/admin/match). Тот же движок, что и на
 * публичной /match, но: (1) кандидаты берутся из ВСЕГО каталога (агент видит и
 * Hold-объекты); (2) без публичного rate-cap (за админ-авторизацией); (3) на
 * выходе — создание лида с контактом walk-in клиента и профилем в note.
 */

const CRM_API_URL = process.env.OBJECTS_API_URL;

/** Подбор под профиль клиента (агент заполняет за него). Возвращает карточки. */
export async function adminMatch(
  rawProfile: unknown,
  locale: "en" | "ru" = "ru",
): Promise<{ results: MatchResult[] }> {
  const objects = await getAllObjects();
  // Агент показывает и Active, и Hold (придержанные) — но не проданные/снятые.
  const sellable = objects.filter(
    (o) => o.status === "Active" || o.status === "Hold",
  );
  const { districts } = deriveFilterOptions(objects);
  const profile = sanitizeProfile(
    rawProfile as Record<string, unknown>,
    districts,
  );

  const { candidates } = shortlistCandidates(sellable, profile);
  const ranked = await rankShortlist(profile, candidates, locale);
  const results = ranked
    ? ranked
        .map((r) => {
          const card = candidates.find((c) => c.rwNumber === r.rw);
          return card
            ? {
                rw: r.rw,
                fitPct: r.fitPct,
                reason: r.reason,
                card: slimObjectForCard(card),
              }
            : null;
        })
        .filter((r): r is MatchResult => r !== null)
    : deterministicRank(profile, candidates, locale).map((r) => ({
        ...r,
        card: slimObjectForCard(r.card),
      }));

  return { results };
}

function pipelineForInterest(types?: string[]): "land" | "villa_house" {
  if (
    types?.some((t) => ["Villa", "House", "Apartment", "Project"].includes(t))
  ) {
    return "villa_house";
  }
  return "land";
}

/** Короткая сводка профиля клиента для note лида. */
function summarizeProfile(p: BuyerProfile): string {
  const bits: string[] = [];
  if (p.goal) bits.push(`цель: ${p.goal}`);
  if (p.type?.length) bits.push(`тип: ${p.type.join("/")}`);
  if (p.budgetMinMThb || p.budgetMaxMThb)
    bits.push(`бюджет: ${p.budgetMinMThb ?? ""}–${p.budgetMaxMThb ?? ""}M฿`);
  if (p.districts?.length) bits.push(`район: ${p.districts.join(", ")}`);
  if (p.tenure?.length) bits.push(`владение: ${p.tenure.join("/")}`);
  if (p.bedroomsMin) bits.push(`спален: ${p.bedroomsMin}+`);
  if (p.mustHaves?.length) bits.push(`важно: ${p.mustHaves.join(", ")}`);
  if (p.timeframe) bits.push(`срок: ${p.timeframe}`);
  if (p.notes) bits.push(`заметки: ${p.notes}`);
  return bits.join(" · ");
}

/** Создать лид из подбора walk-in клиента (POST /leads в свою БД). */
export async function createMatchLead(input: {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  profile: unknown;
  likedRws?: string[];
}): Promise<{ ok: boolean; leadId?: number; error?: string }> {
  const name = String(input.name ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Укажите имя клиента." };
  if (!CRM_API_URL)
    return {
      ok: false,
      error: "CRM API недоступен (OBJECTS_API_URL не задан).",
    };

  const profile = sanitizeProfile(input.profile as Record<string, unknown>);
  const liked = (input.likedRws ?? [])
    .filter((r) => /^RW-/i.test(r))
    .slice(0, 20);
  const note = [
    summarizeProfile(profile),
    liked.length ? `Понравились: ${liked.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const tags = [
    "match",
    "walk-in",
    ...(input.source ? [`source:${input.source}`] : []),
    ...(profile.type?.length ? [`interest:${profile.type[0]}`] : []),
    ...liked.map((r) => `object:${r}`),
  ];

  try {
    const res = await backendFetch(`/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        leadName: `AI Match · ${name}`,
        pipeline: pipelineForInterest(profile.type),
        contact: {
          name,
          phone: input.phone || undefined,
          email: input.email || undefined,
        },
        note,
        tags,
        source: "contact",
        kind: "match",
      }),
    });
    if (!res.ok) return { ok: false, error: `leads API → ${res.status}` };
    const body = (await res.json()) as { leadId?: number };
    return { ok: true, leadId: body.leadId ?? 0 };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

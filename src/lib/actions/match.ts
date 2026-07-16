"use server";

import { z } from "zod";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { recordSearchEvent } from "@/lib/data/demand";
import { deriveFilterOptions } from "@/lib/filters/listings";
import {
  sanitizeProfile,
  shortlistCandidates,
  deterministicRank,
} from "@/lib/match/engine";
import { interviewTurn, rankShortlist, scriptedTurn } from "@/lib/match/llm";
import { rateLimit } from "@/lib/ratelimit";
import type { BuyerProfile, MatchMessage, MatchResult } from "@/types/match";
import type { RealEstateObject } from "@/types/object";

/**
 * RW Match — server actions разговорного подбора. Сервер stateless: клиент
 * присылает историю + профиль, получает следующий ход, а на `done` — карточки
 * с % фита. Защита от расхода токенов: rate-limit + жёсткий cap ходов + Zod-лимиты
 * на размер входа (см. CLAUDE-план D6).
 */

const MAX_TURNS = 24;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(1200),
});

const turnSchema = z.object({
  message: z.string().trim().max(1000),
  history: z.array(messageSchema).max(30).default([]),
  profile: z.record(z.string(), z.unknown()).default({}),
  locale: z.enum(["en", "ru"]).default("en"),
});

const rerankSchema = z.object({
  profile: z.record(z.string(), z.unknown()).default({}),
  feedback: z.object({
    liked: z.array(z.string().max(20)).max(50).default([]),
    rejected: z.array(z.string().max(20)).max(50).default([]),
  }),
  locale: z.enum(["en", "ru"]).default("en"),
});

export interface MatchTurnResult {
  reply: string;
  profile: BuyerProfile;
  done: boolean;
  results?: MatchResult[];
  relaxations?: string[];
  limited?: boolean;
}

const LIMIT_MSG: Record<"en" | "ru", string> = {
  en: "We've chatted a lot! Message us on Telegram or WhatsApp and an agent will take it from here.",
  ru: "Мы уже много обсудили! Напишите нам в Telegram или WhatsApp — дальше подключится агент.",
};

/** RankedItem[]/детерминированная выдача → MatchResult[] с облегчёнными карточками. */
function toResults(
  ranked: { rw: string; fitPct: number; reason: string }[] | null,
  profile: BuyerProfile,
  candidates: RealEstateObject[],
  locale: "en" | "ru",
): MatchResult[] {
  if (ranked) {
    return ranked
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
      .filter((r): r is MatchResult => r !== null);
  }
  // Фолбэк без ключа/при сбое LLM — детерминированный скоринг.
  return deterministicRank(profile, candidates, locale).map((r) => ({
    ...r,
    card: slimObjectForCard(r.card),
  }));
}

/** Один ход разговора; на `done` возвращает подобранные карточки. */
export async function matchTurn(input: unknown): Promise<MatchTurnResult> {
  const parsed = turnSchema.safeParse(input);
  if (!parsed.success) {
    return { reply: LIMIT_MSG.en, profile: {}, done: false, limited: true };
  }
  const { message, history, locale } = parsed.data;

  const objects = await getPublicObjects();
  const { districts } = deriveFilterOptions(objects);
  const profile = sanitizeProfile(parsed.data.profile, districts);

  // Per-IP throttle (fail-open). Два окна: всплеск и суточный потолок.
  const okBurst = await rateLimit("match", 30, 60 * 60);
  const okDay = await rateLimit("match-day", 80, 24 * 60 * 60);
  if (!okBurst || !okDay) {
    return { reply: LIMIT_MSG[locale], profile, done: false, limited: true };
  }

  const fullHistory: MatchMessage[] = [
    ...history,
    { role: "user", content: message },
  ];
  const userTurns = fullHistory.filter((m) => m.role === "user").length;

  // Жёсткий cap: дальше завершаем интервью текущим профилем без LLM-вызова.
  const turn =
    userTurns >= MAX_TURNS
      ? { reply: LIMIT_MSG[locale], profile, done: true }
      : ((await interviewTurn(fullHistory, profile, locale, districts)) ??
        scriptedTurn(fullHistory, profile, locale, districts));

  if (!turn.done) {
    return { reply: turn.reply, profile: turn.profile, done: false };
  }

  const { candidates, relaxations } = shortlistCandidates(
    objects,
    turn.profile,
  );
  const ranked = await rankShortlist(turn.profile, candidates, locale);
  const results = toResults(ranked, turn.profile, candidates, locale);

  // Сигнал спроса в /admin/demand (что ищут vs что в каталоге). Бэкенд сведёт
  // kind к "filter"; structural-поля агрегируются. Fire-and-forget.
  const p = turn.profile;
  void recordSearchEvent({
    kind: "filter",
    matched: results.length > 0,
    resultCount: results.length,
    locale,
    types: p.type ?? [],
    districts: p.districts ?? [],
    tenure: p.tenure ?? [],
    features: p.mustHaves ?? [],
    priceMinM: p.budgetMinMThb ?? null,
    priceMaxM: p.budgetMaxMThb ?? null,
    bedroomsMin: p.bedroomsMin ?? null,
  });

  return {
    reply: turn.reply,
    profile: turn.profile,
    done: true,
    results,
    relaxations: relaxations as string[],
  };
}

/** Пере-ранжирование после ♥/✕ фидбека — один LLM-вызов, фолбэк детерминированный. */
export async function rerankMatches(
  input: unknown,
): Promise<{ results: MatchResult[] }> {
  const parsed = rerankSchema.safeParse(input);
  if (!parsed.success) return { results: [] };
  const { feedback, locale } = parsed.data;

  const objects = await getPublicObjects();
  const { districts } = deriveFilterOptions(objects);
  const profile = sanitizeProfile(parsed.data.profile, districts);

  if (!(await rateLimit("match", 30, 60 * 60))) return { results: [] };

  const { candidates } = shortlistCandidates(objects, profile);
  const ranked = await rankShortlist(profile, candidates, locale, feedback);
  return { results: toResults(ranked, profile, candidates, locale) };
}

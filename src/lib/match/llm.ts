import "server-only";
import type { BuyerProfile, InterviewResult, MatchMessage, RankedItem } from "@/types/match";
import type { RealEstateObject } from "@/types/object";
import { interviewerSystem, rankerSystem } from "@/lib/match/prompts";
import { sanitizeProfile, mergeProfile, serializeCandidate } from "@/lib/match/engine";
import { parseHeuristic } from "@/lib/search/parse-query";

/**
 * RW Match — LLM-слой (server-only). Разговорный интервьюер и семантический
 * ранжировщик поверх Anthropic Messages API, по образцу lib/search/parse-query.ts
 * (дешёвая модель по умолчанию, ключ на клиент не уходит). Без ANTHROPIC_API_KEY
 * оба пути деградируют: интервью → `scriptedTurn`, ранжирование → детерминированное
 * (в actions). Каждый ответ модели валидируется кодом.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

type Locale = "en" | "ru";

/** Один вызов Claude → сырой текст ответа. null при отсутствии ключа или ошибке. */
async function callClaude(
  system: string,
  userContent: string,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    if (!resp.ok) {
      console.error(`[match] anthropic ${resp.status}`);
      return null;
    }
    const data = (await resp.json()) as { content?: Array<{ type: string; text?: string }> };
    return (data.content ?? []).map((c) => c.text ?? "").join("");
  } catch (err) {
    console.error("[match] anthropic call failed:", err);
    return null;
  }
}

function extractJson<T>(raw: string, open: "{" | "["): T | null {
  const close = open === "{" ? "}" : "]";
  const start = raw.indexOf(open);
  const end = raw.lastIndexOf(close);
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/** Компактная запись диалога — последние 12 реплик (знание копится в профиле). */
function transcript(history: MatchMessage[]): string {
  const recent = history.slice(-12);
  if (recent.length === 0) return "(empty — this is the first turn)";
  return recent.map((m) => `${m.role === "user" ? "Client" : "Agent"}: ${m.content}`).join("\n");
}

/**
 * Ход интервью через LLM. Возвращает обновлённый (санитизированный) профиль,
 * реплику и флаг done. null → нет ключа/ошибка/невалидный JSON (вызывающий
 * переходит на `scriptedTurn`).
 */
export async function interviewTurn(
  history: MatchMessage[],
  profile: BuyerProfile,
  locale: Locale,
  validDistricts: string[],
): Promise<InterviewResult | null> {
  const user = `Transcript so far:\n${transcript(history)}\n\nProfile so far (JSON): ${JSON.stringify(profile)}\n\nProduce the next turn as JSON.`;
  const raw = await callClaude(interviewerSystem(locale, validDistricts), user, 700);
  if (!raw) return null;
  const obj = extractJson<{ reply?: unknown; profile?: unknown; done?: unknown }>(raw, "{");
  if (!obj || typeof obj.reply !== "string") return null;
  const merged = { ...profile, ...(typeof obj.profile === "object" && obj.profile ? obj.profile : {}) };
  return {
    reply: obj.reply,
    profile: sanitizeProfile(merged as Record<string, unknown>, validDistricts),
    done: obj.done === true,
  };
}

/**
 * Семантическое ранжирование шортлиста через LLM. Валидирует rw по whitelist
 * кандидатов (анти-галлюцинация) и клампит fitPct. null → нет ключа/ошибка.
 */
export async function rankShortlist(
  profile: BuyerProfile,
  candidates: RealEstateObject[],
  locale: Locale,
  feedback?: { liked: string[]; rejected: string[] },
): Promise<RankedItem[] | null> {
  if (candidates.length === 0) return [];
  const lines = candidates.map(serializeCandidate).join("\n");
  const user = `Buyer profile (JSON): ${JSON.stringify(profile)}\n\nCandidates:\n${lines}`;
  const raw = await callClaude(rankerSystem(locale, feedback), user, 900);
  if (!raw) return null;
  const arr = extractJson<Array<{ rw?: unknown; fitPct?: unknown; reason?: unknown }>>(raw, "[");
  if (!Array.isArray(arr)) return null;
  const valid = new Set(candidates.map((c) => c.rwNumber));
  return arr
    .filter((x): x is { rw: string; fitPct: unknown; reason: unknown } =>
      Boolean(x) && typeof x.rw === "string" && valid.has(x.rw),
    )
    .map((x) => ({
      rw: x.rw,
      fitPct: Math.max(0, Math.min(100, Math.round(Number(x.fitPct) || 0))),
      reason: typeof x.reason === "string" ? x.reason.slice(0, 140) : "",
    }))
    .slice(0, 10);
}

// ---- Скриптованный фолбэк интервью (без API-ключа) ----

/** Извлекает быстрое сырое goal из текста (parseHeuristic его не знает). */
function goalFrom(text: string): BuyerProfile["goal"] | undefined {
  const t = text.toLowerCase();
  if (/\binvest|доходност|аренд.*сдав|rent out|rent-out|yield|окупа/.test(t)) return "invest";
  if (/\blive|жить|переехать|residence|permanent|пмж/.test(t)) return "live";
  if (/\bholiday|vacation|отпуск|дача|second home/.test(t)) return "vacation";
  return undefined;
}

/** parseHeuristic-параметры → патч профиля. */
function paramsToProfile(params: Record<string, string>): BuyerProfile {
  const feats: BuyerProfile["mustHaves"] = [];
  if (params.beachfront) feats.push("beachfront");
  if (params.seaview) feats.push("seaView");
  if (params.mountainview) feats.push("mountainView");
  return {
    type: params.type ? (params.type.split(",") as BuyerProfile["type"]) : undefined,
    districts: params.district ? params.district.split(",") : undefined,
    tenure: params.tenure ? (params.tenure.split(",") as BuyerProfile["tenure"]) : undefined,
    bedroomsMin: params.bedrooms ? Number(params.bedrooms) : undefined,
    budgetMinMThb: params.pmin ? Number(params.pmin) : undefined,
    budgetMaxMThb: params.pmax ? Number(params.pmax) : undefined,
    mustHaves: feats.length ? feats : undefined,
  };
}

const SCRIPT: Record<Locale, string[]> = {
  en: [
    "Hi! I'll help you find the right place on Koh Phangan. First — are you buying to live, to invest, to rent out, or for holidays?",
    "Got it. What's your budget, roughly, in million baht?",
    "And what are you after — land, a villa, a house, an apartment, or an off-plan project?",
    "Any preferred area? (Sri Thanu, Ban Tai, Chaloklum, Haad Yao…) Or should I look island-wide?",
    "Last thing — what matters most? Sea view, quiet, a pool, flat land, close to the beach?",
  ],
  ru: [
    "Привет! Помогу подобрать место на Пангане. Сначала — покупаете, чтобы жить, инвестировать, сдавать или для отдыха?",
    "Понял. Какой примерно бюджет, в миллионах бат?",
    "И что ищете — землю, виллу, дом, апартаменты или проект на стадии стройки?",
    "Есть предпочтительный район? (Sri Thanu, Ban Tai, Chaloklum, Haad Yao…) Или искать по всему острову?",
    "Последнее — что важнее всего? Вид на море, тишина, бассейн, ровный участок, рядом пляж?",
  ],
};

const CLOSING: Record<Locale, string> = {
  en: "Perfect — let me pull the best matches for you now.",
  ru: "Отлично — сейчас подберу для вас лучшие варианты.",
};

/**
 * Скриптованный ход интервью без LLM: разбирает последнюю реплику клиента
 * (parseHeuristic + быстрый goal), копит профиль и задаёт следующий заготовленный
 * вопрос. done, когда пройдены все вопросы. Деградация, а не полный разговор.
 */
export function scriptedTurn(
  history: MatchMessage[],
  profile: BuyerProfile,
  locale: Locale,
  validDistricts: string[],
): InterviewResult {
  const answered = history.filter((m) => m.role === "user").length;
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  let merged = profile;
  if (lastUser) {
    const patch = paramsToProfile(parseHeuristic(lastUser, validDistricts).params);
    const goal = profile.goal ?? goalFrom(lastUser);
    merged = mergeProfile(profile, sanitizeProfile({ ...patch, goal, notes: lastUser } as Record<string, unknown>, validDistricts));
  }

  const script = SCRIPT[locale];
  // answered = сколько ответов уже дал клиент; следующий вопрос — по этому индексу.
  if (answered >= script.length) {
    return { reply: CLOSING[locale], profile: { ...merged, lang: locale }, done: true };
  }
  return { reply: script[answered], profile: { ...merged, lang: locale }, done: false };
}

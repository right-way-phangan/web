/**
 * Генератор рекламных креативов по объекту каталога — Фаза 1 ИИ-агента
 * маркетинга (playbook §4.1).
 *
 * Два слоя, как в object-title.ts / object-description.ts:
 *  - buildFacts() + fallbackCreatives(): чистые, детерминированные, без сети.
 *    Работают всегда — даже когда ключа нет или Anthropic лежит.
 *  - generateAdCreatives(): обёртка над Claude, которая получает те же факты как
 *    основание и обязана уложиться в лимиты канала. Любая осечка — молча падаем
 *    на детерминированный слой, страница админки не должна ломаться из-за LLM.
 *
 * Правила дома, зашитые в промпт и в фолбэк:
 *  - никаких цен и ценового сегмента в тексте (решение по публичным текстам);
 *  - EN и RU выдаём парой и всегда одновременно (правило двуязычия);
 *  - leasehold описываем как «долгосрочная регистрируемая аренда», без обещаний
 *    владения землёй иностранцем;
 *  - тон инфостиля: конкретные факты вместо превосходных степеней.
 */
import type { RealEstateObject } from "@/types/object";

export type AdChannel = "meta" | "google";
export type AdLang = "en" | "ru";

export interface AdCreative {
  lang: AdLang;
  /** Заголовок объявления. */
  headline: string;
  /** Основной текст (Meta primary text / Google description). */
  primary: string;
  /** Короткая подпись под заголовком (Meta description / Google description 2). */
  description: string;
}

export interface CreativeSet {
  rwNumber: string;
  channel: AdChannel;
  /** Ссылка с UTM — одна на объект, общая для всех вариантов. */
  landingUrl: string;
  variants: AdCreative[];
  /** true — тексты пришли от Claude, false — детерминированный шаблон. */
  fromLlm: boolean;
}

/** Лимиты площадок. Meta режет по видимой части, Google — жёстко по символам. */
export const LIMITS: Record<AdChannel, { headline: number; primary: number; description: number }> = {
  meta: { headline: 40, primary: 125, description: 30 },
  google: { headline: 30, primary: 90, description: 90 },
};

const SITE = "https://rightwaygroup.co";
const API_URL = "https://api.anthropic.com/v1/messages";
// Дешёвая модель по умолчанию — задача текстовая и короткая (правило экономии на LLM).
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

// ---- Ссылка с разметкой ----

/**
 * Посадочная с UTM. `utm_content` = RW-номер: именно по нему сшиваются лид в CRM
 * и объект, поэтому он обязателен — без него канал знает о лиде, а мы нет.
 */
export function buildLandingUrl(
  obj: RealEstateObject,
  channel: AdChannel,
  opts: { campaign?: string; projectSlug?: string } = {},
): string {
  const { campaign = "island_w1", projectSlug } = opts;
  // Слаг проекта считается по всему списку проектов (projectSlug() разводит
  // тёзок), поэтому приходит снаружи — здесь модуль остаётся без зависимостей.
  const path = projectSlug ? `/projects/${projectSlug}` : `/object/${obj.rwNumber}`;
  const params = new URLSearchParams({
    utm_source: channel === "meta" ? "facebook" : "google",
    utm_medium: "cpc",
    utm_campaign: campaign,
    utm_content: obj.rwNumber,
  });
  return `${SITE}${path}?${params.toString()}`;
}

// ---- Факты объекта: единственное основание для текста ----

export interface ObjectFacts {
  kind: string;
  district: string;
  area: string;
  bedrooms: string;
  features: string[];
  tenure: string;
  stage: string;
}

/**
 * Выжимка «о чём этот объект» — без цены и без внутренних пометок.
 * Отдаётся и в промпт Claude, и в детерминированный шаблон, поэтому оба слоя
 * говорят об одном и том же и не могут разойтись в фактах.
 */
export function buildFacts(obj: RealEstateObject): ObjectFacts {
  const features: string[] = [];
  if (obj.beachfront) features.push("beachfront");
  else if (obj.seaView) features.push("sea view");
  if (obj.mountainView) features.push("mountain view");
  if (obj.pool) features.push("private pool");
  if (obj.flatLand && obj.type === "Land") features.push("flat, build-ready");
  if (obj.quiet) features.push("quiet location");
  if (obj.gated) features.push("gated");

  const area = obj.areaRai
    ? `${obj.areaRai} rai`
    : obj.areaSqm
      ? `${obj.areaSqm} m²`
      : "";

  const tenure = (obj.tenure ?? []).includes("Leasehold")
    ? "long-term registered lease available"
    : "";

  return {
    kind: obj.type === "Project" ? "off-plan project" : obj.type.toLowerCase(),
    district: obj.district ?? "Koh Phangan",
    area,
    bedrooms: obj.bedrooms ? `${obj.bedrooms}-bedroom` : "",
    features,
    tenure,
    stage: obj.type === "Project" && obj.completion ? `completion ${obj.completion}` : "",
  };
}

// ---- Детерминированный слой (работает без ключа) ----

function clamp(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  // Режем по границе слова, чтобы не обрывать посреди слова.
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}

const RU_KIND: Record<string, string> = {
  land: "Участок",
  villa: "Вилла",
  house: "Дом",
  apartment: "Апартаменты",
  "off-plan project": "Новый проект",
};

export function fallbackCreatives(obj: RealEstateObject, channel: AdChannel): AdCreative[] {
  const f = buildFacts(obj);
  const lim = LIMITS[channel];
  const feat = f.features.slice(0, 2).join(", ");
  const ruKind = RU_KIND[f.kind] ?? "Объект";

  const en: AdCreative = {
    lang: "en",
    headline: clamp(
      [f.bedrooms, f.kind === "off-plan project" ? "New Project" : f.kind, "in", f.district]
        .filter(Boolean)
        .join(" ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      lim.headline,
    ),
    primary: clamp(
      [
        `${f.bedrooms ? `${f.bedrooms} ` : ""}${f.kind} in ${f.district}${f.area ? `, ${f.area}` : ""}.`,
        feat ? `${feat[0].toUpperCase()}${feat.slice(1)}.` : "",
        f.tenure ? "Long-term registered lease available." : "",
        "Personally visited and legally checked before it goes public.",
      ]
        .filter(Boolean)
        .join(" "),
      lim.primary,
    ),
    description: clamp("Phangan only. Ask for details.", lim.description),
  };

  const ru: AdCreative = {
    lang: "ru",
    headline: clamp(
      [ruKind, f.bedrooms ? `${obj.bedrooms} спальни` : "", "—", f.district].filter(Boolean).join(" "),
      lim.headline,
    ),
    primary: clamp(
      [
        `${ruKind} в районе ${f.district}${f.area ? `, ${f.area}` : ""}.`,
        feat ? `${feat}.` : "",
        f.tenure ? "Возможна долгосрочная регистрируемая аренда земли." : "",
        "Объект осмотрен лично, документы проверены до публикации.",
      ]
        .filter(Boolean)
        .join(" "),
      lim.primary,
    ),
    description: clamp("Только Панган. Ответим на вопросы.", lim.description),
  };

  return [en, ru];
}

// ---- Слой Claude ----

interface LlmVariant {
  lang: AdLang;
  headline: string;
  primary: string;
  description: string;
}

function systemPrompt(channel: AdChannel, count: number): string {
  const lim = LIMITS[channel];
  const placement =
    channel === "meta"
      ? "Facebook/Instagram feed ads shown to people physically on Koh Phangan (expats, nomads, long-stayers)."
      : "Google Search ads for people already searching to buy land or a villa on Koh Phangan.";

  return `You write real-estate ads for Right Way, an agency working only on Koh Phangan, Thailand.

Placement: ${placement}

Return ONLY a JSON array of ${count * 2} objects, each: {"lang":"en"|"ru","headline":string,"primary":string,"description":string}.
Produce ${count} EN variants and ${count} RU variants — the RU ones are independent copy for Russian-speaking residents, not literal translations.

Hard limits (characters, enforced): headline ≤ ${lim.headline}, primary ≤ ${lim.primary}, description ≤ ${lim.description}.

Rules:
- NEVER mention price, budget, price segment, discounts or commission.
- Ground every claim in the supplied facts. Invent nothing — no beaches, no distances, no yields that are not given.
- If a long-term lease is available, say "long-term registered lease" (RU: «долгосрочная регистрируемая аренда»). Never imply a foreigner can own land outright.
- Plain, concrete, informational tone. No "luxury", "paradise", "dream", no exclamation marks, no emoji.
- Each variant must open with a different angle (the place, the object itself, the process/legal safety).`;
}

function factsBlock(obj: RealEstateObject): string {
  const f = buildFacts(obj);
  return JSON.stringify(
    {
      type: f.kind,
      district: f.district,
      area: f.area || undefined,
      bedrooms: f.bedrooms || undefined,
      features: f.features.length ? f.features : undefined,
      lease: f.tenure || undefined,
      stage: f.stage || undefined,
    },
    null,
    1,
  );
}

function sanitize(v: LlmVariant, channel: AdChannel): AdCreative | null {
  const lim = LIMITS[channel];
  if (v.lang !== "en" && v.lang !== "ru") return null;
  const headline = clamp(String(v.headline ?? ""), lim.headline);
  const primary = clamp(String(v.primary ?? ""), lim.primary);
  const description = clamp(String(v.description ?? ""), lim.description);
  if (!headline || !primary) return null;
  // Цена в тексте — нарушение правила публичных текстов: вариант выбрасываем целиком.
  if (/\d[\d\s.,]*\s*(thb|฿|бат|baht|млн|m\b|million)/i.test(`${headline} ${primary} ${description}`)) return null;
  return { lang: v.lang, headline, primary, description };
}

/**
 * Основная точка входа. Всегда возвращает набор: при любой проблеме с LLM
 * отдаём детерминированную пару EN+RU, пометив `fromLlm: false`.
 */
export async function generateAdCreatives(
  obj: RealEstateObject,
  channel: AdChannel,
  opts: { variantsPerLang?: number; projectSlug?: string } = {},
): Promise<CreativeSet> {
  const { variantsPerLang = 2, projectSlug } = opts;
  const base: CreativeSet = {
    rwNumber: obj.rwNumber,
    channel,
    landingUrl: buildLandingUrl(obj, channel, { projectSlug }),
    variants: fallbackCreatives(obj, channel),
    fromLlm: false,
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return base;

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
        max_tokens: 1200,
        system: systemPrompt(channel, variantsPerLang),
        messages: [{ role: "user", content: `Facts about the listing:\n${factsBlock(obj)}` }],
      }),
    });
    if (!resp.ok) {
      console.error(`[ads] Anthropic HTTP ${resp.status}`);
      return base;
    }

    const data = (await resp.json()) as { content?: Array<{ text?: string }> };
    const text = data.content?.map((c) => c.text ?? "").join("") ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return base;

    const parsed = JSON.parse(match[0]) as LlmVariant[];
    const variants = parsed.map((v) => sanitize(v, channel)).filter((v): v is AdCreative => v !== null);
    // Пара обязана быть полной: если Claude отдал только один язык — это не то,
    // что нужно по правилу двуязычия, лучше честный шаблон.
    const hasBoth = variants.some((v) => v.lang === "en") && variants.some((v) => v.lang === "ru");
    if (!hasBoth) return base;

    return { ...base, variants, fromLlm: true };
  } catch (err) {
    console.error("[ads] generateAdCreatives failed:", err);
    return base;
  }
}

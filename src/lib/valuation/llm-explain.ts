import "server-only";

/**
 * LLM-обоснование оценки: превращает ДЕТЕРМИНИРОВАННЫЙ результат движка в связное
 * человеческое объяснение «почему столько» — для агента и продавца. Линия
 * отстройки RW — «честные цифры + проверяемая методология»: модель НЕ считает
 * цену и НЕ выдумывает фактов, она только пересказывает уже посчитанные движком
 * числа, факторы, оговорки и рычаги. Цифры остаются за детерминированным ядром.
 *
 * Подключается ключом `ANTHROPIC_API_KEY` (как lib/classify/image-doc.ts и
 * lib/search/parse-query.ts) — без ключа `explainValuation` возвращает null и
 * фича просто не показывается. Сырой fetch к Anthropic, без SDK-зависимости.
 *
 * Только админка (createdBy не публичный): на вход идёт ВНУТРЕННЯЯ раскладка
 * (методы/веса/число компсов), которую публичный estimatePublic не раскрывает.
 * Для публичного лид-магнита нужен отдельный санитизированный промпт — позже.
 */

import type { ValuationResult, ValuationSubject } from "./engine";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export function isValuationLlmEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const fmt = (v: number | undefined | null): string =>
  v == null ? "—" : v >= 1e6 ? `${(v / 1e6).toFixed(2)}M THB` : `${Math.round(v / 1000)}k THB`;

const CONF_RU: Record<string, string> = { high: "высокая", medium: "средняя", low: "низкая" };

/**
 * Компактная фактическая раскладка оценки (только посчитанное движком). Модель
 * получает уже готовые числа/факторы и лишь переписывает их в прозу — так
 * исключается выдумывание цифр.
 */
function factsBlock(subject: ValuationSubject, r: ValuationResult): string {
  const lines: string[] = [];
  const meta = [
    subject.type,
    subject.district ? `район ${subject.district}` : null,
    subject.tenure,
    subject.areaRai ? `${subject.areaRai} рай` : null,
    subject.builtSqm ? `${subject.builtSqm} м² постройки` : null,
    subject.bedrooms ? `${subject.bedrooms} спален` : null,
  ].filter(Boolean);
  lines.push(`Объект: ${meta.join(", ")}.`);
  lines.push(
    `Итог: рекомендуемая цена размещения ${fmt(r.listValue)}, ожидаемая сделка ${fmt(r.fairValue)}, ` +
      `вилка ${fmt(r.low)}–${fmt(r.high)}${r.perRai != null ? `, ~${fmt(r.perRai)} за рай` : ""}. ` +
      `Уверенность: ${CONF_RU[r.confidence ?? "low"] ?? r.confidence}.`,
  );

  const used = r.methods.filter((m) => m.available && m.value);
  if (used.length) {
    lines.push("Методы (взвешенное среднее):");
    for (const m of used) {
      lines.push(
        `  • ${m.label}: ${fmt(m.value)}${m.basis ? ` (${m.basis})` : ""}, вес ${m.weight}` +
          `${m.tier === "island" ? ", база по всему острову" : ""}${m.rough ? ", грубое сравнение" : ""}.`,
      );
    }
  }
  if (r.adjustments.length) {
    lines.push(
      "Поправки субъекта к эталону: " +
        r.adjustments.map((a) => `${a.label} ×${a.mult.toFixed(2)}`).join(", ") + ".",
    );
  }
  if (r.sensitivity?.length) {
    lines.push(
      "Рычаги (что двигает цену): " +
        r.sensitivity
          .map((s) => `${s.label} ${s.deltaPct > 0 ? "+" : ""}${s.deltaPct}%${s.applied ? "" : " (потенциал)"}`)
          .join("; ") + ".",
    );
  }
  if (r.leasehold) {
    const l = r.leasehold;
    lines.push(
      `Leasehold: справедливая аренда ${l.fairRentPerRaiMonth.toLocaleString()} THB/рай·мес` +
        `${l.fairRentTotalMonth ? ` (всего ${l.fairRentTotalMonth.toLocaleString()} THB/мес)` : ""}` +
        `${l.contractNpv != null ? `; NPV контракта ${fmt(l.contractNpv)} против справедливого ${fmt(l.fairNpv)}` : ""}` +
        `${l.rentVerdict ? ` — ставка ${l.rentVerdict === "over" ? "выше" : l.rentVerdict === "under" ? "ниже" : "в"} рынка` : ""}.`,
    );
  }
  if (r.rental?.scenarios.length) {
    lines.push(
      "Прогноз аренды: " +
        r.rental.scenarios
          .map((s) => `${s.label} ~${s.monthly.toLocaleString()} THB/мес (${fmt(s.annual)}/год)`)
          .join("; ") + ".",
    );
  }
  if (r.askingVerdict) {
    const v = r.askingVerdict;
    lines.push(
      `Запрошенная цена ${fmt(v.askingPrice)} — ${v.deltaPct > 0 ? "+" : ""}${v.deltaPct}% к рекомендации ` +
        `(${v.verdict === "over" ? "переоценён" : v.verdict === "under" ? "ниже рынка" : "в рынке"}).`,
    );
  }
  if (r.caveats.length) {
    lines.push("Оговорки: " + r.caveats.map((c) => `— ${c}`).join(" "));
  }
  return lines.join("\n");
}

const SYSTEM_PROMPT = `Ты — оценщик недвижимости на острове Панган (Таиланд) в агентстве Right Way.
Тебе дают ГОТОВУЮ раскладку оценки, посчитанную детерминированным движком.
Напиши на русском связное профессиональное объяснение «почему такая цена» —
для агента и продавца.

ЖЁСТКИЕ ПРАВИЛА:
- Используй ТОЛЬКО приведённые числа, факторы, рычаги и оговорки. НИЧЕГО не
  выдумывай: не вводи новых цифр, ставок, районов или фактов, которых нет в
  раскладке. Сами цифры считает движок — ты их объясняешь, а не пересчитываешь.
- Будь честным: если уверенность низкая или есть оговорки (мало компсов, грубое
  сравнение, база по острову) — прямо скажи об этом, не сглаживай.
- Структура (без громоздких заголовков, живым текстом, 3–5 абзацев):
  1) итог и диапазон; 2) почему столько — какие методы и главные факторы/рычаги;
  3) что снижает уверенность (оговорки); 4) аргументы для разговора о цене.
- Тон деловой, без маркетингового пафоса и без эмодзи. Не давай юридических
  гарантий. Не более ~280 слов.`;

/**
 * Прозаическое обоснование оценки или null (нет ключа / ошибка / пустой ответ).
 * Грубых отказов наружу не бросает — вызывающий показывает фолбэк.
 */
export async function explainValuation(
  subject: ValuationSubject,
  result: ValuationResult,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !result.ok) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: factsBlock(subject, result) }],
      }),
    });
    if (!resp.ok) {
      console.error(`[valuation-llm] anthropic ${resp.status}`);
      return null;
    }
    const data = (await resp.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = (data.content ?? [])
      .map((c) => c.text ?? "")
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    console.error("[valuation-llm] call failed", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

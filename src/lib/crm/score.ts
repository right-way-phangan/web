import type { CrmLead } from "@/lib/data/leads";

/**
 * Lead temperature — a derived readiness score from signals the CRM already
 * captures, so the agent doesn't have to eyeball every card. Pure function, no
 * writes; "hot" stays a manual override that always reads as 🔥.
 */
export interface LeadScore {
  score: number; // 0..100
  level: "hot" | "warm" | "cold";
  emoji: string;
  signals: { label: string; on: boolean }[];
}

const RECENT_TOUCH_DAYS = 7;

export function leadScore(
  lead: Pick<
    CrmLead,
    "tags" | "dealValue" | "stageKey" | "lastTouchAt" | "pipelineKey" | "rwNumber"
  >,
): LeadScore {
  const tags = lead.tags ?? [];
  const hasShortlist = tags.some((t) => t.startsWith("object:")) || Boolean(lead.rwNumber);
  const hasBudget = (lead.dealValue ?? 0) > 0;
  const qualified = tags.some((t) => t.startsWith("interest:"));
  const manualHot = tags.includes("hot");
  const advanced = Boolean(
    lead.stageKey && !["incoming", "contacted"].includes(lead.stageKey),
  );
  const touchedRecently = lead.lastTouchAt
    ? (Date.now() - new Date(lead.lastTouchAt).getTime()) / 86_400_000 <= RECENT_TOUCH_DAYS
    : false;

  let score = 0;
  if (manualHot) score += 30;
  if (hasShortlist) score += 20;
  if (hasBudget) score += 20;
  if (qualified) score += 10;
  if (advanced) score += 10;
  if (touchedRecently) score += 10;
  score = Math.min(100, score);

  const level: LeadScore["level"] = manualHot || score >= 50 ? "hot" : score >= 25 ? "warm" : "cold";
  const emoji = level === "hot" ? "🔥" : level === "warm" ? "🌤" : "❄️";

  return {
    score,
    level,
    emoji,
    signals: [
      { label: "Бюджет указан", on: hasBudget },
      { label: "Есть шортлист/объект", on: hasShortlist },
      { label: "Квалифицирован (интерес)", on: qualified },
      { label: "Продвинут по воронке", on: advanced },
      { label: `Касание < ${RECENT_TOUCH_DAYS} дн`, on: touchedRecently },
    ],
  };
}

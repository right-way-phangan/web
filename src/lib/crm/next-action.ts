import type { CrmLead } from "@/lib/data/leads";
import { slaStatus } from "@/lib/crm/sla";
import { leadScore } from "@/lib/crm/score";
import { dealProgress, DEAL_STAGE_KEYS } from "@/lib/crm/deal-checklist";

export interface NextAction {
  /** Imperative, short — the one thing to do next. */
  label: string;
  /** Why / context — one line. */
  detail?: string;
  icon: string;
  urgency: "now" | "soon" | "later";
}

type LeadLike = Pick<
  CrmLead,
  | "status"
  | "stageKey"
  | "pipelineKey"
  | "phone"
  | "email"
  | "openTasks"
  | "overdueTasks"
  | "lastTouchAt"
  | "stageSince"
  | "createdAt"
  | "dealValue"
  | "expectedCloseAt"
  | "tags"
  | "rwNumber"
  | "dealChecklist"
>;

const RECENT_TOUCH_DAYS = 3;

function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86_400_000) : null;
}

/**
 * The single next best action for a lead — synthesizes every CRM signal
 * (contact gaps, tasks, SLA, stage, shortlist, deal checklist, money fields)
 * into one prescriptive step, so a solo agent doesn't have to read the whole
 * card to know what to do. Prioritized: data blockers → overdue/SLA → first
 * touch → next-step gaps → stage-specific moves → nurture. Pure; returns null
 * for closed deals (won/lost — nothing to chase).
 *
 * `objectMismatch` (optional, card-only) is the status the linked object should
 * have but doesn't — a Reserved/Sold deal whose object is still public.
 */
export function nextAction(
  lead: LeadLike,
  opts?: { objectMismatch?: "Reserved" | "Sold" | null },
): NextAction | null {
  if (lead.status !== "open") return null;
  const stage = lead.stageKey ?? "";
  const tags = lead.tags ?? [];
  const isLegacy = lead.pipelineKey === "legacy";

  // 1. Data blockers — can't work the lead at all.
  if (!lead.phone && !lead.email)
    return { icon: "📇", urgency: "now", label: "Добавить контакт", detail: "ни телефона, ни email — связаться нечем" };
  if (!lead.pipelineKey || !lead.stageKey)
    return { icon: "🗂", urgency: "now", label: "Назначить воронку/стадию", detail: "лид без воронки выпадет из работы" };

  // 2. Object↔deal out of sync (card-only) — risk of double-sale.
  if (opts?.objectMismatch)
    return {
      icon: "🏷",
      urgency: "now",
      label: `Пометить объект ${opts.objectMismatch}`,
      detail: "сделка идёт, а объект ещё Active на сайте",
    };

  // 3. Overdue task — a promised step is late.
  if ((lead.overdueTasks ?? 0) > 0)
    return { icon: "🔴", urgency: "now", label: "Закрыть просроченную задачу", detail: `${lead.overdueTasks} просрочено` };

  // 4. SLA breach — stuck on stage past its target.
  const sla = slaStatus(lead.stageKey, lead.stageSince ?? lead.createdAt);
  if (sla.breached)
    return {
      icon: "⏰",
      urgency: "now",
      label: "Сдвинуть со стадии или закрыть",
      detail: `висит +${sla.over}д сверх SLA (${sla.sla}д)`,
    };

  // 5. First touch — incoming with no reply yet.
  if (stage === "incoming")
    return {
      icon: "💬",
      urgency: "now",
      label: isLegacy ? "Разобрать лид (Circle)" : "Ответить — First Reply",
      detail: isLegacy ? "из очереди разбора" : "SLA первого ответа — 1 час",
    };

  // 6. No next step — nothing scheduled, lead will be forgotten.
  if ((lead.openTasks ?? 0) === 0)
    return { icon: "📌", urgency: "soon", label: "Поставить следующий шаг", detail: "нет открытой задачи с датой" };

  // 7. Gone quiet — no real touch in a while on a warm/hot lead.
  const touchDays = daysSince(lead.lastTouchAt);
  const score = leadScore(lead);
  if ((touchDays == null || touchDays >= RECENT_TOUCH_DAYS) && score.level !== "cold")
    return {
      icon: "📞",
      urgency: "soon",
      label: "Позвонить — давно тишина",
      detail: touchDays == null ? "касаний ещё не было" : `${touchDays} дн без касания`,
    };

  // 8. Stage-specific moves.
  const hasShortlist = tags.some((t) => t.startsWith("object:")) || Boolean(lead.rwNumber);
  if ((stage === "qualified" || stage === "viewing") && !hasShortlist)
    return { icon: "🏘", urgency: "soon", label: "Собрать подборку 3–5 объектов", detail: "квалифицирован, но подборки нет" };
  if (stage === "viewing")
    return { icon: "🗝", urgency: "soon", label: "Назначить/подтвердить показ", detail: "стадия Viewing" };
  if (stage === "negotiation" && !(lead.dealValue ?? 0))
    return { icon: "💰", urgency: "soon", label: "Указать сумму сделки", detail: "идёт торг без суммы — прогноз не считается" };

  // 9. Deal in progress — push the transaction checklist.
  if (DEAL_STAGE_KEYS.has(stage)) {
    const p = dealProgress(lead.dealChecklist);
    if (!(lead.expectedCloseAt) && (stage === "reservation" || stage === "dd"))
      return { icon: "📅", urgency: "soon", label: "Поставить ожид. дату закрытия", detail: "для прогноза по месяцам" };
    if (p.nextGroup)
      return { icon: "📋", urgency: "soon", label: `Чек-лист сделки: ${p.nextGroup}`, detail: `${p.doneCount}/${p.total} шагов` };
  }

  // 10. Fallback — keep it moving.
  return { icon: "➡️", urgency: "later", label: "Продвинуть по воронке", detail: "или зафиксировать касание" };
}

export const URGENCY_STYLE: Record<NextAction["urgency"], string> = {
  now: "bg-red-50 text-red-700 border-red-200",
  soon: "bg-brass-500/10 text-brass-700 border-brass-500/30",
  later: "bg-forest-900/5 text-forest-900/60 border-forest-900/10",
};

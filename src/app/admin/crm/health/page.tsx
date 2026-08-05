import type { Metadata } from "next";
import Link from "next/link";
import { getLeads, CRM_ENABLED, type CrmLead } from "@/lib/data/leads";
import { getAllObjects } from "@/lib/data/objects";
import { slaStatus } from "@/lib/crm/sla";

export const metadata: Metadata = {
  title: "CRM — здоровье данных",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STUCK_DAYS = 21;
const SILENT_DAYS = 14;

function daysAgo(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86_400_000) : null;
}

interface Issue {
  key: string;
  title: string;
  hint: string;
  leads: CrmLead[];
}

/**
 * Data-health checklist — after importing 400 legacy + 800 contacts, the base
 * has gaps. Surfaces open leads that will silently rot: no way to contact, no
 * next step, stuck on a stage, gone quiet, or missing a pipeline. Read-only —
 * each row links to the lead to fix by hand.
 */
export default async function CrmHealthPage() {
  const [leads, objects] = CRM_ENABLED
    ? await Promise.all([getLeads(), getAllObjects()])
    : [[], []];
  const open = leads.filter((l) => (l.status ?? "open") === "open");
  const working = open.filter((l) => l.pipelineKey !== "legacy"); // legacy идёт через конвейер разбора

  const noContact = working.filter((l) => !l.phone && !l.email);
  const noNextStep = working.filter((l) => (l.openTasks ?? 0) === 0);
  const stuck = working.filter((l) => {
    const d = daysAgo(l.stageSince ?? l.createdAt);
    return d !== null && d >= STUCK_DAYS;
  });
  const slaBreached = working.filter(
    (l) => slaStatus(l.stageKey, l.stageSince ?? l.createdAt).breached,
  );
  const silent = working.filter((l) => {
    const d = daysAgo(l.lastTouchAt ?? l.updatedAt ?? l.createdAt);
    return d !== null && d >= SILENT_DAYS;
  });
  const noPipeline = open.filter((l) => !l.pipelineKey || !l.stageKey);

  // Объект↔сделка: продвинутая сделка, а объект ещё публичен (Active) — риск
  // двойной брони / продажи занятого. Won без Sold — каталог врёт.
  const objStatusByRw = new Map(objects.map((o) => [o.rwNumber, o.status]));
  const advancedStages = new Set(["reservation", "dd", "spa", "transfer"]);
  const objectOutOfSync = leads.filter((l) => {
    if (!l.rwNumber) return false;
    const st = objStatusByRw.get(l.rwNumber);
    if (!st) return false;
    if (l.status === "won") return st !== "Sold";
    if ((l.status ?? "open") === "open" && l.stageKey && advancedStages.has(l.stageKey))
      return st === "Active";
    return false;
  });

  const issues: Issue[] = [
    {
      key: "noContact",
      title: "Без контактов",
      hint: "ни телефона, ни email — связаться невозможно",
      leads: noContact,
    },
    {
      key: "noNextStep",
      title: "Без следующего шага",
      hint: "нет открытой задачи — лид выпадет из поля зрения",
      leads: noNextStep,
    },
    {
      key: "sla",
      title: "Просрочка SLA стадии",
      hint: "висят на стадии дольше норматива (incoming 1д · viewing 7д · DD 14д…)",
      leads: slaBreached,
    },
    {
      key: "objectOutOfSync",
      title: "Объект сделки ещё на сайте",
      hint: "бронь/сделка идёт, а объект публичен (Active) — снять с продажи в карточке лида",
      leads: objectOutOfSync,
    },
    {
      key: "stuck",
      title: `Застряли (> ${STUCK_DAYS} дн на стадии)`,
      hint: "не двигались по воронке — двигать или закрывать",
      leads: stuck,
    },
    {
      key: "silent",
      title: `Тишина (> ${SILENT_DAYS} дн без касания)`,
      hint: "давно не общались — позвонить или потерять",
      leads: silent,
    },
    {
      key: "noPipeline",
      title: "Без воронки/стадии",
      hint: "повреждённые данные — назначить воронку",
      leads: noPipeline,
    },
  ].filter((i) => i.leads.length > 0);

  const totalFlagged = new Set(issues.flatMap((i) => i.leads.map((l) => l.id))).size;

  return (
    <section className="px-4 py-8 md:px-8">
      <Link href={{ pathname: "/admin/crm" }} className="text-xs text-forest-900/50 hover:text-forest-900">
        ← Доска лидов
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Здоровье данных</h1>
      <p className="mt-1 text-sm text-forest-900/60">
        {totalFlagged === 0
          ? "Проблемных лидов не найдено — база в порядке. ✨"
          : `${totalFlagged} лид(ов) требуют внимания, чтобы база не гнила.`}
      </p>

      {!CRM_ENABLED ? (
        <p className="mt-6 text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : (
        <div className="mt-6 space-y-5">
          {issues.map((issue) => (
            <div key={issue.key} className="rounded-2xl border border-forest-900/10 bg-cream-50 p-4">
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-forest-900">{issue.title}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  {issue.leads.length}
                </span>
                <span className="text-xs text-forest-900/45">{issue.hint}</span>
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {issue.leads.slice(0, 40).map((l) => (
                  <li key={l.id}>
                    <Link
                      href={{ pathname: `/admin/crm/${l.id}` }}
                      className="inline-block max-w-[14rem] truncate rounded-lg border border-forest-900/10 px-2 py-1 text-xs text-forest-900/75 hover:border-brass-500/40 hover:text-brass-700"
                    >
                      {l.contactName || l.name || `#${l.id}`}
                      {l.stage ? ` · ${l.stage}` : ""}
                    </Link>
                  </li>
                ))}
                {issue.leads.length > 40 && (
                  <li className="px-2 py-1 text-xs text-forest-900/40">
                    …и ещё {issue.leads.length - 40}
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

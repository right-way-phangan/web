import type { Metadata } from "next";
import Link from "next/link";
import {
  getLeads,
  getTasks,
  CRM_ENABLED,
  type CrmLead,
  type CrmTaskItem,
} from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";
import { TaskRow } from "@/components/crm/task-row";
import { leadScore } from "@/lib/crm/score";
import { forecastByMonth } from "@/lib/crm/forecast";
import { getMonthlyTargetThb } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "CRM — сегодня",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BKK_OFFSET = 7 * 3_600_000;
const CALL_AFTER_DAYS = 3; // горячий лид без касания дольше — звонить
const nf = new Intl.NumberFormat("ru-RU");

function bkkDate(ms: number): string {
  return new Date(ms + BKK_OFFSET).toISOString().slice(0, 10);
}
function isDateOnly(iso: string): boolean {
  const d = new Date(iso);
  return d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
}
function dueLabel(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" });
  if (isDateOnly(iso)) return day;
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });
  return `${day} · ${time}`;
}
function gcalUrl(t: CrmTaskItem): string | null {
  if (!t.dueAt || isDateOnly(t.dueAt)) return null;
  const start = new Date(t.dueAt);
  const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const end = new Date(start.getTime() + 3_600_000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${t.title} — ${t.contactName ?? `лид #${t.leadId}`}`,
    dates: `${f(start)}/${f(end)}`,
    details: `Лид: https://rightwaygroup.co/admin/crm/${t.leadId}${t.phone ? `\nТел: ${t.phone}` : ""}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function daysSinceTouch(l: CrmLead): number | null {
  const iso = l.lastTouchAt || l.updatedAt || l.createdAt;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86_400_000) : null;
}

/** Is the task overdue / due today (Bangkok)? — the only tasks «Сегодня» surfaces. */
function isUrgent(t: CrmTaskItem, nowMs: number): boolean {
  if (!t.dueAt) return false;
  const due = new Date(t.dueAt).getTime();
  const today = bkkDate(nowMs);
  const dDate = bkkDate(due);
  if (isDateOnly(t.dueAt)) return dDate <= today; // дата-задача: сегодня или раньше
  return due <= nowMs || dDate === today; // тайм-задача: прошла или на сегодня
}

/**
 * «Сегодня» — командный центр дня для соло-агента. Сводит в один экран всё,
 * что требует действия прямо сейчас: просроченные и сегодняшние задачи,
 * горячие лиды, до которых давно не дотрагивались (надо звонить), и очередь
 * разбора входящих. Не дублирует /tasks (там все задачи по срокам) и /health
 * (там гниющая база) — это «с чего начать утро».
 */
export default async function CrmTodayPage() {
  if (!CRM_ENABLED) {
    return (
      <section className="px-4 py-8 md:px-8">
        <AdminNav active="crm" />
        <h1 className="mt-2 text-2xl font-semibold text-forest-900">Сегодня</h1>
        <p className="mt-3 text-sm text-forest-900/60">CRM-бэкенд не подключён.</p>
      </section>
    );
  }

  const [leads, tasks, monthlyTarget] = await Promise.all([
    getLeads(),
    getTasks(),
    getMonthlyTargetThb(),
  ]);
  const nowMs = Date.now();

  // ── Срочные задачи: просрочено + сегодня ──
  const urgent = tasks
    .filter((t) => isUrgent(t, nowMs))
    .sort((a, b) => {
      const at = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
      const bt = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
      return at - bt;
    });
  const overdueCount = urgent.filter(
    (t) => t.dueAt && (isDateOnly(t.dueAt) ? bkkDate(new Date(t.dueAt).getTime()) < bkkDate(nowMs) : new Date(t.dueAt).getTime() < nowMs),
  ).length;

  // ── Горячие без касания: звонить сейчас ──
  const callNow = leads
    .filter((l) => (l.status ?? "open") === "open" && l.pipelineKey !== "legacy")
    .map((l) => ({ lead: l, score: leadScore(l), days: daysSinceTouch(l) }))
    .filter((x) => x.score.level === "hot" && (x.days == null || x.days >= CALL_AFTER_DAYS))
    .sort((a, b) => b.score.score - a.score.score || (b.lead.dealValue ?? 0) - (a.lead.dealValue ?? 0))
    .slice(0, 20);

  // ── Очередь разбора (legacy incoming) ──
  const triageQueue = leads.filter(
    (l) => l.pipelineKey === "legacy" && (l.status ?? "open") === "open" && l.stageKey === "incoming",
  ).length;

  // ── Темп месяца: факт won + прогноз закрытия этого месяца ──
  const nowD = new Date();
  const monthKey = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(nowD);
  const work = leads.filter((l) => l.pipelineKey !== "legacy");
  const wonMonthCommission = work
    .filter((l) => {
      if (l.status !== "won") return false;
      const d = new Date(l.updatedAt ?? l.createdAt);
      return d.getFullYear() === nowD.getFullYear() && d.getMonth() === nowD.getMonth();
    })
    .reduce((s, l) => s + (l.commissionValue ?? 0), 0);
  const openWork = work.filter((l) => (l.status ?? "open") === "open");
  const monthFcThis =
    forecastByMonth(openWork, 1, nowD).find((m) => m.key === monthKey)?.weightedCommission ?? 0;
  const monthProjection = wonMonthCommission + monthFcThis;
  const projPct = monthlyTarget ? Math.min(100, Math.round((monthProjection / monthlyTarget) * 100)) : null;

  const nothing = urgent.length === 0 && callNow.length === 0 && triageQueue === 0;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <Link href={{ pathname: "/admin/crm" }} className="text-xs text-forest-900/50 hover:text-forest-900">
        ← Доска лидов
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">Сегодня</h1>
          <p className="mt-1 text-sm text-forest-900/60">
            С чего начать день: {urgent.length} срочных задач ({overdueCount} просрочено) ·{" "}
            {callNow.length} горячих звонков · {triageQueue} на разбор.
          </p>
        </div>
        {monthProjection > 0 && (
          <div className="rounded-xl bg-forest-900 px-4 py-2.5 text-right text-white">
            <p className="text-[11px] uppercase tracking-wide text-white/55 capitalize">
              Темп · {monthLabel}
            </p>
            <p className="text-lg font-semibold">
              ≈ ฿{nf.format(Math.round(monthProjection))}
              {projPct != null && (
                <span className="ml-1.5 text-xs font-normal text-brass-300">{projPct}% цели</span>
              )}
            </p>
            <p className="text-[11px] text-white/55">
              won ฿{nf.format(Math.round(wonMonthCommission))} + прогноз ฿
              {nf.format(Math.round(monthFcThis))}
            </p>
          </div>
        )}
      </div>

      {nothing ? (
        <div className="mt-8 rounded-2xl border border-forest-900/10 bg-white p-8 text-center">
          <p className="text-lg font-medium text-forest-900">Всё под контролем ✨</p>
          <p className="mt-1 text-sm text-forest-900/55">
            Срочных задач нет, горячие лиды на связи, очередь разбора пуста. Хороший день, чтобы
            добавить объекты или контент.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Срочные задачи */}
          {urgent.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-700">
                🔴 Срочные задачи
                <span className="ml-1 font-normal text-forest-900/40">· {urgent.length}</span>
              </h2>
              <ul className="space-y-1.5">
                {urgent.map((t) => {
                  const overdue =
                    !!t.dueAt &&
                    (isDateOnly(t.dueAt)
                      ? bkkDate(new Date(t.dueAt).getTime()) < bkkDate(nowMs)
                      : new Date(t.dueAt).getTime() < nowMs);
                  return (
                    <TaskRow
                      key={t.id}
                      id={t.id}
                      leadId={t.leadId}
                      title={t.title}
                      dueAt={t.dueAt}
                      dueLabel={t.dueAt ? dueLabel(t.dueAt) : null}
                      overdue={overdue}
                      leadLabel={t.contactName || t.leadName || `Лид #${t.leadId}`}
                      phone={t.phone}
                      gcalUrl={gcalUrl(t)}
                    />
                  );
                })}
              </ul>
            </div>
          )}

          {/* Горячие без касания */}
          {callNow.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brass-600">
                🔥 Позвонить горячим
                <span className="ml-1 font-normal text-forest-900/40">· {callNow.length}</span>
              </h2>
              <p className="mb-2 text-xs text-forest-900/45">
                Лид «горит» по сигналам, но касания не было ≥ {CALL_AFTER_DAYS} дней — остывает.
              </p>
              <ul className="space-y-1.5">
                {callNow.map(({ lead, score, days }) => (
                  <li
                    key={lead.id}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-forest-900/10 bg-white px-3 py-2 text-sm"
                  >
                    <span className="shrink-0" title={`score ${score.score}`}>
                      {score.emoji}
                    </span>
                    <Link
                      href={{ pathname: `/admin/crm/${lead.id}` }}
                      className="min-w-0 flex-1 truncate font-medium text-forest-900 hover:text-brass-700"
                    >
                      {lead.contactName || lead.name || `Лид #${lead.id}`}
                    </Link>
                    {lead.stage && (
                      <span className="shrink-0 rounded bg-forest-900/5 px-1.5 py-0.5 text-xs text-forest-900/55">
                        {lead.stage}
                      </span>
                    )}
                    {(lead.dealValue ?? 0) > 0 && (
                      <span className="shrink-0 text-xs text-forest-900/55">
                        ฿{nf.format(lead.dealValue!)}
                      </span>
                    )}
                    <span className="shrink-0 text-xs text-forest-900/40">
                      {days == null ? "без касаний" : `${days}д тишины`}
                    </span>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="shrink-0 rounded-full border border-brass-500/40 bg-brass-500/10 px-2.5 py-0.5 text-xs font-medium text-brass-700 hover:bg-brass-500/20"
                      >
                        📞 Позвонить
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Очередь разбора */}
          {triageQueue > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-forest-900/70">
                🧹 Разбор входящих
              </h2>
              <Link
                href={{ pathname: "/admin/crm/triage" }}
                className="inline-flex items-center gap-2 rounded-xl border border-brass-500/40 bg-brass-500/10 px-4 py-3 text-sm font-medium text-brass-700 hover:bg-brass-500/20"
              >
                Разобрать {triageQueue} новых лид(ов) из Circle →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

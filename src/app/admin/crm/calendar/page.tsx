import type { Metadata } from "next";
import Link from "next/link";
import { getTasks, CRM_ENABLED, type CrmTaskItem } from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "CRM — план показов",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BKK_OFFSET = 7 * 3_600_000;
const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

function bkk(ms: number): Date {
  return new Date(ms + BKK_OFFSET);
}
function bkkDateKey(ms: number): string {
  return bkk(ms).toISOString().slice(0, 10);
}
function isDateOnly(iso: string): boolean {
  const d = new Date(iso);
  return d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
}
function timeLabel(iso: string): string | null {
  if (isDateOnly(iso)) return null;
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

/**
 * Viewing planner — next 7 days as an agenda. An agent thinks "вторник —
 * три показа в Тонг Сале", so dated tasks are grouped by Bangkok day and
 * sorted by time, timed ones first. Linkable to the lead; gcal for showings.
 */
export default async function CrmCalendarPage() {
  const tasks = CRM_ENABLED ? await getTasks() : [];
  const now = Date.now();
  const todayKey = bkkDateKey(now);

  // 7 day buckets from today (Bangkok).
  const days = Array.from({ length: 7 }, (_, i) => {
    const ms = now + i * 86_400_000;
    return { key: bkkDateKey(ms), date: bkk(ms) };
  });
  const dayKeys = new Set(days.map((d) => d.key));

  const byDay = new Map<string, CrmTaskItem[]>();
  let overdue = 0;
  for (const t of tasks) {
    if (!t.dueAt) continue;
    const key = bkkDateKey(new Date(t.dueAt).getTime());
    if (!isDateOnly(t.dueAt) && new Date(t.dueAt).getTime() < now && key < todayKey) {
      overdue++;
    }
    if (dayKeys.has(key)) byDay.set(key, [...(byDay.get(key) ?? []), t]);
  }
  for (const [, arr] of byDay) {
    arr.sort((a, b) => {
      const at = a.dueAt && !isDateOnly(a.dueAt) ? new Date(a.dueAt).getTime() : Infinity;
      const bt = b.dueAt && !isDateOnly(b.dueAt) ? new Date(b.dueAt).getTime() : Infinity;
      return at - bt;
    });
  }
  const planned = [...byDay.values()].reduce((n, a) => n + a.length, 0);

  const gcalUrl = (t: CrmTaskItem): string | null => {
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
  };

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <Link href={{ pathname: "/admin/crm" }} className="text-xs text-forest-900/50 hover:text-forest-900">
        ← Доска лидов
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">План показов</h1>
          <p className="mt-1 text-sm text-forest-900/60">
            Ближайшие 7 дней · {planned} задач(и) с датой
            {overdue > 0 ? ` · ⚠️ ${overdue} просрочено` : ""}
          </p>
        </div>
        <Link
          href={{ pathname: "/admin/crm/tasks" }}
          className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
        >
          ☑ Все задачи
        </Link>
      </div>

      {!CRM_ENABLED ? (
        <p className="mt-6 text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {days.map(({ key, date }) => {
            const items = byDay.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`rounded-2xl border p-3 ${
                  isToday ? "border-brass-500/40 bg-brass-500/[0.05]" : "border-forest-900/10 bg-white"
                }`}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-900/60">
                  {WEEKDAYS[date.getUTCDay()]}{" "}
                  <span className="font-normal text-forest-900/45">
                    {date.getUTCDate()}.{String(date.getUTCMonth() + 1).padStart(2, "0")}
                  </span>
                  {isToday && <span className="ml-1 text-brass-600">сегодня</span>}
                </p>
                {items.length === 0 ? (
                  <p className="py-3 text-center text-xs text-forest-900/30">—</p>
                ) : (
                  <ul className="space-y-1.5">
                    {items.map((t) => {
                      const time = t.dueAt ? timeLabel(t.dueAt) : null;
                      const url = gcalUrl(t);
                      return (
                        <li key={t.id} className="rounded-lg bg-forest-900/[0.03] px-2 py-1.5 text-sm">
                          <div className="flex items-baseline gap-1.5">
                            {time && (
                              <span className="shrink-0 font-medium tabular-nums text-brass-700">
                                {time}
                              </span>
                            )}
                            <Link
                              href={{ pathname: `/admin/crm/${t.leadId}` }}
                              className="min-w-0 flex-1 truncate text-forest-900 hover:text-brass-700"
                            >
                              {t.title}
                            </Link>
                            {url && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                title="В Google Calendar"
                                className="shrink-0 text-xs"
                              >
                                📅
                              </a>
                            )}
                          </div>
                          <p className="truncate text-xs text-forest-900/45">
                            {t.contactName || t.leadName || `#${t.leadId}`}
                            {t.phone ? ` · ${t.phone}` : ""}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

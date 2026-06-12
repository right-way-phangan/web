import type { Metadata } from "next";
import Link from "next/link";
import { getTasks, CRM_ENABLED, type CrmTaskItem } from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";
import { TaskRow } from "@/components/crm/task-row";

export const metadata: Metadata = {
  title: "CRM — задачи",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BKK_OFFSET = 7 * 3_600_000;

/** Calendar date (YYYY-MM-DD) of an instant in Bangkok. */
function bkkDate(ms: number): string {
  return new Date(ms + BKK_OFFSET).toISOString().slice(0, 10);
}

/** Date-only tasks are stored as UTC midnight ("due that day", digest convention). */
function isDateOnly(iso: string): boolean {
  const d = new Date(iso);
  return d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
}

function dueLabel(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok",
  });
  if (isDateOnly(iso)) return day;
  const time = d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
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

type GroupKey = "overdue" | "today" | "tomorrow" | "week" | "later" | "nodue";

const GROUPS: { key: GroupKey; title: string; accent?: string }[] = [
  { key: "overdue", title: "🔴 Просрочено", accent: "text-red-700" },
  { key: "today", title: "Сегодня", accent: "text-brass-600" },
  { key: "tomorrow", title: "Завтра" },
  { key: "week", title: "Ближайшие 7 дней" },
  { key: "later", title: "Позже" },
  { key: "nodue", title: "Без срока" },
];

function groupOf(t: CrmTaskItem, nowMs: number): GroupKey {
  if (!t.dueAt) return "nodue";
  const due = new Date(t.dueAt).getTime();
  const dDate = bkkDate(due);
  const today = bkkDate(nowMs);
  if (isDateOnly(t.dueAt) ? dDate < today : due < nowMs) return "overdue";
  if (dDate === today) return "today";
  if (dDate === bkkDate(nowMs + 86_400_000)) return "tomorrow";
  if (dDate <= bkkDate(nowMs + 7 * 86_400_000)) return "week";
  return "later";
}

/**
 * Unified tasks page — every open task across all leads, grouped by urgency
 * (Bangkok dates). The morning answer to "what do I do today": tick done,
 * snooze, jump to the lead, push a viewing into Google Calendar.
 */
export default async function CrmTasksPage() {
  const tasks = CRM_ENABLED ? await getTasks() : [];
  const nowMs = Date.now();

  const grouped = new Map<GroupKey, CrmTaskItem[]>();
  for (const t of tasks) {
    const g = groupOf(t, nowMs);
    grouped.set(g, [...(grouped.get(g) ?? []), t]);
  }
  const overdueCount = grouped.get("overdue")?.length ?? 0;
  const todayCount = grouped.get("today")?.length ?? 0;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <Link href={{ pathname: "/admin/crm" }} className="text-xs text-forest-900/50 hover:text-forest-900">
        ← Доска лидов
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">Задачи</h1>
          <p className="mt-1 text-sm text-forest-900/60">
            {tasks.length} открытых · {overdueCount} просрочено · {todayCount} на сегодня. Снуз
            переносит на завтра/+3 дня (Bangkok), время задачи сохраняется.
          </p>
        </div>
      </div>

      {!CRM_ENABLED ? (
        <p className="mt-6 text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : tasks.length === 0 ? (
        <p className="mt-6 text-sm text-forest-900/55">
          Открытых задач нет — все выполнены. ✨
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {GROUPS.map(({ key, title, accent }) => {
            const items = grouped.get(key) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={key}>
                <h2
                  className={`mb-2 text-sm font-semibold uppercase tracking-wide ${accent ?? "text-forest-900/70"}`}
                >
                  {title} <span className="font-normal text-forest-900/40">· {items.length}</span>
                </h2>
                <ul className="space-y-1.5">
                  {items.map((t) => (
                    <TaskRow
                      key={t.id}
                      id={t.id}
                      leadId={t.leadId}
                      title={t.title}
                      dueAt={t.dueAt}
                      dueLabel={t.dueAt ? dueLabel(t.dueAt) : null}
                      overdue={key === "overdue"}
                      leadLabel={t.contactName || t.leadName || `Лид #${t.leadId}`}
                      phone={t.phone}
                      gcalUrl={gcalUrl(t)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

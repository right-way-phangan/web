"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleTaskAction, rescheduleTaskAction } from "@/lib/actions/lead-actions";

const BKK_OFFSET = 7 * 3_600_000;

/**
 * Snooze target: today+days in Bangkok. Date-only tasks (and tasks without a
 * deadline) stay date-only ("YYYY-MM-DD" → UTC midnight, digest convention);
 * timed tasks keep their original Bangkok wall-clock time on the new date.
 */
function snoozeIso(dueAt: string | null, days: number): string {
  const nowBkk = new Date(Date.now() + BKK_OFFSET);
  const target = Date.UTC(nowBkk.getUTCFullYear(), nowBkk.getUTCMonth(), nowBkk.getUTCDate() + days);
  if (!dueAt) return new Date(target).toISOString().slice(0, 10);
  const d = new Date(dueAt);
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) {
    return new Date(target).toISOString().slice(0, 10);
  }
  const bkk = new Date(d.getTime() + BKK_OFFSET);
  const ms = target + (bkk.getUTCHours() * 3600 + bkk.getUTCMinutes() * 60) * 1000 - BKK_OFFSET;
  return new Date(ms).toISOString();
}

export interface TaskRowProps {
  id: number;
  leadId: number;
  title: string;
  dueAt: string | null;
  dueLabel: string | null;
  overdue: boolean;
  leadLabel: string;
  phone?: string | null;
  gcalUrl?: string | null;
}

/** One row on the unified tasks page: done-toggle, lead link, gcal, snooze. */
export function TaskRow({
  id,
  leadId,
  title,
  dueAt,
  dueLabel,
  overdue,
  leadLabel,
  phone,
  gcalUrl,
}: TaskRowProps) {
  const [pending, start] = useTransition();
  const snooze = (days: number) =>
    start(async () => {
      await rescheduleTaskAction(id, leadId, snoozeIso(dueAt, days));
    });

  return (
    <li
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-2 text-sm ${pending ? "opacity-50" : ""}`}
    >
      <input
        type="checkbox"
        disabled={pending}
        onChange={(e) => {
          const done = e.target.checked;
          start(async () => {
            await toggleTaskAction(id, leadId, done);
          });
        }}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-forest-900/30 accent-brass-500 disabled:opacity-50"
        aria-label="Задача выполнена"
      />
      <span className="min-w-0 flex-1 truncate text-forest-900">{title}</span>
      {dueLabel && (
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${
            overdue ? "bg-red-50 font-medium text-red-700" : "bg-forest-900/5 text-forest-900/60"
          }`}
        >
          {dueLabel}
        </span>
      )}
      <Link
        href={{ pathname: `/admin/crm/${leadId}` }}
        className="shrink-0 max-w-[12rem] truncate text-xs text-brass-600 hover:underline"
      >
        {leadLabel}
      </Link>
      {phone && (
        <a href={`tel:${phone}`} className="shrink-0 text-xs text-forest-900/50 hover:text-forest-900">
          📞
        </a>
      )}
      {gcalUrl && (
        <a
          href={gcalUrl}
          target="_blank"
          rel="noreferrer"
          title="Добавить в Google Calendar"
          className="shrink-0 rounded bg-forest-900/5 px-1.5 py-0.5 text-xs text-forest-900/60 hover:bg-forest-900/10"
        >
          📅
        </a>
      )}
      <span className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => snooze(1)}
          disabled={pending}
          title="Перенести на завтра"
          className="rounded border border-forest-900/15 px-1.5 py-0.5 text-xs text-forest-900/60 hover:bg-forest-900/5 disabled:opacity-50"
        >
          → завтра
        </button>
        <button
          type="button"
          onClick={() => snooze(3)}
          disabled={pending}
          title="Перенести на +3 дня"
          className="rounded border border-forest-900/15 px-1.5 py-0.5 text-xs text-forest-900/60 hover:bg-forest-900/5 disabled:opacity-50"
        >
          +3д
        </button>
      </span>
    </li>
  );
}

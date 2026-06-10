import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead, CRM_ENABLED } from "@/lib/data/leads";
import { MoveLeadSelect } from "@/components/crm/move-lead-select";
import { TaskToggle } from "@/components/crm/task-toggle";
import { addNoteAction, addTaskAction } from "@/lib/actions/lead-actions";

export const metadata: Metadata = {
  title: "CRM — лид",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmt(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const STATUS_STYLE: Record<string, string> = {
  open: "bg-forest-900/10 text-forest-900/70",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-forest-900/5 text-forest-900/40",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!CRM_ENABLED) notFound();
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) notFound();

  return (
    <section className="container-prose py-8">
      <Link
        href={{ pathname: "/admin/crm", query: lead.pipelineKey ? { p: lead.pipelineKey } : {} }}
        className="text-xs text-forest-900/50 hover:text-forest-900"
      >
        ← Доска лидов
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-forest-900">
            {lead.contactName || "Без имени"}
          </h1>
          <p className="mt-1 text-sm text-forest-900/70">{lead.name}</p>
        </div>
        <span
          className={
            "rounded-full px-2.5 py-1 text-xs font-medium " +
            (STATUS_STYLE[lead.status] ?? STATUS_STYLE.open)
          }
        >
          {lead.status}
        </span>
      </div>

      {/* Meta grid */}
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-forest-900/10 bg-white p-4 text-sm sm:grid-cols-3">
        <Meta label="Воронка" value={lead.pipeline ?? "—"} />
        <div>
          <dt className="text-xs uppercase tracking-wide text-forest-900/40">Стадия</dt>
          <dd className="mt-1">
            <MoveLeadSelect
              leadId={lead.id}
              stages={lead.stages.map((s) => ({ key: s.key, name: s.name }))}
              currentStageKey={lead.stageKey}
            />
          </dd>
        </div>
        <Meta label="Email" value={lead.email ?? "—"} />
        <Meta label="Телефон" value={lead.phone ?? "—"} />
        <div>
          <dt className="text-xs uppercase tracking-wide text-forest-900/40">Объект</dt>
          <dd className="mt-1">
            {lead.rwNumber ? (
              <a
                href={`/object/${lead.rwNumber}`}
                className="font-medium text-brass-600 hover:underline"
              >
                {lead.rwNumber}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <Meta label="Создан" value={fmt(lead.createdAt)} />
      </dl>

      {(lead.tags ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {(lead.tags ?? []).map((t) => (
            <span
              key={t}
              className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] text-forest-900/60"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Tasks */}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-forest-900/70">
        Задачи
      </h2>
      <ul className="mt-2 space-y-1.5">
        {lead.tasks.length === 0 && (
          <li className="text-sm text-forest-900/40">Пока нет задач.</li>
        )}
        {lead.tasks.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-2 rounded-md border border-forest-900/10 bg-white px-3 py-2 text-sm"
          >
            <TaskToggle taskId={t.id} leadId={lead.id} done={t.done} />
            <span className={t.done ? "text-forest-900/40 line-through" : "text-forest-900"}>
              {t.title}
            </span>
            {t.dueAt && (
              <span className="ml-auto text-xs text-forest-900/40">до {fmt(t.dueAt)}</span>
            )}
          </li>
        ))}
      </ul>
      <form action={addTaskAction} className="mt-2 flex flex-wrap gap-2">
        <input type="hidden" name="leadId" value={lead.id} />
        <input
          name="title"
          required
          placeholder="Новая задача…"
          className="min-w-[200px] flex-1 rounded-md border border-forest-900/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-brass-500"
        />
        <input
          name="dueAt"
          type="date"
          className="rounded-md border border-forest-900/15 bg-white px-3 py-1.5 text-sm text-forest-900/70 outline-none focus:border-brass-500"
        />
        <button
          type="submit"
          className="rounded-md bg-forest-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-forest-900/90"
        >
          Добавить
        </button>
      </form>

      {/* Notes / history */}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-forest-900/70">
        Заметки и история
      </h2>
      <form action={addNoteAction} className="mt-2">
        <input type="hidden" name="leadId" value={lead.id} />
        <textarea
          name="text"
          required
          rows={3}
          placeholder="Добавить заметку…"
          className="w-full rounded-md border border-forest-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-brass-500"
        />
        <button
          type="submit"
          className="mt-1 rounded-md bg-forest-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-forest-900/90"
        >
          Сохранить заметку
        </button>
      </form>
      <ul className="mt-4 space-y-3">
        {lead.notes.length === 0 && (
          <li className="text-sm text-forest-900/40">Заметок пока нет.</li>
        )}
        {lead.notes.map((n) => (
          <li key={n.id} className="border-l-2 border-brass-500/40 pl-3">
            <p className="whitespace-pre-wrap text-sm text-forest-900">{n.text}</p>
            <p className="mt-0.5 text-[11px] text-forest-900/40">{fmt(n.createdAt)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-forest-900/40">{label}</dt>
      <dd className="mt-1 text-forest-900">{value}</dd>
    </div>
  );
}

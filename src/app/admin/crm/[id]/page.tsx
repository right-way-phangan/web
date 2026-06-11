import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead, CRM_ENABLED } from "@/lib/data/leads";
import { getAllObjects } from "@/lib/data/objects";
import type { RealEstateObject } from "@/types/object";
import { MoveLeadSelect } from "@/components/crm/move-lead-select";
import { TaskToggle } from "@/components/crm/task-toggle";
import { LeadEdit } from "@/components/crm/lead-edit";
import { LeadWonLost } from "@/components/crm/lead-won-lost";
import { ContactActions } from "@/components/crm/contact-actions";
import { addNoteAction, addTaskAction } from "@/lib/actions/lead-actions";

export const metadata: Metadata = {
  title: "CRM — лид",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// All times shown in office hours (Phangan, UTC+7) — server renders in UTC.
function fmt(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  } catch {
    return "";
  }
}

/** Task due: date-only tasks are stored as UTC midnight — show just the date. */
function fmtDue(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) {
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
    }
    return fmt(iso);
  } catch {
    return "";
  }
}

const STATUS_STYLE: Record<string, string> = {
  open: "bg-forest-900/10 text-forest-900/70",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-forest-900/5 text-forest-900/40",
};

function nf(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}
function objPrice(o: RealEstateObject): string {
  if (o.priceThb) return `฿${nf(o.priceThb)}`;
  if (o.pricePerRai) return `฿${nf(o.pricePerRai)}/rai`;
  if (o.rentPerRaiMonth) return `฿${nf(o.rentPerRaiMonth)}/rai·мес`;
  return "Цена по запросу";
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!CRM_ENABLED) notFound();
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) notFound();

  // Reverse object↔lead link: the object this lead is about (any status).
  const obj = lead.rwNumber
    ? (await getAllObjects()).find((o) => o.rwNumber === lead.rwNumber) ?? null
    : null;

  // How long the lead sits on the current stage: since the last stage event
  // (events come desc), else since creation.
  const events = lead.events ?? [];
  const stageSinceIso = events[0]?.createdAt ?? lead.createdAt;
  const daysOnStage = Math.max(
    0,
    Math.floor((Date.now() - new Date(stageSinceIso).getTime()) / 86_400_000),
  );

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

      {/* One-tap contact actions */}
      <div className="mt-4">
        <ContactActions phone={lead.phone} email={lead.email} />
      </div>

      {/* Quick close */}
      <div className="mt-3 max-w-sm">
        <LeadWonLost leadId={lead.id} status={lead.status} />
      </div>

      {/* Inline contact editor + delete */}
      <div className="mt-3">
        <LeadEdit
          leadId={lead.id}
          contactName={lead.contactName}
          email={lead.email}
          phone={lead.phone}
          rwNumber={lead.rwNumber}
        />
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
        <Meta label="На стадии" value={daysOnStage === 0 ? "сегодня" : `${daysOnStage} дн`} />
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

      {/* Object the lead is interested in */}
      {obj && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-forest-900/70">
            Интересующий объект
          </h2>
          <Link
            href={`/object/${obj.rwNumber}`}
            className="flex items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-3 transition hover:border-brass-500/40 hover:shadow-sm"
          >
            <span className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-forest-900/5">
              {obj.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin thumb, no LCP/optim need
                <img
                  src={obj.coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-forest-900/30">
                  нет фото
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-brass-600">{obj.rwNumber}</span>
                <span className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] text-forest-900/60">
                  {obj.type}
                </span>
                <span className="text-[10px] text-forest-900/45">{obj.status}</span>
              </span>
              <span className="mt-0.5 line-clamp-1 block text-sm text-forest-900/85">
                {obj.titleEn || "—"}
              </span>
              <span className="mt-0.5 block text-xs text-forest-900/55">
                {[obj.district, objPrice(obj)].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span className="shrink-0 text-forest-900/30">›</span>
          </Link>
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
              <span className="ml-auto text-xs text-forest-900/40">до {fmtDue(t.dueAt)}</span>
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
        <input
          name="dueTime"
          type="time"
          title="Время (необязательно) — в момент срока придёт напоминание в Telegram"
          className="rounded-md border border-forest-900/15 bg-white px-3 py-1.5 text-sm text-forest-900/70 outline-none focus:border-brass-500"
        />
        <button
          type="submit"
          className="rounded-md bg-forest-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-forest-900/90"
        >
          Добавить
        </button>
      </form>

      {/* Stage timeline */}
      {events.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-forest-900/70">
            История стадий
          </h2>
          <ul className="mt-2 space-y-1">
            {events.map((e) => (
              <li key={e.id} className="flex items-baseline gap-2 text-sm">
                <span className="shrink-0 text-[11px] tabular-nums text-forest-900/40">
                  {fmt(e.createdAt)}
                </span>
                {e.type === "created" ? (
                  <span className="text-forest-900/70">
                    Лид создан{e.toStage ? <> → <b className="font-medium">{e.toStage}</b></> : null}
                  </span>
                ) : (
                  <span className="text-forest-900/70">
                    {e.fromStage ?? "—"} → <b className="font-medium text-forest-900">{e.toStage}</b>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

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

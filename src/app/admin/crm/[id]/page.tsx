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
import { DealValue } from "@/components/crm/deal-value";
import { CommissionValue } from "@/components/crm/commission-value";
import { TouchButtons } from "@/components/crm/touch-buttons";
import { leadScore } from "@/lib/crm/score";
import { LeadSnooze } from "@/components/crm/lead-snooze";
import { DealChecklist } from "@/components/crm/deal-checklist";
import { DEAL_STAGE_KEYS } from "@/lib/crm/deal-checklist";
import { ExpectedClose } from "@/components/crm/expected-close";
import { ObjectStatusSync } from "@/components/crm/object-status-sync";
import { slaStatus } from "@/lib/crm/sla";
import { nextAction, URGENCY_STYLE } from "@/lib/crm/next-action";
import { ShareShortlist } from "@/components/crm/share-shortlist";
import { makeShortlistToken } from "@/lib/shortlist-token";
import { LeadMatches, type MatchItem } from "@/components/crm/lead-matches";
import { MessageTemplates } from "@/components/crm/message-templates";
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

  const allObjects = await getAllObjects();
  // Reverse object↔lead link: the object this lead is about (any status).
  const obj = lead.rwNumber
    ? allObjects.find((o) => o.rwNumber === lead.rwNumber) ?? null
    : null;

  // "Что показать": match catalog objects to the lead's qualification.
  const tags = lead.tags ?? [];
  const shortRws = new Set(tags.filter((t) => t.startsWith("object:")).map((t) => t.slice(7)));
  const interest = tags.find((t) => t.startsWith("interest:"))?.slice("interest:".length);
  const wantTypes = interest
    ? new Set([interest])
    : lead.pipelineKey === "villa_house"
      ? new Set(["Villa", "House", "Apartment", "Project"])
      : lead.pipelineKey === "land"
        ? new Set(["Land"])
        : null;
  const leadText = [lead.name, ...lead.notes.map((n) => n.text)].join(" ").toLowerCase();
  const isUnit = (rw: string) => /^RW-P\d+-\d+$/i.test(rw);
  const toItem = (o: RealEstateObject, inShortlist: boolean): MatchItem => ({
    rwNumber: o.rwNumber,
    title: o.titleEn || o.rwNumber,
    cover: o.coverImage ?? null,
    priceLabel: o.priceThb || o.pricePerRai || o.rentPerRaiMonth ? objPrice(o) : "",
    district: o.district ?? null,
    inShortlist,
  });
  const matches: MatchItem[] =
    lead.status === "open"
      ? allObjects
          .filter(
            (o) =>
              o.status === "Active" &&
              o.coverImage &&
              o.rwNumber &&
              !isUnit(o.rwNumber) &&
              o.rwNumber !== lead.rwNumber &&
              !shortRws.has(o.rwNumber) &&
              (!wantTypes || wantTypes.has(o.type)),
          )
          .map((o) => ({
            o,
            score: o.district && leadText.includes(o.district.toLowerCase()) ? 2 : 0,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map(({ o }) => toItem(o, false))
      : [];
  const shortlist: MatchItem[] = allObjects
    .filter((o) => shortRws.has(o.rwNumber))
    .map((o) => toItem(o, true));

  // Timed tasks get an "add to Google Calendar" prefill link (viewings).
  const gcalUrl = (t: { title: string; dueAt: string | null }) => {
    if (!t.dueAt) return null;
    const start = new Date(t.dueAt);
    if (start.getUTCHours() === 0 && start.getUTCMinutes() === 0) return null; // date-only
    const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const end = new Date(start.getTime() + 3_600_000);
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: `${t.title} — ${lead.contactName ?? `лид #${lead.id}`}`,
      dates: `${f(start)}/${f(end)}`,
      details: `Лид: https://rightwaygroup.co/admin/crm/${lead.id}${lead.phone ? `\nТел: ${lead.phone}` : ""}`,
      location: obj?.locationUrl || obj?.district || "",
    });
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  };

  // How long the lead sits on the current stage: since the last STAGE event
  // (events come desc; touch/shortlist_view не двигают стадию), else creation.
  const events = lead.events ?? [];
  const stageSinceIso =
    events.find((e) => e.type === "stage" || e.type === "created")?.createdAt ?? lead.createdAt;
  const daysOnStage = Math.max(
    0,
    Math.floor((Date.now() - new Date(stageSinceIso).getTime()) / 86_400_000),
  );
  // Last real touch — the one-tap журнал касаний writes type='touch' events.
  const lastTouchAt = events.find((e) => e.type === "touch")?.createdAt ?? null;
  // Client engagement: when they last opened their shared shortlist.
  const lastShortlistViewAt =
    events.find((e) => e.type === "shortlist_view")?.createdAt ?? null;
  // Derived temperature + what's missing to advance.
  const readiness = leadScore(lead);
  // Stage SLA — is the lead overdue on its current stage?
  const sla = slaStatus(lead.stageKey, stageSinceIso);
  // Object↔deal sync: what site status the deal stage implies (won → Sold,
  // reservation+ → Reserved). Only when the deal links an object.
  const objSuggested: "Reserved" | "Sold" | null =
    lead.status === "won"
      ? "Sold"
      : lead.stageKey && ["reservation", "dd", "spa", "transfer"].includes(lead.stageKey)
        ? "Reserved"
        : null;
  // Следующий шаг — учитываем рассогласование статуса объекта (если он ещё Active).
  const nba = nextAction(lead, {
    objectMismatch: objSuggested && obj?.status === "Active" ? objSuggested : null,
  });

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

      {/* Touch log — честный «когда реально общались» */}
      <div className="mt-3">
        <TouchButtons leadId={lead.id} lastTouchAt={lastTouchAt} />
      </div>

      {/* Следующий шаг — что сделать с лидом прямо сейчас */}
      {nba && (
        <div className={`mt-3 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${URGENCY_STYLE[nba.urgency]}`}>
          <span className="text-lg">{nba.icon}</span>
          <span className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
              Следующий шаг
            </span>
            <span className="block text-sm font-semibold leading-tight">{nba.label}</span>
            {nba.detail && <span className="block text-xs opacity-70">{nba.detail}</span>}
          </span>
        </div>
      )}

      {lastShortlistViewAt && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
          👀 Клиент открывал подборку{" "}
          {(() => {
            const d = Math.floor((Date.now() - new Date(lastShortlistViewAt).getTime()) / 86_400_000);
            return d === 0 ? "сегодня" : `${d} дн назад`;
          })()}
        </p>
      )}

      {lead.status === "open" && (
        <div className="mt-3 rounded-xl border border-forest-900/10 bg-white p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-forest-900">
            <span className="text-lg">{readiness.emoji}</span>
            Готовность {readiness.score}/100
            <span className="text-xs font-normal text-forest-900/45">
              {readiness.level === "hot"
                ? "созрел — двигать к показу/сделке"
                : readiness.level === "warm"
                  ? "греется — добить квалификацию"
                  : "холодный — нужен контакт и интерес"}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {readiness.signals.map((s) => (
              <span
                key={s.label}
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  s.on
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-forest-900/5 text-forest-900/40"
                }`}
              >
                {s.on ? "✓" : "○"} {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Message templates (copy / WhatsApp prefill) */}
      <div className="mt-3">
        <MessageTemplates
          contactName={lead.contactName}
          phone={lead.phone}
          objectTitle={obj?.titleEn ?? null}
          objectRw={obj?.rwNumber ?? null}
        />
      </div>

      {/* Quick close */}
      <div className="mt-3 max-w-sm">
        <LeadWonLost leadId={lead.id} status={lead.status} contactName={lead.contactName} />
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
        <div>
          <dt className="text-xs uppercase tracking-wide text-forest-900/40">На стадии</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-1.5 text-forest-900">
            {daysOnStage === 0 ? "сегодня" : `${daysOnStage} дн`}
            {sla.breached && (
              <span
                className="rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-700"
                title={`SLA стадии ${sla.sla} дн — просрочка ${sla.over} дн`}
              >
                ⏰ SLA +{sla.over}д
              </span>
            )}
            {!sla.breached && sla.sla != null && (
              <span className="text-[11px] text-forest-900/35">SLA {sla.sla}д</span>
            )}
          </dd>
        </div>
        {lead.status === "open" && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-forest-900/40">Ожид. закрытие</dt>
            <dd className="mt-1">
              <ExpectedClose leadId={lead.id} value={lead.expectedCloseAt ?? null} />
            </dd>
          </div>
        )}
        {lead.status === "lost" && lead.lostReason && (
          <Meta label="Причина потери" value={lead.lostReason} />
        )}
        <div className="col-span-2 sm:col-span-3">
          <dt className="text-xs uppercase tracking-wide text-forest-900/40">
            Сумма сделки
            {lead.dealValue ? (
              <span className="ml-2 normal-case text-brass-600">
                комиссия ≈ ฿{nf(Math.max(lead.dealValue * 0.05, 150_000))}
              </span>
            ) : null}
          </dt>
          <dd className="mt-1">
            <DealValue
              leadId={lead.id}
              value={lead.dealValue ?? null}
              objectPrice={obj?.priceThb ?? null}
            />
          </dd>
        </div>
        {lead.status === "won" && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-xs uppercase tracking-wide text-forest-900/40">
              Комиссия (факт)
              <span className="ml-2 normal-case text-forest-900/45">
                co-agency/referral учитывайте здесь — идёт в журнал сделок
              </span>
            </dt>
            <dd className="mt-1">
              <CommissionValue
                leadId={lead.id}
                value={lead.commissionValue ?? null}
                suggested={lead.dealValue ? Math.round(Math.max(lead.dealValue * 0.05, 150_000)) : null}
              />
            </dd>
          </div>
        )}
      </dl>

      {lead.stageKey && DEAL_STAGE_KEYS.has(lead.stageKey) && (
        <div className="mt-4">
          <DealChecklist
            leadId={lead.id}
            checklist={lead.dealChecklist ?? null}
            currentStageKey={lead.stageKey}
          />
        </div>
      )}

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
          {objSuggested && (
            <div className="mt-2">
              <ObjectStatusSync
                rwNumber={obj.rwNumber}
                currentStatus={obj.status}
                suggested={objSuggested}
              />
            </div>
          )}
        </div>
      )}

      {/* Matching + shortlist */}
      <div className="mt-6">
        <LeadMatches
          leadId={lead.id}
          tags={tags}
          matches={matches}
          shortlist={shortlist}
          contactName={lead.contactName}
        />
        {shortlist.length > 0 && (
          <div className="mt-3">
            <ShareShortlist
              url={`https://rightwaygroup.co/s/${makeShortlistToken(lead.id)}`}
              phone={lead.phone}
              count={shortlist.length}
            />
          </div>
        )}
      </div>

      {/* Tasks */}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-forest-900/70">
        Задачи
      </h2>
      {lead.status === "open" && (
        <div className="mt-2">
          <LeadSnooze leadId={lead.id} />
        </div>
      )}
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
              <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-forest-900/40">
                до {fmtDue(t.dueAt)}
                {!t.done && gcalUrl(t) && (
                  <a
                    href={gcalUrl(t)!}
                    target="_blank"
                    rel="noreferrer"
                    title="Добавить в Google Calendar"
                    className="rounded bg-forest-900/5 px-1.5 py-0.5 text-forest-900/60 hover:bg-forest-900/10"
                  >
                    📅
                  </a>
                )}
              </span>
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
                ) : e.type === "touch" || e.type === "shortlist_view" ? (
                  <span className="text-forest-900/55">{e.toStage ?? "Касание"}</span>
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

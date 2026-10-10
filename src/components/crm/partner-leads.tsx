import Link from "next/link";
import type { CrmLead, CrmLeadDetail } from "@/lib/data/leads";
import { MoveLeadSelect } from "@/components/crm/move-lead-select";
import { addNoteAction } from "@/lib/actions/lead-actions";

/**
 * Partner (developer rep) views: a plain list of THEIR leads and a lead card.
 * Deliberately shows no deal value, commission, tasks, catalogue matches or
 * scoring — only what the developer needs to work the lead. Data arrives
 * already scoped by the data layer (lib/data/leads.ts).
 */

const fmt = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok",
    });
  } catch {
    return "";
  }
};

export function PartnerLeadList({ leads }: { leads: CrmLead[] }) {
  return (
    <section className="container-prose py-8">
      <h1 className="text-2xl font-semibold text-forest-900">Ваши лиды</h1>
      <p className="mt-1 text-sm text-forest-900/60">Заявки по вашим проектам: {leads.length}</p>
      {leads.length === 0 ? (
        <p className="mt-6 text-sm text-forest-900/50">Пока нет заявок.</p>
      ) : (
        <ul className="mt-4 divide-y divide-forest-900/10 rounded-lg border border-forest-900/10">
          {leads.map((l) => (
            <li key={l.id}>
              <Link href={`/admin/crm/${l.id}` as never} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-forest-900/5">
                <span>
                  <span className="block text-sm font-medium text-forest-900">{l.contactName || l.name}</span>
                  <span className="block text-xs text-forest-900/50">
                    {[l.intent, l.phone || l.email].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="text-right text-xs text-forest-900/60">
                  <span className="block">{l.stage ?? "—"}</span>
                  <span className="block text-forest-900/40">{fmt(l.createdAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const touch = (t?: Record<string, string>) =>
  t ? Object.entries(t).map(([k, v]) => `${k}: ${v}`).join(" · ") : null;

export function PartnerLeadCard({ lead }: { lead: CrmLeadDetail }) {
  const q = lead.qualification;
  const rows: Array<[string, string | null | undefined]> = [
    ["Контакт", lead.contactName],
    ["Телефон", lead.phone],
    ["Email", lead.email],
    ["Telegram", lead.telegram],
    ["WhatsApp", lead.whatsapp],
    ["Предпочитаемый канал", lead.preferredChannel],
    ["Запрос", lead.intent],
    ["Цель", q?.goal],
    ["Бюджет", q?.budget],
    ["Горизонт", q?.horizon],
    ["Источник (первое касание)", touch(lead.attribution?.first)],
    ["Источник (последнее касание)", touch(lead.attribution?.last)],
    ["Создан", fmt(lead.createdAt)],
  ];
  const stageEvents = (lead.events ?? []).filter((e) => e.type === "stage" || e.type === "created");
  return (
    <section className="container-prose py-8">
      <Link href={"/admin/crm" as never} className="text-sm text-forest-900/60 hover:underline">← Ко всем лидам</Link>
      <h1 className="mt-2 text-2xl font-semibold text-forest-900">{lead.contactName || lead.name}</h1>
      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs uppercase tracking-wide text-forest-900/40">{k}</dt>
            <dd className="mt-1 text-forest-900">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-forest-900/70">Статус</h2>
      <div className="mt-2 max-w-xs">
        <MoveLeadSelect
          leadId={lead.id}
          stages={lead.stages.map((s) => ({ key: s.key, name: s.name }))}
          currentStageKey={lead.stageKey}
        />
      </div>
      {stageEvents.length > 0 && (
        <ul className="mt-2 text-xs text-forest-900/50">
          {stageEvents.map((e) => (
            <li key={e.id}>{fmt(e.createdAt)} — {e.type === "created" ? "создан" : e.toStage}</li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-forest-900/70">Комментарии</h2>
      <form action={addNoteAction} className="mt-2">
        <input type="hidden" name="leadId" value={lead.id} />
        <textarea
          name="text"
          required
          rows={3}
          placeholder="Добавить комментарий…"
          className="w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-brass-500"
        />
        <button type="submit" className="mt-1 rounded-md bg-panel px-3 py-1.5 text-sm font-medium text-panel-fg hover:bg-panel/90">
          Сохранить
        </button>
      </form>
      <ul className="mt-4 space-y-3">
        {lead.notes.length === 0 && <li className="text-sm text-forest-900/40">Комментариев пока нет.</li>}
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

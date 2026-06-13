import type { Metadata } from "next";
import Link from "next/link";
import { getLeads, getLead, CRM_ENABLED } from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";
import { TriageActions } from "@/components/crm/triage-actions";
import { ContactActions } from "@/components/crm/contact-actions";

export const metadata: Metadata = {
  title: "CRM — разбор legacy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Triage conveyor for the legacy (Circle-era) queue: one lead at a time,
 * three verdicts — revive into a working pipeline / dead / later — then the
 * next one. Turns a 400-lead backlog into an evening of swiping.
 */
export default async function TriagePage({
  searchParams,
}: {
  searchParams: Promise<{ after?: string }>;
}) {
  const { after } = await searchParams;
  const afterId = Number(after) || 0;
  const leads = CRM_ENABLED ? await getLeads() : [];

  const legacy = leads.filter((l) => l.pipelineKey === "legacy");
  const queue = legacy
    .filter((l) => (l.status ?? "open") === "open" && l.stageKey === "incoming")
    .sort((a, b) => a.id - b.id);
  const done = legacy.length - queue.length;

  const current = queue.find((l) => l.id > afterId) ?? queue[0];
  const detail = current ? await getLead(current.id) : null;
  const pct = legacy.length ? Math.round((done / legacy.length) * 100) : 0;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <Link
        href={{ pathname: "/admin/crm", query: { p: "legacy" } }}
        className="text-xs text-forest-900/50 hover:text-forest-900"
      >
        ← Доска лидов
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Разбор legacy</h1>
      <p className="mt-1 text-sm text-forest-900/60">
        Разобрано {done} из {legacy.length} · осталось {queue.length}
      </p>
      <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-forest-900/10">
        <div className="h-full rounded-full bg-brass-500" style={{ width: `${pct}%` }} />
      </div>

      {!CRM_ENABLED ? (
        <p className="mt-8 text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : !current || !detail ? (
        <div className="mt-8 max-w-xl rounded-2xl border border-forest-900/10 bg-white p-8 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 font-medium text-forest-900">Очередь разобрана.</p>
          <p className="mt-1 text-sm text-forest-900/55">
            Новых лидов в «Разобрать» нет. Отложенные вернутся задачами в дайджесте.
          </p>
        </div>
      ) : (
        <div className="mt-6 max-w-xl">
          <div className="rounded-2xl border border-forest-900/10 bg-white p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold text-forest-900">
                {detail.contactName || detail.name}
              </h2>
              <Link
                href={{ pathname: `/admin/crm/${detail.id}` }}
                className="shrink-0 text-xs text-brass-600 hover:underline"
              >
                карточка →
              </Link>
            </div>
            <p className="mt-0.5 text-xs text-forest-900/45">
              #{detail.id} · создан{" "}
              {new Date(detail.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Bangkok",
              })}
              {detail.rwNumber ? ` · ${detail.rwNumber}` : ""}
            </p>

            <div className="mt-3">
              <ContactActions phone={detail.phone ?? null} email={detail.email ?? null} />
            </div>

            {(detail.tags ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {(detail.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] text-forest-900/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {detail.notes.length > 0 && (
              <div className="mt-4 max-h-48 space-y-2 overflow-y-auto rounded-lg bg-forest-900/[0.03] p-3">
                {detail.notes.map((n) => (
                  <p key={n.id} className="whitespace-pre-wrap text-sm text-forest-900/75">
                    {n.text}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <TriageActions leadId={detail.id} />
          </div>
        </div>
      )}
    </section>
  );
}

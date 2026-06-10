import type { Metadata } from "next";
import Link from "next/link";
import { getLeads, getPipelines, CRM_ENABLED, type CrmLead, type CrmPipeline } from "@/lib/data/leads";
import { MoveLeadSelect } from "@/components/crm/move-lead-select";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "CRM — лиды",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

function LeadCard({ lead, pipeline }: { lead: CrmLead; pipeline: CrmPipeline }) {
  const contact = [lead.email, lead.phone].filter(Boolean).join(" · ");
  return (
    <article className="rounded-lg border border-forest-900/10 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/admin/crm/${lead.id}`}
          className="text-sm font-medium leading-snug text-forest-900 hover:text-brass-600 hover:underline"
        >
          {lead.contactName || "—"}
        </Link>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-forest-900/40">
          {fmtDate(lead.createdAt)}
        </span>
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs text-forest-900/70">{lead.name}</p>
      {contact && <p className="mt-1 text-xs text-forest-900/55">{contact}</p>}
      <div className="mt-2 flex flex-wrap gap-1">
        {lead.rwNumber && (
          <span className="rounded bg-brass-500/10 px-1.5 py-0.5 text-[10px] font-medium text-brass-600">
            {lead.rwNumber}
          </span>
        )}
        {(lead.tags ?? [])
          .filter((t) => !t.startsWith("object:"))
          .slice(0, 4)
          .map((t) => (
            <span
              key={t}
              className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] text-forest-900/60"
            >
              {t}
            </span>
          ))}
      </div>
      <div className="mt-2">
        <MoveLeadSelect
          leadId={lead.id}
          stages={pipeline.stages.map((s) => ({ key: s.key, name: s.name }))}
          currentStageKey={lead.stageKey}
        />
      </div>
    </article>
  );
}

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  if (!CRM_ENABLED) {
    return (
      <section className="container-prose py-12">
        <h1 className="text-2xl font-semibold text-forest-900">CRM</h1>
        <p className="mt-3 max-w-xl text-sm text-forest-900/70">
          CRM-бэкенд не подключён. Задайте переменную окружения{" "}
          <code className="rounded bg-forest-900/5 px-1">OBJECTS_API_URL</code> (адрес backend-API),
          и доска лидов появится здесь. Локально:{" "}
          <code className="rounded bg-forest-900/5 px-1">OBJECTS_API_URL=http://localhost:8787</code>.
        </p>
      </section>
    );
  }

  const [pipelines, leads] = await Promise.all([getPipelines(), getLeads()]);
  const { p } = await searchParams;
  const active = pipelines.find((pl) => pl.key === p) ?? pipelines[0];

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · CRM
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Лиды</h1>
        <p className="mt-1 text-sm text-forest-900/60">
          {leads.length} лид(ов) · своя БД (Фаза B). Перетаскивать не нужно — меняйте стадию селектором
          на карточке.
        </p>
      </div>

      {/* Pipeline tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {pipelines.map((pl) => {
          const n = leads.filter((l) => l.pipelineKey === pl.key).length;
          const on = pl.key === active?.key;
          return (
            <Link
              key={pl.key}
              href={{ pathname: "/admin/crm", query: { p: pl.key } }}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (on
                  ? "bg-forest-900 text-white"
                  : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
              }
            >
              {pl.name} <span className="opacity-60">({n})</span>
            </Link>
          );
        })}
      </div>

      {!active ? (
        <p className="text-sm text-forest-900/60">Нет воронок. Проверьте сидинг CRM на backend.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {active.stages.map((stage) => {
            const items = leads.filter(
              (l) => l.pipelineKey === active.key && l.stageKey === stage.key,
            );
            return (
              <div key={stage.key} className="flex min-w-[270px] max-w-[270px] flex-col">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2
                    className={
                      "text-xs font-semibold uppercase tracking-wide " +
                      (stage.isWon
                        ? "text-emerald-600"
                        : stage.isLost
                          ? "text-forest-900/40"
                          : "text-forest-900/70")
                    }
                  >
                    {stage.name}
                  </h2>
                  <span className="text-xs text-forest-900/40">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-forest-900/[0.03] p-2">
                  {items.length === 0 ? (
                    <p className="px-1 py-4 text-center text-xs text-forest-900/30">—</p>
                  ) : (
                    items.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} pipeline={active} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

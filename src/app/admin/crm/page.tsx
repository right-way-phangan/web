import type { Metadata } from "next";
import Link from "next/link";
import { getLeads, getPipelines, CRM_ENABLED } from "@/lib/data/leads";
import { CrmBoard } from "@/components/crm/crm-board";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "CRM — лиды",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            Admin · CRM
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Лиды</h1>
          <p className="mt-1 text-sm text-forest-900/60">
            {leads.length} лид(ов) · своя БД (Фаза B). Перетаскивайте карточку между колонками или
            меняйте стадию селектором.
          </p>
        </div>
        <Link
          href={{ pathname: "/admin/crm/new" }}
          className="shrink-0 rounded-full bg-forest-900 px-4 py-2 text-sm font-medium text-white hover:bg-forest-900/90"
        >
          + Новый лид
        </Link>
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
        (() => {
          const pipelineLeads = leads.filter((l) => l.pipelineKey === active.key);
          // Remount the board when server data changes (e.g. a move from the
          // detail page) so its optimistic local state reseeds from fresh props.
          const sig = pipelineLeads
            .map((l) => `${l.id}:${l.stageKey ?? ""}`)
            .sort()
            .join("|");
          return (
            <CrmBoard
              key={`${active.key}:${sig}`}
              pipelineKey={active.key}
              stages={active.stages}
              leads={pipelineLeads}
            />
          );
        })()
      )}
    </section>
  );
}

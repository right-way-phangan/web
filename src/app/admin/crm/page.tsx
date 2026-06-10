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
  searchParams: Promise<{ p?: string; q?: string; hot?: string }>;
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
  const { p, q, hot: hotParam } = await searchParams;
  const active = pipelines.find((pl) => pl.key === p) ?? pipelines[0];

  const query = (q ?? "").trim().toLowerCase();
  const hot = hotParam === "1";
  const filteredLeads = leads.filter((l) => {
    if (hot && !(l.tags ?? []).includes("hot")) return false;
    if (query) {
      const hay = [l.contactName, l.name, l.email, l.phone, l.rwNumber, (l.tags ?? []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
  const filtering = Boolean(query || hot);
  // Carry the active filters across pipeline tabs / toggles.
  const baseQ: Record<string, string> = {
    ...(query ? { q: query } : {}),
    ...(hot ? { hot: "1" } : {}),
  };

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
            {filtering ? `${filteredLeads.length} из ${leads.length}` : `${leads.length}`} лид(ов) ·
            своя БД (Фаза B). Перетаскивайте карточку между колонками или меняйте стадию селектором.
          </p>
        </div>
        <Link
          href={{ pathname: "/admin/crm/new" }}
          className="shrink-0 rounded-full bg-forest-900 px-4 py-2 text-sm font-medium text-white hover:bg-forest-900/90"
        >
          + Новый лид
        </Link>
      </div>

      {/* Search + quick filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form action="/admin/crm" className="flex w-full items-center gap-2 sm:w-auto">
          {p && <input type="hidden" name="p" value={p} />}
          {hot && <input type="hidden" name="hot" value="1" />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Имя / телефон / email / RW / тег…"
            className="w-full rounded-full border border-forest-900/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-brass-500 sm:w-64"
          />
        </form>
        <Link
          href={{ pathname: "/admin/crm", query: hot ? { ...baseQ, hot: undefined } : { ...baseQ, hot: "1" } }}
          className={
            "rounded-full px-3 py-1.5 text-sm font-medium transition " +
            (hot
              ? "bg-amber-500 text-white"
              : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
          }
        >
          🔥 Горячие
        </Link>
        {filtering && (
          <Link
            href={{ pathname: "/admin/crm", query: p ? { p } : {} }}
            className="text-xs text-forest-900/50 hover:text-forest-900"
          >
            Сбросить
          </Link>
        )}
      </div>

      {/* Pipeline tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {pipelines.map((pl) => {
          const n = filteredLeads.filter((l) => l.pipelineKey === pl.key).length;
          const on = pl.key === active?.key;
          return (
            <Link
              key={pl.key}
              href={{ pathname: "/admin/crm", query: { ...baseQ, p: pl.key } }}
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
          const pipelineLeads = filteredLeads.filter((l) => l.pipelineKey === active.key);
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

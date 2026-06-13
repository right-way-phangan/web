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
  searchParams: Promise<{ p?: string; q?: string; f?: string }>;
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
  const { p, q, f } = await searchParams;
  const active = pipelines.find((pl) => pl.key === p) ?? pipelines[0];

  const query = (q ?? "").trim().toLowerCase();
  const QUICK = [
    { key: "shift", label: "🎯 Мой движ" },
    { key: "hot", label: "🔥 Горячие" },
    { key: "stale", label: "💤 Остывающие" },
    { key: "notasks", label: "📋 Без задач" },
  ] as const;
  const quick = QUICK.some((x) => x.key === f) ? (f as string) : "";
  const daysSince = (l: { updatedAt?: string | null; createdAt: string }) => {
    const t = new Date(l.updatedAt || l.createdAt).getTime();
    return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86_400_000) : 0;
  };
  type Lead = (typeof leads)[number];
  const matchesQuick = (l: Lead, key: string): boolean => {
    const open = (l.status ?? "open") === "open";
    if (key === "hot") return (l.tags ?? []).includes("hot");
    if (key === "stale") return open && daysSince(l) >= 3;
    if (key === "notasks") return open && (l.openTasks ?? 0) === 0;
    // "Моя смена" — что требует действия сейчас: просрочка, горячие,
    // новые за сегодня, остывшие.
    if (key === "shift") {
      if (!open) return false;
      const newToday =
        Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86_400_000) === 0;
      return (
        (l.overdueTasks ?? 0) > 0 ||
        (l.tags ?? []).includes("hot") ||
        newToday ||
        daysSince(l) >= 3
      );
    }
    return true;
  };
  const matchesQuery = (l: Lead): boolean => {
    if (!query) return true;
    return [l.contactName, l.name, l.email, l.phone, l.rwNumber, (l.tags ?? []).join(" "), l.notesText]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  };
  const searched = leads.filter(matchesQuery);
  // Chip counters reflect what each quick filter would show given the current search.
  const quickCounts: Record<string, number> = Object.fromEntries(
    QUICK.map((x) => [x.key, searched.filter((l) => matchesQuick(l, x.key)).length]),
  );
  const filteredLeads = quick ? searched.filter((l) => matchesQuick(l, quick)) : searched;
  const filtering = Boolean(query || quick);
  // Carry the active filters across pipeline tabs / toggles.
  const baseQ: Record<string, string> = {
    ...(query ? { q: query } : {}),
    ...(quick ? { f: quick } : {}),
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
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={{ pathname: "/admin/crm/stats" }}
            className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
          >
            📈 Метрики
          </Link>
          <Link
            href={{ pathname: "/admin/crm/contacts" }}
            className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
          >
            👥 Контакты
          </Link>
          <Link
            href={{ pathname: "/admin/crm/tasks" }}
            className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
          >
            ☑ Задачи
            {(() => {
              const overdue = leads.reduce((n, l) => n + (l.overdueTasks ?? 0), 0);
              return overdue > 0 ? (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                  {overdue}
                </span>
              ) : null;
            })()}
          </Link>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler returns a file download, not a page nav */}
          <a
            href="/admin/crm/export"
            className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
          >
            ⤓ CSV
          </a>
          <Link
            href={{ pathname: "/admin/crm/import" }}
            className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
          >
            ⤒ Импорт
          </Link>
          <Link
            href={{ pathname: "/admin/crm/new" }}
            className="rounded-full bg-forest-900 px-4 py-2 text-sm font-medium text-white hover:bg-forest-900/90"
          >
            + Новый лид
          </Link>
        </div>
      </div>

      {/* Search + quick filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form action="/admin/crm" className="flex w-full items-center gap-2 sm:w-auto">
          {p && <input type="hidden" name="p" value={p} />}
          {quick && <input type="hidden" name="f" value={quick} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Имя / телефон / email / RW / тег / заметки…"
            className="w-full rounded-full border border-forest-900/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-brass-500 sm:w-64"
          />
        </form>
        {QUICK.map((x) => {
          const on = quick === x.key;
          const query2 = on
            ? { ...baseQ, f: undefined }
            : { ...baseQ, f: x.key };
          return (
            <Link
              key={x.key}
              href={{ pathname: "/admin/crm", query: query2 }}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (on
                  ? "bg-amber-500 text-white"
                  : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
              }
            >
              {x.label} <span className="opacity-60">({quickCounts[x.key] ?? 0})</span>
            </Link>
          );
        })}
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

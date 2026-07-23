import type { Metadata } from "next";
import Link from "next/link";
import { getLeads, getPipelines, CRM_ENABLED } from "@/lib/data/leads";
import { CrmBoard } from "@/components/crm/crm-board";
import { AdminNav } from "@/components/admin/admin-nav";
import { leadScore } from "@/lib/crm/score";
import { nextAction } from "@/lib/crm/next-action";
import { EmptyState } from "@/components/ui/empty-state";
import { Workflow } from "lucide-react";

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
    { key: "now", label: "🧭 Сейчас" },
    { key: "ripe", label: "🌡 Созрел" },
    { key: "hot", label: "🔥 Горячие" },
    { key: "stale", label: "💤 Остывающие" },
    { key: "notasks", label: "📋 Без задач" },
  ] as const;
  const quick = QUICK.some((x) => x.key === f) ? (f as string) : "";
  // Staleness counts from the last REAL touch (one-tap журнал касаний) when
  // there is one — updatedAt дёргается любой правкой и врёт про общение.
  const daysSince = (l: { lastTouchAt?: string | null; updatedAt?: string | null; createdAt: string }) => {
    const t = new Date(l.lastTouchAt || l.updatedAt || l.createdAt).getTime();
    return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86_400_000) : 0;
  };
  type Lead = (typeof leads)[number];
  const matchesQuick = (l: Lead, key: string): boolean => {
    const open = (l.status ?? "open") === "open";
    if (key === "hot") return (l.tags ?? []).includes("hot");
    if (key === "stale") return open && daysSince(l) >= 3;
    if (key === "notasks") return open && (l.openTasks ?? 0) === 0;
    // "Сейчас" — лиды, у которых «Следующий шаг» горит красным (urgency=now):
    // нет контакта, просрочка/SLA, объект не помечен, ждёт первого ответа.
    if (key === "now") return open && nextAction(l)?.urgency === "now";
    // "Созрел" — сигналы говорят, что лид готов (level=hot), но вручную ещё не
    // помечен 🔥: кандидаты на повышение, которые легко прозевать.
    if (key === "ripe")
      return open && leadScore(l).level === "hot" && !(l.tags ?? []).includes("hot");
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
            своя БД (Фаза B).{" "}
            <span className="hidden lg:inline">
              Перетаскивайте карточку между колонками или меняйте стадию селектором.
            </span>
            <span className="lg:hidden">Меняйте стадию селектором.</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <Link
            href={{ pathname: "/admin/crm/today" }}
            className="rounded-full border border-brass-500/50 bg-brass-500/15 px-3 py-2 text-sm font-semibold text-brass-700 hover:bg-brass-500/25"
          >
            ☀️ Сегодня
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
          {/* Остальные разделы CRM — в выпадающем меню, чтобы не растягивать панель кнопками */}
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5 [&::-webkit-details-marker]:hidden">
              ⋯ Ещё
              <span className="text-forest-900/40 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-forest-900/10 bg-cream-50 p-1 shadow-lg">
              {(() => {
                const queue = leads.filter(
                  (l) =>
                    l.pipelineKey === "legacy" &&
                    (l.status ?? "open") === "open" &&
                    l.stageKey === "incoming",
                ).length;
                return queue > 0 ? (
                  <Link
                    href={{ pathname: "/admin/crm/triage" }}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forest-900/75 hover:bg-forest-900/5"
                  >
                    🧹 Разбор
                    <span className="rounded-full bg-brass-500/20 px-1.5 py-0.5 text-xs font-semibold text-brass-700">
                      {queue}
                    </span>
                  </Link>
                ) : null;
              })()}
              <Link
                href={{ pathname: "/admin/crm/stats" }}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-forest-900/75 hover:bg-forest-900/5"
              >
                📈 Метрики
              </Link>
              <Link
                href={{ pathname: "/admin/crm/calendar" }}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-forest-900/75 hover:bg-forest-900/5"
              >
                📅 Показы
              </Link>
              <Link
                href={{ pathname: "/admin/crm/health" }}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-forest-900/75 hover:bg-forest-900/5"
              >
                🩺 Здоровье
              </Link>
              <Link
                href={{ pathname: "/admin/crm/contacts" }}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-forest-900/75 hover:bg-forest-900/5"
              >
                👥 Контакты
              </Link>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler returns a file download, not a page nav */}
              <a
                href="/admin/crm/export"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-forest-900/75 hover:bg-forest-900/5"
              >
                ⤓ Экспорт CSV
              </a>
              <Link
                href={{ pathname: "/admin/crm/import" }}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-forest-900/75 hover:bg-forest-900/5"
              >
                ⤒ Импорт
              </Link>
            </div>
          </details>
          <Link
            href={{ pathname: "/admin/crm/new" }}
            className="rounded-full bg-panel px-4 py-2 text-sm font-medium text-panel-fg hover:bg-panel/90"
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
            className="w-full rounded-full border border-forest-900/15 bg-cream-50 px-3 py-1.5 text-sm outline-none focus:border-brass-500 sm:w-64"
          />
        </form>
        {(() => {
          const chips = QUICK.map((x) => {
            const on = quick === x.key;
            const query2 = on ? { ...baseQ, f: undefined } : { ...baseQ, f: x.key };
            return (
              <Link
                key={x.key}
                href={{ pathname: "/admin/crm", query: query2 }}
                className={
                  "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                  (on
                    ? "bg-amber-500 text-panel-fg"
                    : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
                }
              >
                {x.label} <span className="opacity-60">({quickCounts[x.key] ?? 0})</span>
              </Link>
            );
          });
          const resetLink = filtering ? (
            <Link
              href={{ pathname: "/admin/crm", query: p ? { p } : {} }}
              className="text-xs text-forest-900/50 hover:text-forest-900"
            >
              Сбросить
            </Link>
          ) : null;
          const activeLabel = QUICK.find((x) => x.key === quick)?.label;
          return (
            <>
              {/* Десктоп: быстрые фильтры чипами в ряд */}
              <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-2">
                {chips}
                {resetLink}
              </div>
              {/* Мобильный: свёрнуто в «Фильтры ▾» — не растягивает панель */}
              <details className="group relative lg:hidden">
                <summary
                  className={
                    "flex cursor-pointer list-none items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium [&::-webkit-details-marker]:hidden " +
                    (quick
                      ? "border-amber-500/40 bg-amber-500/15 text-forest-900"
                      : "border-forest-900/15 text-forest-900/70")
                  }
                >
                  {activeLabel ?? "Фильтры"}
                  <span className="text-forest-900/40 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="absolute left-0 z-30 mt-2 w-64 rounded-xl border border-forest-900/10 bg-cream-50 p-2 shadow-lg">
                  <div className="flex flex-wrap gap-2">{chips}</div>
                  {resetLink && <div className="mt-2 px-1">{resetLink}</div>}
                </div>
              </details>
            </>
          );
        })()}
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
                  ? "bg-panel text-panel-fg"
                  : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
              }
            >
              {pl.name} <span className="opacity-60">({n})</span>
            </Link>
          );
        })}
      </div>

      {!active ? (
        <EmptyState
          icon={Workflow}
          title="Нет воронок"
          hint="Проверьте сидинг CRM на backend."
        />
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

import type { ComponentProps } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllObjects, getPublicObjects } from "@/lib/data/objects";

type Href = ComponentProps<typeof Link>["href"];
import { getLeads, getPipelines, CRM_ENABLED } from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";
import type { RealEstateObject } from "@/types/object";

export const metadata: Metadata = {
  title: "Дашборд",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TYPES = ["Land", "Villa", "House", "Apartment", "Project"] as const;

function isUnit(rw: string): boolean {
  return /^RW-P\d+-\d+$/i.test(rw);
}

function Stat({
  label,
  value,
  hint,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: Href;
  accent?: boolean;
}) {
  const body = (
    <div
      className={
        "rounded-2xl border p-5 transition " +
        (accent
          ? "border-brass-500/30 bg-brass-500/[0.06]"
          : "border-forest-900/10 bg-white") +
        (href ? " hover:border-brass-500/40 hover:shadow-sm" : "")
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-forest-900/45">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-forest-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-forest-900/50">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminHomePage() {
  const [all, publicObjs, leads, pipelines] = await Promise.all([
    getAllObjects(),
    getPublicObjects(),
    CRM_ENABLED ? getLeads() : Promise.resolve([]),
    CRM_ENABLED ? getPipelines() : Promise.resolve([]),
  ]);

  // Objects exclude off-plan unit sub-cards from the headline count.
  const objects = all.filter((o) => !isUnit(o.rwNumber));
  const byType = Object.fromEntries(
    TYPES.map((t) => [t, objects.filter((o) => o.type === t).length]),
  ) as Record<(typeof TYPES)[number], number>;
  const active = objects.filter((o: RealEstateObject) => o.status === "Active").length;
  const sold = objects.filter((o) => o.status === "Sold").length;
  const noPhoto = objects.filter((o) => o.status === "Active" && !o.coverImage).length;

  // CRM: classify by won/lost stage flags.
  const wonKeys = new Set<string>();
  const lostKeys = new Set<string>();
  for (const p of pipelines)
    for (const s of p.stages) {
      if (s.isWon) wonKeys.add(s.key);
      if (s.isLost) lostKeys.add(s.key);
    }
  const won = leads.filter((l) => l.stageKey && wonKeys.has(l.stageKey)).length;
  const lost = leads.filter((l) => l.stageKey && lostKeys.has(l.stageKey)).length;
  const openLeads = leads.length - won - lost;
  const closed = won + lost;
  const conversion = closed > 0 ? Math.round((won / closed) * 100) : null;
  const overdueLeads = leads.filter((l) => (l.overdueTasks ?? 0) > 0).length;

  // Stale: open leads not touched (updatedAt/createdAt) in 3+ days.
  const STALE_DAYS = 3;
  const daysSince = (l: { updatedAt?: string | null; createdAt: string }) => {
    const t = new Date(l.updatedAt || l.createdAt).getTime();
    return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86_400_000) : 0;
  };
  const isOpenLead = (l: { stageKey?: string | null }) =>
    !(l.stageKey && (wonKeys.has(l.stageKey) || lostKeys.has(l.stageKey)));
  const staleLeads = leads.filter((l) => isOpenLead(l) && daysSince(l) >= STALE_DAYS).length;

  // Channel attribution: where leads come from (source/tags) + per-channel win rate.
  const channelOf = (l: { source?: string | null; tags?: string[] | null }): string => {
    const tags = l.tags ?? [];
    const ch = tags.find((t) => t.startsWith("channel:"));
    if (ch) return ch.slice("channel:".length);
    if (l.source === "ad" || tags.includes("source:ad")) return "ad";
    if (tags.includes("website") || l.source === "object" || l.source === "contact")
      return "website";
    if (l.source === "manual") return "manual";
    return "other";
  };
  const CHANNEL_LABEL: Record<string, string> = {
    ad: "Реклама",
    website: "Сайт",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    "walk-in": "Walk-in",
    referral: "Рекомендация",
    phone: "Звонок",
    manual: "Ручной",
    other: "Другое",
  };
  const channelStats = new Map<string, { total: number; won: number }>();
  for (const l of leads) {
    const c = channelOf(l);
    const e = channelStats.get(c) ?? { total: 0, won: 0 };
    e.total += 1;
    if (l.stageKey && wonKeys.has(l.stageKey)) e.won += 1;
    channelStats.set(c, e);
  }
  const channels = [...channelStats.entries()]
    .map(([key, v]) => ({ key, label: CHANNEL_LABEL[key] ?? key, ...v }))
    .sort((a, b) => b.total - a.total);

  // Funnel per pipeline. Leads sit at their current stage; assuming forward
  // progress, a lead at stage i has passed every earlier non-lost stage, so the
  // cumulative count at stage i = leads whose current stage sort >= i (excluding
  // lost = dropouts). Gives Incoming→Contacted→…→Won conversion at a glance.
  const funnels = pipelines
    .map((p) => {
      const plLeads = leads.filter((l) => l.pipelineKey === p.key);
      const ordered = [...p.stages].sort((a, b) => a.sort - b.sort);
      const lostKeysP = new Set(ordered.filter((s) => s.isLost).map((s) => s.key));
      const sortOf = (key?: string | null) =>
        ordered.find((s) => s.key === key)?.sort ?? -1;
      const notLost = plLeads.filter((l) => !(l.stageKey && lostKeysP.has(l.stageKey)));
      const steps = ordered
        .filter((s) => !s.isLost)
        .map((s) => ({
          key: s.key,
          name: s.name,
          isWon: s.isWon,
          cum: notLost.filter((l) => sortOf(l.stageKey) >= s.sort).length,
        }));
      const lost = plLeads.length - notLost.length;
      return { key: p.key, name: p.name, steps, lost, total: plLeads.length };
    })
    .filter((f) => f.total > 0);

  // Recent leads (newest first).
  const recent = [...leads]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 6);

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="home" />

      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · Сводка
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Дашборд</h1>
        <p className="mt-1 text-sm text-forest-900/60">
          Источник — своя БД (Neon). Цифры обновляются при каждом заходе.
        </p>
      </div>

      {/* Objects */}
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Объекты
      </h2>
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Всего в базе"
          value={objects.length}
          href={{ pathname: "/admin/objects" }}
        />
        <Stat
          label="Публичных"
          value={publicObjs.length}
          hint="Active + фото"
          href={{ pathname: "/admin/objects", query: { s: "Active" } }}
          accent
        />
        <Stat
          label="Active"
          value={active}
          hint={`${noPhoto} без фото`}
          href={{ pathname: "/admin/objects", query: { s: "Active" } }}
        />
        <Stat
          label="Продано"
          value={sold}
          href={{ pathname: "/admin/objects", query: { s: "Sold" } }}
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Link
            key={t}
            href={{ pathname: "/admin/objects", query: { t } }}
            className="rounded-full border border-forest-900/10 bg-white px-3 py-1.5 text-sm text-forest-900/70 hover:border-brass-500/40"
          >
            {t} <span className="font-semibold text-forest-900">{byType[t]}</span>
          </Link>
        ))}
      </div>

      {/* CRM */}
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
        Лиды (CRM)
      </h2>
      {!CRM_ENABLED ? (
        <p className="text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : (
        <>
          <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Всего лидов" value={leads.length} href={{ pathname: "/admin/crm" }} />
            <Stat
              label="В работе"
              value={openLeads}
              hint={
                [
                  overdueLeads > 0 ? `⏰ ${overdueLeads} просрочка` : "",
                  staleLeads > 0 ? `💤 ${staleLeads} остыло` : "",
                ]
                  .filter(Boolean)
                  .join(" · ") || undefined
              }
              href={{ pathname: "/admin/crm" }}
              accent
            />
            <Stat label="Выиграно" value={won} href={{ pathname: "/admin/crm" }} />
            <Stat
              label="Конверсия"
              value={conversion === null ? "—" : `${conversion}%`}
              hint={closed > 0 ? `${won} из ${closed} закрытых` : "нет закрытых сделок"}
            />
          </div>

          {/* Funnel per pipeline */}
          {funnels.length > 0 && (
            <div className="mb-7 grid gap-4 md:grid-cols-2">
              {funnels.map((f) => {
                const top = f.steps[0]?.cum || 0;
                return (
                  <div key={f.key} className="rounded-2xl border border-forest-900/10 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                      Воронка · {f.name}
                    </p>
                    <div className="space-y-1.5">
                      {f.steps.map((s, i) => {
                        const prev = i > 0 ? f.steps[i - 1].cum : s.cum;
                        const stepPct = prev > 0 ? Math.round((s.cum / prev) * 100) : 0;
                        const width = top > 0 ? Math.max(4, Math.round((s.cum / top) * 100)) : 0;
                        return (
                          <div key={s.key} className="flex items-center gap-2 text-sm">
                            <span className="w-24 shrink-0 text-xs text-forest-900/70">{s.name}</span>
                            <div className="h-5 flex-1 overflow-hidden rounded bg-forest-900/5">
                              <div
                                className={
                                  "flex h-full items-center justify-end rounded px-2 text-[11px] font-medium text-white " +
                                  (s.isWon ? "bg-emerald-500" : "bg-brass-500")
                                }
                                style={{ width: `${width}%` }}
                              >
                                {s.cum}
                              </div>
                            </div>
                            <span className="w-10 shrink-0 text-right text-xs text-forest-900/45">
                              {i === 0 ? "100%" : `${stepPct}%`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {f.lost > 0 && (
                      <p className="mt-2 text-xs text-forest-900/40">Потеряно (Lost): {f.lost}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Channel attribution */}
          {channels.length > 0 && (
            <div className="mb-7 rounded-2xl border border-forest-900/10 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                Каналы привлечения
              </p>
              <div className="space-y-2">
                {channels.map((c) => {
                  const pct = leads.length ? Math.round((c.total / leads.length) * 100) : 0;
                  const winRate = c.total ? Math.round((c.won / c.total) * 100) : 0;
                  return (
                    <div key={c.key} className="flex items-center gap-3 text-sm">
                      <span className="w-24 shrink-0 text-forest-900/70">{c.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-forest-900/5">
                        <div
                          className="h-full rounded-full bg-brass-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-medium text-forest-900">
                        {c.total}
                      </span>
                      <span className="w-20 shrink-0 text-right text-xs text-forest-900/50">
                        {c.won > 0 ? `${winRate}% win` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-forest-900/40">
                Колонки: канал · доля · число лидов · доля выигранных. Источник — теги лида
                (source/channel/campaign).
              </p>
            </div>
          )}

          {recent.length > 0 && (
            <div className="rounded-2xl border border-forest-900/10 bg-white">
              <div className="border-b border-forest-900/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                Последние лиды
              </div>
              <ul className="divide-y divide-forest-900/5">
                {recent.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/admin/crm/${l.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-brass-500/[0.04]"
                    >
                      <span className="min-w-0">
                        <span className="text-sm font-medium text-forest-900">
                          {l.contactName || "—"}
                        </span>
                        <span className="ml-2 text-xs text-forest-900/50 line-clamp-1">
                          {l.name}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {l.rwNumber && (
                          <span className="rounded bg-brass-500/10 px-1.5 py-0.5 font-mono text-[10px] text-brass-600">
                            {l.rwNumber}
                          </span>
                        )}
                        {l.stage && (
                          <span className="rounded bg-forest-900/5 px-1.5 py-0.5 text-[10px] text-forest-900/55">
                            {l.stage}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

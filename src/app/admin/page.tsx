import type { ComponentProps } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllObjects, getPublicObjects } from "@/lib/data/objects";

type Href = ComponentProps<typeof Link>["href"];
import { getLeads, getPipelines, getEvents, getTasks, CRM_ENABLED } from "@/lib/data/leads";
import { matchLeadsToObject } from "@/lib/crm/matching";
import { computeCatalogHealth } from "@/lib/data/catalog-health";
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
  const [all, publicObjs, leads, pipelines, events, openTasks] = await Promise.all([
    getAllObjects(),
    getPublicObjects(),
    CRM_ENABLED ? getLeads() : Promise.resolve([]),
    CRM_ENABLED ? getPipelines() : Promise.resolve([]),
    CRM_ENABLED ? getEvents(500) : Promise.resolve([]),
    CRM_ENABLED ? getTasks() : Promise.resolve([]),
  ]);

  // «Сегодня»: просроченные + сегодняшние задачи прямо на дашборде (Bangkok).
  const bkkDay = (iso: string) =>
    new Date(new Date(iso).getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
  const todayBkk = bkkDay(new Date().toISOString());
  const isDateOnly = (iso: string) => {
    const d = new Date(iso);
    return d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
  };
  const todayTasks = openTasks
    .filter((t) => {
      if (!t.dueAt) return false;
      const due = new Date(t.dueAt).getTime();
      return isDateOnly(t.dueAt)
        ? bkkDay(t.dueAt) <= todayBkk
        : due < Date.now() || bkkDay(t.dueAt) === todayBkk;
    })
    .slice(0, 6);
  // «Реанимация»: авто-задачи 🔁 по потерянным, у которых срок подошёл.
  const revivalTasks = openTasks
    .filter((t) => t.title.startsWith("🔁") && t.dueAt && bkkDay(t.dueAt) <= todayBkk)
    .slice(0, 5);

  // Objects exclude off-plan unit sub-cards from the headline count.
  const objects = all.filter((o) => !isUnit(o.rwNumber));
  const byType = Object.fromEntries(
    TYPES.map((t) => [t, objects.filter((o) => o.type === t).length]),
  ) as Record<(typeof TYPES)[number], number>;
  const active = objects.filter((o: RealEstateObject) => o.status === "Active").length;
  const sold = objects.filter((o) => o.status === "Sold").length;
  const noPhoto = objects.filter((o) => o.status === "Active" && !o.coverImage).length;

  // Здоровье каталога: считаем из уже загруженного `all` (без второго запроса).
  // Баннер показываем только при критичных пробелах — иначе дашборд не засоряем.
  const health = computeCatalogHealth(all);
  const healthCritical = health.checks.filter((c) => c.severity === "critical");
  const healthCriticalCount = healthCritical.reduce((n, c) => n + c.objects.length, 0);

  // «Активация базы»: Active-объекты с числом тёплых лидов под них — обратный
  // подбор. Показываем те, под кого больше всего ждущих лидов: кому звонить.
  const activation = objects
    .filter((o) => o.status === "Active")
    .map((o) => ({ o, warm: matchLeadsToObject(o, leads, { limit: 50 }).length }))
    .filter((x) => x.warm > 0)
    .sort((a, b) => b.warm - a.warm || b.o.rwNumber.localeCompare(a.o.rwNumber))
    .slice(0, 4);

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

  // Pipeline money: expected deal sizes + commission max(5%; 150k THB).
  const nf = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
  const fmtTHB = (n: number) =>
    n >= 1_000_000 ? `฿${(n / 1_000_000).toFixed(1)}M` : `฿${nf(n)}`;
  const commissionOf = (v: number) => Math.max(v * 0.05, 150_000);
  const openValued = leads.filter((l) => isOpenLead(l) && (l.dealValue ?? 0) > 0);
  const pipelineValue = openValued.reduce((s, l) => s + (l.dealValue ?? 0), 0);
  const pipelineCommission = openValued.reduce((s, l) => s + commissionOf(l.dealValue ?? 0), 0);
  const wonValued = leads.filter(
    (l) =>
      l.stageKey &&
      wonKeys.has(l.stageKey) &&
      ((l.dealValue ?? 0) > 0 || (l.commissionValue ?? 0) > 0),
  );
  // Выигранная комиссия: факт (commissionValue) важнее расчёта по формуле.
  const wonCommission = wonValued.reduce(
    (s, l) => s + (l.commissionValue ?? commissionOf(l.dealValue ?? 0)),
    0,
  );
  const valueByStage = new Map<string, number>();
  for (const l of openValued) {
    const k = l.stage ?? "—";
    valueByStage.set(k, (valueByStage.get(k) ?? 0) + (l.dealValue ?? 0));
  }
  const stageValues = [...valueByStage.entries()].sort((a, b) => b[1] - a[1]);

  // Loss reasons (asked by the Lost dialog) — why deals die.
  const lostLeads = leads.filter((l) => l.stageKey && lostKeys.has(l.stageKey));
  const lossReasons = [
    ...lostLeads
      .reduce((m, l) => {
        const k = l.lostReason || "Без причины";
        m.set(k, (m.get(k) ?? 0) + 1);
        return m;
      }, new Map<string, number>())
      .entries(),
  ].sort((a, b) => b[1] - a[1]);

  // Average time per stage, from stage events: a lead's stay on stage S = gap
  // between the event that put it on S and the lead's next event.
  const stageSort = new Map<string, number>();
  for (const p of pipelines) for (const s of p.stages) stageSort.set(s.name, s.sort);
  const byLeadEvents = new Map<number, typeof events>();
  for (const e of events) {
    if (e.leadId == null) continue;
    if (e.type !== "created" && e.type !== "stage") continue; // touch/shortlist_view стадию не двигают
    const arr = byLeadEvents.get(e.leadId) ?? [];
    arr.push(e);
    byLeadEvents.set(e.leadId, arr);
  }
  const stageDur = new Map<string, { totalMs: number; n: number }>();
  for (const arr of byLeadEvents.values()) {
    const asc = [...arr].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (let i = 0; i < asc.length - 1; i++) {
      const st = asc[i].toStage;
      if (!st) continue;
      const ms = new Date(asc[i + 1].createdAt).getTime() - new Date(asc[i].createdAt).getTime();
      if (!Number.isFinite(ms) || ms < 0) continue;
      const e = stageDur.get(st) ?? { totalMs: 0, n: 0 };
      e.totalMs += ms;
      e.n += 1;
      stageDur.set(st, e);
    }
  }
  const stageCycle = [...stageDur.entries()]
    .map(([name, v]) => ({ name, days: v.totalMs / v.n / 86_400_000, n: v.n }))
    .sort((a, b) => (stageSort.get(a.name) ?? 99) - (stageSort.get(b.name) ?? 99));
  const fmtDays = (d: number) => (d < 1 ? "< 1 дн" : `${d.toFixed(d < 10 ? 1 : 0)} дн`);

  // Activity feed: latest stage moves / creations across all leads.
  const activity = events.slice(0, 8);
  const fmtEvent = (iso: string) => {
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
  };

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

      {healthCriticalCount > 0 && (
        <Link href={{ pathname: "/admin/health" }} className="mb-8 block">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-4 transition hover:border-red-500/50 hover:shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-lg leading-none">🔴</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-700">
                  Здоровье каталога: {healthCriticalCount}{" "}
                  {healthCriticalCount === 1 ? "критичная проблема" : "критичных проблем"}
                </p>
                <p className="mt-0.5 text-xs text-forest-900/60">
                  {healthCritical.map((c) => `${c.label} (${c.objects.length})`).join(" · ")}
                </p>
                <p className="mt-1 text-xs font-medium text-red-700/80">
                  Открыть разбор → /admin/health
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

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
            <Stat label="Победы" value={won} href={{ pathname: "/admin/crm" }} />
            <Stat
              label="Конверсия"
              value={conversion === null ? "—" : `${conversion}%`}
              hint={closed > 0 ? `${won} из ${closed} закрытых` : "нет закрытых сделок"}
            />
          </div>

          {/* Сегодня: просроченные + сегодняшние задачи и реанимация потерянных */}
          {(todayTasks.length > 0 || revivalTasks.length > 0) && (
            <div className="mb-7 grid gap-4 md:grid-cols-2">
              {todayTasks.length > 0 && (
                <div className="rounded-2xl border border-brass-500/25 bg-brass-500/[0.04] p-4">
                  <p className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                    <span>☑ Сегодня</span>
                    <Link
                      href={{ pathname: "/admin/crm/tasks" }}
                      className="font-normal normal-case text-brass-600 hover:underline"
                    >
                      все задачи →
                    </Link>
                  </p>
                  <ul className="space-y-1.5">
                    {todayTasks.map((t) => (
                      <li key={t.id} className="text-sm">
                        <Link
                          href={{ pathname: `/admin/crm/${t.leadId}` }}
                          className="flex items-baseline gap-2 hover:text-brass-700"
                        >
                          <span className="min-w-0 flex-1 truncate text-forest-900">{t.title}</span>
                          <span className="shrink-0 text-xs text-forest-900/45">
                            {t.contactName || t.leadName || `#${t.leadId}`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {revivalTasks.length > 0 && (
                <div className="rounded-2xl border border-forest-900/10 bg-white p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                    🔁 На реанимацию
                  </p>
                  <ul className="space-y-1.5">
                    {revivalTasks.map((t) => (
                      <li key={t.id} className="text-sm">
                        <Link
                          href={{ pathname: `/admin/crm/${t.leadId}` }}
                          className="flex items-baseline gap-2 hover:text-brass-700"
                        >
                          <span className="min-w-0 flex-1 truncate text-forest-900">
                            {t.contactName || t.leadName || `#${t.leadId}`}
                          </span>
                          <span className="shrink-0 text-xs text-forest-900/45">
                            потерян, пора спросить снова
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Активация базы: объект → кому звонить (обратный подбор) */}
          {activation.length > 0 && (
            <div className="mb-7 rounded-2xl border border-brass-500/25 bg-brass-500/[0.04] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                🎯 Объекты, под которые есть тёплые лиды
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {activation.map(({ o, warm }) => (
                  <Link
                    key={o.rwNumber}
                    href={{ pathname: `/admin/objects/${o.rwNumber}` }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-forest-900/10 bg-white px-3 py-2 hover:border-brass-500/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-forest-900">
                        {o.rwNumber} · {o.titleEn || o.type}
                      </span>
                      <span className="text-xs text-forest-900/45">
                        {o.type}
                        {o.district ? ` · ${o.district}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-brass-500/15 px-2 py-1 text-xs font-semibold text-brass-700">
                      {warm} 🔥
                    </span>
                  </Link>
                ))}
              </div>
              <p className="mt-2 text-xs text-forest-900/40">
                Число — сколько открытых лидов подходят под объект по типу/району/шортлисту.
              </p>
            </div>
          )}

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
                Колонки: канал · доля · число лидов · доля побед. Источник — теги лида
                (source/channel/campaign).
              </p>
            </div>
          )}

          {/* Pipeline money */}
          {(pipelineValue > 0 || wonCommission > 0) && (
            <div className="mb-7 rounded-2xl border border-forest-900/10 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                Деньги в воронке
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-forest-900/45">В работе (сделки)</p>
                  <p className="text-2xl font-semibold text-forest-900">{fmtTHB(pipelineValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-forest-900/45">Прогноз комиссии</p>
                  <p className="text-2xl font-semibold text-brass-600">{fmtTHB(pipelineCommission)}</p>
                </div>
                <div>
                  <p className="text-xs text-forest-900/45">Победы (комиссия)</p>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {wonCommission > 0 ? fmtTHB(wonCommission) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-forest-900/45">Лидов с суммой</p>
                  <p className="text-2xl font-semibold text-forest-900">{openValued.length}</p>
                </div>
              </div>
              {stageValues.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {stageValues.map(([stage, v]) => (
                    <span
                      key={stage}
                      className="rounded-full bg-forest-900/5 px-2.5 py-1 text-xs text-forest-900/70"
                    >
                      {stage}: <b className="text-forest-900">{fmtTHB(v)}</b>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-forest-900/40">
                Комиссия по формуле max(5%; ฿150k) с каждой сделки. Сумму задаёт поле «Сумма
                сделки» на карточке лида.
              </p>
            </div>
          )}

          {/* Loss reasons + stage cycle */}
          {(lossReasons.length > 0 || stageCycle.length > 0) && (
            <div className="mb-7 grid gap-4 md:grid-cols-2">
              {lossReasons.length > 0 && (
                <div className="rounded-2xl border border-forest-900/10 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                    Причины потерь
                  </p>
                  <div className="space-y-2">
                    {lossReasons.map(([reason, n]) => {
                      const pct = lostLeads.length
                        ? Math.round((n / lostLeads.length) * 100)
                        : 0;
                      return (
                        <div key={reason} className="flex items-center gap-3 text-sm">
                          <span className="w-32 shrink-0 truncate text-forest-900/70">{reason}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-forest-900/5">
                            <div
                              className="h-full rounded-full bg-forest-900/30"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 shrink-0 text-right font-medium text-forest-900">
                            {n}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-forest-900/40">
                    Спрашивается при переносе лида в Lost.
                  </p>
                </div>
              )}
              {stageCycle.length > 0 && (
                <div className="rounded-2xl border border-forest-900/10 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                    Средний цикл стадий
                  </p>
                  <div className="space-y-2">
                    {stageCycle.map((s) => (
                      <div key={s.name} className="flex items-center gap-3 text-sm">
                        <span className="w-32 shrink-0 text-forest-900/70">{s.name}</span>
                        <span className="font-medium text-forest-900">{fmtDays(s.days)}</span>
                        <span className="text-xs text-forest-900/40">({s.n} перех.)</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-forest-900/40">
                    Сколько лид в среднем проводит на стадии до следующего шага.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className={recent.length > 0 && activity.length > 0 ? "grid gap-4 md:grid-cols-2" : ""}>
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

          {/* Activity feed: who moved where */}
          {activity.length > 0 && (
            <div className="rounded-2xl border border-forest-900/10 bg-white">
              <div className="border-b border-forest-900/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-900/50">
                Активность
              </div>
              <ul className="divide-y divide-forest-900/5">
                {activity.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/admin/crm/${e.leadId}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-brass-500/[0.04]"
                    >
                      <span className="min-w-0">
                        <span className="text-sm font-medium text-forest-900">
                          {e.contactName || e.leadName || `#${e.leadId}`}
                        </span>
                        <span className="ml-2 text-xs text-forest-900/55">
                          {e.type === "created"
                            ? `создан → ${e.toStage ?? "—"}`
                            : e.type === "touch" || e.type === "shortlist_view"
                              ? (e.toStage ?? "касание")
                              : `${e.fromStage ?? "—"} → ${e.toStage ?? "—"}`}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-forest-900/40">
                        {fmtEvent(e.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </>
      )}
    </section>
  );
}

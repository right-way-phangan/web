import type { Metadata } from "next";
import Link from "next/link";
import { getLeads, getPipelines, getEvents, CRM_ENABLED, type CrmLead } from "@/lib/data/leads";
import { getViewsByRw, getCrossShoppers } from "@/lib/data/views";
import { getSiteEventStats, getOnPageFunnel } from "@/lib/data/events";
import { getReferrals, getAiCitations, referralLabel } from "@/lib/data/referrals";
import { classifyReferrer, isAiChannel } from "@/lib/analytics/referrer";
import { AdminNav } from "@/components/admin/admin-nav";
import { forecastPipeline, forecastByMonth } from "@/lib/crm/forecast";
import { computeFunnel } from "@/lib/crm/funnel";
import { getLiveRatesTHB } from "@/lib/data/fx-live";
import { getMonthlyTargetThb } from "@/lib/data/settings";
import { TargetEditor } from "@/components/crm/target-editor";

export const metadata: Metadata = {
  title: "CRM — метрики",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * CRM-метрики — интерактивный аналог недельной TG-панели (bot/weekly_report.py),
 * считается на живых данных при каждом открытии. Воронка «Разбор (legacy)»
 * исключена из потоковых метрик (created_at у мигрированных лидов = дата
 * миграции, не реального обращения) и показана отдельным блоком прогресса.
 */

const DAY = 86_400_000;

function daysAgo(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? (Date.now() - t) / DAY : Infinity;
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function fmtHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} мин`;
  if (h < 48) return `${Math.round(h)} ч`;
  return `${(h / 24).toFixed(1)} дн`;
}

const nf = new Intl.NumberFormat("ru-RU");

/** Funnel-step share of object views (30d window), for the on-page panel. */
function pctOfViews(n: number, views: number): string {
  return views > 0 ? `${Math.round((n / views) * 100)}% от просмотров` : "—";
}

/** Человекочитаемый источник лида из тегов. */
function sourceOf(l: CrmLead): string {
  const tags = l.tags ?? [];
  const utm = tags.find((t) => t.startsWith("utm-source:"));
  if (utm) return `🎯 ${utm.slice("utm-source:".length)}`;
  const ref = tags.find((t) => t.startsWith("ref:"));
  if (ref) {
    const host = ref.slice("ref:".length);
    const channel = classifyReferrer(host); // ai:/search:/social:/ref:host
    if (isAiChannel(channel)) return `🤖 ${host}`;
    return `🔗 ${host}`;
  }
  if (tags.includes("calculator")) return "🧮 калькулятор";
  if (tags.includes("market-report")) return "📊 market report";
  if (tags.includes("shortlist")) return "⭐ shortlist";
  if (tags.includes("saved-search")) return "🔔 saved search";
  if (tags.includes("website-inquiry")) return "🌐 сайт · объект";
  if (tags.includes("website-contact")) return "🌐 сайт · контакт";
  if (tags.includes("telegram") || tags.includes("tg")) return "✈️ telegram";
  return "✍️ вручную / другое";
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <p className="text-xs uppercase tracking-wide text-forest-900/45">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-forest-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-forest-900/50">{hint}</p> : null}
    </div>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-44 shrink-0 truncate text-forest-900/75">{label}</span>
      <div className="h-4 flex-1 rounded-sm bg-forest-900/[0.04]">
        <div className="h-4 rounded-sm bg-brass-500/60" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right font-medium text-forest-900">{count}</span>
    </div>
  );
}

export default async function CrmStatsPage() {
  if (!CRM_ENABLED) {
    return (
      <section className="container-prose py-12">
        <h1 className="text-2xl font-semibold text-forest-900">CRM-метрики</h1>
        <p className="mt-3 text-sm text-forest-900/70">CRM-бэкенд не подключён (OBJECTS_API_URL).</p>
      </section>
    );
  }

  const [leads, pipelines, events, viewsByRw, siteEvents, onPage, crossShoppers, referrals, aiCitations, liveRates, monthlyTarget] =
    await Promise.all([
      getLeads(),
      getPipelines(),
      getEvents(500),
      getViewsByRw(),
      getSiteEventStats(),
      getOnPageFunnel(),
      getCrossShoppers(),
      getReferrals(),
      getAiCitations(),
      getLiveRatesTHB(),
      getMonthlyTargetThb(),
    ]);

  // THB → RUB for the money views (Vladimir reads income «домой» in ₽). Live
  // rate is THB-per-RUB; fall back to the accounting rate when the feed is down.
  const thbPerRub = liveRates?.RUB ?? 0.42;
  const toRub = (thb: number) => thb / thbPerRub;

  const isLegacyPipe = (name?: string | null) => /legacy|разбор/i.test(name ?? "");
  const work = leads.filter((l) => !isLegacyPipe(l.pipeline));
  // Scope the legacy-разбор widget to the same window as the triage conveyor
  // (/admin/crm/triage): only leads created within the last LEGACY_WINDOW_MONTHS
  // months are in scope — ancient Circle records aren't worth swiping.
  const LEGACY_WINDOW_MONTHS = 7;
  const legacyCutoff = new Date();
  legacyCutoff.setMonth(legacyCutoff.getMonth() - LEGACY_WINDOW_MONTHS);
  const legacyCutoffMs = legacyCutoff.getTime();
  const legacy = leads.filter((l) => {
    if (!isLegacyPipe(l.pipeline)) return false;
    const t = new Date(l.createdAt).getTime();
    return Number.isFinite(t) && t >= legacyCutoffMs;
  });

  // ── Поток новых лидов ──
  const new7 = work.filter((l) => daysAgo(l.createdAt) <= 7);
  const new30 = work.filter((l) => daysAgo(l.createdAt) <= 30);

  // ── Источники (30 дней) ──
  const bySource = new Map<string, number>();
  for (const l of new30) bySource.set(sourceOf(l), (bySource.get(sourceOf(l)) ?? 0) + 1);
  const sources = [...bySource.entries()].sort((a, b) => b[1] - a[1]);
  const maxSource = sources[0]?.[1] ?? 0;

  // ── Скорость первого касания (стадийные события за окном /events) ──
  const firstStageEvent = new Map<number, number>();
  for (const e of events) {
    if (e.type !== "stage" || !e.leadId) continue;
    const t = new Date(e.createdAt).getTime();
    const prev = firstStageEvent.get(e.leadId);
    if (!prev || t < prev) firstStageEvent.set(e.leadId, t);
  }
  const touchHours: number[] = [];
  let untouched = 0;
  for (const l of new30) {
    const created = new Date(l.createdAt).getTime();
    const first = firstStageEvent.get(l.id);
    if (first && first > created) touchHours.push((first - created) / 3_600_000);
    else if (daysAgo(l.createdAt) > 1 && (l.status ?? "open") === "open") untouched++;
  }
  const touchMedian = median(touchHours);
  const touchMax = touchHours.length ? Math.max(...touchHours) : null;

  // ── Won / Lost (30 дней, по updatedAt как моменту закрытия) ──
  const won30 = work.filter((l) => l.status === "won" && daysAgo(l.updatedAt ?? l.createdAt) <= 30);
  const lost30 = work.filter((l) => l.status === "lost" && daysAgo(l.updatedAt ?? l.createdAt) <= 30);
  const lostReasons = new Map<string, number>();
  for (const l of lost30) {
    const r = l.lostReason?.trim() || "без причины";
    lostReasons.set(r, (lostReasons.get(r) ?? 0) + 1);
  }

  // ── Открытый pipeline: деньги и остывшие ──
  const open = work.filter((l) => (l.status ?? "open") === "open");
  const pipelineValue = open.reduce((s, l) => s + (l.dealValue ?? 0), 0);
  const wonCommission30 = won30.reduce((s, l) => s + (l.commissionValue ?? 0), 0);
  const stale = open.filter((l) => daysAgo(l.updatedAt ?? l.createdAt) >= 3);

  // ── Доска по стадиям (рабочие воронки) ──
  const workPipes = pipelines.filter((p) => !isLegacyPipe(p.name));

  // ── Взвешенный прогноз выручки ──
  // Рабочие воронки делят один цикл стадий — берём порядок из первой как канон.
  const stageOrder = (workPipes[0]?.stages ?? [])
    .slice()
    .sort((a, b) => a.sort - b.sort)
    .map((s) => s.key);
  const stageName = new Map((workPipes[0]?.stages ?? []).map((s) => [s.key, s.name] as const));
  const forecast = forecastPipeline(open, stageOrder);
  const monthForecast = forecastByMonth(open, 6);
  const monthMax = Math.max(...monthForecast.map((m) => m.weightedCommission), 1);

  // ── Темп месяца: факт won + прогноз закрытия этого месяца → проекция ──
  const nowD = new Date();
  const monthKey = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(nowD);
  const inThisMonth = (iso?: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === nowD.getFullYear() && d.getMonth() === nowD.getMonth();
  };
  const wonMonthCommission = work
    .filter((l) => l.status === "won" && inThisMonth(l.updatedAt ?? l.createdAt))
    .reduce((s, l) => s + (l.commissionValue ?? 0), 0);
  const monthFcThis = monthForecast.find((m) => m.key === monthKey)?.weightedCommission ?? 0;
  const monthProjection = wonMonthCommission + monthFcThis;
  // Прогресс к цели месяца (если задана): факт won и проекция в % от цели.
  const wonPct = monthlyTarget ? Math.min(100, (wonMonthCommission / monthlyTarget) * 100) : null;
  const projPct = monthlyTarget ? Math.min(100, (monthProjection / monthlyTarget) * 100) : null;
  const targetGap = monthlyTarget ? monthlyTarget - monthProjection : null;

  // ── Конверсия воронки (по истории lead_events) ──
  const funnel =
    workPipes[0] != null ? computeFunnel(work, workPipes[0].stages, events) : [];
  const stageCount = (pipeKey: string, stageKey: string) =>
    open.filter((l) => l.pipelineKey === pipeKey && l.stageKey === stageKey).length;

  // ── Воронка просмотры → лиды → сделки ──
  // Views: own first-party counter (30-day window). Leads: object-linked work
  // leads created in 30 days. Won: closed-won in 30 days. Rates connect traffic
  // quality to outcomes — the "честные цифры" backbone.
  let views30Total = 0;
  for (const v of viewsByRw.values()) views30Total += v.d30;
  const leadsWithObject30 = new30.filter((l) => l.rwNumber);
  const view2lead = views30Total > 0 ? (leadsWithObject30.length / views30Total) * 100 : null;
  const lead2won = new30.length > 0 ? (won30.length / new30.length) * 100 : null;

  // Leads count per object (work leads only).
  const leadsByRw = new Map<string, number>();
  for (const l of work) {
    if (l.rwNumber) leadsByRw.set(l.rwNumber, (leadsByRw.get(l.rwNumber) ?? 0) + 1);
  }
  // "Смотрят, но не пишут" — high views, zero leads = listing-quality problem.
  const viewedNoLeads = [...viewsByRw.values()]
    .filter((v) => v.d30 >= 5 && (leadsByRw.get(v.rwNumber) ?? 0) === 0)
    .sort((a, b) => b.d30 - a.d30)
    .slice(0, 12);

  // ── ROI по каналам: лиды / выигрыши / комиссия по источнику ──
  const byChannel = new Map<string, { leads: number; won: number; commission: number }>();
  for (const l of work) {
    const src = sourceOf(l);
    const c = byChannel.get(src) ?? { leads: 0, won: 0, commission: 0 };
    c.leads++;
    if (l.status === "won") {
      c.won++;
      c.commission += l.commissionValue ?? 0;
    }
    byChannel.set(src, c);
  }
  const channels = [...byChannel.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.commission - a.commission || b.leads - a.leads);

  // ── Legacy-разбор ──
  const legacyPipe = pipelines.find((p) => isLegacyPipe(p.name));
  const legacyFirstStage = legacyPipe?.stages.slice().sort((a, b) => a.sort - b.sort)[0]?.key;
  const legacyDone = legacy.filter(
    (l) => l.stageKey !== legacyFirstStage || (l.status ?? "open") !== "open",
  ).length;
  const legacyPct = legacy.length ? Math.round((legacyDone / legacy.length) * 100) : 0;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            Admin · CRM
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Метрики</h1>
          <p className="mt-1 text-sm text-forest-900/60">
            Живой срез по рабочим воронкам (legacy-разбор — отдельно внизу). Недельная сводка
            продолжает приходить в Telegram по понедельникам.
          </p>
        </div>
        <Link
          href={{ pathname: "/admin/crm" }}
          className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
        >
          ← К доске
        </Link>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Card label="Новые · 7 дней" value={String(new7.length)} hint={`30 дней: ${new30.length}`} />
        <Card
          label="Первое касание"
          value={touchMedian != null ? fmtHours(touchMedian) : "—"}
          hint={
            touchMax != null
              ? `медиана за 30д · макс ${fmtHours(touchMax)}`
              : "нет стадийных событий за 30д"
          }
        />
        <Card
          label="Без касания >24ч"
          value={String(untouched)}
          hint="новых лидов ждут первой реакции"
        />
        <Card
          label="Pipeline, THB"
          value={pipelineValue > 0 ? `฿${nf.format(pipelineValue)}` : "—"}
          hint={`${open.length} открытых лидов`}
        />
        <Card
          label="Won / Lost · 30д"
          value={`${won30.length} / ${lost30.length}`}
          hint={wonCommission30 > 0 ? `комиссия ฿${nf.format(wonCommission30)}` : undefined}
        />
        <Card label="Остывшие ≥3д" value={String(stale.length)} hint="открытые без движения" />
      </div>

      {/* Взвешенный прогноз выручки */}
      <div className="mt-8 rounded-2xl border border-brass-500/25 bg-brass-500/[0.04] p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-forest-900">Прогноз выручки</h2>
          <span className="text-xs text-forest-900/50">
            комиссия по модели max(5%; ฿150k) · вес = вероятность стадии · ₽ по живому курсу
            {liveRates ? ` (${liveRates.date})` : " (учётный)"}
          </span>
        </div>

        {/* Темп месяца: факт + прогноз закрытия этого месяца, прогресс к цели */}
        <div className="mb-4 rounded-xl bg-panel px-4 py-3 text-panel-fg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-panel-fg/55 capitalize">
                Темп · {monthLabel}
              </p>
              <p className="mt-0.5 text-2xl font-semibold">
                ≈ ฿{nf.format(Math.round(monthProjection))}
                <span className="ml-2 text-sm font-normal text-panel-fg/65">
                  ≈ ₽{nf.format(Math.round(toRub(monthProjection)))}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-panel-fg/70">
                won ฿{nf.format(Math.round(wonMonthCommission))}
                <span className="text-panel-fg/45"> + </span>
                прогноз ฿{nf.format(Math.round(monthFcThis))}
              </p>
              <p className="mt-1">
                {monthlyTarget ? (
                  <span className="text-xs text-panel-fg/70">
                    Цель ฿{nf.format(monthlyTarget)} · <TargetEditor value={monthlyTarget} />
                  </span>
                ) : (
                  <TargetEditor value={null} />
                )}
              </p>
            </div>
          </div>

          {monthlyTarget && projPct != null && wonPct != null && (
            <div className="mt-3">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-cream-50/15">
                {/* закрыто (won) — сплошной; прогноз — полупрозрачный сверху */}
                <div className="h-full bg-emerald-400" style={{ width: `${wonPct}%` }} />
                <div className="h-full bg-brass-400/70" style={{ width: `${projPct - wonPct}%` }} />
              </div>
              <p className="mt-1 text-xs text-panel-fg/65">
                {Math.round(projPct)}% от цели по проекции · won {Math.round(wonPct)}% ·{" "}
                {targetGap != null && targetGap > 0
                  ? `до цели ещё ฿${nf.format(Math.round(targetGap))}`
                  : "цель закрывается проекцией ✓"}
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-brass-500/30 bg-cream-50 p-4">
            <p className="text-xs uppercase tracking-wide text-forest-900/45">
              Ожидаемая комиссия · взвеш.
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-forest-900">
              ฿{nf.format(Math.round(forecast.weightedCommission))}
            </p>
            <p className="mt-1 text-xs text-forest-900/55">
              ≈ ₽{nf.format(Math.round(toRub(forecast.weightedCommission)))} · честная цифра «что
              реально прилетит»
            </p>
          </div>
          <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
            <p className="text-xs uppercase tracking-wide text-forest-900/45">
              Комиссия при полном закрытии
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-forest-900">
              ฿{nf.format(Math.round(forecast.commission))}
            </p>
            <p className="mt-1 text-xs text-forest-900/55">
              ≈ ₽{nf.format(Math.round(toRub(forecast.commission)))} · если закроются все открытые
            </p>
          </div>
          <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
            <p className="text-xs uppercase tracking-wide text-forest-900/45">
              Объём сделок · взвеш.
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-forest-900">
              ฿{nf.format(Math.round(forecast.weightedGmv))}
            </p>
            <p className="mt-1 text-xs text-forest-900/55">
              GMV ฿{nf.format(Math.round(forecast.gmv))} · {forecast.withValue}/{forecast.open} с
              указанной суммой
            </p>
          </div>
        </div>
        {forecast.byStage.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {forecast.byStage
              .filter((r) => r.count > 0)
              .map((r) => {
                const max = Math.max(...forecast.byStage.map((x) => x.weightedCommission), 1);
                const pct = Math.max(2, Math.round((r.weightedCommission / max) * 100));
                return (
                  <div key={r.stageKey} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0 truncate text-forest-900/75">
                      {stageName.get(r.stageKey) ?? r.stageKey}
                      <span className="ml-1 text-forest-900/40">· {r.count}</span>
                    </span>
                    <span className="w-10 shrink-0 text-right text-xs text-forest-900/45">
                      {Math.round(r.probability * 100)}%
                    </span>
                    <div className="h-4 flex-1 rounded-sm bg-forest-900/[0.04]">
                      <div
                        className="h-4 rounded-sm bg-brass-500/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-28 shrink-0 text-right font-medium text-forest-900">
                      ฿{nf.format(Math.round(r.weightedCommission))}
                    </span>
                  </div>
                );
              })}
            <p className="pt-1 text-xs text-forest-900/45">
              Вклад каждой стадии в ожидаемую комиссию (сумма × вероятность). Вероятности — приоры,
              калибруются по воронке ниже, когда накопятся закрытия.
            </p>
          </div>
        )}

        {/* Прогноз по месяцам */}
        {monthForecast.length > 0 && (
          <div className="mt-5 border-t border-brass-500/20 pt-4">
            <p className="mb-2 text-sm font-medium text-forest-900">
              По месяцам закрытия
              <span className="ml-2 text-xs font-normal text-forest-900/45">
                ставьте «ожид. закрытие» в карточке лида — план наполнится
              </span>
            </p>
            <div className="space-y-1.5">
              {monthForecast.map((m) => {
                const pct = Math.max(2, Math.round((m.weightedCommission / monthMax) * 100));
                const muted = m.key === "none";
                return (
                  <div key={m.key} className="flex items-center gap-3 text-sm">
                    <span className="w-32 shrink-0 truncate capitalize text-forest-900/75">
                      {m.label}
                      <span className="ml-1 text-forest-900/40">· {m.count}</span>
                    </span>
                    <div className="h-4 flex-1 rounded-sm bg-forest-900/[0.04]">
                      <div
                        className={"h-4 rounded-sm " + (muted ? "bg-forest-900/15" : "bg-brass-500/60")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-44 shrink-0 text-right font-medium text-forest-900">
                      ฿{nf.format(Math.round(m.weightedCommission))}
                      <span className="ml-1 text-xs font-normal text-forest-900/45">
                        ≈ ₽{nf.format(Math.round(toRub(m.weightedCommission)))}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Источники */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-forest-900">
            Источники новых лидов · 30 дней
          </h2>
          {sources.length === 0 ? (
            <p className="text-sm text-forest-900/50">За 30 дней новых лидов не было.</p>
          ) : (
            <div className="space-y-2">
              {sources.map(([label, count]) => (
                <BarRow key={label} label={label} count={count} max={maxSource} />
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-forest-900/45">
            🎯 = utm-метка кампании · 🔗 = внешний переход без метки. Атрибуция first-touch,
            хранится 30 дней на устройстве посетителя.
          </p>
        </div>

        {/* Lost-причины */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-forest-900">Причины Lost · 30 дней</h2>
          {lost30.length === 0 ? (
            <p className="text-sm text-forest-900/50">Проигранных сделок за 30 дней нет.</p>
          ) : (
            <div className="space-y-2">
              {[...lostReasons.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([reason, count]) => (
                  <BarRow key={reason} label={reason} count={count} max={lost30.length} />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Доска по стадиям */}
      <div className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-forest-900">Открытые лиды по стадиям</h2>
        <div className="space-y-4">
          {workPipes.map((p) => {
            const total = open.filter((l) => l.pipelineKey === p.key).length;
            return (
              <div key={p.key} className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
                <p className="mb-2 text-sm font-medium text-forest-900">
                  {p.name} <span className="text-forest-900/40">· {total}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.stages
                    .filter((s) => !s.isWon && !s.isLost)
                    .sort((a, b) => a.sort - b.sort)
                    .map((s) => {
                      const n = stageCount(p.key, s.key);
                      return (
                        <span
                          key={s.key}
                          className={
                            "rounded-full px-2.5 py-1 text-xs font-medium " +
                            (n > 0
                              ? "bg-forest-900/[0.07] text-forest-900"
                              : "bg-forest-900/[0.02] text-forest-900/35")
                          }
                        >
                          {s.name} · {n}
                        </span>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Воронка: просмотры → лиды → сделки */}
      <div className="mt-10">
        <h2 className="mb-1 text-lg font-semibold text-forest-900">
          Воронка · 30 дней
        </h2>
        <p className="mb-3 text-xs text-forest-900/50">
          Просмотры — свой first-party счётчик (не зависит от блокировщиков). Связывает трафик
          с результатом.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Card label="Просмотры объектов" value={nf.format(views30Total)} hint="за 30 дней" />
          <Card
            label="💬 Клики в мессенджеры"
            value={nf.format(siteEvents.clicks.total)}
            hint={
              siteEvents.clicks.total > 0
                ? `WA ${siteEvents.clicks.wa} · TG ${siteEvents.clicks.tg} · тел ${siteEvents.clicks.phone}`
                : "WhatsApp/TG/звонок — основной путь"
            }
          />
          <Card
            label="→ Лиды по объектам"
            value={String(leadsWithObject30.length)}
            hint={view2lead != null ? `${view2lead.toFixed(1)}% от просмотров` : "нет данных"}
          />
          <Card
            label="→ Сделки (Won)"
            value={String(won30.length)}
            hint={lead2won != null ? `${lead2won.toFixed(0)}% от всех новых лидов` : undefined}
          />
          <Card
            label="Комиссия Won · 30д"
            value={wonCommission30 > 0 ? `฿${nf.format(wonCommission30)}` : "—"}
          />
          <Card
            label="Смотрят, не пишут"
            value={String(viewedNoLeads.length)}
            hint="объектов ≥5 просмотров, 0 лидов"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Card
            label="Доходимость форм"
            value={
              siteEvents.form.starts > 0
                ? `${Math.round((siteEvents.form.submits / siteEvents.form.starts) * 100)}%`
                : "—"
            }
            hint={`${siteEvents.form.submits} из ${siteEvents.form.starts} начатых · 30д`}
          />
          <Card
            label="Кросс-шопперы"
            value={String(crossShoppers)}
            hint="смотрели ≥2 объектов за 30д"
          />
          <Card
            label="🤖 ИИ-визиты · 30д"
            value={nf.format(
              referrals.filter((r) => r.source.startsWith("ai:")).reduce((s, r) => s + r.d30, 0),
            )}
            hint="нашли нас через ИИ-ассистентов"
          />
        </div>

        {viewedNoLeads.length > 0 ? (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-forest-900/80">
              Объекты: смотрят, но не пишут — проверить фото/цену/описание
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {viewedNoLeads.map((v) => (
                <Link
                  key={v.rwNumber}
                  href={{ pathname: `/object/${v.rwNumber}` }}
                  className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
                  title={`${v.d30} просмотров за 30д, 0 лидов`}
                >
                  {v.rwNumber} · 👁 {v.d30}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Поведение на странице объекта — где утекает внимание до клика */}
      <div className="mt-10">
        <h2 className="mb-1 text-lg font-semibold text-forest-900">
          Поведение на странице · 30 дней
        </h2>
        <p className="mb-3 text-xs text-forest-900/50">
          Что происходит между просмотром и кликом в мессенджер. Каждый шаг — % от{" "}
          {nf.format(views30Total)} просмотров за 30 дней (one-time на просмотр, без идентификации).
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <Card
            label="⏱ Задержались 30с"
            value={nf.format(onPage.dwell30)}
            hint={pctOfViews(onPage.dwell30, views30Total)}
          />
          <Card
            label="📖 Долистали до конца"
            value={nf.format(onPage.scroll90)}
            hint={pctOfViews(onPage.scroll90, views30Total)}
          />
          <Card
            label="🖼 Открыли галерею"
            value={nf.format(onPage.galleryOpen)}
            hint={pctOfViews(onPage.galleryOpen, views30Total)}
          />
          <Card
            label="📨 Дошли до формы"
            value={nf.format(onPage.contactReach)}
            hint={pctOfViews(onPage.contactReach, views30Total)}
          />
          <Card
            label="💬 → Клик в мессенджер"
            value={nf.format(siteEvents.clicks.total)}
            hint={pctOfViews(siteEvents.clicks.total, views30Total)}
          />
        </div>
        <p className="mt-2 text-xs text-forest-900/40">
          Узкое место — там, где % резко падает: тонкая страница (мало долистывают), слабые фото
          (мало открывают галерею) или далёкая форма (дошли, но не кликнули).
        </p>
      </div>

      {/* ROI по каналам */}
      <div className="mt-10">
        <h2 className="mb-1 text-lg font-semibold text-forest-900">ROI по каналам</h2>
        <p className="mb-3 text-xs text-forest-900/50">
          Фактическая комиссия по источнику лида (first-touch). С запуском рекламы рядом встанет
          расход — получится настоящий ROAS.
        </p>
        {channels.length === 0 ? (
          <p className="text-sm text-forest-900/45">Пока нет лидов с источником.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-forest-900/10">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="border-b border-forest-900/10 bg-forest-900/[0.03] text-left text-xs uppercase tracking-wide text-forest-900/50">
                  <th className="px-3 py-2 font-medium">Канал</th>
                  <th className="px-3 py-2 text-center font-medium">Лиды</th>
                  <th className="px-3 py-2 text-center font-medium">Won</th>
                  <th className="px-3 py-2 text-center font-medium">Конверсия</th>
                  <th className="px-3 py-2 text-right font-medium">Комиссия, ฿</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={c.name} className="border-b border-forest-900/5">
                    <td className="px-3 py-2 text-forest-900/85">{c.name}</td>
                    <td className="px-3 py-2 text-center text-forest-900/70">{c.leads}</td>
                    <td className="px-3 py-2 text-center text-forest-900/70">{c.won}</td>
                    <td className="px-3 py-2 text-center text-forest-900/60">
                      {c.leads > 0 ? `${Math.round((c.won / c.leads) * 100)}%` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-forest-900">
                      {c.commission > 0 ? nf.format(c.commission) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Каналы привлечения (визиты, не лиды) */}
      <div className="mt-10">
        <h2 className="mb-1 text-lg font-semibold text-forest-900">Каналы привлечения · визиты</h2>
        <p className="mb-3 text-xs text-forest-900/50">
          Откуда приходят на сайт (раз в сессию, first-party). 🤖 ИИ-ассистенты — измеряем ставку
          на GEO/AEO. Это визиты, а не лиды.
        </p>
        {referrals.length === 0 ? (
          <p className="text-sm text-forest-900/45">Пока нет данных по каналам.</p>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => (
              <BarRow
                key={r.source}
                label={referralLabel(r.source)}
                count={r.d30}
                max={referrals[0]?.d30 ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI цитирует страницы — какие наши страницы выдают ответные движки */}
      <div className="mt-10">
        <h2 className="mb-1 text-lg font-semibold text-forest-900">
          🤖 AI цитирует страницы · 30 дней
        </h2>
        <p className="mb-3 text-xs text-forest-900/50">
          На какие наши страницы ИИ-ассистенты (Perplexity, ChatGPT, Gemini…) приводят посетителя —
          то, что движки реально выдают в ответах. Прямой замер ставки на GEO/AEO. Считаем только
          landing-страницу, без идентификации.
        </p>
        {aiCitations.length === 0 ? (
          <p className="text-sm text-forest-900/45">
            Пока ни одного захода с ИИ-ассистента (или данные ещё не накопились).
          </p>
        ) : (
          <div className="space-y-2">
            {aiCitations.slice(0, 12).map((c) => (
              <div
                key={c.path}
                className="flex items-center justify-between gap-3 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <a href={c.path} className="block truncate text-sm font-medium text-forest-900 hover:underline">
                    {c.path}
                  </a>
                  <div className="text-xs text-forest-900/45">
                    {c.sources.map((s) => s.replace(/^ai:/, "")).join(" · ")}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-forest-900">{nf.format(c.d30)}</div>
                  <div className="text-xs text-forest-900/45">7д: {nf.format(c.d7)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Конверсия воронки */}
      {(() => {
        const steps = funnel.filter((f) => f.reached > 0);
        if (steps.length < 2) return null;
        const top = steps[0].reached;
        return (
          <div className="mt-10">
            <h2 className="mb-1 text-lg font-semibold text-forest-900">Конверсия воронки</h2>
            <p className="mb-3 text-xs text-forest-900/50">
              Из дошедших до стадии — какая доля прошла дальше, и сколько дней лиды на ней сидят.
              По истории смен стадий (последние 500 событий). Где конверсия проседает — там
              горлышко.
            </p>
            <div className="space-y-1.5">
              {steps.map((f, i) => {
                const pct = top > 0 ? Math.max(3, Math.round((f.reached / top) * 100)) : 0;
                const drop = f.convFromPrev != null && f.convFromPrev < 0.5 && i > 0;
                return (
                  <div key={f.key} className="flex items-center gap-3 text-sm">
                    <span className="w-36 shrink-0 truncate text-forest-900/75">{f.name}</span>
                    <div className="h-5 flex-1 rounded-sm bg-forest-900/[0.04]">
                      <div
                        className={
                          "flex h-5 items-center justify-end rounded-sm pr-2 text-xs font-medium text-panel-fg " +
                          (drop ? "bg-red-400/80" : "bg-forest-700/70")
                        }
                        style={{ width: `${pct}%` }}
                      >
                        {f.reached}
                      </div>
                    </div>
                    <span
                      className={
                        "w-14 shrink-0 text-right text-xs " +
                        (drop ? "font-semibold text-red-600" : "text-forest-900/55")
                      }
                    >
                      {f.convFromPrev != null ? `${Math.round(f.convFromPrev * 100)}%` : "—"}
                    </span>
                    <span className="w-16 shrink-0 text-right text-xs text-forest-900/45">
                      {f.medianDays != null ? `${f.medianDays.toFixed(f.medianDays < 10 ? 1 : 0)}д` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-forest-900/40">
              Колонки: дошло лидов · конверсия со стадии выше · медиана дней на стадии. Красным —
              переходы с конверсией &lt; 50%.
            </p>
          </div>
        );
      })()}

      {/* Legacy-разбор */}
      {legacy.length > 0 ? (
        <div className="mt-10 rounded-xl border border-forest-900/10 bg-forest-900/[0.02] p-4">
          <h2 className="text-lg font-semibold text-forest-900">Разбор legacy (Circle)</h2>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-forest-900/[0.06]">
              <div className="h-3 rounded-full bg-brass-500" style={{ width: `${legacyPct}%` }} />
            </div>
            <span className="shrink-0 text-sm font-medium text-forest-900">
              {legacyDone} / {legacy.length} · {legacyPct}%
            </span>
          </div>
          <p className="mt-2 text-xs text-forest-900/50">
            Разобранным считается лид, ушедший с первой стадии или закрытый. Учитываются только
            лиды за последние {LEGACY_WINDOW_MONTHS} мес.
          </p>
        </div>
      ) : null}

      <p className="mt-8 text-xs text-forest-900/45">
        Первое касание считается по сменам стадий (lead_events) — заметки пока не учитываются.
        Окно событий — последние 500 записей.
      </p>
    </section>
  );
}

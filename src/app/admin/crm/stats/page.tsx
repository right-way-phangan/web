import type { Metadata } from "next";
import Link from "next/link";
import { getLeads, getPipelines, getEvents, CRM_ENABLED, type CrmLead } from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";

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

/** Человекочитаемый источник лида из тегов. */
function sourceOf(l: CrmLead): string {
  const tags = l.tags ?? [];
  const utm = tags.find((t) => t.startsWith("utm-source:"));
  if (utm) return `🎯 ${utm.slice("utm-source:".length)}`;
  const ref = tags.find((t) => t.startsWith("ref:"));
  if (ref) return `🔗 ${ref.slice("ref:".length)}`;
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
    <div className="rounded-xl border border-forest-900/10 bg-white p-4">
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

  const [leads, pipelines, events] = await Promise.all([
    getLeads(),
    getPipelines(),
    getEvents(500),
  ]);

  const isLegacyPipe = (name?: string | null) => /legacy|разбор/i.test(name ?? "");
  const work = leads.filter((l) => !isLegacyPipe(l.pipeline));
  const legacy = leads.filter((l) => isLegacyPipe(l.pipeline));

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
  const stageCount = (pipeKey: string, stageKey: string) =>
    open.filter((l) => l.pipelineKey === pipeKey && l.stageKey === stageKey).length;

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
              <div key={p.key} className="rounded-xl border border-forest-900/10 bg-white p-4">
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
            Разобранным считается лид, ушедший с первой стадии или закрытый.
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

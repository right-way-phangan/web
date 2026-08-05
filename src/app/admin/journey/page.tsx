import type { Metadata } from "next";
import { getJourneys, getHotLeads, getReturningVisitors, type JourneyLead, type HotLead } from "@/lib/data/journey";

export const metadata: Metadata = {
  title: "Путь посетителя",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("ru-RU");

const KIND_LABEL: Record<string, string> = {
  save: "💾 сохранил",
  calc: "🧮 калькулятор",
  brochure: "📄 брошюра",
  share: "↗️ поделился",
  wa_click: "💬 WhatsApp",
  tg_click: "💬 Telegram",
  phone_click: "📞 звонок",
  email_click: "✉️ email",
  form_start: "✍️ начал форму",
  form_submit: "✅ отправил форму",
  contact_reach: "📨 дошёл до формы",
};

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <div className="text-xs text-forest-900/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-forest-900">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-forest-900/45">{hint}</div> : null}
    </div>
  );
}

function date(iso: string): string {
  return iso ? iso.slice(0, 10) : "—";
}

function JourneyRow({ j }: { j: JourneyLead }) {
  const statusDot = j.status === "won" ? "🟢" : j.status === "lost" ? "🔴" : "🟡";
  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-medium text-forest-900">
          {statusDot} {j.name}
          {j.rwNumber ? <span className="ml-2 text-sm text-forest-900/50">по {j.rwNumber}</span> : null}
        </div>
        <div className="text-xs text-forest-900/45">{date(j.createdAt)}</div>
      </div>

      {j.viewedRw.length > 0 ? (
        <div className="mt-2">
          <span className="text-xs text-forest-900/50">Смотрел: </span>
          {j.viewedRw.slice(0, 16).map((rw) => (
            <a
              key={rw}
              href={`/object/${rw}`}
              className="mr-1 inline-block rounded bg-forest-900/5 px-1.5 py-0.5 text-xs text-forest-900/80 hover:bg-forest-900/10"
            >
              {rw}
            </a>
          ))}
          {j.viewedRw.length > 16 ? <span className="text-xs text-forest-900/40">+{j.viewedRw.length - 16}</span> : null}
        </div>
      ) : null}

      {j.actions.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-forest-900/70">
          {j.actions.map((a, i) => (
            <span key={i} className="rounded-full border border-forest-900/10 px-2 py-0.5">
              {KIND_LABEL[a.kind] ?? a.kind}
              {a.rwNumber ? <span className="text-forest-900/40"> {a.rwNumber}</span> : null}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-xs text-forest-900/40">Действий до заявки не зафиксировано (или зашёл напрямую на форму).</div>
      )}
    </div>
  );
}

export default async function JourneyPage() {
  const [j, hot, rv] = await Promise.all([getJourneys(), getHotLeads(), getReturningVisitors()]);
  const hotScored = hot.filter((h: HotLead) => h.score > 0);
  const attrPct = j.totalLeads > 0 ? Math.round((j.attributable / j.totalLeads) * 100) : 0;

  return (
    <section className="px-4 py-8 md:px-8">

      <h1 className="font-serif text-3xl text-forest-900">Путь посетителя</h1>
      <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
        Как лид дошёл до заявки — какие объекты смотрел и что делал до того, как написал. Сшивается
        по анонимному <code className="text-xs">vid</code> (ротируемый id браузера, без персональных
        данных). Глубже, чем агрегатная атрибуция «по первому касанию».
      </p>

      {/* Позвонить первым — открытые лиды по теплоте (что делали до заявки) */}
      {hotScored.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-brass-500/30 bg-brass-500/[0.06] p-5">
          <h2 className="text-lg font-semibold text-forest-900">
            🔥 Позвонить первым
            {hotScored.length > 10 ? (
              <span className="ml-2 text-sm font-normal text-forest-900/45">
                топ-10 из {hotScored.length}
              </span>
            ) : null}
          </h2>
          <p className="mb-3 text-xs text-forest-900/55">
            Открытые лиды по «теплоте» — что человек делал до заявки. Чем выше, тем горячее: время
            продаж сначала на этих, и есть с чем зайти в разговор.
          </p>
          <div className="space-y-2">
            {hotScored.slice(0, 10).map((h: HotLead, i: number) => (
              <div
                key={h.leadId}
                className="flex items-center justify-between gap-3 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <span className="font-medium text-forest-900">
                    {i === 0 ? "🥇 " : ""}{h.name}
                  </span>
                  {h.rwNumber ? <span className="ml-2 text-xs text-forest-900/50">по {h.rwNumber}</span> : null}
                  <div className="text-xs text-forest-900/55">{h.why}</div>
                </div>
                <div className="shrink-0 rounded-full bg-brass-500/15 px-2.5 py-1 text-sm font-semibold text-brass-600">
                  {h.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Возвращающиеся посетители — качество анонимного трафика по vid */}
      {rv && rv.totalVisitors > 0 ? (
        <div className="mt-6 rounded-2xl border border-forest-900/10 bg-cream-50 p-5">
          <h2 className="text-lg font-semibold text-forest-900">🔁 Возвращающиеся посетители</h2>
          <p className="mb-3 text-xs text-forest-900/55">
            Качество анонимного трафика за {rv.windowDays} дней по ротируемому <code className="text-xs">vid</code>.
            «Тёплые анонимы» — вернулись или смотрели много объектов, но не оставили заявку: спрос,
            который мы пока не ловим.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Посетителей" value={nf.format(rv.totalVisitors)} hint="уникальных vid" />
            <Card label="Возвращались" value={nf.format(rv.returning)} hint="≥ 2 дней" />
            <Card label="Смотрели много" value={nf.format(rv.multiObject)} hint="≥ 3 объектов" />
            <Card label="Тёплые анонимы" value={nf.format(rv.warmAnonymous)} hint="интент без заявки" />
          </div>
          {rv.magnets.length > 0 ? (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-forest-900/80">Магниты — тянут вовлечённых</h3>
              <div className="space-y-1.5">
                {rv.magnets.map((m) => (
                  <div
                    key={m.rwNumber}
                    className="flex items-center justify-between rounded-lg border border-forest-900/10 bg-forest-900/[0.02] px-3 py-1.5 text-sm"
                  >
                    <a href={`/object/${m.rwNumber}`} className="font-medium text-forest-900 hover:underline">
                      {m.rwNumber}
                    </a>
                    <span className="text-forest-900/60">{nf.format(m.visitors)} вовлечённых</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {j.attributable === 0 ? (
        <p className="mt-8 text-sm text-forest-900/50">
          Пока нет лидов с привязкой к пути (данные начнут копиться после деплоя — vid пишется на
          новые события и заявки).
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Лидов всего" value={nf.format(j.totalLeads)} />
            <Card label="С путём" value={nf.format(j.attributable)} hint={`${attrPct}% атрибутировано`} />
            <Card
              label="Объектов до заявки"
              value={j.avgViewsBeforeLead != null ? String(j.avgViewsBeforeLead) : "—"}
              hint="в среднем смотрят"
            />
            <Card label="Объектов в путях" value={nf.format(j.topObjects.length)} hint="встречаются у лидов" />
          </div>

          {j.topObjects.length > 0 ? (
            <div className="mt-10">
              <h2 className="mb-1 text-lg font-semibold text-forest-900">Объекты, которые закрывают</h2>
              <p className="mb-3 text-xs text-forest-900/50">
                Чаще всего встречаются в путях лидов — это «магниты», которые приводят к заявке.
              </p>
              <div className="space-y-1.5">
                {j.topObjects.map((o) => (
                  <div
                    key={o.rwNumber}
                    className="flex items-center justify-between rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-1.5 text-sm"
                  >
                    <a href={`/object/${o.rwNumber}`} className="font-medium text-forest-900 hover:underline">
                      {o.rwNumber}
                    </a>
                    <span className="text-forest-900/60">{nf.format(o.count)} лид(ов)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-forest-900">Недавние пути</h2>
            <div className="space-y-3">
              {j.recent.map((lead) => (
                <JourneyRow key={lead.leadId} j={lead} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

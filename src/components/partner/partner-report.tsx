import type { Route } from "next";
import Link from "next/link";
import type { PartnerReport } from "@/lib/partner/stats";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

type Locale = "en" | "ru";
type NumCol = "views7" | "views30" | "uniques30" | "clicks30" | "calc30" | "save30" | "leads30" | "leadsTotal" | "lastLeadAt";

const T = {
  en: {
    eyebrow: "Partner report",
    title: (n: string) => `${n} on Right Way`,
    lead: "How buyers interact with your projects on rightwaygroup.co. Counters only — leads are qualified and handled by Right Way; names and phone numbers stay with us.",
    asOf: (d: string) => `Data as of ${d}, Asia/Bangkok. Last 30 days unless stated.`,
    tiles: { views30: "Page views, 30 days", uniques30: "Unique visitors, 30 days", clicks30: "Contact clicks, 30 days", leads30: "Enquiries, 30 days" },
    cols: { project: "Project", views7: "Views 7d", views30: "Views 30d", uniques30: "Visitors", clicks30: "Contact clicks", calc30: "ROI calc", save30: "Saved", leads30: "Enquiries 30d", leadsTotal: "Enquiries total", lastLeadAt: "Last enquiry" },
    empty: "No public projects yet.",
    notes: [
      "Page views count opens of the project page and its units on the site; unique visitors are anonymous browser ids, no personal data.",
      "Contact clicks are taps on WhatsApp, Telegram, phone or email on the project page. ROI calc is opens of the return calculator; Saved is shortlist adds.",
      "Enquiries are buyer requests received by Right Way for this project, including its units. We qualify each one before an introduction.",
    ],
    open: "Open page",
  },
  ru: {
    eyebrow: "Отчёт партнёра",
    title: (n: string) => `${n} на Right Way`,
    lead: "Как покупатели взаимодействуют с вашими проектами на rightwaygroup.co. Только счётчики: лиды квалифицирует и ведёт Right Way, имена и телефоны остаются у нас.",
    asOf: (d: string) => `Данные на ${d}, Asia/Bangkok. Последние 30 дней, если не сказано иное.`,
    tiles: { views30: "Просмотры, 30 дней", uniques30: "Уникальные посетители, 30 дней", clicks30: "Клики по контактам, 30 дней", leads30: "Обращения, 30 дней" },
    cols: { project: "Проект", views7: "Просм. 7д", views30: "Просм. 30д", uniques30: "Посетители", clicks30: "Клики по контактам", calc30: "Калькулятор", save30: "Сохранили", leads30: "Обращения 30д", leadsTotal: "Обращения всего", lastLeadAt: "Последнее" },
    empty: "Публичных проектов пока нет.",
    notes: [
      "Просмотры — открытия страницы проекта и его юнитов на сайте; уникальные посетители — анонимные идентификаторы браузера, без персональных данных.",
      "Клики по контактам — нажатия на WhatsApp, Telegram, телефон или почту на странице проекта. Калькулятор — открытия расчёта доходности; Сохранили — добавления в подборку.",
      "Обращения — запросы покупателей, полученные Right Way по этому проекту вместе с юнитами. Каждое квалифицируем до знакомства.",
    ],
    open: "Открыть страницу",
  },
} as const;

const fmt = (n: number, locale: Locale) => n.toLocaleString(locale === "ru" ? "ru-RU" : "en-GB");

export function PartnerReportView({ report, locale }: { report: PartnerReport; locale: Locale }) {
  const t = T[locale];
  const base = locale === "ru" ? "/ru" : "";
  const tiles: (keyof typeof t.tiles)[] = ["views30", "uniques30", "clicks30", "leads30"];
  const cols: NumCol[] = ["views7", "views30", "uniques30", "clicks30", "calc30", "save30", "leads30", "leadsTotal", "lastLeadAt"];

  return (
    <section className="container-prose py-10 md:py-14">
      <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
      <h1 className="mt-3 max-w-3xl text-balance">{t.title(report.name)}</h1>
      <p className="mt-4 max-w-2xl text-base text-forest-500/70">{t.lead}</p>
      <p className="mt-2 text-sm text-forest-500/50">{t.asOf(report.generatedAt)}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((k) => (
          <div key={k} className="rounded-sm border border-forest-500/10 bg-cream-50 px-5 py-4">
            <p className="font-serif text-3xl text-forest-900">{fmt(report.totals[k], locale)}</p>
            <p className="mt-1 text-xs text-forest-500/60">{t.tiles[k]}</p>
          </div>
        ))}
      </div>

      {report.rows.length === 0 ? (
        <p className="mt-10 text-forest-500/60">{t.empty}</p>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-sm border border-forest-500/10">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-forest-500/5 text-left text-xs uppercase tracking-wide text-forest-500/60">
              <tr>
                <th className="px-4 py-3 font-medium">{t.cols.project}</th>
                {cols.map((k) => (
                  <th key={k} className="px-3 py-3 text-right font-medium">{t.cols[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.rwNumber} className="border-t border-forest-500/10">
                  <td className="px-4 py-3">
                    <Link href={`${base}/projects/${r.slug}` as Route} className="font-medium text-forest-900 underline-offset-4 hover:underline" title={t.open}>
                      {r.title}
                    </Link>
                    <span className="ml-2 text-xs text-forest-500/40">{r.rwNumber}</span>
                  </td>
                  {cols.map((k) => (
                    <td key={k} className="px-3 py-3 text-right tabular-nums text-forest-900/80">
                      {k === "lastLeadAt" ? (r.lastLeadAt ?? "—") : fmt(r[k], locale)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ul className="mt-8 max-w-2xl space-y-2 text-xs leading-relaxed text-forest-500/55">
        {t.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </section>
  );
}

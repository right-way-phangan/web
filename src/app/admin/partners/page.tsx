import type { Metadata } from "next";
import { getDevelopers } from "@/lib/data/projects";
import { getSiteUrl } from "@/lib/site-url";
import { PARTNER_LINKS_ENABLED, PARTNER_TOKEN_DAYS, signPartnerToken } from "@/lib/partner/token";
import { CopyField } from "@/components/admin/copy-field";

export const metadata: Metadata = {
  title: "Партнёры · отчёты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Ссылки на партнёрские отчёты застройщиков (/partner/<token>): просмотры,
 * клики и лиды по их проектам — аргумент в разговоре о developer-fee.
 * Ссылка подписана и живёт PARTNER_TOKEN_DAYS дней; здесь она генерируется
 * заново при каждом открытии, старые остаются рабочими до своего срока.
 */
export default async function PartnersPage() {
  const devs = await getDevelopers();
  const base = getSiteUrl();
  const links = PARTNER_LINKS_ENABLED
    ? await Promise.all(devs.map(async (d) => ({ dev: d, token: await signPartnerToken(d.slug) })))
    : [];

  return (
    <section className="px-4 py-8 md:px-8">
      <h1 className="font-serif text-3xl text-forest-900">Партнёры · отчёты</h1>
      <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
        Каждому застройщику с публичным проектом — своя ссылка на отчёт: просмотры, уникальные посетители, клики по контактам,
        калькулятор, сохранения и число обращений по его проектам. Без имён и телефонов. Ссылка действует {PARTNER_TOKEN_DAYS} дней
        с момента выдачи; отозвать раньше можно только сменой AUTH_SECRET.
      </p>

      {!PARTNER_LINKS_ENABLED ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          AUTH_SECRET не задан — ссылки подписать нечем.
        </p>
      ) : devs.length === 0 ? (
        <p className="mt-6 text-sm text-forest-900/60">Публичных проектов с застройщиком пока нет.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {links.map(({ dev, token }) => (
            <li key={dev.slug} className="rounded-2xl border border-forest-900/10 bg-cream-50 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-forest-900">{dev.name}</p>
                <p className="text-xs text-forest-900/50">
                  {dev.projects.length} {dev.projects.length === 1 ? "проект" : "проектов"} · {dev.projects.map((p) => p.rwNumber).join(", ")}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                <CopyField label="EN" value={`${base}/partner/${token}`} />
                <CopyField label="RU" value={`${base}/ru/partner/${token}`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

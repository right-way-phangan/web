import type { Metadata } from "next";
import { getPartners, getPartnerReferrals } from "@/lib/data/partner-referrals";
import { getLeads } from "@/lib/data/leads";
import { getAllObjects } from "@/lib/data/objects";
import { ReferralPartners } from "@/components/admin/referral-partners";
import {
  ReferralHandovers,
  type LeadOption,
  type ObjectOption,
} from "@/components/admin/referral-handovers";

export const metadata: Metadata = {
  title: "Партнёры · передачи",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /admin/referrals — партнёры-застройщики и передачи им лидов (developer-fee
 * пивот, спека §5). Двухшаговый протокол: тизер без контакта → ack партнёра →
 * контакт. Денег в системе нет — суммы в личном учёте, здесь только статусы,
 * артефакты и каденция follow-up (D+1 / D+3 / D+14).
 */
export default async function AdminReferralsPage() {
  const [partners, referrals, leads, objects] = await Promise.all([
    getPartners(),
    getPartnerReferrals(),
    getLeads(),
    getAllObjects(),
  ]);

  const apiDown = partners === null || referrals === null;

  const leadOptions: LeadOption[] = leads
    .filter((l) => (l.status ?? "open") === "open")
    .map((l) => ({
      id: l.id,
      label: l.contactName ? `${l.name} · ${l.contactName}` : l.name,
    }));
  const objectOptions: ObjectOption[] = objects.map((o) => ({
    rw: o.rwNumber,
    title: o.titleEn,
  }));

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">
          Партнёры и передачи лидов
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-forest-900/60">
          Передача лида застройщику в два шага: тизер без контакта клиента → партнёр
          подтверждает (ack) → только тогда контакт. Каденция после передачи: D+1, D+3,
          D+14. Суммы и проценты — в личном учёте, в системе только статусы и артефакты.
        </p>
      </div>

      {apiDown ? (
        <div className="rounded-2xl border border-brass-500/50 bg-brass-500/10 p-6">
          <p className="font-semibold text-forest-900">Данные раздела недоступны</p>
          <p className="mt-2 max-w-2xl text-sm text-forest-900/70">
            Backend не отвечает на <code className="rounded bg-forest-900/5 px-1">/partners</code>{" "}
            и <code className="rounded bg-forest-900/5 px-1">/referrals</code>. Причины по
            частоте: не задан{" "}
            <code className="rounded bg-forest-900/5 px-1">OBJECTS_API_URL</code>; на backend
            ещё не применена миграция таблиц partners/referrals (
            <code className="rounded bg-forest-900/5 px-1">npm run db:migrate</code>, вручную и
            ДО деплоя кода); не задеплоен backend с этими роутами.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-900/45">
              Партнёры · {partners.length}
            </h2>
            <ReferralPartners partners={partners} />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-900/45">
              Передачи · {referrals.length}
            </h2>
            <ReferralHandovers
              referrals={referrals}
              partners={partners}
              leads={leadOptions}
              objects={objectOptions}
            />
          </div>
        </div>
      )}
    </section>
  );
}

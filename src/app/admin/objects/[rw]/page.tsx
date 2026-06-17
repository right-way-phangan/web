import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdminObjectByRwNumber } from "@/lib/data/objects";
import { getLeads, CRM_ENABLED } from "@/lib/data/leads";
import { matchLeadsToObject } from "@/lib/crm/matching";
import { AdminNav } from "@/components/admin/admin-nav";
import { ObjectWarmLeads, type WarmLeadRow } from "@/components/admin/object-warm-leads";

export const metadata: Metadata = {
  title: "Объект — тёплые лиды",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-US");
function objPrice(o: {
  priceThb?: number;
  pricePerRai?: number;
  rentPerRaiMonth?: number;
}): string {
  if (o.priceThb) return `฿${nf.format(o.priceThb)}`;
  if (o.pricePerRai) return `฿${nf.format(o.pricePerRai)}/rai`;
  if (o.rentPerRaiMonth) return `฿${nf.format(o.rentPerRaiMonth)}/rai·мес`;
  return "Цена по запросу";
}

/**
 * Per-object admin hub — the reverse of the lead card's "что показать": given a
 * listing, who in the base wants something like it. A new object becomes an
 * instant calling list. Splits direct inquiries (asked about THIS object) from
 * matches (criteria fit).
 */
export default async function AdminObjectPage({
  params,
}: {
  params: Promise<{ rw: string }>;
}) {
  const { rw } = await params;
  const object = await getAdminObjectByRwNumber(rw);
  if (!object) notFound();

  const leads = CRM_ENABLED ? await getLeads() : [];
  const matched = matchLeadsToObject(object, leads, { limit: 20 });

  const toRow = (m: (typeof matched)[number]): WarmLeadRow => ({
    id: m.lead.id,
    name: m.lead.contactName || m.lead.name,
    phone: m.lead.phone ?? null,
    stage: m.lead.stage ?? null,
    score: m.score,
    reasons: m.reasons,
  });
  // Inquiries = asked about this exact object; warm = everyone else matched.
  const inquiries = matched.filter((m) => m.reasons.includes("спрашивал этот объект")).map(toRow);
  const inquiryIds = new Set(inquiries.map((r) => r.id));
  const warm = matched.filter((m) => !inquiryIds.has(m.lead.id)).map(toRow);

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="objects" />
      <Link
        href={{ pathname: "/admin/objects" }}
        className="text-xs text-forest-900/50 hover:text-forest-900"
      >
        ← База объектов
      </Link>

      <div className="mt-3 flex flex-wrap items-start gap-4">
        {object.coverImage && (
          <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl bg-forest-900/5">
            <Image
              src={object.coverImage}
              alt={object.rwNumber}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-brass-600">
            {object.rwNumber} · {object.type}
            {object.district ? ` · ${object.district}` : ""} · {object.status}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-forest-900 md:text-2xl">
            {object.titleEn || `${object.type} на Пангане`}
          </h1>
          <p className="mt-1 text-sm font-medium text-forest-900/80">{objPrice(object)}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <Link
              href={`/object/${object.rwNumber}` as `/object/${string}`}
              className="text-brass-600 hover:underline"
              target="_blank"
            >
              публичная карточка →
            </Link>
            {object.driveFolder && (
              <a
                href={object.driveFolder}
                className="text-brass-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                📁 Drive (фото и документы) →
              </a>
            )}
            {object.lat != null && object.lng != null && (
              <a
                href={`https://www.google.com/maps?q=${object.lat},${object.lng}`}
                className="text-brass-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                📍 {object.lat.toFixed(5)}, {object.lng.toFixed(5)} →
              </a>
            )}
          </div>
          {object.docs && object.docs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-forest-900/60">
              <span className="text-forest-900/45">📄 Документы:</span>
              {object.docs.map((d) => (
                <a
                  key={d.url}
                  href={d.url}
                  className="text-brass-600 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {d.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {!CRM_ENABLED ? (
        <p className="mt-8 text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {inquiries.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-forest-900/60">
                📨 Прямые запросы по объекту · {inquiries.length}
              </h2>
              <ObjectWarmLeads leads={inquiries} />
            </div>
          )}
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-forest-900/60">
              🎯 Тёплые лиды (подходят по критериям) · {warm.length}
            </h2>
            <p className="mb-3 text-xs text-forest-900/45">
              Открытые лиды, чей интерес (тип/район/шортлист) совпадает с объектом. Позвоните им,
              когда появилось подходящее предложение.
            </p>
            <ObjectWarmLeads leads={warm} />
          </div>
        </div>
      )}
    </section>
  );
}

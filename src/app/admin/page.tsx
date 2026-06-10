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
              hint={overdueLeads > 0 ? `⏰ ${overdueLeads} с просрочкой` : undefined}
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
